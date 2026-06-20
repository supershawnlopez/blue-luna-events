'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, Download, Sparkles, Check } from 'lucide-react'

type MediaItem = {
  id: string
  url: string
  caption?: string
}

type ExportSize = '1:1' | '9:16' | '4:5'

const SIZES: { id: ExportSize; label: string; sub: string; w: number; h: number }[] = [
  { id: '1:1', label: 'Square', sub: '1080 × 1080 · Feed post', w: 1080, h: 1080 },
  { id: '9:16', label: 'Story / Reel', sub: '1080 × 1920 · Full screen', w: 1080, h: 1920 },
  { id: '4:5', label: 'Portrait', sub: '1080 × 1350 · Best reach', w: 1080, h: 1350 },
]

export default function StudioExports() {
  const [starred, setStarred] = useState<MediaItem[]>([]) // populated from Supabase
  const [selectedSizes, setSelectedSizes] = useState<ExportSize[]>(['1:1', '9:16', '4:5'])
  const [watermark, setWatermark] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [done, setDone] = useState(false)

  function toggleSize(s: ExportSize) {
    setSelectedSizes(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  async function handleExport() {
    if (starred.length === 0 || selectedSizes.length === 0) return
    setExporting(true)
    const res = await fetch('/api/studio/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mediaIds: starred.map(m => m.id),
        sizes: selectedSizes,
        watermark,
      }),
    })
    if (res.ok) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `blue-luna-social-export-${Date.now()}.zip`
      a.click()
      URL.revokeObjectURL(url)
      setDone(true)
      setTimeout(() => setDone(false), 3000)
    }
    setExporting(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '120px' }}>
      {/* Header */}
      <div style={{ padding: '56px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <Link href="/studio" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', display: 'flex', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              <ChevronLeft size={18} />
            </Link>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: 0 }}>Studio</p>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'white', letterSpacing: '-0.01em' }}>Social Export</h1>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 24px 0' }}>

        {/* Export size selector */}
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '12px' }}>
          Export Sizes
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
          {SIZES.map(s => {
            const active = selectedSizes.includes(s.id)
            return (
              <button
                key={s.id}
                onClick={() => toggleSize(s.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  background: active ? 'rgba(91,191,191,0.1)' : 'rgba(255,255,255,0.04)',
                  border: active ? '1.5px solid rgba(91,191,191,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{
                  width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                  background: active ? '#5BBFBF' : 'rgba(255,255,255,0.08)',
                  border: active ? 'none' : '1.5px solid rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {active && <Check size={13} color="#0D0F0F" />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'white', margin: 0, marginBottom: '2px' }}>{s.label}</p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{s.sub}</p>
                </div>
                {/* Aspect ratio visual */}
                <div style={{
                  width: s.id === '1:1' ? '28px' : s.id === '9:16' ? '18px' : '23px',
                  height: s.id === '1:1' ? '28px' : s.id === '9:16' ? '32px' : '28px',
                  background: active ? 'rgba(91,191,191,0.3)' : 'rgba(255,255,255,0.1)',
                  borderRadius: '4px', flexShrink: 0,
                }} />
              </button>
            )
          })}
        </div>

        {/* Watermark toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px 18px', marginBottom: '28px' }}>
          <div>
            <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'white', margin: 0, marginBottom: '2px' }}>Add Watermark</p>
            <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Blue Luna Events logo on every photo</p>
          </div>
          <button
            onClick={() => setWatermark(!watermark)}
            style={{
              width: '48px', height: '28px', borderRadius: '99px', border: 'none', cursor: 'pointer',
              background: watermark ? '#5BBFBF' : 'rgba(255,255,255,0.15)',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute', top: '4px',
              left: watermark ? '24px' : '4px',
              width: '20px', height: '20px', borderRadius: '50%',
              background: 'white', transition: 'left 0.2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>

        {/* Starred media grid */}
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '12px' }}>
          ⭐ Starred Photos ({starred.length})
        </p>

        {starred.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', marginBottom: '24px' }}>
            <Sparkles size={32} color="rgba(255,255,255,0.1)" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>No photos starred yet</p>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)', marginBottom: '20px' }}>Go to My Work and tap ⭐ on photos you want to export</p>
            <Link href="/studio/media" style={{
              display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', padding: '10px 20px', color: 'rgba(255,255,255,0.6)',
              fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
            }}>
              Go to My Work →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '4px', marginBottom: '24px' }}>
            {starred.map(m => (
              <div key={m.id} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden' }}>
                <Image src={m.url} alt="" fill style={{ objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky export button */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(13,15,15,0.98)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '16px 24px env(safe-area-inset-bottom, 16px)',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <button
            onClick={handleExport}
            disabled={exporting || starred.length === 0 || selectedSizes.length === 0}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              background: done ? '#22c55e' : (starred.length === 0 || selectedSizes.length === 0) ? 'rgba(91,191,191,0.2)' : '#5BBFBF',
              color: (starred.length === 0 || selectedSizes.length === 0) ? 'rgba(91,191,191,0.4)' : '#0D0F0F',
              border: 'none', borderRadius: '14px', padding: '16px',
              fontSize: '0.95rem', fontWeight: 700,
              cursor: (exporting || starred.length === 0 || selectedSizes.length === 0) ? 'not-allowed' : 'pointer',
            }}
          >
            {done ? <><Check size={18} /> Downloaded!</>
              : exporting ? 'Exporting…'
              : <><Download size={18} /> Export {starred.length} Photo{starred.length !== 1 ? 's' : ''} · {selectedSizes.length} Size{selectedSizes.length !== 1 ? 's' : ''}</>}
          </button>
          {starred.length > 0 && (
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: '8px' }}>
              Downloads as a ZIP — {starred.length * selectedSizes.length} files total
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
