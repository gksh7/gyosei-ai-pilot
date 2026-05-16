const IG_API = 'https://graph.instagram.com/v21.0'

export async function postToInstagram(article: {
  slug: string
  tweet_text: string
}) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gyosei-ai-pilot.com'

  if (!token || !accountId) {
    console.log('⚠️ Instagram環境変数未設定。スキップ。')
    return null
  }

  const imageUrl = `${siteUrl}/articles/${article.slug}/opengraph-image`
  const articleUrl = `${siteUrl}/articles/${article.slug}`
  const caption = `${article.tweet_text}\n\n${articleUrl}\n\n#行政書士 #2026年改正 #法改正 #コンプライアンス`

  try {
    // 1. メディアコンテナ作成
    const containerRes = await fetch(`${IG_API}/${accountId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: token,
      }),
    })
    const container = await containerRes.json()
    if (!container.id) {
      console.error('❌ Instagramコンテナ作成失敗:', container)
      return null
    }
    console.log('📦 Instagramコンテナ作成:', container.id)

    // 2. 投稿
    const publishRes = await fetch(`${IG_API}/${accountId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: container.id,
        access_token: token,
      }),
    })
    const published = await publishRes.json()
    if (!published.id) {
      console.error('❌ Instagram投稿失敗:', published)
      return null
    }
    console.log('✅ Instagram投稿完了:', published.id)
    return published.id
  } catch (err) {
    console.error('❌ Instagram投稿エラー:', err)
    return null
  }
}
