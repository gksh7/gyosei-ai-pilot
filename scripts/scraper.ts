import axios from 'axios'
import * as cheerio from 'cheerio'
import Anthropic from '@anthropic-ai/sdk'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ScrapedContent = { id: string; source: string; url: string; content: string }

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function scrapeAll(supabase: SupabaseClient): Promise<ScrapedContent[]> {
  const { data: sources } = await supabase
    .from('sources')
    .select('*')
    .eq('is_active', true)
    .order('tier')

  if (!sources || sources.length === 0) return []

  const results: ScrapedContent[] = []

  for (const source of sources) {
    let content = ''
    let succeeded = false

    try {
      console.log(`スクレイプ中: ${source.name} (${source.scrape_method})`)
      if (source.scrape_method === 'playwright') {
        content = await scrapeWithPlaywright(source.url, source.selector)
      } else if (source.scrape_method === 'rss') {
        content = await scrapeWithRss(source.url)
      } else {
        content = await scrapeWithCheerio(source.url, source.selector)
      }
      succeeded = content.length > 100
    } catch (err) {
      console.error(`❌ スクレイプ失敗: ${source.name}`, (err as Error).message)
    }

    // 取得できた場合
    if (succeeded) {
      results.push({ id: source.id, source: source.name, url: source.url, content })
      await supabase.from('sources').update({ last_scraped_at: new Date().toISOString() }).eq('id', source.id)
      console.log(`✅ ${source.name}: ${content.length}文字取得`)
      continue
    }

    // 失敗した場合 → 自己修復を試みる（RSS・Playwrightは対象外）
    if (source.scrape_method === 'cheerio') {
      const repaired = await selfRepair(source, supabase)
      if (repaired) {
        results.push({ id: source.id, source: source.name, url: source.url, content: repaired })
        await supabase.from('sources').update({ last_scraped_at: new Date().toISOString() }).eq('id', source.id)
        console.log(`✅ ${source.name}: 自己修復後 ${repaired.length}文字取得`)
      }
    }
  }

  return results
}

async function selfRepair(
  source: { id: string; name: string; url: string },
  supabase: SupabaseClient
): Promise<string | null> {
  console.log(`🔧 自己修復試行: ${source.name}`)

  // Step 1: 生HTMLを取得（接続不可の場合はここで諦める）
  let rawHtml = ''
  try {
    const { data } = await axios.get(source.url, {
      headers: { 'User-Agent': BROWSER_UA },
      timeout: 20000,
      responseType: 'text',
    })
    rawHtml = (data as string).slice(0, 5000)
  } catch {
    console.log(`🔧 接続不可のため修復スキップ: ${source.name}`)
    return null
  }

  // Step 2: Claude Haikuに最適セレクタを分析させる
  let selector: string | null = null
  try {
    const response = await ai.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `日本語の政府・ニュースサイトからニュース一覧テキストを抽出するCSSセレクタを提案してください。

URL: ${source.url}
HTML（先頭5000字）:
${rawHtml}

JSON形式のみで回答:
{"selector": "CSSセレクタ文字列またはnull", "note": "理由20字以内"}`,
      }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      const parsed = JSON.parse(match[0]) as { selector: string | null; note: string }
      selector = parsed.selector
      console.log(`🔧 Claudeの提案: selector="${selector}" (${parsed.note})`)
    }
  } catch (err) {
    console.error(`🔧 Claude解析失敗:`, (err as Error).message)
    return null
  }

  if (!selector) return null

  // Step 3: 提案セレクタで再試行
  try {
    const $ = cheerio.load(rawHtml)
    const content = $(selector).text().replace(/\s+/g, ' ').trim().slice(0, 3000)
    if (content.length > 100) {
      // Step 4: 成功したらDBのセレクタを更新
      await supabase.from('sources').update({ selector }).eq('id', source.id)
      console.log(`✅ 自己修復成功: ${source.name} → selector="${selector}"`)
      return content
    }
  } catch {
    // セレクタ無効
  }

  console.log(`🔧 修復失敗（セレクタが機能しなかった）: ${source.name}`)
  return null
}

async function scrapeWithCheerio(url: string, selector?: string): Promise<string> {
  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': BROWSER_UA },
    timeout: 30000,
  })
  const $ = cheerio.load(html)
  $('script, style, nav, footer, iframe, .ad, #ad').remove()
  const target = selector
    ? $(selector)
    : $('main, article, .content, #content, .news-list, .press-release, body')
  return target.text().replace(/\s+/g, ' ').trim().slice(0, 3000)
}

async function scrapeWithRss(url: string): Promise<string> {
  const { data: xml } = await axios.get(url, {
    headers: { 'User-Agent': BROWSER_UA },
    timeout: 15000,
    responseType: 'text',
  })
  const $ = cheerio.load(xml, { xmlMode: true })
  const items: string[] = []
  $('item').each((_, el) => {
    const title = $(el).find('title').text().replace(/<!\[CDATA\[|\]\]>/g, '').trim()
    const description = $(el).find('description').text().replace(/<!\[CDATA\[|\]\]>/g, '').trim()
    const pubDate = $(el).find('pubDate').text().trim()
    if (title) items.push([pubDate, title, description].filter(Boolean).join(' | '))
  })
  return items.slice(0, 20).join('\n').slice(0, 3000)
}

async function scrapeWithPlaywright(url: string, selector?: string): Promise<string> {
  const { chromium } = await import('playwright')
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (compatible; LegalAIPilot/1.0; +https://gyosei-ai-pilot.vercel.app)',
    })
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2000)

    const text = await page.evaluate((sel) => {
      const remove = document.querySelectorAll('script, style, nav, footer, iframe')
      remove.forEach(el => el.remove())
      const target = sel
        ? document.querySelector(sel)
        : document.querySelector('main, article, .content, #content, body')
      return target?.textContent ?? ''
    }, selector ?? null)

    return text.replace(/\s+/g, ' ').trim().slice(0, 3000)
  } finally {
    await browser.close()
  }
}
