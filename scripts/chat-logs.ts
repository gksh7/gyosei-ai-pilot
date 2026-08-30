import { supabase } from './supabase-client'

/**
 * チャットボットの利用状況を確認する。
 *   npx tsx scripts/chat-logs.ts          直近30件の質問＋日別件数
 *   npx tsx scripts/chat-logs.ts 100      直近100件
 */

async function main() {
  const limit = Number(process.argv[2] ?? 30)

  const { data, error } = await supabase
    .from('chat_logs')
    .select('created_at, question, turn_count, ip_hash')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('❌', error.message)
    console.error('   chat_logs テーブルが未作成の可能性があります（README/SQL参照）')
    process.exit(1)
  }

  const rows = data ?? []
  console.log(`\n=== 直近 ${rows.length} 件 ===`)
  for (const r of rows) {
    const t = new Date(r.created_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
    const turn = r.turn_count > 1 ? ` (${r.turn_count}ターン目)` : ''
    console.log(`${t}  [${r.ip_hash ?? '--------'}]${turn}\n  ${r.question}`)
  }

  // 日別件数（取得範囲内）
  const byDay = new Map<string, number>()
  const byIp = new Set<string>()
  for (const r of rows) {
    const day = new Date(r.created_at).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })
    byDay.set(day, (byDay.get(day) ?? 0) + 1)
    if (r.ip_hash) byIp.add(r.ip_hash)
  }
  console.log(`\n=== 日別件数（直近${rows.length}件の範囲） ===`)
  for (const [day, n] of [...byDay.entries()].sort().reverse()) {
    console.log(`  ${day}: ${n}件`)
  }
  console.log(`\nユニーク利用者（ip_hash）: ${byIp.size}`)
  process.exit(0)
}

main()
