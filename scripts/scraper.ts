import axios from 'axios'
import * as cheerio from 'cheerio'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ScrapedContent = { id: string; source: string; url: string; content: string }

export async function scrapeAll(supabase: SupabaseClient): Promise<ScrapedContent[]> {
  const { data: sources } = await supabase
    .from('sources')
    .select('*')
    .eq('is_active', true)
    .order('tier')

  if (!sources || sources.length === 0) return []

  const results: ScrapedContent[] = []

  for (const source of sources) {
    try {
      console.log(`スクレイプ中: ${source.name} (${source.scrape_method})`)
      const content = source.scrape_method === 'playwright'
        ? await scrapeWithPlaywright(source.url, source.selector)
        : await scrapeWithCheerio(source.url, source.selector)

      if (content.length > 100) {
        results.push({ id: source.id, source: source.name, url: source.url, content })
        await supabase
          .from('sources')
          .update({ last_scraped_at: new Date().toISOString() })
          .eq('id', source.id)
        console.log(`✅ ${source.name}: ${content.length}文字取得`)
      }
    } catch (err) {
      console.error(`❌ スクレイプ失敗: ${source.name}`, err)
    }
  }

  return results
}

async function scrapeWithCheerio(url: string, selector?: string): Promise<string> {
  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LegalAIPilot/1.0; +https://gyosei-ai-pilot.vercel.app)' },
    timeout: 15000,
  })
  const $ = cheerio.load(html)
  $('script, style, nav, footer, iframe, .ad, #ad').remove()
  const target = selector
    ? $(selector)
    : $('main, article, .content, #content, .news-list, .press-release, body')
  return target.text().replace(/\s+/g, ' ').trim().slice(0, 3000)
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
