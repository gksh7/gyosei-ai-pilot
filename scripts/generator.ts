import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type ScrapedContent = { source: string; url: string; content: string }

// 検索ボリュームの大きいターゲットキーワード
// 記事ごとに「必須1語 + 推奨2〜3語」を自然に盛り込む
const TARGET_KEYWORDS = {
  // 必ず毎記事含める（サイトテーマの核心）
  required: ['行政書士法', '2026年改正', '無資格代行'],
  // 記事内容に合わせて選択するビッグワード（検索ボリューム大）
  bigWords: [
    '行政書士', '補助金申請', '許認可申請', '在留資格', '会社設立',
    '建設業許可', '農地転用', '相続手続き', '風俗営業許可', '帰化申請',
    '産業廃棄物処理', '古物商許可', '宅建業免許',
  ],
  // コンプライアンス文脈で使うロングテール
  compliance: [
    'コンプライアンス', '罰則', '両罰規定', '無資格', '違反リスク',
    '法務担当', '業務委託', 'アウトソーシング', '名義貸し', '代行サービス',
  ],
}

export async function generateArticle(scrapedContent: ScrapedContent[], recentTitles: string[] = []) {
  const sourceText = scrapedContent
    .slice(0, 5)
    .map(s => `【${s.source}】\n${s.content}`)
    .join('\n\n---\n\n')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: `あなたは行政書士法コンプライアンス専門の法務メディアライターです。
官公庁の最新情報をもとに、企業の法務・コンプライアンス担当者向けの実務記事を書きます。
2026年改正行政書士法（無資格代行の厳罰化）との関連を必ず盛り込んでください。

【SEOキーワード戦略】
以下のルールでキーワードを自然に埋め込んでください（詰め込み禁止・文脈に合った使用のみ）：
- 必須キーワード（毎記事）: ${TARGET_KEYWORDS.required.join('、')}
- タイトルとseo_titleには上記必須キーワードを最低1語含める
- ビッグワード（記事内容に合うものを2〜4語選択）: ${TARGET_KEYWORDS.bigWords.join('、')}
- コンプライアンス関連（内容に合うものを2〜3語）: ${TARGET_KEYWORDS.compliance.join('、')}
- h2見出し（2〜3個）にもキーワードを入れること
- 冒頭100字以内に必須キーワードを最低1語配置すること
- tagsには使用したビッグワードとコンプライアンスキーワードを含めること（3〜5個）`,
    messages: [{
      role: 'user',
      content: `以下の官公庁・ニュース情報をもとに記事を1本作成してください。

${recentTitles.length > 0 ? `【掲載済み記事タイトル（これらと重複するトピックは避けてください）】\n${recentTitles.map(t => `・${t}`).join('\n')}\n\n` : ''}【収集情報】
${sourceText}

以下のJSON形式のみで出力（前後に文章不要）：
{
  "title": "記事タイトル（30字以内・必須キーワードを含む）",
  "slug": "url-safe-english-slug",
  "content": "記事本文HTML（<h2><p>タグ使用・1000〜1500字・キーワードを見出しと冒頭に配置）",
  "summary": "要約文（100字以内・必須キーワードを含む）",
  "seo_title": "SEOタイトル（32字以内・検索意図に合わせビッグワードを先頭寄りに）",
  "seo_description": "メタディスクリプション（120字以内・キーワードと行動喚起を含む）",
  "tags": ["使用したキーワード3〜5個"],
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
