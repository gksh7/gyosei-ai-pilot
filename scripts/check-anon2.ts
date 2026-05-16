import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { realtime: { transport: () => null as any } as any }
)

async function main() {
  const { data, error } = await supabase
    .from('articles')
    .select('slug')
    .eq('status', 'published')
    .limit(1)
  console.log('data:', data)
  console.log('error:', error)
  process.exit(0)
}
main()
