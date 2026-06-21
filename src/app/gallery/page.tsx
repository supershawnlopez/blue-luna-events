'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react'

type MediaItem = {
  id: string
  url: string
  thumbnail_url?: string | null
  type: string
  file_name: string
  event_type?: string | null
}

const FALLBACK: MediaItem[] = [
  { id: 'f1', url: '/images/gal-1.jpg',     type: 'image', file_name: 'gal-1.jpg',     event_type: 'special_event' },
  { id: 'f2', url: '/images/gal-2.jpg',     type: 'image', file_name: 'gal-2.jpg',     event_type: 'birthday'      },
  { id: 'f3', url: '/images/gal-3.jpg',     type: 'image', file_name: 'gal-3.jpg',     event_type: 'baby_shower'   },
  { id: 'f4', url: '/images/gal-4.jpg',     type: 'image', file_name: 'gal-4.jpg',     event_type: 'birthday'      },
  { id: 'f5', url: '/images/gal-5.jpg',     type: 'image', file_name: 'gal-5.jpg',     event_type: 'special_event' },
  { id: 'f6', url: '/images/hero-main.jpg', type: 'image', file_name: 'hero-main.jpg', event_type: 'birthday'      },
  { id: 'f7', url: '/images/hero-sec.jpg',  type: 'image', file_name: 'hero-sec.jpg',  event_type: 'wedding'       },
]

