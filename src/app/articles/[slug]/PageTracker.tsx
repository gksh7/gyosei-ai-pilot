'use client'
import { useEffect } from 'react'

export default function PageTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId }),
    }).catch(() => {})
  }, [articleId])

  return null
}
