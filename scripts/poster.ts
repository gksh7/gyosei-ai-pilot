import { TwitterApi } from 'twitter-api-v2'

const URL_CHAR_COUNT = 23 // X counts all URLs as 23 chars via t.co
const MAX_TWEET_CHARS = 280

export async function postToX(article: {
  id: string
  tweet_text: string
  slug: string
}) {
  const client = new TwitterApi({
    appKey: process.env.X_API_KEY!,
    appSecret: process.env.X_API_SECRET!,
    accessToken: process.env.X_ACCESS_TOKEN!,
    accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
  })
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gyosei-ai-pilot.vercel.app'
  try {
    const url = `${siteUrl}/articles/${article.slug}`
    const maxTextLength = MAX_TWEET_CHARS - URL_CHAR_COUNT - 1 // 1 for newline
    const tweetBody = article.tweet_text.length > maxTextLength
      ? article.tweet_text.slice(0, maxTextLength - 1) + '…'
      : article.tweet_text
    const tweetText = `${tweetBody}\n${url}`
    const { data } = await client.v2.tweet(tweetText)
    console.log('✅ ツイート投稿:', data.id)
    return data.id
  } catch (err) {
    console.error('❌ ツイート失敗:', err)
    return null
  }
}
