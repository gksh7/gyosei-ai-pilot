import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { supabase } from './supabase-client'
import { createGscClient, fetchPageRows, fetchQueryRows, GscRow } from './gsc-client'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const SITE_BASE = 'https://gyosei-ai-pilot.com'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@gyosei-ai-pilot.com'
const TO_EMAIL   = process.env.RESEND_TO_EMAIL   ?? 'gksh1613@gmail.com'

// タイトル最適化のしきい値
const TITLE_OPT_MIN_IMPRESSIONS = 30
const TITLE_OPT_MAX_CTR = 0.05   // 5%未満

// ギャップクエリのしきい値
const GAP_MIN_IMPRESSIONS = 10
const GAP_MAX_POSITION = 10

type Article = { id: string; slug: string; title: string; tags: string[] | null }

type TitleCandidate = {
  currentTitle: string
  suggestions: string[]
  impressions: number
  ctrPct: string
  position: string
}

/**
 * GSC最適化メイン処理。
 * - 高impression・低CTRの記事タイトル改善候補をSupabaseに保存しメール通知
 * - 1〜10位だがカバー記事がないクエリを返す（翌朝の記事テーマ注入用）
 */
export async function runGscOptimizer(): Promise<string[]> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    console.log('⚠️  GOOGLE_SERVICE_ACCOUNT_JSON 未設定。GSC最適化をスキップ。')
    return []
  }

  const gsc = createGscClient()

  const [pageRows, queryRows, articlesResult] = await Promise.all([
    fetchPageRows(gsc),
    fetchQueryRows(gsc),
    supabase.from('articles').select('id, slug, title, tags'),
  ])

  const articles: Article[] = articlesResult.data ?? []

  const [titleCandidates, gapQueries] = await Promise.all([
    optimizeTitles(pageRows, articles),
    detectGapQueries(queryRows, articles),
  ])

  await sendReport(titleCandidates, gapQueries)

  return gapQueries
}

async function optimizeTitles(pageRows: GscRow[], articles: Article[]): Promise<TitleCandidate[]> {
  const lowCtrRows = pageRows.filter(row =>
    row.impressions >= TITLE_OPT_MIN_IMPRESSIONS && row.ctr < TITLE_OPT_MAX_CTR,
  )

  if (lowCtrRows.length === 0) {
    console.log('📊 タイトル最適化対象なし（高impression・低CTRページ 0件）')
    return []
  }

  const slugToArticle = new Map(articles.map(a => [a.slug, a]))
  const candidates = lowCtrRows
    .map(row => {
      const url = row.keys[0] ?? ''
      const slug = url.replace(`${SITE_BASE}/articles/`, '').replace(/\/$/, '')
      return { row, article: slugToArticle.get(slug) }
    })
    .filter((c): c is { row: GscRow; article: Article } => c.article != null)
    .sort((a, b) => b.row.impressions - a.row.impressions)
    .slice(0, 5)

  if (candidates.length === 0) {
    console.log('📊 タイトル最適化: GSCページURLと記事スラッグの一致なし')
    return []
  }

  console.log(`\n🔍 タイトル改善候補を生成中（${candidates.length}件）...`)

  const results: TitleCandidate[] = []
  const dbRows: object[] = []

  for (const { row, article } of candidates) {
    const impressions = row.impressions
    const ctrPct = (row.ctr * 100).toFixed(1)
    const position = row.position.toFixed(1)

    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `この記事はGoogleで平均${position}位に表示されていますが、CTRが${ctrPct}%と低い（impressions:${impressions}）。
クリック率を上げる改題候補を3案生成してください（30字以内・行政書士法・コンプライアンス文脈）。

現在のタイトル：「${article.title}」
タグ：${(article.tags ?? []).join('、')}

JSON配列のみで出力: ["案1", "案2", "案3"]`,
      }],
    })

    const text = res.content[0].type === 'text' ? res.content[0].text : '[]'
    let suggestions: string[] = []
    try {
      suggestions = JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] ?? '[]')
    } catch {
      suggestions = []
    }

    console.log(`\n📌 ${article.title}`)
    console.log(`   impressions:${impressions} CTR:${ctrPct}% 順位:${position}位`)
    suggestions.forEach((s, i) => console.log(`   案${i + 1}: ${s}`))

    results.push({ currentTitle: article.title, suggestions, impressions, ctrPct, position })
    dbRows.push({
      article_id: article.id,
      article_slug: article.slug,
      current_title: article.title,
      suggested_titles: suggestions,
      impressions,
      ctr: row.ctr,
      position: row.position,
    })
  }

  if (dbRows.length > 0) {
    const { error } = await supabase.from('gsc_suggestions').insert(dbRows)
    if (error) console.error('❌ gsc_suggestions 保存エラー:', error.message)
    else console.log(`\n✅ gsc_suggestions に ${dbRows.length}件保存`)
  }

  return results
}

