import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type ScrapedContent = { source: string; url: string; content: string }

export async function generateArticle(scrapedContent: ScrapedContent[]) {
  const sourceText = scrapedContent
    .slice(0, 5)
    .map(s => `【${s.source}】\n${s.content}`)
    .join('\n\n---\n\n')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: `あなたは行政書士法コンプライアンス専門の法務メディアライターです。
官公庁の最新情報をもとに、企業の法務・コンプライアンス担当者向けの実務記事を書きます。
2026年改正行政書士法（無資格代行の厳罰化）との関連を必ず盛り込んでください。`,
    messages: [{
      role: 'user',
      content: `以下の官公庁・ニュース情報をもとに記事を1本作成してください。

【収集情報】
${sourceText}

以下のJSON形式のみで出力（前後に文章不要）：
{
  "title": "記事タイトル（30字以内）",
  "slug": "url-safe-english-slug",
  "content": "記事本文HTML（<h2><p>タグ使用・800〜1200字）",
  "summary": "要約文（100字以内）",
  "seo_title": "SEOタイトル（32字以内）",
  "seo_description": "メタディスクリプション（120字以内）",
  "tags": ["タグ1", "タグ2", "タグ3"],
  "tweet_text": "ツイート本文（URLなし・120字以内・ハッシュタグ2〜3個）"
}`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('JSON生成失敗')

  const article = JSON.parse(jsonMatch[0])
  article.slug = `${article.slug}-${Date.now()}`
  article.status = 'published'

  return article
}
