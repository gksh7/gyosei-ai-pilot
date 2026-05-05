import { supabase } from './supabase-client'

const sources = [
  { name: 'e-Gov法令検索', url: 'https://elaws.e-gov.go.jp/search/elawsSearch/elaws_search/lsg0100/', tier: 1, scrape_method: 'cheerio', frequency: 'daily' },
  { name: 'NHKニュース', url: 'https://www3.nhk.or.jp/news/cat07.html', tier: 2, scrape_method: 'cheerio', frequency: 'daily' },
  { name: '公正取引委員会', url: 'https://www.jftc.go.jp/pressrelease/index.html', tier: 2, scrape_method: 'cheerio', frequency: 'daily' },
]

async function add() {
  const { error } = await supabase.from('sources').insert(sources)
  if (error) console.error('❌ エラー:', error)
  else console.log('✅ 追加完了')
}

add()
