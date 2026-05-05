import { supabase } from './supabase-client'

const sources = [
  // Tier 1
  { name: 'デジタル庁', url: 'https://www.digital.go.jp/news/', tier: 1, scrape_method: 'cheerio', frequency: 'daily' },
  { name: '経済産業省', url: 'https://www.meti.go.jp/press/index.html', tier: 1, scrape_method: 'cheerio', frequency: 'daily' },
  { name: '法務省', url: 'https://www.moj.go.jp/news.html', tier: 1, scrape_method: 'cheerio', frequency: 'daily' },
  { name: '総務省', url: 'https://www.soumu.go.jp/menu_news/s-news/index.html', tier: 1, scrape_method: 'cheerio', frequency: 'daily' },
  { name: '日本行政書士会連合会', url: 'https://www.gyosei.or.jp/information/', tier: 1, scrape_method: 'cheerio', frequency: 'daily' },
  // Tier 2
  { name: '内閣府', url: 'https://www.cao.go.jp/others/csi/news/index.html', tier: 2, scrape_method: 'cheerio', frequency: 'daily' },
  { name: '国税庁', url: 'https://www.nta.go.jp/information/release/index.htm', tier: 2, scrape_method: 'cheerio', frequency: 'daily' },
  { name: '中小企業庁', url: 'https://www.chusho.meti.go.jp/koukai/other/oshirase/index.html', tier: 2, scrape_method: 'cheerio', frequency: 'daily' },
  // Tier 3
  { name: 'IPA', url: 'https://www.ipa.go.jp/security/announce/index.html', tier: 3, scrape_method: 'cheerio', frequency: 'weekly' },
  { name: '厚生労働省', url: 'https://www.mhlw.go.jp/stf/newpage_index.html', tier: 3, scrape_method: 'cheerio', frequency: 'weekly' },
]

async function seed() {
  const { error } = await supabase.from('sources').insert(sources)
  if (error) console.error('❌ エラー:', error)
  else console.log('✅ sourcesテーブルにデータを投入しました')
}

seed()
