'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, Download, Sparkles, Play, Check, Loader2 } from 'lucide-react'

type MediaItem = { id: string; url: string; thumbnail_url?: string | null; type: string; file_name: string; caption?: string | null; event_type?: string | null }
type Layout = 'single' | 'square' | 'story'

const LAYOUTS: { id: Layout; label: string; sub: string; w: number; h: number; dims: string }[] = [
  { id: 'single', label: 'Feed Portrait', sub: '4:5 · Best reach on Instagram', w: 1080, h: 1350, dims: '1080×1350' },
  { id: 'square', label: 'Feed Square',   sub: '1:1 · Classic grid post',        w: 1080, h: 1080, dims: '1080×1080' },
  { id: 'story',  label: 'Story / Reel', sub: '9:16 · Full-screen impact',       w: 1080, h: 1920, dims: '1080×1920' },
]

function toLabel(raw: string) {
  return raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function displayCaption(m: MediaItem) {
  return m.caption?.trim() || null
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => res(img)
    img.onerror = () => {
      // retry without crossOrigin (some CDNs block the CORS preflight)
      const img2 = new window.Image()
      img2.onload  = () => res(img2)
      img2.onerror = rej
      img2.src = src
    }
    img.src = src
  })
}

function coverFit(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cw: number, ch: number) {
  const iRatio = img.width / img.height
  const cRatio = cw / ch
  let sx = 0, sy = 0, sw = img.width, sh = img.height
  if (iRatio > cRatio) { sw = img.height * cRatio; sx = (img.width - sw) / 2 }
  else                  { sh = img.width / cRatio;  sy = (img.height - sh) / 2 }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch)
}

