import { supabase } from './supabase-client'
import { postToX } from './poster'

async function main() {
  // 引数で日付指定可能: npm run repost -- 2026-05-13
  const dateArg = process.argv[2]
  let utcStart: Date, utcEnd: Date

  if (dateArg) {
    // JST yyyy-MM-dd → UTC
    utcStart = new Date(`${dateArg}T15:00:00Z`)
    utcStart.setDate(utcStart.getDate() - 1)
    utcEnd = new Date(utcStart.getTime() + 24 * 60 * 60 * 1000)
  } else {
    const jstNow = new Date()
    const jstMidnight = new Date(jstNow)
    jstMidnight.setHours(jstMidnight.getHours() - ((jstNow.getHours() + 9) % 24))
    jstMidnight.setMinutes(0); jstMidnight.setSeconds(0); jstMidnight.setMilliseconds(0)
    utcStart = new Date(jstMidnight.getTime() - 9 * 60 * 60 * 1000)
    utcEnd = new Date(utcStart.getTime() + 24 * 60 * 60 * 1000)
  }

  const { data, error } = await supabase
    .from('articles')
    .select('id, slug, title, tweet_text, created_at')
    .gte('created_at', utcStart.toISOString())
    .lt('created_at', utcEnd.toISOString())
    .order('created_at', { ascending: false })

  if (error) { console.error(error); process.exit(1) }
  if (!data || data.length === 0) {
    console.log('今日の記事が見つかりません')
    process.exit(0)
  }

  const article = data[0]
  console.log(`対象記事: ${article.title}`)
  console.log(`スラッグ: ${article.slug}`)

  // 重複検知回避のため末尾に日付を付加
  const today = new Date().toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo', month: 'long', day: 'numeric' })
  article.tweet_text = article.tweet_text + `\n📅 ${today}`

  const tweetId = await postToX(article)
  if (tweetId) {
    await supabase
      .from('articles')
      .update({ tweet_id: tweetId, tweet_posted_at: new Date().toISOString() })
      .eq('id', article.id)
    console.log('✅ 再投稿・DB更新完了')
  } else {
    console.error('❌ 投稿失敗')
    process.exit(1)
  }
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
