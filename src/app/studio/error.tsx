'use client'

import { useEffect } from 'react'

// If anything in Studio crashes, Monica sees a calm "Reload" screen instead of
// a blank page. The most common cause right after a deploy is the phone
// asking for a piece of the old version that no longer exists — in that case
// we just reload once on our own.
export default function StudioError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    const isStaleVersion = /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module/i.test(`${error?.name} ${error?.message}`)
    const key = 'studio-auto-reloaded'
    try {
      if (isStaleVersion && !sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1')
        window.location.reload()
        return
      }
      sessionStorage.removeItem(key)
    } catch { /* storage blocked — fall through to the manual button */ }
    console.error(error)
  }, [error])

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '320px', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.22em', color: '#5BBFBF', textTransform: 'uppercase', margin: '0 0 10px' }}>Blue Luna Studio</p>
        <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', margin: '0 0 8px' }}>Something didn’t load</p>
        <p style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 24px', lineHeight: 1.5 }}>Nothing was lost. Reload and you’ll be right back where you were.</p>
        <button
          onClick={() => { try { sessionStorage.removeItem('studio-auto-reloaded') } catch {} ; window.location.reload() }}
          style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: '#5BBFBF', color: '#0D0F0F', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer', marginBottom: '10px' }}
        >
          Reload
        </button>
        <button onClick={reset} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', cursor: 'pointer' }}>Try again without reloading</button>
      </div>
    </div>
  )
}
