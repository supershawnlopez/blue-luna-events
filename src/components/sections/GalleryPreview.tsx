'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Instagram } from 'lucide-react'

type MediaItem = { id: string; url: string; thumbnail_url?: string | null; type: string; event_type?: string | null }

function toLabel(raw?: string | null) {
  if (!raw) return ''
  return raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function VideoTile({ item }: { item: MediaItem }) {
  const ref = useRef<HTMLVideoElement>(null)
  return (
    // Outer white "mat" frame — makes each tile read as a distinct card even when
    // two adjacent videos share similar balloon colors and would otherwise bleed together.
    <div style={{ height: '100%', padding: '6px', background: 'white', borderRadius: '26px', boxShadow: '0 12px 40px rgba(13,15,15,0.14)' }}>
      <div className="gp-video-tile" style={{
        position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '100%',
      }}>
        <video
          ref={ref}
          src={item.url}
          poster={item.thumbnail_url || undefined}
          autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,15,15,0.55) 0%, transparent 45%)', pointerEvents: 'none' }} />
        {/* Shimmer sweep — the "magic" touch */}
        <div className="gp-shimmer" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        {item.event_type && (
          <p style={{
            position: 'absolute', bottom: '16px', left: '18px',
            fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'white',
            letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0,
          }}>
            {toLabel(item.event_type)}
          </p>
        )}
      </div>
    </div>
  )
}

export default function GalleryPreview() {
  const [videos, setVideos] = useState<MediaItem[]>([])
  const [accentPhoto, setAccentPhoto] = useState<MediaItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/studio/media?website=true')
      .then(r => (r.ok ? r.json() : []))
      .then((d: MediaItem[]) => {
        if (!Array.isArray(d)) { setLoading(false); return }
        setVideos(d.filter(m => m.type === 'video').slice(0, 4))
        setAccentPhoto(d.find(m => m.type !== 'video') || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section id="gallery-preview" style={{ padding: 'clamp(64px,9vw,110px) 0', background: 'var(--warm)', position: 'relative', overflow: 'hidden' }}>
      {/* Twilight glow, echoing the hero */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-6%', width: '400px', height: '400px',
        borderRadius: '50%', background: 'var(--twilight-glow)', filter: 'blur(30px)',
        pointerEvents: 'none', opacity: 0.5,
      }} />

      <div className="container" style={{ position: 'relative' }}>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }} className="reveal">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {accentPhoto && (
              <div style={{
                position: 'relative', width: '64px', height: '64px', borderRadius: '50%',
                overflow: 'hidden', border: '3px solid white', boxShadow: '0 6px 20px rgba(13,15,15,0.16)',
                flexShrink: 0, display: 'none',
              }} className="gp-accent-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={accentPhoto.thumbnail_url || accentPhoto.url} alt="Real balloon décor by Blue Luna Events, Tucson AZ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div>
              <div className="eyebrow" style={{ marginBottom: '14px' }}>
                <div className="eyebrow-line" />
                <span className="eyebrow-text">Real Events, Real Magic</span>
              </div>
              <h2 className="font-display" style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, color: 'var(--ink)', lineHeight: 1.05 }}>
                See It <em style={{ fontStyle: 'italic', color: 'var(--teal)' }}>Come to Life.</em>
              </h2>
            </div>
          </div>
          <Link href="/gallery" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 600,
            color: 'var(--teal)', textDecoration: 'none', letterSpacing: '0.04em',
            borderBottom: '1px solid rgba(91,191,191,0.4)', paddingBottom: '2px',
          }}>
            See Every Event <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '18px' }} className="reveal reveal-delay-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ height: '280px', borderRadius: '22px', background: '#F0EEE9' }} />
            ))}
          </div>
        ) : videos.length === 0 ? null : (
          <div className="gp-bento reveal reveal-delay-1" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridAutoRows: '190px',
            gap: '24px',
          }}>
            {/* Spans are chosen to sum exactly to 4 columns per row (2+2 on row 1, 2+1+1 on row 2) —
                mismatched spans previously left the browser to improvise gaps and orphan tiles. */}
            {videos.map((v, i) => {
              const span = i === 0 ? { gridColumn: 'span 2', gridRow: 'span 2' }
                : i === 1 ? { gridColumn: 'span 2', gridRow: 'span 1' }
                : { gridColumn: 'span 1', gridRow: 'span 1' }
              return (
                <div key={v.id} style={span} className="gp-bento-item">
                  <VideoTile item={v} />
                </div>
              )
            })}
          </div>
        )}

        <p className="reveal" style={{ fontFamily: 'Inter, sans-serif', textAlign: 'center', marginTop: '36px', fontSize: '0.85rem', fontWeight: 300, color: 'var(--gray)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Instagram size={14} style={{ flexShrink: 0 }} />
          Watch more real reveals on Instagram{' '}
          <a href="https://instagram.com/bluelunamagic" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid rgba(91,191,191,0.4)' }}>
            @BlueLunaMagic
          </a>
        </p>
      </div>

      <style>{`
        .gp-shimmer {
          background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.18) 48%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 52%, transparent 70%);
          background-size: 250% 250%;
          background-position: 120% 0%;
          transition: background-position 1.1s cubic-bezier(0.16,1,0.3,1);
        }
        .gp-video-tile:hover .gp-shimmer { background-position: -20% 100%; }
        .gp-video-tile:hover { transform: translateY(-2px); transition: transform 0.3s ease; }
        @media (max-width: 700px) {
          .gp-bento { grid-template-columns: 1fr !important; grid-auto-rows: 240px !important; }
          .gp-bento-item { grid-column: span 1 !important; grid-row: span 1 !important; }
          .gp-accent-photo { display: none !important; }
        }
        @media (min-width: 560px) {
          .gp-accent-photo { display: block !important; }
        }
      `}</style>
    </section>
  )
}
