import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data } = await supabase
    .from('affiliates')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  return NextResponse.json(data ?? [])
}
