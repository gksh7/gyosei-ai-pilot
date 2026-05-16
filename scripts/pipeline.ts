import { supabase } from './supabase-client'
import { scrapeAll } from './scraper'
import { generateArticle } from './generator'
import { postToX } from './poster'
import { postToInstagram } from './instagram-poster'
import { runGscOptimizer } from './gsc-optimizer'
import { notifyIndexing } from './indexing-client'

async function run() {
  console.log('🚀 パイプライン開始:', new Date().toLocaleString('ja-JP'))

  // 1b. GSC最適化（タイトル改善候補保存 + ギャップクエリ取得）
  const gapQueries = await runGscOptimizer()

  // 1. スクレイプ
  const scraped = await scrapeAll(supabase)
  if (scraped.length === 0) {
    console.log('スクレイプコンテンツなし。終了。')
    return
  }
  console.log(`📰 ${scraped.length}件のコンテンツを取得`)

  // 2. 直近の記事タイトルを取得（重複防止）
  const { data: recentArticles } = await supabase
    .from('articles')
    .select('title')
    .order('created_at', { ascending: false })
    .limit(30)
  const recentTitles = (recentArticles ?? []).map((a: { title: string }) => a.title)

  // 2b. 人気テーマを取得（直近30日のPV上位記事からタグを集計）
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const { data: topAnalytics } = await supabase
    .from('analytics')
    .select('article_id, page_views')
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('page_views', { ascending: false })
    .limit(10)

  let popularThemes: string[] = []
  if (topAnalytics && topAnalytics.length > 0) {
    const topIds = topAnalytics.map((a: { article_id: string }) => a.article_id)
    const { data: topArticles } = await supabase
      .from('articles')
      .select('tags')
      .in('id', topIds)
    const tagCount: Record<string, number> = {}
    ;(topArticles ?? []).forEach((a: { tags: string[] | null }) => {
      ;(a.tags ?? []).forEach(tag => { tagCount[tag] = (tagCount[tag] ?? 0) + 1 })
    })
    popularThemes = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag)
    if (popularThemes.length > 0) console.log(`📊 人気テーマ: ${popularThemes.join(', ')}`)
  }

  // 3. 記事生成
  console.log('✍️ 記事生成中...')
  const article = await generateArticle(scraped, recentTitles, popularThemes, gapQueries)
  console.log(`記事生成完了: ${article.title}`)

  // 4. Supabaseに保存（参照元IDを含める）
  article.source_ids = scraped.map(s => s.id)
  const { data, error } = await supabase
    .from('articles')
    .insert(article)
    .select()
    .single()

  if (error) {
    console.error('❌ 記事保存失敗:', error)
    return
  }
  console.log('✅ 記事保存完了:', data.id)

  // 5. Google Indexing API通知
  const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${data.slug}`
  try {
    await notifyIndexing(articleUrl)
  } catch (err) {
    console.error('⚠️ Indexing API通知失敗（パイプラインは続行）:', (err as Error).message)
  }

  // 6. X投稿
  const tweetId = await postToX(data)
  if (tweetId) {
    await supabase
      .from('articles')
      .update({ tweet_id: tweetId, tweet_posted_at: new Date().toISOString() })
      .eq('id', data.id)
  }

  // 7. Instagram投稿
  await postToInstagram(data)

  console.log('🎉 パイプライン完了')
}

run().catch((err) => {
  console.error('パイプラインエラー:', err)
  process.exit(1)
})
