'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// Jony's pick — the "2026" marquee installation: level, well-lit, on-brand
// warm/gold tones, and no faces in frame (keeps us out of the privacy
// question flagged earlier while curation isn't happening yet in Studio).
const HERO_VIDEO_URL = 'https://myumgaqlafbynsgnkdnj.supabase.co/storage/v1/object/public/media/media/1781997557666-jqsfj1nmpc.mp4'
const HERO_SLOWDOWN = 0.5 // half speed — makes a short clip read as cinematic B-roll instead of jumpy

export default function Hero() {
  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'var(--ink)' }}>
      {/* Real work, full-bleed — photo is the reliable base layer; video is a progressive
          enhancement that fades in only once it's actually confirmed playing. Raw phone
          video often can't start fast (metadata isn't at the front of the file the way a
          web-optimized export would be — same root cause documented elsewhere in this repo
          for video thumbnails), so this must never depend on the video to show anything. */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Image src="/images/hero-main.jpg" alt="Blue Luna Events — balloon décor Tucson AZ" fill style={{ objectFit: 'cover' }} priority />
        <video
          src={HERO_VIDEO_URL}
          autoPlay muted loop playsInline
          onPlaying={e => { e.currentTarget.playbackRate = HERO_SLOWDOWN; e.currentTarget.style.opacity = '1' }}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            opacity: 0, transition: 'opacity 1s ease',
          }}
        />
        {/* Twilight-tinted scrim — dark enough to hold text legible over any frame,
            with just enough warmth to still read as "twilight," not flat black. */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(13,15,15,0.72) 0%, rgba(20,17,15,0.6) 40%, rgba(13,15,15,0.58) 65%, rgba(13,15,15,0.88) 100%)',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(232,207,160,0.06)', mixBlendMode: 'overlay' }} />
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
            textShadow: '0 2px 24px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.3)',
          }}>
            Your Event Deserves<br />
            <em style={{ fontStyle: 'italic', color: 'var(--teal-l)' }}>Something Extraordinary.</em>
          </h1>

          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.95rem, 1.4vw, 1.05rem)', fontWeight: 400,
            lineHeight: 1.8, color: 'rgba(255,255,255,0.9)', maxWidth: '440px', marginBottom: '36px',
            animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.28s both',
            textShadow: '0 1px 12px rgba(0,0,0,0.4)',
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
