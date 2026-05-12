import Anthropic from '@anthropic-ai/sdk'
import { supabase } from './supabase-client'
import { createGscClient, fetchPageRows, fetchQueryRows, GscRow } from './gsc-client'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const SITE_BASE = 'https://gyosei-ai-pilot.com'

// タイトル最適化のしきい値
const TITLE_OPT_MIN_IMPRESSIONS = 30
const TITLE_OPT_MAX_CTR = 0.05   // 5%未満

// ギャップクエリのしきい値
const GAP_MIN_IMPRESSIONS = 10
const GAP_MAX_POSITION = 10

type Article = { id: string; slug: string; title: string; tags: string[] | null }

/**
 * GSC最適化メイン処理。
 * - 高impression・低CTRの記事タイトル改善候補をSupabaseに保存
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

  const [, gapQueries] = await Promise.all([
    optimizeTitles(pageRows, articles),
    detectGapQueries(queryRows, articles),
  ])

  return gapQueries
}

async function optimizeTitles(pageRows: GscRow[], articles: Article[]) {
  const lowCtrRows = pageRows.filter(row =>
    row.impressions >= TITLE_OPT_MIN_IMPRESSIONS && row.ctr < TITLE_OPT_MAX_CTR,
  )

  if (lowCtrRows.length === 0) {
    console.log('📊 タイトル最適化対象なし（高impression・低CTRページ 0件）')
    return
  }

  // URLから記事をルックアップ
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
    return
  }

  console.log(`\n🔍 タイトル改善候補を生成中（${candidates.length}件）...`)

  const rows: object[] = []

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
    let suggested: string[] = []
    try {
      suggested = JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] ?? '[]')
    } catch {
      suggested = []
    }

    console.log(`\n📌 ${article.title}`)
    console.log(`   impressions:${impressions} CTR:${ctrPct}% 順位:${position}位`)
    suggested.forEach((s, i) => console.log(`   案${i + 1}: ${s}`))

    rows.push({
      article_id: article.id,
      article_slug: article.slug,
      current_title: article.title,
      suggested_titles: suggested,
      impressions,
      ctr: row.ctr,
      position: row.position,
    })
  }

  if (rows.length > 0) {
    const { error } = await supabase.from('gsc_suggestions').insert(rows)
    if (error) console.error('❌ gsc_suggestions 保存エラー:', error.message)
    else console.log(`\n✅ gsc_suggestions に ${rows.length}件保存`)
  }
}

async function detectGapQueries(queryRows: GscRow[], articles: Article[]): Promise<string[]> {
  const highRankRows = queryRows.filter(row =>
    row.position <= GAP_MAX_POSITION && row.impressions >= GAP_MIN_IMPRESSIONS,
  )

  if (highRankRows.length === 0) {
    console.log('📊 ギャップクエリなし（1〜10位・10impressions以上 0件）')
    return []
  }

  // 既存記事テキスト（タイトル＋タグ＋スラッグ）
  const articleTexts = articles.map(a =>
    `${a.title} ${(a.tags ?? []).join(' ')} ${a.slug}`.toLowerCase(),
  )

  const isNotCovered = (query: string) => {
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 1)
    // 主要単語が1つもいずれかの記事にない場合をギャップとみなす
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
