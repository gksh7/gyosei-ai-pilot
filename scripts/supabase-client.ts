import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ws = require('ws')

// パイプラインはRLSをバイパスできるservice_role keyを使用
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey,
  {
    realtime: { transport: ws },
  }
)
