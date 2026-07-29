'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type MediaItem = { id: string; url: string; type: string; event_type?: string | null }

export default function Hero() {
  const [featured, setFeatured] = useState<MediaItem | null>(null)

  useEffect(() => {
    fetch('/api/studio/media')
      .then(r => (r.ok ? r.json() : []))
      .then((d: MediaItem[]) => {
        const photos = Array.isArray(d) ? d.filter(m => m.type === 'photo') : []
        if (photos.length > 0) {
          setFeatured(photos[Math.floor(Math.random() * Math.min(photos.length, 10))])
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: '#FFFFFF' }}>
      {/* Twilight glow, anchored behind the moon mark */}
      <div style={{
        position: 'absolute', top: '-180px', left: '-180px', width: '560px', height: '560px',
        background: 'var(--twilight-glow)', filter: 'blur(10px)', pointerEvents: 'none',
      }} />

      <div className="container" style={{
        position: 'relative', zIndex: 2, paddingTop: 'clamp(120px,14vw,160px)', paddingBottom: 'clamp(56px,8vw,96px)',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,460px),1fr))', gap: 'clamp(32px,5vw,56px)', alignItems: 'center',
      }}>
        {/* Copy */}
        <div style={{ animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both' }}>
          <Image src="/images/logo-mark.png" alt="" width={56} height={56} style={{ marginBottom: '24px' }} />

          <div className="eyebrow" style={{ marginBottom: '22px' }}>
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Tucson, AZ · Southern Arizona</span>
          </div>

          <h1 className="font-display" style={{
            fontSize: 'clamp(2.6rem, 5.2vw, 4.4rem)', fontWeight: 300, lineHeight: 1.05,
            color: 'var(--ink)', marginBottom: '22px', letterSpacing: '-0.01em',
          }}>
            Your Event Deserves<br />
            <em style={{ fontStyle: 'italic', color: 'var(--teal)' }}>Something Extraordinary.</em>
          </h1>

          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.95rem, 1.4vw, 1.05rem)', fontWeight: 400,
            lineHeight: 1.8, color: 'var(--gray)', maxWidth: '440px', marginBottom: '36px',
          }}>
            Monica transforms your venue from empty room to magazine-worthy moment — delivered, installed, and perfect before the first guest walks in.
          </p>

          <Link href="/event-questionnaire" className="btn-primary" style={{ fontSize: '0.85rem', padding: '15px 32px' }}>
            Event Questionnaire <ArrowRight size={15} />
          </Link>

          {/* Stats, light treatment */}
          <div style={{ display: 'flex', gap: 'clamp(24px,4vw,40px)', marginTop: '48px', flexWrap: 'wrap' }}>
            {[
              { n: '200+', l: 'Events Styled' },
              { n: '5.0★', l: 'Google Rating' },
              { n: 'Full Service', l: 'Balloons · Booth · Audio · MC' },
            ].map((s, i) => (
              <div key={i}>
                <p className="font-display" style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--ink)', lineHeight: 1, marginBottom: '4px' }}>{s.n}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', fontWeight: 500, color: 'var(--gray)', letterSpacing: '0.04em' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Real work, framed like a gallery piece */}
        <div style={{
          position: 'relative', aspectRatio: '4/5', borderRadius: '28px', overflow: 'hidden',
          boxShadow: '0 50px 100px -20px rgba(13,15,15,0.18), 0 0 0 1px rgba(13,15,15,0.04)',
          background: 'var(--smoke)', animation: 'fadeScale 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s both',
        }}>
          {featured ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={featured.url} alt="Blue Luna Events — real installation" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Image src="/images/hero-main.jpg" alt="Blue Luna Events — balloon décor Tucson AZ" fill style={{ objectFit: 'cover' }} priority />
          )}
        </div>
      </div>
    </section>
  )
}
