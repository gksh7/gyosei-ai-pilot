import { supabase } from './supabase-client'

const playwrightSites = ['デジタル庁', '経済産業省', 'NHKニュース']

async function update() {
  for (const name of playwrightSites) {
    const { error } = await supabase
      .from('sources')
      .update({ scrape_method: 'playwright' })
      .eq('name', name)
    if (error) console.error(`❌ ${name}:`, error)
    else console.log(`✅ ${name} → playwright`)
  }
}

update()
