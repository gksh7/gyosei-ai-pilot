import { supabase } from './supabase-client'

async function main() {
  const { data, error } = await supabase
    .from('articles')
    .select('id, slug, status, created_at')
    .order('created_at', { ascending: false })
    .limit(3)
  console.log(JSON.stringify(data, null, 2))
  if (error) console.error('error:', error)
  process.exit(0)
}
main()
