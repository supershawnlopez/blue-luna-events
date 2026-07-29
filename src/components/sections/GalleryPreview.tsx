'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'

type MediaItem = { id: string; url: string; thumbnail_url?: string | null; type: string; event_type?: string | null }

export default function GalleryPreview() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/studio/media')
      .then(r => (r.ok ? r.json() : []))
      .then((d: MediaItem[]) => {
        setMedia(Array.isArray(d) ? d.slice(0, 9) : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section id="gallery-preview" style={{ padding: 'clamp(64px,9vw,110px) 0', background: 'var(--warm)', position: 'relative' }}>
      <div className="container">

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }} className="reveal">
          <div>
            <div className="eyebrow" style={{ marginBottom: '14px' }}>
              <div className="eyebrow-line" />
              <span className="eyebrow-text">Real Work, Real Events</span>
            </div>
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, color: 'var(--ink)', lineHeight: 1.05 }}>
              Every Event. <em style={{ fontStyle: 'italic', color: 'var(--teal)' }}>Documented.</em>
            </h2>
          </div>
          <Link href="/gallery" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 600,
            color: 'var(--teal)', textDecoration: 'none', letterSpacing: '0.04em',
            borderBottom: '1px solid rgba(91,191,191,0.4)', paddingBottom: '2px',
          }}>
            View Full Gallery <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ columns: 'auto 260px', columnGap: '14px' }} className="reveal reveal-delay-1">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ breakInside: 'avoid', marginBottom: '14px', height: `${220 + (i % 3) * 60}px`, borderRadius: '18px', background: '#F0EEE9' }} />
            ))
          ) : media.length === 0 ? null : (
            media.map(m => (
              <div key={m.id} className="gp-card" style={{ breakInside: 'avoid', marginBottom: '14px', borderRadius: '18px', overflow: 'hidden', position: 'relative' }}>
                {m.type === 'video' ? (
                  <div style={{ position: 'relative', minHeight: '200px', background: '#111' }}>
                    {m.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.thumbnail_url} alt="" style={{ width: '100%', display: 'block', objectFit: 'cover' }} className="gp-img" />
                    ) : (
                      <div style={{ minHeight: '200px', background: 'linear-gradient(145deg,#0e1822 0%,#16213e 60%,#0a2540 100%)' }} />
                    )}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                      <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
                        <Play size={18} color="var(--teal)" fill="var(--teal)" style={{ marginLeft: '2px' }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt="Blue Luna Events installation" style={{ width: '100%', display: 'block', objectFit: 'cover', transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)' }} className="gp-img" />
                )}
              </div>
            ))
          )}
        </div>

        <p className="reveal" style={{ fontFamily: 'Inter, sans-serif', textAlign: 'center', marginTop: '32px', fontSize: '0.85rem', fontWeight: 300, color: 'var(--gray)' }}>
          Follow Monica&apos;s work on Instagram{' '}
          <a href="https://instagram.com/bluelunamagic" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid rgba(91,191,191,0.4)' }}>
            @BlueLunaMagic
          </a>
        </p>
      </div>

      <style>{`.gp-card:hover .gp-img { transform: scale(1.04); }`}</style>
    </section>
  )
}
