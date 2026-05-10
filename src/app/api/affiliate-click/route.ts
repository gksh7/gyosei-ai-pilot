import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const affiliateId = searchParams.get('id')
  const articleId = searchParams.get('article_id')

  if (!affiliateId) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('a8_link, is_active')
    .eq('id', affiliateId)
    .maybeSingle()

  if (!affiliate?.is_active) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (articleId) {
    const today = new Date().toISOString().split('T')[0]
    const { data: existing } = await supabase
      .from('analytics')
      .select('id, affiliate_clicks')
      .eq('article_id', articleId)
      .eq('date', today)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('analytics')
        .update({ affiliate_clicks: existing.affiliate_clicks + 1 })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('analytics')
        .insert({ article_id: articleId, date: today, page_views: 0, clicks: 0, affiliate_clicks: 1 })
    }
  }

  return NextResponse.redirect(affiliate.a8_link)
}
