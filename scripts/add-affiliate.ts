import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ws = require('ws')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws } }
)

const newAffiliate = {
  service_name: 'アガルート行政書士講座',
  description: '合格率全国平均の4倍超。行政書士試験の通信講座。',
  a8_link: 'https://px.a8.net/svt/ejp?a8mat=4B3N6Q+55R9IQ+44M0+631SX',
  categories: ['行政書士', '資格取得', '通信教育', 'コンプライアンス'],
  is_active: true,
}

async function main() {
  const { data, error } = await supabase
    .from('affiliates')
    .insert(newAffiliate)
    .select()

  if (error) {
    console.error('Error:', error)
    process.exit(1)
  }

  console.log('追加完了:', data)
}

main()
