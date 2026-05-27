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
    '建設業許可', '農地転用', '相続手続き', '帰化申請',
    '産業廃棄物処理', '古物商許可', '宅建業免許',
    '補助金申請代行', '補助金コンサル', '事業再構築補助金', 'IT導入補助金',
    'ものづくり補助金', '小規模事業者持続化補助金',
  ],
  // コンプライアンス文脈で使うロングテール
  compliance: [
    'コンプライアンス', '罰則', '両罰規定', '無資格', '違反リスク',
    '法務担当', '業務委託', 'アウトソーシング', '名義貸し', '代行サービス',
    '違法', '資格が必要', '行政書士資格なし', '無資格代行 違法', '合法的に代行',
  ],
}

// 実際の検索ニーズに直結する優先テーマ
// 「○○は行政書士資格なしで違法か？」という実務Qに答える記事を積極的に生成する
const PRIORITY_QUESTION_THEMES = [
  '補助金申請の代行に行政書士資格は必要か・無資格でできる範囲',
  '補助金コンサルが行政書士法違反になるケース・ならないケース',
  '事業再構築補助金・IT導入補助金の申請代行は資格が必要か',
  '許認可申請の代行を外注する際の法的リスク',
  '在留資格申請をコンサルが代行すると違法になる条件',
  '建設業許可申請を社労士・税理士が代行できるか',
  '会社設立手続きを無資格者が代行した場合の罰則',
  'ビザ申請代行サービスを提供する企業が注意すべき行政書士法の規制',
  '農地転用申請を農業コンサルが代理できるか',
  '相続手続きのワンストップ代行サービスはどこまで合法か',
]

export async function generateArticle(scrapedContent: ScrapedContent[], recentTitles: string[] = [], popularThemes: string[] = [], gapQueries: string[] = []) {
  const sourceText = scrapedContent
    .slice(0, 5)
    .map(s => `【${s.source}】\n${s.content}`)
    .join('\n\n---\n\n')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: `あなたは行政書士法コンプライアンス専門の法務メディアライターです。
企業の法務・コンプライアンス担当者・中小企業経営者・ビジネスコンサルタントが「これは違法になるのか？資格が必要なのか？」と疑問を持って検索する実務記事を書きます。

【最重要：記事フォーマットの優先順位】
以下の優先順で記事フォーマットを選んでください：

1. **実務Q&A形式（最優先）**：「補助金申請の代行に資格は必要か」「○○を無資格でやると違法か」など、読者の具体的な疑問に直接答える記事。タイトルは疑問形または結論から始める形式で。
   例：「補助金申請代行に行政書士資格は必要か？無資格でできる範囲を解説」
   例：「IT導入補助金の申請代行は違法？コンサルが知っておくべき行政書士法のライン」

2. **ニュース解説形式**：収集情報に具体的な最新ニュース・通達・改正・事件がある場合に使用。タイトルにそのトピックを前面に出す。

3. **事例分析・チェックリスト形式**：具体的なビジネスシナリオを題材にした実践的な記事。

【優先的に扱うテーマ（検索ニーズが確認済み）】
以下のテーマは積極的に取り上げてください：
${PRIORITY_QUESTION_THEMES.map(t => `- ${t}`).join('\n')}

【禁止事項】
- 「●●と2026年改正行政書士法の実務対応」のような固定パターンのタイトル
- 風俗営業・性風俗・わいせつ関連テーマ
- 抽象的な法改正概要だけで実務への影響が不明な記事

【SEOキーワード戦略（本文・メタ情報に自然に埋め込む）】
以下のキーワードは詰め込み禁止。文脈に合った箇所にのみ使用してください：
- コアキーワード: ${TARGET_KEYWORDS.required.join('、')}
- 関連ビッグワード（内容に合うものを2〜3語）: ${TARGET_KEYWORDS.bigWords.join('、')}
- コンプライアンス関連（内容に合うものを1〜2語）: ${TARGET_KEYWORDS.compliance.join('、')}
- h2見出し（3〜4個）にキーワードを入れること
- 冒頭100字以内にコアキーワードを最低1語配置すること
- tagsには記事で扱ったキーワードを含めること（3〜5個）`,
    messages: [{
      role: 'user',
      content: `以下の官公庁・ニュース情報をもとに記事を1本作成してください。

${recentTitles.length > 0 ? `【掲載済み記事タイトル（これらと重複するトピックは避けてください）】\n${recentTitles.map(t => `・${t}`).join('\n')}\n\n` : ''}${gapQueries.length > 0 ? `【GSCギャップクエリ（実際に検索されているが専用記事がない・最優先テーマ）】\n${gapQueries.map(q => `・${q}`).join('\n')}\nこれらのクエリに直接答える実務Q&A形式の記事を最優先で選んでください。タイトルはクエリの疑問に正面から答える形にしてください。\n\n` : ''}${popularThemes.length > 0 ? `【読者に人気のテーマ（関連トピックを優先してください）】\n${popularThemes.join('、')}\n\n` : ''}【収集情報】
${sourceText}

以下のJSON形式のみで出力（前後に文章不要）：
{
  "title": "記事タイトル（30字以内・収集情報の具体的なニューストピックを前面に出す・固定パターン禁止）",
  "slug": "url-safe-english-slug",
  "content": "記事本文HTML（<h2><p>タグ使用・2500〜3000字・キーワードを見出しと冒頭に配置・h2は3〜4個・各セクションを具体的に肉付けすること）",
  "summary": "要約文（100字以内・必須キーワードを含む）",
  "seo_title": "SEOタイトル（32字以内・検索意図に合わせビッグワードを先頭寄りに）",
  "seo_description": "メタディスクリプション（120字以内・キーワードと行動喚起を含む）",
  "tags": ["使用したキーワード3〜5個"],
  "tweet_text": "ツイート本文（URLなし・110字以内・ハッシュタグ2〜3個・末尾に「→ 詳細はこちら」または「続きを読む↓」を必ず付ける）",
  "faq": [
    { "question": "読者が実際に検索しそうな質問（記事内容に基づく）", "answer": "100字以内の簡潔な回答" },
    { "question": "別の質問", "answer": "回答" },
    { "question": "別の質問", "answer": "回答" }
  ]
}`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('JSON生成失敗')

  // JSON文字列リテラル内の制御文字をエスケープ（Claude出力にリテラル改行が混入する場合の対策）
  const sanitized = jsonMatch[0].replace(/"(?:[^"\\]|\\.)*"/g, (match) =>
    match.replace(/[\x00-\x1F\x7F]/g, (char) => {
      const escapes: { [key: string]: string } = { '\n': '\\n', '\r': '\\r', '\t': '\\t', '\f': '\\f', '\b': '\\b' }
      return escapes[char] ?? `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`
    })
  )
  const article = JSON.parse(sanitized)
  article.slug = `${article.slug}-${Date.now()}`
  article.status = 'published'

  return article
}
