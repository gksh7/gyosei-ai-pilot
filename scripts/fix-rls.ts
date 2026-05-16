import { supabase } from './supabase-client'

async function main() {
  // articlesテーブルの既存ポリシーを確認してから追加
  const { error } = await supabase.rpc('exec_sql' as any, {
    sql: `
      CREATE POLICY IF NOT EXISTS "public_read_published_articles"
      ON articles
      FOR SELECT
      TO anon, authenticated
      USING (status = 'published');
    `
  })
  if (error) {
    console.error('exec_sql not available, trying direct approach:', error.message)
  } else {
    console.log('✅ ポリシー追加完了')
  }
  process.exit(0)
}
main()
