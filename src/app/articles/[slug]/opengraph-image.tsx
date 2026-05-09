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
    .select('title, tags')
    .eq('slug', slug)
    .single()

  const title = article?.title ?? '行政書士AI Pilot'
  const tags: string[] = article?.tags?.slice(0, 3) ?? []

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gyosei-ai-pilot.com'
  const fontData = await fetch(`${siteUrl}/fonts/NotoSansJP-Bold.woff2`).then((res) =>
    res.arrayBuffer()
  )

  const fontSize = title.length > 35 ? 40 : title.length > 20 ? 48 : 56

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0f172a',
          padding: '64px',
          fontFamily: 'NotoSansJP',
        }}
      >
        {/* ゴールドアクセントバー */}
        <div
          style={{
            width: '72px',
            height: '4px',
            backgroundColor: '#b8922e',
            marginBottom: '28px',
          }}
        />

        {/* サイト名 */}
        <div
          style={{
            color: '#b8922e',
            fontSize: '26px',
            fontWeight: 700,
            marginBottom: '32px',
            letterSpacing: '0.02em',
          }}
        >
          行政書士AI Pilot｜2026法改正ナビ
        </div>

        {/* 記事タイトル */}
        <div
          style={{
            color: '#ffffff',
            fontSize: `${fontSize}px`,
            fontWeight: 700,
            lineHeight: 1.5,
            flex: 1,
          }}
        >
          {title}
        </div>

        {/* タグ + ドメイン */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  backgroundColor: 'rgba(184, 146, 46, 0.2)',
                  color: '#e0c45a',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  fontSize: '20px',
                }}
              >
                #{tag}
              </div>
            ))}
          </div>
          <div style={{ color: '#64748b', fontSize: '20px' }}>
            gyosei-ai-pilot.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'NotoSansJP',
          data: fontData,
          weight: 700,
        },
      ],
    }
  )
}
