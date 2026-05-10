import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import { readFile } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'
export const alt = '行政書士AI Pilot｜2026法改正ナビ'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function splitTitle(title: string, charsPerLine: number): string[] {
  const lines: string[] = []
  for (let i = 0; i < title.length; i += charsPerLine) {
    lines.push(title.slice(i, i + charsPerLine))
  }
  return lines
}

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
  const titleLines = splitTitle(title, 12)
  const fontSize = titleLines.length >= 3 ? 42 : titleLines.length === 2 ? 50 : 56

  const [bgData, fontData] = await Promise.all([
    readFile(path.join(process.cwd(), 'public', 'ogp-bg.png')),
    readFile(path.join(process.cwd(), 'public', 'fonts', 'NotoSansJP-ExtraBold.ttf')),
  ])
  const bgSrc = `data:image/png;base64,${bgData.toString('base64')}`

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative' }}>
        {/* 背景画像 */}
        <img
          src={bgSrc}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* コンテンツ */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '64px',
          }}
        >
          <div style={{ width: '72px', height: '4px', backgroundColor: '#f5d060', marginBottom: '28px' }} />

          <div style={{ color: '#f5d060', fontSize: '26px', fontWeight: 400, fontFamily: 'sans-serif', marginBottom: '32px' }}>
            行政書士AI Pilot | 2026法改正ナビ
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {titleLines[0] && (
              <div style={{ color: '#ffffff', fontSize: `${fontSize}px`, fontWeight: 800, fontFamily: 'NotoSansJP', lineHeight: 1.4 }}>
                {titleLines[0]}
              </div>
            )}
            {titleLines[1] && (
              <div style={{ color: '#ffffff', fontSize: `${fontSize}px`, fontWeight: 800, fontFamily: 'NotoSansJP', lineHeight: 1.4 }}>
                {titleLines[1]}
              </div>
            )}
            {titleLines[2] && (
              <div style={{ color: '#ffffff', fontSize: `${fontSize}px`, fontWeight: 800, fontFamily: 'NotoSansJP', lineHeight: 1.4 }}>
                {titleLines[2]}
              </div>
            )}
            {titleLines[3] && (
              <div style={{ color: '#ffffff', fontSize: `${fontSize}px`, fontWeight: 800, fontFamily: 'NotoSansJP', lineHeight: 1.4 }}>
                {titleLines[3]}
              </div>
            )}
          </div>

          <div style={{ color: '#ffffff', fontSize: '20px', fontWeight: 300, fontFamily: 'sans-serif', marginTop: 'auto' }}>
            gyosei-ai-pilot.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'NotoSansJP', data: fontData, weight: 800, style: 'normal' }],
    }
  )
}
