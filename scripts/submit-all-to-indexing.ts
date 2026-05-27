import { supabase } from './supabase-client'
import { notifyIndexing } from './indexing-client'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gyosei-ai-pilot.com'
const DELAY_MS = 200 // Indexing API は 1 日 200 件制限あり

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('slug')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Supabase error:', error)
    process.exit(1)
  }

  const urls = [
    SITE_URL,
    `${SITE_URL}/articles`,
    `${SITE_URL}/diagnosis`,
    ...(articles ?? []).map((a) => `${SITE_URL}/articles/${a.slug}`),
  ]

  console.log(`📋 送信対象: ${urls.length} URL`)

  let success = 0
  let failed = 0

  for (const url of urls) {
    try {
      await notifyIndexing(url)
      success++
    } catch (e) {
      console.error(`❌ 失敗: ${url}`, e)
      failed++
    }
    await sleep(DELAY_MS)
  }

  console.log(`\n✅ 完了 — 成功: ${success} / 失敗: ${failed}`)
}

main()
