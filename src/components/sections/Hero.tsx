'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      background: '#0D0F0F',
    }}>
      {/* Full-bleed background image */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Image
          src="/images/hero-main.jpg"
          alt="Blue Luna Events — balloon décor Tucson AZ"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(13,15,15,0.92) 0%, rgba(13,15,15,0.72) 50%, rgba(13,15,15,0.30) 100%)',
        }} />
      </div>

      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(91,191,191,0.5), transparent)',
      }} />

      {/* Content */}
      <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: '120px', paddingBottom: '140px' }}>
        <div style={{ maxWidth: '600px' }}>

          <div className="eyebrow" style={{ marginBottom: '28px', animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Tucson, AZ · Southern Arizona</span>
          </div>

          <h1 className="font-display" style={{
            fontSize: 'clamp(3.2rem, 6.5vw, 5.5rem)',
            fontWeight: 300,
            lineHeight: 1.0,
            color: 'white',
            marginBottom: '24px',
            letterSpacing: '-0.01em',
            animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both',
          }}>
            Your Event Deserves<br />
            <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>Something Extraordinary.</em>
          </h1>

          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)',
            fontWeight: 300,
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.62)',
            maxWidth: '460px',
            marginBottom: '40px',
            animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.35s both',
          }}>
            Monica transforms your venue from empty room to magazine-worthy moment — delivered, installed, and perfect before the first guest walks in.
          </p>

          <div style={{
            display: 'flex', gap: '12px', flexWrap: 'wrap',
            animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.45s both',
          }}>
            <Link href="/get-a-quote" className="btn-primary" style={{ fontSize: '0.85rem', padding: '15px 32px' }}>
              Build Your Package <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(13,15,15,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div className="container">
          <div style={{ display: 'flex' }}>
            {[
              { n: '200+', l: 'Events Styled' },
              { n: '5.0★', l: 'Google Rating' },
              { n: 'Full Service', l: 'Balloons · Booth · Audio · MC' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1,
                padding: 'clamp(14px,2vw,20px) 16px',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                textAlign: 'center',
              }}>
                <p className="font-display" style={{
                  fontSize: 'clamp(1.1rem,2vw,1.5rem)',
                  fontWeight: 600,
                  color: 'white',
                  lineHeight: 1,
                  marginBottom: '4px',
                }}>
                  {s.n}
                </p>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'clamp(0.6rem,1vw,0.7rem)',
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.05em',
                }}>
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
