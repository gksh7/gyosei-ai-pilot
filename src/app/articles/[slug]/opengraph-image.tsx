import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const alt = '行政書士AI Pilot｜2026法改正ナビ'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  const { data: article } = await supabase
    .from('articles')
    .select('title')
    .eq('slug', slug)
    .single()

  const title = article?.title ?? '行政書士AI Pilot'
  const fontSize = title.length > 35 ? 40 : title.length > 20 ? 48 : 56

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#1e5da9',
          padding: '64px',
        }}
      >
        <div style={{ width: '72px', height: '4px', backgroundColor: '#b8922e', marginBottom: '28px' }} />

        <div style={{ color: '#b8922e', fontSize: '34px', fontWeight: 700, marginBottom: '32px' }}>
          行政書士AI Pilot | 2026法改正ナビ
        </div>

        <div style={{ color: '#ffffff', fontSize: `${fontSize}px`, fontWeight: 700, lineHeight: 1.5 }}>
          {title}
        </div>

        <div style={{ color: '#64748b', fontSize: '20px', marginTop: 'auto' }}>
          gyosei-ai-pilot.com
        </div>
      </div>
    ),
    { ...size }
  )
}