function toLabel(raw: string) {
  return raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function Gallery() {
  const [media, setMedia]       = useState<MediaItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [lightbox, setLightbox] = useState<number | null>(null)
  const touchStartX             = useRef<number | null>(null)

  useEffect(() => {
    fetch('/api/studio/media?website=true')
      .then(r => r.ok ? r.json() : [])
      .then((d: MediaItem[]) => {
        setMedia(Array.isArray(d) && d.length > 0 ? d : FALLBACK)
        setLoading(false)
      })
      .catch(() => { setMedia(FALLBACK); setLoading(false) })
  }, [])

  const filtered = filter === 'all' ? media : media.filter(m => m.event_type === filter)
  const eventTypes = Array.from(new Set(media.map(m => m.event_type).filter(Boolean))) as string[]

  const openLightbox = (i: number) => { setLightbox(i); document.body.style.overflow = 'hidden' }
  const closeLightbox = () => { setLightbox(null); document.body.style.overflow = '' }

  const prev = useCallback(() => {
    setLightbox(i => i === null ? null : (i - 1 + filtered.length) % filtered.length)
  }, [filtered.length])

  const next = useCallback(() => {
    setLightbox(i => i === null ? null : (i + 1) % filtered.length)
  }, [filtered.length])

  useEffect(() => {
    if (lightbox === null) return
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     closeLightbox()
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [lightbox, prev, next])

  const activeLb = lightbox !== null ? filtered[lightbox] : null

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F' }}>

      {/* Hero */}
      <div style={{ paddingTop: '140px', paddingBottom: '60px', padding: '140px 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '24px', height: '1px', background: '#5BBFBF' }} />
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#5BBFBF', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Our Work</span>
        </div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2.6rem,6vw,4.5rem)', fontWeight: 300, color: 'white', lineHeight: 1.1, margin: '0 0 20px' }}>
          Our <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>Creations</em>
        </h1>
        <p style={{ fontSize: '1rem', fontWeight: 300, color: 'rgba(255,255,255,0.5)', maxWidth: '480px', margin: 0, lineHeight: 1.6 }}>
          Every setup is custom — your colors, your vision, your moment. Here&apos;s a look at what we&apos;ve built for Tucson families and businesses.
        </p>
      </div>

      {/* Filter chips */}
      {!loading && eventTypes.length > 0 && (
        <div style={{ padding: '0 24px 36px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', ...eventTypes].map(type => {
              const active = filter === type
              return (
                <button key={type} onClick={() => setFilter(type)}
                  style={{ padding: '8px 18px', borderRadius: '999px', border: `1.5px solid ${active ? '#5BBFBF' : 'rgba(255,255,255,0.12)'}`, background: active ? 'rgba(91,191,191,0.12)' : 'transparent', color: active ? '#5BBFBF' : 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                  {type === 'all' ? 'All Events' : toLabel(type)}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Masonry grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px' }}>
        {loading ? (
          <div style={{ columns: 'auto 280px', columnGap: '16px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ breakInside: 'avoid', marginBottom: '16px', height: `${240 + (i % 3) * 60}px`, borderRadius: '16px', background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : (
          <div style={{ columns: 'auto 280px', columnGap: '16px' }}>
            {filtered.map((m, i) => (
              <div key={m.id} className="gallery-card" onClick={() => openLightbox(i)}
                style={{ breakInside: 'avoid', marginBottom: '16px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>

                {m.type === 'video' ? (
                  <div style={{ position: 'relative', background: '#111', minHeight: '240px' }}>
                    {m.thumbnail_url
                      ? <img src={m.thumbnail_url} alt="" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
                      : <div style={{ minHeight: '240px', background: 'linear-gradient(145deg, #0e1822 0%, #16213e 60%, #0a2540 100%)' }} />
                    }
                    {/* Modern play button */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="play-btn" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 1px rgba(255,255,255,0.2), 0 0 32px rgba(91,191,191,0.55)', transition: 'transform 0.2s' }}>
                        <Play size={26} color="#5BBFBF" fill="#5BBFBF" style={{ marginLeft: '4px' }} />
                      </div>
                    </div>
                    {/* Category label bottom */}
                    {m.event_type && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '36px 16px 14px', background: 'linear-gradient(to top,rgba(13,15,15,0.85),transparent)' }}>
                        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#5BBFBF', letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0 }}>
                          {toLabel(m.event_type)}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <img src={m.url} alt="" style={{ width: '100%', display: 'block', objectFit: 'cover', transition: 'transform 0.45s ease' }} className="gallery-img" />
                    {/* Category label — always visible at bottom */}
                    {m.event_type && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '36px 16px 14px', background: 'linear-gradient(to top,rgba(13,15,15,0.82),transparent)' }}>
                        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#5BBFBF', letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0 }}>
                          {toLabel(m.event_type)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '80px' }}>
          <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2rem', fontWeight: 300, color: 'white', marginBottom: '12px' }}>
            Ready to create your <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>moment?</em>
          </p>
          <p style={{ fontSize: '0.95rem', fontWeight: 300, color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>
            Let&apos;s build something beautiful for your event.
          </p>
          <Link href="/get-a-quote"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#5BBFBF', color: '#0D0F0F', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '15px 36px', borderRadius: '999px', textDecoration: 'none', boxShadow: '0 4px 24px rgba(91,191,191,0.35)' }}>
            Get a Free Estimate
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {activeLb && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(6,7,7,0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={closeLightbox}
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
          onTouchEnd={e => {
            if (touchStartX.current === null) return
            const dx = e.changedTouches[0].clientX - touchStartX.current
            if (dx > 50) prev(); else if (dx < -50) next()
            touchStartX.current = null
          }}>

          {/* Close */}
          <button onClick={closeLightbox}
            style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
            <X size={18} />
          </button>

          {/* Counter */}
          <div style={{ position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)', fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em' }}>
            {(lightbox! + 1)} / {filtered.length}
          </div>

          {/* Prev */}
          {filtered.length > 1 && (
            <button onClick={e => { e.stopPropagation(); prev() }}
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Next */}
          {filtered.length > 1 && (
            <button onClick={e => { e.stopPropagation(); next() }}
              style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
              <ChevronRight size={22} />
            </button>
          )}

          {/* Media — no controls, fully muted */}
          <div onClick={e => e.stopPropagation()}
            style={{ position: 'relative', maxWidth: 'min(90vw,900px)', maxHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {activeLb.type === 'video' ? (
              <video key={activeLb.id} src={activeLb.url}
                autoPlay muted loop playsInline
                style={{ maxWidth: '100%', maxHeight: '78vh', borderRadius: '12px', display: 'block' }}
              />
            ) : (
              <img key={activeLb.id} src={activeLb.url} alt=""
                style={{ maxWidth: '100%', maxHeight: '78vh', borderRadius: '12px', display: 'block', objectFit: 'contain' }} />
            )}
          </div>

          {/* Caption strip — event type only */}
          {activeLb.event_type && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 24px 28px', background: 'linear-gradient(to top,rgba(6,7,7,0.95),transparent)', pointerEvents: 'none' }}>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#5BBFBF', letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>
                {toLabel(activeLb.event_type)}
              </p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .gallery-card:hover .gallery-img { transform: scale(1.04); }
        .gallery-card:hover .play-btn    { transform: scale(1.08); }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
      `}</style>
    </div>
  )
}
