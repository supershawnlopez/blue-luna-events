'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type MediaItem = { id: string; url: string; type: string; show_on_website: boolean }

export default function Hero() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoReady, setVideoReady] = useState(false)

  useEffect(() => {
    fetch('/api/studio/media')
      .then(r => (r.ok ? r.json() : []))
      .then((d: MediaItem[]) => {
        if (!Array.isArray(d)) return
        const videos = d.filter(m => m.type === 'video' && m.url.toLowerCase().endsWith('.mp4'))
        if (videos.length === 0) return
        const featured = videos.find(v => v.show_on_website) ?? videos[Math.floor(Math.random() * Math.min(videos.length, 8))]
        setVideoUrl(featured.url)
      })
      .catch(() => {})
  }, [])

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'var(--ink)' }}>
      {/* Real work, full-bleed — photo is the reliable base layer; video is a progressive
          enhancement that fades in only once it's actually confirmed playing. Raw phone
          video often can't start fast (metadata isn't at the front of the file the way a
          web-optimized export would be — same root cause documented elsewhere in this repo
          for video thumbnails), so this must never depend on the video to show anything. */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Image src="/images/hero-main.jpg" alt="Blue Luna Events — balloon décor Tucson AZ" fill style={{ objectFit: 'cover' }} priority />
        {videoUrl && (
          <video
            key={videoUrl}
            src={videoUrl}
            autoPlay muted loop playsInline
            onPlaying={() => setVideoReady(true)}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              opacity: videoReady ? 1 : 0, transition: 'opacity 0.8s ease',
            }}
          />
        )}
        {/* Twilight-tinted overlay — legible, not flat black */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(13,15,15,0.5) 0%, rgba(232,207,160,0.1) 42%, rgba(13,15,15,0.35) 65%, rgba(13,15,15,0.82) 100%)',
        }} />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: '120px', paddingBottom: '100px' }}>
        <div style={{ maxWidth: '620px' }}>
          <div className="eyebrow" style={{ marginBottom: '24px', animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>
            <div className="eyebrow-line" style={{ background: 'var(--twilight-gold)' }} />
            <span className="eyebrow-text" style={{ color: 'var(--twilight-gold)' }}>Tucson, AZ · Southern Arizona</span>
          </div>

          <h1 className="font-display" style={{
            fontSize: 'clamp(2.8rem, 5.5vw, 4.8rem)', fontWeight: 300, lineHeight: 1.03, color: 'white',
            marginBottom: '22px', letterSpacing: '-0.01em', animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.18s both',
          }}>
            Your Event Deserves<br />
            <em style={{ fontStyle: 'italic', color: 'var(--teal-l)' }}>Something Extraordinary.</em>
          </h1>

          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.95rem, 1.4vw, 1.05rem)', fontWeight: 400,
            lineHeight: 1.8, color: 'rgba(255,255,255,0.75)', maxWidth: '440px', marginBottom: '36px',
            animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.28s both',
          }}>
            Monica transforms your venue from empty room to magazine-worthy moment — delivered, installed, and perfect before the first guest walks in.
          </p>

          <div style={{ animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.36s both' }}>
            <Link href="/event-questionnaire" className="btn-primary" style={{ fontSize: '0.85rem', padding: '15px 32px' }}>
              Event Questionnaire <ArrowRight size={15} />
            </Link>
          </div>

          <div style={{ display: 'flex', gap: 'clamp(24px,4vw,40px)', marginTop: '52px', flexWrap: 'wrap', animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.44s both' }}>
            {[
              { n: '200+', l: 'Events Styled' },
              { n: '5.0★', l: 'Google Rating' },
              { n: 'Full Service', l: 'Balloons · Booth · Audio · MC' },
            ].map((s, i) => (
              <div key={i}>
                <p className="font-display" style={{ fontSize: '1.3rem', fontWeight: 600, color: 'white', lineHeight: 1, marginBottom: '4px' }}>{s.n}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.66rem', fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
