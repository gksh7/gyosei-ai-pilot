import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const alt = '行政書士AI Pilot｜2026法改正ナビ'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const fontData = await fetch(
    'https://gyosei-ai-pilot.com/fonts/NotoSansJP-Bold.woff2'
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#b8922e',
          fontSize: '48px',
          fontFamily: 'NotoSansJP',
        }}
      >
        行政書士AI Pilot
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'NotoSansJP', data: fontData, weight: 700 }],
    }
  )
}
