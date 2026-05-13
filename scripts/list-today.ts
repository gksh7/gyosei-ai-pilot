import { supabase } from './supabase-client'

async function main() {
  // JST 2026-05-14 = UTC 2026-05-13T15:00 〜 2026-05-14T15:00
  const { data, error } = await supabase
    .from('articles')
    .select('id, slug, title, created_at')
    .gte('created_at', '2026-05-13T15:00:00')
    .lte('created_at', '2026-05-14T15:00:00')
    .order('created_at', { ascending: false })

  if (error) { console.error(error); process.exit(1) }
  if (!data || data.length === 0) {
    console.log('今日の記事はありません')
  } else {
    data.forEach((a: { id: string; slug: string; title: string; created_at: string }) => {
      const jst = new Date(a.created_at + (a.created_at.endsWith('Z') ? '' : '+00:00'))
      console.log(`ID: ${a.id}`)
      console.log(`タイトル: ${a.title}`)
      console.log(`スラッグ: ${a.slug}`)
      console.log(`投稿時刻(UTC): ${a.created_at}`)
      console.log('---')
    })
  }
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
