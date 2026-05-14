import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import { readFile } from 'fs/promises'
import path from 'path'
import { loadDefaultJapaneseParser } from 'budoux'

export const runtime = 'nodejs'
export const alt = '行政書士AI Pilot｜2026法改正ナビ'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const budouxParser = loadDefaultJapaneseParser()

// 漢字/仮名 ↔ ASCII/数字の境界でチャンクをさらに細かく分割する
// 例: '行政書士法2026年改正の' → ['行政書士法', '2026年', '改正の']
function subSplitChunk(chunk: string): string[] {
  if (chunk.length <= 4) return [chunk]
  const result: string[] = []
  let current = ''
  let prevIsAscii = /[0-9a-zA-Z]/.test(chunk[0])

  for (const char of chunk) {
    const isAscii = /[0-9a-zA-Z]/.test(char)
    if (current.length > 0 && isAscii !== prevIsAscii) {
      if (prevIsAscii && /[年月日時分秒週]/.test(char)) {
        // 数字+助数詞はくっつけて直後で分割（例: 2026年、75年、3月）
        current += char
        result.push(current)
        current = ''
      } else {
        result.push(current)
        current = char
      }
    } else {
      current += char
    }
    prevIsAscii = isAscii
    // ：や。はフレーズの区切りなので直後で分割する
    if (/[：。]/.test(char) && current.length > 0) {
      result.push(current)
      current = ''
    }
  }
  if (current) result.push(current)
  return result.filter(s => s.length > 0)
}

function splitTitle(title: string, targetCharsPerLine: number = 12): string[] {
  const rawChunks = budouxParser.parse(title)
  const chunks = rawChunks.flatMap(subSplitChunk)
  const lines: string[] = []
  let currentLine = ''

  for (const chunk of chunks) {
    const wouldExceed = currentLine.length + chunk.length > targetCharsPerLine
    const longEnough = currentLine.length >= targetCharsPerLine * 0.7

    if (currentLine.length > 0 && wouldExceed && longEnough) {
      lines.push(currentLine)
      currentLine = chunk
    } else {
      currentLine += chunk
    }
  }
  if (currentLine) lines.push(currentLine)
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
  const titleLines = splitTitle(title, 11)
  const fontSize = titleLines.length >= 3 ? 52 : titleLines.length === 2 ? 60 : 68

  const [bgData, fontData, fontThinData, fontMediumData] = await Promise.all([
    readFile(path.join(process.cwd(), 'public', 'ogp-bg.png')),
    readFile(path.join(process.cwd(), 'public', 'fonts', 'NotoSansJP-ExtraBold.ttf')),
    readFile(path.join(process.cwd(), 'public', 'fonts', 'NotoSansJP-Regular.ttf')),
    readFile(path.join(process.cwd(), 'public', 'fonts', 'NotoSansJP-Medium.ttf')),
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

          <div style={{ color: '#f5d060', fontSize: '30px', fontWeight: 500, fontFamily: 'NotoSansJP', marginBottom: '32px' }}>
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

        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'NotoSansJP', data: fontData, weight: 800, style: 'normal' },
        { name: 'NotoSansJP', data: fontThinData, weight: 400, style: 'normal' },
        { name: 'NotoSansJP', data: fontMediumData, weight: 500, style: 'normal' },
      ],
    }
  )
}
