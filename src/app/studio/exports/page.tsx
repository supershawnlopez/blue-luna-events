'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Download, Sparkles, Check, Play } from 'lucide-react'

type MediaItem = { id: string; url: string; thumbnail_url?: string | null; type: string; file_name: string }
type ExportSize = '1:1' | '9:16' | '4:5'

const SIZES: { id: ExportSize; label: string; sub: string }[] = [
  { id: '1:1',  label: 'Square',       sub: '1080 × 1080 · Feed post' },
  { id: '9:16', label: 'Story / Reel', sub: '1080 × 1920 · Full screen' },
  { id: '4:5',  label: 'Portrait',     sub: '1080 × 1350 · Best reach' },
]

export default function StudioExports() {
  const [starred, setStarred]           = useState<MediaItem[]>([])
  const [loading, setLoading]           = useState(true)
  const [selectedSizes, setSelectedSizes] = useState<ExportSize[]>(['1:1', '9:16', '4:5'])
  const [watermark, setWatermark]       = useState(true)
  const [exporting, setExporting]       = useState(false)
  const [done, setDone]                 = useState(false)

  useEffect(() => {
    fetch('/api/studio/media')
      .then(r => r.json())
      .then((d: any[]) => {
        setStarred(Array.isArray(d) ? d.filter(m => m.social_export) : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function toggleSize(s: ExportSize) {
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  async function handleExport() {
    if (starred.length === 0 || selectedSizes.length === 0) return
    setExporting(true)
    const res = await fetch('/api/studio/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaIds: starred.map(m => m.id), sizes: selectedSizes, watermark }),
    })
    if (res.ok) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `blue-luna-social-${Date.now()}.zip`; a.click()
      URL.revokeObjectURL(url)
      setDone(true); setTimeout(() => setDone(false), 3000)
    }
    setExporting(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '160px' }}>

      {/* Header */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 20px) 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/studio/media" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', display: 'flex', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
            <ChevronLeft size={18} />
          </Link>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.22em', color: '#5BBFBF', textTransform: 'uppercase', margin: '0 0 2px' }}>Blue Luna</p>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', margin: 0, letterSpacing: '-0.01em' }}>Social Export</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 24px 0' }}>

        {/* Starred grid */}
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: '0 0 12px' }}>
          Starred Photos ({loading ? '…' : starred.length})
        </p>

        {!loading && starred.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', marginBottom: '28px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Sparkles size={28} color="rgba(255,255,255,0.1)" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontWeight: 600 }}>No starred photos yet</p>
            <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.25)', marginBottom: '20px' }}>In My Work, tap the ★ on any photo you want to export for Instagram</p>
            <Link href="/studio/media" style={{ display: 'inline-block', background: '#5BBFBF', borderRadius: '10px', padding: '10px 20px', color: '#0D0F0F', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>
              Go to My Work →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '3px', marginBottom: '28px', borderRadius: '12px', overflow: 'hidden' }}>
            {starred.map(m => (
              <div key={m.id} style={{ position: 'relative', aspectRatio: '1/1', background: '#1A1A1A' }}>
                {m.type === 'video' && m.thumbnail_url ? (
                  <img src={m.thumbnail_url} alt={m.file_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : m.type === 'video' ? (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Play size={16} color="rgba(255,255,255,0.3)" fill="rgba(255,255,255,0.3)" />
                  </div>
                ) : (
                  <img src={m.url} alt={m.file_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Export sizes */}
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: '0 0 12px' }}>
          Export Sizes
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {SIZES.map(s => {
            const active = selectedSizes.includes(s.id)
            return (
              <button key={s.id} onClick={() => toggleSize(s.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', background: active ? 'rgba(91,191,191,0.08)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${active ? 'rgba(91,191,191,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0, background: active ? '#5BBFBF' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {active && <Check size={13} color="#0D0F0F" />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', margin: '0 0 2px' }}>{s.label}</p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{s.sub}</p>
                </div>
                <div style={{ width: s.id === '1:1' ? '26px' : s.id === '9:16' ? '16px' : '22px', height: s.id === '1:1' ? '26px' : s.id === '9:16' ? '30px' : '26px', background: active ? 'rgba(91,191,191,0.25)' : 'rgba(255,255,255,0.08)', borderRadius: '3px', flexShrink: 0 }} />
              </button>
            )
          })}
        </div>

        {/* Watermark */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px 18px' }}>
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', margin: '0 0 2px' }}>Add Watermark</p>
            <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Blue Luna Events logo on every photo</p>
          </div>
          <button onClick={() => setWatermark(!watermark)}
            style={{ width: '48px', height: '28px', borderRadius: '99px', border: 'none', cursor: 'pointer', background: watermark ? '#5BBFBF' : 'rgba(255,255,255,0.15)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: '4px', left: watermark ? '24px' : '4px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
          </button>
        </div>
      </div>

      {/* Sticky export button */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, background: 'rgba(13,15,15,0.98)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '14px 24px env(safe-area-inset-bottom, 20px)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <button onClick={handleExport} disabled={exporting || starred.length === 0 || selectedSizes.length === 0}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: done ? '#22c55e' : (starred.length === 0 || selectedSizes.length === 0) ? 'rgba(91,191,191,0.15)' : '#5BBFBF', color: (starred.length === 0 || selectedSizes.length === 0) ? 'rgba(91,191,191,0.35)' : '#0D0F0F', border: 'none', borderRadius: '12px', padding: '15px', fontSize: '0.92rem', fontWeight: 700, cursor: (exporting || starred.length === 0) ? 'not-allowed' : 'pointer' }}>
            {done ? <><Check size={17} /> Downloaded!</>
              : exporting ? 'Exporting…'
              : <><Download size={17} /> Export {starred.length} Photo{starred.length !== 1 ? 's' : ''} · {selectedSizes.length} Size{selectedSizes.length !== 1 ? 's' : ''}</>}
          </button>
        </div>
      </div>
    </div>
  )
}
