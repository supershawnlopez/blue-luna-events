'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react'

type MediaItem = {
  id: string
  url: string
  thumbnail_url?: string | null
  type: string
  file_name: string
  event_type?: string | null
  caption?: string | null
}

const FALLBACK: MediaItem[] = [
  { id: 'f1', url: '/images/gal-1.jpg',      type: 'image', file_name: 'gal-1.jpg',      event_type: 'special_event', caption: 'Custom Installation' },
  { id: 'f2', url: '/images/gal-2.jpg',      type: 'image', file_name: 'gal-2.jpg',      event_type: 'birthday',      caption: 'Rose Gold Arch' },
  { id: 'f3', url: '/images/gal-3.jpg',      type: 'image', file_name: 'gal-3.jpg',      event_type: 'baby_shower',   caption: 'Baby Shower Setup' },
  { id: 'f4', url: '/images/gal-4.jpg',      type: 'image', file_name: 'gal-4.jpg',      event_type: 'birthday',      caption: 'Birthday Celebration' },
  { id: 'f5', url: '/images/gal-5.jpg',      type: 'image', file_name: 'gal-5.jpg',      event_type: 'special_event', caption: 'Outdoor Event' },
  { id: 'f6', url: '/images/hero-main.jpg',  type: 'image', file_name: 'hero-main.jpg',  event_type: 'birthday',      caption: 'Blue & Silver Arch' },
  { id: 'f7', url: '/images/hero-sec.jpg',   type: 'image', file_name: 'hero-sec.jpg',   event_type: 'wedding',       caption: 'Elegant Backdrop' },
]

function toLabel(raw: string) {
  return raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function displayCaption(m: MediaItem) {
  if (m.caption) return m.caption
  return m.file_name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function Gallery() {
  const [media, setMedia]         = useState<MediaItem[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')
  const [lightbox, setLightbox]   = useState<number | null>(null)
  const touchStartX               = useRef<number | null>(null)
  const videoRef                  = useRef<HTMLVideoElement>(null)

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

  const openLightbox = (indexInFiltered: number) => {
    setLightbox(indexInFiltered)
    document.body.style.overflow = 'hidden'
  }
  const closeLightbox = () => {
    setLightbox(null)
    document.body.style.overflow = ''
  }
  const prev = useCallback(() => {
    if (lightbox === null) return
    setLightbox(i => (i! - 1 + filtered.length) % filtered.length)
  }, [lightbox, filtered.length])
  const next = useCallback(() => {
    if (lightbox === null) return
    setLightbox(i => (i! + 1) % filtered.length)
  }, [lightbox, filtered.length])

  useEffect(() => {
    if (lightbox === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     closeLightbox()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, prev, next])

  const activeLb = lightbox !== null ? filtered[lightbox] : null

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F' }}>

      {/* Hero header */}
      <div style={{ paddingTop: '140px', paddingBottom: '60px', paddingLeft: '24px', paddingRight: '24px', maxWidth: '1200px', margin: '0 auto' }}>
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
        <div style={{ paddingBottom: '36px', paddingLeft: '24px', paddingRight: '24px' }}>
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

      {/* Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: '320px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{ columns: 'auto 280px', columnGap: '16px' }}>
            {filtered.map((m, i) => (
              <div key={m.id}
                onClick={() => openLightbox(i)}
                style={{ breakInside: 'avoid', marginBottom: '16px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', position: 'relative', display: 'block',
                  opacity: 1, transition: 'opacity 0.25s, transform 0.25s', transform: 'scale(1)' }}>
                {/* Media */}
                {m.type === 'video' ? (
                  <div style={{ position: 'relative', background: '#111', minHeight: '220px' }}>
                    <img
                      src={m.thumbnail_url || undefined}
                      alt={displayCaption(m)}
                      style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                    />
                    {!m.thumbnail_url && (
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', minHeight: '220px' }} />
                    )}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Play size={20} color="white" fill="white" style={{ marginLeft: '3px' }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={m.url}
                    alt={displayCaption(m)}
                    style={{ width: '100%', display: 'block', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  />
                )}

                {/* Label overlay */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 18px 18px', background: 'linear-gradient(to top, rgba(13,15,15,0.88) 0%, transparent 100%)', opacity: 0, transition: 'opacity 0.3s' }}
                  className="gallery-hover-overlay">
                  {m.event_type && (
                    <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#5BBFBF', letterSpacing: '0.18em', textTransform: 'uppercase', margin: '0 0 5px' }}>
                      {toLabel(m.event_type)}
                    </p>
                  )}
                  <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.35rem', fontStyle: 'italic', fontWeight: 300, color: 'rgba(255,255,255,0.92)', margin: 0, lineHeight: 1.2 }}>
                    {displayCaption(m)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '80px' }}>
          <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2rem', fontWeight: 300, color: 'white', marginBottom: '12px' }}>
            Ready to create your <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>moment?</em>
          </p>
          <p style={{ fontSize: '0.95rem', fontWeight: 300, color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>Let&apos;s build something beautiful for your event.</p>
          <Link href="/get-a-quote"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#5BBFBF', color: '#0D0F0F', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '15px 36px', borderRadius: '999px', textDecoration: 'none', boxShadow: '0 4px 24px rgba(91,191,191,0.35)', transition: 'all 0.25s' }}>
            Get a Free Estimate
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {activeLb && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(6,7,7,0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={closeLightbox}
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
          onTouchEnd={e => {
            if (touchStartX.current === null) return
            const dx = e.changedTouches[0].clientX - touchStartX.current
            if (dx > 50) prev()
            else if (dx < -50) next()
            touchStartX.current = null
          }}
        >
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

          {/* Media */}
          <div onClick={e => e.stopPropagation()}
            style={{ position: 'relative', maxWidth: 'min(90vw, 900px)', maxHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {activeLb.type === 'video' ? (
              <video
                ref={videoRef}
                key={activeLb.id}
                src={activeLb.url}
                autoPlay muted loop playsInline controls
                style={{ maxWidth: '100%', maxHeight: '78vh', borderRadius: '12px', display: 'block' }}
              />
            ) : (
              <img
                key={activeLb.id}
                src={activeLb.url}
                alt={displayCaption(activeLb)}
                style={{ maxWidth: '100%', maxHeight: '78vh', borderRadius: '12px', display: 'block', objectFit: 'contain' }}
              />
            )}
          </div>

          {/* Caption strip */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 24px 28px', background: 'linear-gradient(to top, rgba(6,7,7,0.95) 0%, transparent 100%)', textAlign: 'center', pointerEvents: 'none' }}>
            {activeLb.event_type && (
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#5BBFBF', letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                {toLabel(activeLb.event_type)}
              </p>
            )}
            <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontStyle: 'italic', fontWeight: 300, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
              {displayCaption(activeLb)}
            </p>
          </div>
        </div>
      )}

      <style>{`
        .gallery-hover-overlay { opacity: 0; }
        div:hover > .gallery-hover-overlay { opacity: 1; }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
      `}</style>
    </div>
  )
}
