import { supabase } from './supabase'
import type { Affiliate } from './types'

export async function getMatchingAffiliates(tags: string[]): Promise<Affiliate[]> {
  const { data } = await supabase
    .from('affiliates')
    .select('*')
    .eq('is_active', true)

  if (!data || data.length === 0) return []

  const normalizedTags = tags.map((t) => t.toLowerCase())

  const agaroot = (data as Affiliate[]).filter(
    (a) => a.service_name === 'アガルート行政書士講座'
  )

  const specific = (data as Affiliate[]).filter(
    (a) => a.service_name !== 'アガルート行政書士講座' &&
      a.categories && a.categories.length > 0 &&
      a.categories.some((c) => normalizedTags.includes(c.toLowerCase()))
  )

  // カテゴリ未設定のものは全記事に表示する汎用枠
  const general = (data as Affiliate[]).filter(
    (a) => a.service_name !== 'アガルート行政書士講座' &&
      (!a.categories || a.categories.length === 0)
  )

  return [...agaroot, ...specific, ...general].slice(0, 3)
}
