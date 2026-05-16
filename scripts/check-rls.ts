import { supabase } from './supabase-client'

async function main() {
  const { data, error } = await supabase
    .rpc('exec_sql', {
      sql: `SELECT tablename, policyname, cmd, qual FROM pg_policies WHERE tablename = 'articles' ORDER BY policyname;`
    })
  if (error) {
    // Try direct query
    const { data: d2, error: e2 } = await supabase
      .from('articles')
      .select('count')
    console.log('count result:', d2, e2)
  } else {
    console.log('policies:', JSON.stringify(data, null, 2))
  }
  process.exit(0)
}
main()
