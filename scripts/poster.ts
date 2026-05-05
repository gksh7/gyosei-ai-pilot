import { TwitterApi } from 'twitter-api-v2'

const client = new TwitterApi({
  appKey: process.env.X_API_KEY!,
  appSecret: process.env.X_API_SECRET!,
  accessToken: process.env.X_ACCESS_TOKEN!,
  accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gyosei-ai-pilot.vercel.app'

export async function postToX(article: {
  id: string
  tweet_text: string
  slug: string
}) {
  try {
    const tweetText = `${article.tweet_text}\n${siteUrl}/articles/${article.slug}`
    const { data } = await client.v2.tweet(tweetText)
    console.log('✅ ツイート投稿:', data.id)
    return data.id
  } catch (err) {
    console.error('❌ ツイート失敗:', err)
    return null
  }
}
