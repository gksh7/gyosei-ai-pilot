import { config } from 'dotenv'
config({ path: '.env.local' })
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from './supabase-client'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// 実際に検索されるクエリをターゲットにしたピラー記事のテーマ
const PILLAR_TOPICS = [
  {
    keyword: '補助金申請 代行 違法',
    intent: '補助金申請を外部業者に依頼するのが違法かどうか知りたい企業担当者',
    title_hint: '補助金申請の「代行」は違法？外注・委託の境界線を実務から解説',
    angle: '補助金申請書の作成を外部に任せると行政書士法違反になるケース・ならないケースを具体例つきで解説する。無資格者への依頼リスク、合法的な依頼先の見分け方も含める。',
  },
  {
    keyword: '会社設立 行政書士 必要か 自分でできる',
    intent: '会社設立を自分でやるか行政書士に頼むか迷っている人',
    title_hint: '会社設立は自分でできる？行政書士に頼む必要があるケースを全部解説',
    angle: '合同会社・株式会社の設立手続きのうち自分でできる部分と行政書士が必要な部分を整理。費用比較・時間比較・リスク比較を具体的に示す。',
  },
  {
    keyword: '建設業許可 自分で 取り方 費用',
    intent: '建設業許可を自分で取得しようとしている建設会社・個人事業主',
    title_hint: '建設業許可を自分で取る方法と費用｜行政書士に頼む場合との比較',
    angle: '建設業許可の申請手順（知事許可・大臣許可）を自分で行う場合の手順・費用・期間を解説。行政書士に依頼する場合の相場と比較し、どちらが合理的かを示す。',
  },
  {
    keyword: '行政書士 何をしてくれる 費用 相場',
    intent: '行政書士に依頼することを検討しているが何をどのくらいの費用でやってくれるか知りたい',
    title_hint: '行政書士に頼めること一覧と費用相場【2026年最新版】',
    angle: '行政書士が対応できる業務（許認可・会社設立・在留資格・遺言・補助金等）を網羅的に一覧化。各業務の費用相場・期間・自分でやる場合との比較を具体的に記載。',
  },
  {
    keyword: '無資格 行政書士業務 罰則 バレる',
    intent: '無資格で行政書士業務をやっている・やらせている企業が罰則リスクを知りたい',
    title_hint: '無資格で行政書士業務をすると罰則はどうなる？摘発事例と対処法',
    angle: '改正行政書士法の罰則（1年以下の懲役・100万円以下の罰金）、両罰規定で会社も処罰される点、実際の摘発パターン（補助金代行・在留資格代行等）を具体的に解説。',
  },
  {
    keyword: '在留資格 申請 行政書士 費用 自分で',
    intent: '外国人雇用している企業・外国人本人が在留資格申請を自分でやるか行政書士に頼むか検討している',
    title_hint: '在留資格の申請は自分でできる？行政書士に頼む場合の費用と手順',
    angle: '在留資格申請（就労ビザ・配偶者ビザ等）を本人・企業が自分でする場合の手順と、行政書士（申請取次行政書士）に依頼する場合の費用・メリットを比較する。',
  },
  {
    keyword: '相続手続き 行政書士 司法書士 違い',
    intent: '相続手続きで行政書士と司法書士のどちらに頼めばよいか迷っている人',
    title_hint: '相続手続きは行政書士と司法書士どちらに頼む？業務範囲と費用の違い',
    angle: '相続手続きのうち行政書士が対応できるもの（遺産分割協議書・農地転用等）と司法書士が必要なもの（不動産登記等）を明確に区別。費用相場と依頼先の選び方も解説。',
  },
  {
    keyword: '古物商許可 自分で 取り方 必要書類',
    intent: 'フリマ・リサイクルショップ開業を検討している人',
    title_hint: '古物商許可を自分で取る方法｜必要書類・費用・申請手順を全解説',
    angle: '古物商許可申請の必要書類一覧・警察署への申請手順・費用（19,000円の申請手数料）を自分で申請する場合の手順として解説。行政書士に依頼する場合の相場も比較。',
  },
]

type PillarArticle = {
  title: string
  slug: string
  content: string
  summary: string
  seo_title: string
  seo_description: string
  tags: string[]
  tweet_text: string
  faq: { question: string; answer: string }[]
}

