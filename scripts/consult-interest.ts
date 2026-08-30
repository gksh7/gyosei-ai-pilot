import { supabase } from './supabase-client'

/**
 * 「行政書士に相談したい」ボタンの需要を確認する。
 *   npx tsx scripts/consult-interest.ts        直近50件＋集計
 */

async function main() {
  const limit = Number(process.argv[2] ?? 50)

  const { data, error } = await supabase
    .from('consult_interest')
    .select('created_at, source, context, ip_hash')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('❌', error.message)
    console.error('   consult_interest テーブルが未作成の可能性があります（scripts/consult-interest.sql）')
    process.exit(1)
  }

  const rows = data ?? []
  console.log(`\n=== 直近 ${rows.length} 件 ===`)
  for (const r of rows) {
    const t = new Date(r.created_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
    console.log(`${t}  [${r.source}]  ${r.context ?? ''}`)
  }

  const bySource = new Map<string, number>()
  const byDay = new Map<string, number>()
  const uniqIp = new Set<string>()
  for (const r of rows) {
    bySource.set(r.source, (bySource.get(r.source) ?? 0) + 1)
    const day = new Date(r.created_at).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })
    byDay.set(day, (byDay.get(day) ?? 0) + 1)
    if (r.ip_hash) uniqIp.add(r.ip_hash)
  }

  console.log(`\n=== ソース別 ===`)
  for (const [s, n] of bySource) console.log(`  ${s}: ${n}`)
  console.log(`\n=== 日別 ===`)
  for (const [d, n] of [...byDay.entries()].sort().reverse()) console.log(`  ${d}: ${n}`)
  console.log(`\nユニーク（ip_hash）: ${uniqIp.size}`)
  process.exit(0)
}

main()
