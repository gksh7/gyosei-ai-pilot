import { supabase } from './supabase-client'
import { scrapeAll } from './scraper'
import { generateArticle } from './generator'
import { postToX } from './poster'

async function run() {
  console.log('🚀 パイプライン開始:', new Date().toLocaleString('ja-JP'))

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

  // 3. 記事生成
  console.log('✍️ 記事生成中...')
  const article = await generateArticle(scraped, recentTitles)
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

  // 5. X投稿
  const tweetId = await postToX(data)
  if (tweetId) {
    await supabase
      .from('articles')
      .update({ tweet_id: tweetId, tweet_posted_at: new Date().toISOString() })
      .eq('id', data.id)
  }

  console.log('🎉 パイプライン完了')
}

run().catch((err) => {
  console.error('パイプラインエラー:', err)
  process.exit(1)
})
