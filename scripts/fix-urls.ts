import { supabase } from './supabase-client'

const updates = [
  { name: '法務省', url: 'https://www.moj.go.jp/press_index.html' },
  { name: '内閣府', url: 'https://www.cao.go.jp/press/index.html' },
  { name: '公正取引委員会', url: 'https://www.jftc.go.jp/houdou/pressrelease/index.html' },
  { name: '厚生労働省', url: 'https://www.mhlw.go.jp/stf/houdou/index.html' },
  { name: '経済産業省', url: 'https://www.meti.go.jp/whatsnew.html', scrape_method: 'cheerio' },
]

async function fix() {
  for (const update of updates) {
    const patch: Record<string, string> = { url: update.url }
    if (update.scrape_method) patch.scrape_method = update.scrape_method

    const { error } = await supabase
      .from('sources')
      .update(patch)
      .eq('name', update.name)

    if (error) console.error(`❌ ${update.name}:`, error)
    else console.log(`✅ ${update.name} → ${update.url}`)
  }
}

fix()
