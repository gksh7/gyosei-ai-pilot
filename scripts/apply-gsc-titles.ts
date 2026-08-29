import { supabase } from './supabase-client'
import { notifyIndexing } from './indexing-client'

const SITE_BASE = 'https://gyosei-ai-pilot.com'

// 2026-08 バッチ: GSC実データ（3か月）に基づくタイトル改善
//  - construction-permit: 5.4位なのにCTR1.6% → SERPで切れる末尾を削り訴求を前に
//  - inheritance-tax: 7.5位なのにCTR1.3%、勝ちクエリ「相続コンサルタント 違法」に寄せる
//  - pillar-kobutsu: 「古物商許可 申請 自分」で32位 → タイトルに「自分で」を明示
const updates = [
  {
    currentTitle: '建設業許可申請を無資格者に依頼したら違法？｜行政書士法コンプライアンス',
    newTitle: '建設業許可の代行は行政書士だけ？無資格依頼の違法リスク',
  },
  {
    currentTitle: '相続税調査と無資格代行：行政書士法の境界線',
    newTitle: '相続手続きの代行はどこまで合法？無資格コンサルの違反リスク',
  },
  {
    currentTitle: '古物商許可申請｜必要書類・費用・期間を行政書士が徹底解説',
    newTitle: '古物商許可を自分で取る方法｜必要書類・費用・期間を解説',
  },
]

async function apply() {
  for (const { currentTitle, newTitle } of updates) {
    const { data: article, error: findError } = await supabase
      .from('articles')
      .select('id, slug, title')
      .eq('title', currentTitle)
      .single()

    if (findError || !article) {
      console.error(`❌ 記事が見つかりません: ${currentTitle}`, findError?.message)
      continue
    }

    const { error: updateError } = await supabase
      .from('articles')
      .update({ title: newTitle, seo_title: newTitle, updated_at: new Date().toISOString() })
      .eq('id', article.id)

    if (updateError) {
      console.error(`❌ 更新失敗 (${article.slug}):`, updateError.message)
      continue
    }

    console.log(`✅ ${article.slug}\n   旧: ${currentTitle}\n   新: ${newTitle}`)

    try {
      await notifyIndexing(`${SITE_BASE}/articles/${article.slug}`)
    } catch (err) {
      console.error(`⚠️  Indexing API通知失敗 (${article.slug}):`, err)
    }
  }
}

apply()