async function renderBrandPack(item: MediaItem, layout: Layout): Promise<Blob> {
  const spec = LAYOUTS.find(l => l.id === layout)!
  const canvas = document.createElement('canvas')
  canvas.width  = spec.w
  canvas.height = spec.h
  const ctx = canvas.getContext('2d')!

  // 1 — draw photo full bleed
  ctx.fillStyle = '#0D0F0F'
  ctx.fillRect(0, 0, spec.w, spec.h)
  try {
    const photo = await loadImage(item.url)
    coverFit(ctx, photo, spec.w, spec.h)
  } catch { /* leave dark background if photo fails */ }

  // 2 — event type chip — top right (only if tagged)
  if (item.event_type) {
    const chipLabel = toLabel(item.event_type).toUpperCase()
    const chipFontSize = spec.w * 0.022
    ctx.font = `700 ${chipFontSize}px "DM Mono", monospace`
    const textW = ctx.measureText(chipLabel).width
    const chipPad = spec.w * 0.028
    const chipH   = chipFontSize * 2.2
    const chipX   = spec.w - chipPad - textW - chipFontSize * 1.2
    const chipY   = chipPad

    // pill background
    ctx.fillStyle = 'rgba(13,15,15,0.72)'
    const r = chipH / 2
    ctx.beginPath()
    ctx.moveTo(chipX + r, chipY)
    ctx.lineTo(chipX + textW + chipFontSize * 1.2 - r, chipY)
    ctx.arcTo(chipX + textW + chipFontSize * 1.2, chipY, chipX + textW + chipFontSize * 1.2, chipY + chipH, r)
    ctx.arcTo(chipX + textW + chipFontSize * 1.2, chipY + chipH, chipX, chipY + chipH, r)
    ctx.arcTo(chipX, chipY + chipH, chipX, chipY, r)
    ctx.arcTo(chipX, chipY, chipX + r, chipY, r)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = '#5BBFBF'
    ctx.textAlign = 'center'
    ctx.fillText(chipLabel, chipX + (textW + chipFontSize * 1.2) / 2, chipY + chipH * 0.68)
  }

  // 3 — bottom branding strip (80px)
  const stripH = Math.round(spec.h * 0.074)
  const stripY = spec.h - stripH
  ctx.fillStyle = 'rgba(13,15,15,0.88)'
  ctx.fillRect(0, stripY, spec.w, stripH)

  // teal accent line at very top of strip
  ctx.fillStyle = '#5BBFBF'
  ctx.fillRect(0, stripY, spec.w, Math.round(spec.h * 0.003))

  const pad = spec.w * 0.055
  const stripMid = stripY + stripH / 2

  // logo image — left side
  try {
    const logo = await loadImage('/images/logo-white.png')
    const logoH = stripH * 0.52
    const logoW = logo.width * (logoH / logo.height)
    ctx.drawImage(logo, pad, stripMid - logoH / 2, logoW, logoH)
  } catch {
    // fallback: "Blue Luna Events" text
    ctx.font = `600 ${spec.w * 0.022}px sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.textAlign = 'left'
    ctx.fillText('Blue Luna Events', pad, stripMid + spec.w * 0.008)
  }

  // website — right side
  ctx.font = `500 ${spec.w * 0.022}px "DM Mono", monospace`
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.textAlign = 'right'
  ctx.fillText('bluelunaevents.com', spec.w - pad, stripMid + spec.w * 0.008)

  return new Promise(res => canvas.toBlob(b => res(b!), 'image/jpeg', 0.94))
}

export default function StudioExports() {
  const [starred, setStarred]     = useState<MediaItem[]>([])
  const [loading, setLoading]     = useState(true)
  const [layout, setLayout]       = useState<Layout>('single')
  const [exporting, setExporting] = useState<string | null>(null)
  const [done, setDone]           = useState<string | null>(null)
  const [allExporting, setAllExporting] = useState(false)

  useEffect(() => {
    fetch('/api/studio/media')
      .then(r => r.json())
      .then((d: any[]) => {
        setStarred(Array.isArray(d) ? d.filter(m => m.social_export) : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function downloadOne(item: MediaItem) {
    setExporting(item.id)
    try {
      const blob = await renderBrandPack(item, layout)
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      const label = (displayCaption(item) || item.event_type || 'export').toLowerCase().replace(/[\s_]+/g, '-')
      a.href = url
      a.download = `blue-luna-${label}-${layout}.jpg`
      a.click()
      URL.revokeObjectURL(url)
      setDone(item.id)
      setTimeout(() => setDone(null), 2500)
    } catch { /* silent */ }
    setExporting(null)
  }

  async function downloadAll() {
    setAllExporting(true)
    for (const item of starred) {
      await downloadOne(item)
    }
    setAllExporting(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '40px' }}>

      {/* Header */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 20px) 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/studio/media" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', display: 'flex', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
            <ChevronLeft size={18} />
          </Link>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.22em', color: '#5BBFBF', textTransform: 'uppercase', margin: '0 0 2px' }}>Blue Luna Studio</p>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', margin: 0, letterSpacing: '-0.01em' }}>Social Export</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '28px 24px 0' }}>

        {/* Explainer */}
        <div style={{ background: 'rgba(91,191,191,0.06)', border: '1px solid rgba(91,191,191,0.18)', borderRadius: '14px', padding: '16px 18px', marginBottom: '28px' }}>
          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#5BBFBF', margin: '0 0 4px' }}>How it works</p>
          <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.55 }}>
            Each photo is rendered at full Instagram resolution with your branding — Blue Luna wordmark, teal accent, caption, and website — already baked in. Tap Download on any photo to save it directly to your device. No zip. No fuss.
          </p>
        </div>

        {/* Layout picker */}
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: '0 0 12px' }}>Format</p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {LAYOUTS.map(l => {
            const active = layout === l.id
            return (
              <button key={l.id} onClick={() => setLayout(l.id)}
                style={{ flex: 1, background: active ? 'rgba(91,191,191,0.1)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${active ? 'rgba(91,191,191,0.45)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', padding: '14px 10px', cursor: 'pointer', textAlign: 'center' }}>
                {/* Aspect ratio visual */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  <div style={{ background: active ? 'rgba(91,191,191,0.3)' : 'rgba(255,255,255,0.1)', borderRadius: '3px', width: l.id === 'square' ? '28px' : l.id === 'single' ? '23px' : '16px', height: l.id === 'square' ? '28px' : l.id === 'single' ? '29px' : '30px' }} />
                </div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: active ? '#5BBFBF' : 'rgba(255,255,255,0.55)', margin: '0 0 2px' }}>{l.label}</p>
                <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', margin: 0 }}>{l.dims}</p>
              </button>
            )
          })}
        </div>

        {/* Starred photos */}
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: '0 0 14px' }}>
          Starred Photos {!loading && `(${starred.length})`}
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>Loading…</div>
        ) : starred.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Sparkles size={28} color="rgba(255,255,255,0.1)" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontWeight: 600 }}>No starred photos yet</p>
            <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.25)', marginBottom: '20px', lineHeight: 1.5 }}>
              In My Work, tap the ★ on any photo to mark it for social export.
            </p>
            <Link href="/studio/media" style={{ display: 'inline-block', background: '#5BBFBF', borderRadius: '10px', padding: '10px 20px', color: '#0D0F0F', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>
              Go to My Work →
            </Link>
          </div>
        ) : (
          <>
            {/* Download all */}
            <button onClick={downloadAll} disabled={allExporting}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: allExporting ? 'rgba(91,191,191,0.08)' : '#5BBFBF', color: allExporting ? 'rgba(91,191,191,0.4)' : '#0D0F0F', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '0.88rem', fontWeight: 700, cursor: allExporting ? 'not-allowed' : 'pointer', marginBottom: '20px' }}>
              {allExporting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Exporting…</> : <><Download size={16} /> Download All {starred.length} Photos</>}
            </button>

            {/* Individual cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {starred.map(item => {
                const isExporting = exporting === item.id
                const isDone      = done === item.id
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px 14px' }}>
                    {/* Thumb */}
                    <div style={{ width: '58px', height: '58px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#161616', position: 'relative' }}>
                      {item.thumbnail_url || item.type === 'image' ? (
                        <img src={item.thumbnail_url || item.url} alt={displayCaption(item)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Play size={14} color="rgba(255,255,255,0.3)" fill="rgba(255,255,255,0.3)" />
                        </div>
                      )}
                      {/* Branding preview overlay */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(to right,#5BBFBF,#3A9898)' }} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'white', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {displayCaption(item) || (item.event_type ? toLabel(item.event_type) : 'Untagged photo')}
                      </p>
                      <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.file_name}
                      </p>
                    </div>

                    {/* Download button */}
                    <button onClick={() => downloadOne(item)} disabled={isExporting || !!exporting}
                      style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px', background: isDone ? 'rgba(34,197,94,0.15)' : 'rgba(91,191,191,0.1)', border: `1px solid ${isDone ? 'rgba(34,197,94,0.4)' : 'rgba(91,191,191,0.25)'}`, borderRadius: '10px', padding: '9px 14px', color: isDone ? '#4ade80' : '#5BBFBF', fontSize: '0.75rem', fontWeight: 700, cursor: (isExporting || !!exporting) ? 'not-allowed' : 'pointer' }}>
                      {isDone ? <><Check size={14} /> Saved</> : isExporting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <><Download size={14} /> Save</>}
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