async function generatePillarArticle(topic: typeof PILLAR_TOPICS[0]): Promise<PillarArticle> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 6000,
    system: `あなたは行政書士・法務手続きの専門メディアライターです。
読者が実際にGoogleで検索するキーワードをターゲットにした、エバーグリーン（時事に依存しない）のピラー記事を書きます。

【記事の品質基準】
- 検索意図に完全に答えること（読者の疑問をすべて解消する）
- 3000〜4000字の充実した内容
- h2見出しを4〜5個使い、各セクションを400字以上で具体的に書く
- 数字・具体例・費用相場・期間を必ず含める
- 「〜でしょう」「〜かもしれません」は使わない。断言できることは断言する
- Google Helpful Content Guidelinesに準拠した一次情報に近い内容`,
    messages: [{
      role: 'user',
      content: `以下のターゲットキーワードと読者意図に基づいて、ピラー記事を1本作成してください。

【ターゲットキーワード】
${topic.keyword}

【読者の検索意図】
${topic.intent}

【タイトル案（参考）】
${topic.title_hint}

【記事の切り口・内容方針】
${topic.angle}

以下のJSON形式のみで出力（前後に文章不要）：
{
  "title": "記事タイトル（32字以内・ターゲットキーワードを先頭寄りに・疑問形または具体的メリット訴求）",
  "slug": "url-safe-english-slug（ハイフン区切り・30字以内）",
  "content": "記事本文HTML（<h2><h3><p><ul><ol>タグ使用・3000〜4000字・h2は4〜5個・各セクション400字以上・費用・期間・具体例を必ず含める）",
  "summary": "要約文（120字以内・ターゲットキーワードを含む・記事の核心を伝える）",
  "seo_title": "SEOタイトル（32字以内・ターゲットキーワードを先頭に）",
  "seo_description": "メタディスクリプション（120字以内・キーワードと検索意図への回答を含む）",
  "tags": ["ターゲットキーワードを含む関連タグ3〜5個"],
  "tweet_text": "ツイート本文（URLなし・110字以内・ハッシュタグ2〜3個・末尾に「→ 詳細はこちら」）",
  "faq": [
    { "question": "読者が実際に検索しそうな関連質問", "answer": "100字以内の具体的な回答" },
    { "question": "別の質問", "answer": "回答" },
    { "question": "別の質問", "answer": "回答" }
  ]
}`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`JSON生成失敗: ${topic.keyword}`)

  const article = JSON.parse(jsonMatch[0]) as PillarArticle
  // ピラー記事は slug に pillar- プレフィックスをつけて通常記事と区別
  article.slug = `pillar-${article.slug}-${Date.now()}`
  return article
}

async function run() {
  // コマンドライン引数でインデックス指定（例: tsx scripts/pillar-generator.ts 0 2 5）
  // 引数なしで全件実行
  const args = process.argv.slice(2)
  const targets = args.length > 0
    ? args.map(n => PILLAR_TOPICS[parseInt(n)]).filter(Boolean)
    : PILLAR_TOPICS

  console.log(`🏛️ ピラー記事生成開始: ${targets.length}件`)

  for (const topic of targets) {
    console.log(`\n📝 生成中: "${topic.keyword}"`)
    try {
      const article = await generatePillarArticle(topic)
      console.log(`  タイトル: ${article.title}`)
      console.log(`  文字数概算: ${article.content.length}字（HTML含む）`)

      const { data, error } = await supabase
        .from('articles')
        .insert({ ...article, status: 'published' })
        .select('id, slug')
        .single()

      if (error) {
        console.error(`  ❌ 保存失敗:`, error.message)
        continue
      }
      console.log(`  ✅ 保存完了: /articles/${data.slug}`)

      // レート制限回避（連続生成時）
      if (targets.indexOf(topic) < targets.length - 1) {
        await new Promise(r => setTimeout(r, 3000))
      }
    } catch (err) {
      console.error(`  ❌ 生成失敗: ${topic.keyword}`, (err as Error).message)
    }
  }

  console.log('\n🎉 ピラー記事生成完了')
}

run().catch(err => {
  console.error('エラー:', err)
  process.exit(1)
})
