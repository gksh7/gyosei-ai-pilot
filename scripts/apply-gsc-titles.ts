import { supabase } from './supabase-client'
import { notifyIndexing } from './indexing-client'

const SITE_BASE = 'https://gyosei-ai-pilot.com'

const updates = [
  {
    currentTitle: '補助金申請代行の違法ライン｜行政書士法で許可される範囲',
    newTitle: '補助金申請代行は違法？行政書士が解説する許可範囲',
  },
  {
    currentTitle: '古物商許可の申請書類と費用｜最短で取得する方法を行政書士が解説',
    newTitle: '古物商許可申請｜必要書類・費用・期間を行政書士が徹底解説',
  },
  {
    currentTitle: '建設業許可の無資格代行は罰金100万円以下？行政書士法違反の全知識',
    newTitle: '建設業許可申請を無資格者に依頼したら違法？｜行政書士法コンプライアンス',
  },
  {
    currentTitle: '無資格で行政書士業務をすると刑事罰？罰金・懲役の具体額と事例',
    newTitle: '行政書士資格なしでも大丈夫？法的リスクと違反事例まとめ',
  },
  {
    currentTitle: '行政書士法違反になる無資格代行業務｜罰則・両罰規定も解説',
    newTitle: '無資格代行は犯罪｜行政書士法違反の罰則と企業責任',
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
