import { supabase } from './supabase-client'
import { notifyIndexing } from './indexing-client'

const SITE_BASE = 'https://gyosei-ai-pilot.com'

const updates = [
  {
    currentTitle: '補助金申請代行は行政書士法違反か｜法的にセーフな範囲を解説',
    newTitle: '補助金申請代行は違法？行政書士法を遵守した安全な代行範囲',
  },
  {
    currentTitle: '古物商許可の申請を自分でする方法｜必要書類と費用の完全ガイド',
    newTitle: '古物商許可を最短で取得する方法｜申請書類と費用を徹底解説',
  },
  {
    currentTitle: '建設業許可を無資格で代行すると違法か？行政書士法の罰則を解説',
    newTitle: '建設業許可の無資格代行は違法？行政書士法違反の罰則と対処法',
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