async function detectGapQueries(queryRows: GscRow[], articles: Article[]): Promise<string[]> {
  const highRankRows = queryRows.filter(row =>
    row.position <= GAP_MAX_POSITION && row.impressions >= GAP_MIN_IMPRESSIONS,
  )

  if (highRankRows.length === 0) {
    console.log('📊 ギャップクエリなし（1〜10位・10impressions以上 0件）')
    return []
  }

  const articleTexts = articles.map(a =>
    `${a.title} ${(a.tags ?? []).join(' ')} ${a.slug}`.toLowerCase(),
  )

  const isNotCovered = (query: string) => {
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 1)
    return words.every(w => !articleTexts.some(t => t.includes(w)))
  }

  const gapQueries = highRankRows
    .filter(row => isNotCovered(row.keys[0] ?? ''))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 5)
    .map(row => row.keys[0])

  if (gapQueries.length === 0) {
    console.log('📊 ギャップクエリなし（全クエリが既存記事でカバー済み）')
    return []
  }

  console.log(`\n🎯 ギャップクエリ（翌朝の記事テーマに注入）: ${gapQueries.join('、')}`)
  return gapQueries
}

async function sendReport(titleCandidates: TitleCandidate[], gapQueries: string[]) {
  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️  RESEND_API_KEY 未設定。メール送信をスキップ。')
    return
  }
  if (titleCandidates.length === 0 && gapQueries.length === 0) {
    console.log('📧 GSCレポート: 通知すべき内容なし。メール送信をスキップ。')
    return
  }

  const today = new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })
  const lines: string[] = [`【GSC日次レポート】${today}`, '']

  if (titleCandidates.length > 0) {
    lines.push(`■ タイトル改善候補（${titleCandidates.length}件）`)
    for (const c of titleCandidates) {
      lines.push(`\n現在: ${c.currentTitle}`)
      lines.push(`      ${c.impressions}imp / CTR ${c.ctrPct}% / 平均${c.position}位`)
      c.suggestions.forEach((s, i) => lines.push(`  案${i + 1}: ${s}`))
    }
    lines.push('')
  }

  if (gapQueries.length > 0) {
    lines.push(`■ 今日の記事テーマ（ギャップクエリ注入 ${gapQueries.length}件）`)
    gapQueries.forEach(q => lines.push(`  ・${q}`))
    lines.push('')
  }

  lines.push('─'.repeat(40))
  lines.push('Supabase gsc_suggestions テーブルで全履歴を確認できます。')

  const resend = new Resend(process.env.RESEND_API_KEY)
  const subject = [
    '[GSC]',
    titleCandidates.length > 0 ? `タイトル改善${titleCandidates.length}件` : '',
    gapQueries.length > 0 ? `ギャップクエリ${gapQueries.length}件` : '',
  ].filter(Boolean).join(' / ')

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject,
    text: lines.join('\n'),
  })

  if (error) console.error('❌ GSCレポートメール送信エラー:', error)
  else console.log(`\n📧 GSCレポートを ${TO_EMAIL} に送信しました`)
}
