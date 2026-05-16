import { supabase } from './supabase-client'
import { postToInstagram } from './instagram-poster'

async function run() {
  const { data: article, error } = await supabase
    .from('articles')
    .select('slug, tweet_text')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !article) {
    console.error('記事取得失敗:', error)
    process.exit(1)
  }

  console.log('テスト記事:', article.slug)
  await postToInstagram(article)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
