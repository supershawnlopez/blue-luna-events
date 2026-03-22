'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'

export default function Hero() {
  return (
    <section style={{
      position: 'relative', minHeight: '100vh',
      background: '#0D0F0F',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 65% 40%, rgba(91,191,191,0.13) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 15% 70%, rgba(201,169,110,0.07) 0%, transparent 50%), linear-gradient(160deg, #0D0F0F 0%, #0F1A1A 60%, #0D0F0F 100%)',
      }} />

      {/* Orbs */}
      <div style={{
        position: 'absolute', width: '500px', height: '500px',
        top: '-80px', right: '-60px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(91,191,191,0.15) 0%, transparent 70%)',
        filter: 'blur(70px)', pointerEvents: 'none',
        animation: 'orbFloat1 14s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: '300px', height: '300px',
        bottom: '15%', left: '3%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(91,191,191,0.08) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
        animation: 'orbFloat2 18s ease-in-out infinite',
      }} />

      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, #5BBFBF, transparent)',
        opacity: 0.6,
      }} />

      {/* Content */}
      <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: '100px', paddingBottom: '120px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
          gap: '56px', alignItems: 'center',
        }}>
          {/* Left */}
          <div>
            {/* Location pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(91,191,191,0.12)',
              border: '1px solid rgba(91,191,191,0.25)',
              borderRadius: '999px', padding: '6px 14px',
              marginBottom: '28px',
              animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both',
            }}>
              <MapPin size={12} color="#5BBFBF" />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 500, color: '#5BBFBF', letterSpacing: '0.08em' }}>
                Tucson, AZ · Serving All of Southern Arizona
              </span>
            </div>

            <h1 className="font-display" style={{
              fontSize: 'clamp(2.8rem, 6vw, 5rem)',
              fontWeight: 300, lineHeight: 1.05,
              color: 'white', marginBottom: '20px',
              animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both',
            }}>
              <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>Breathtaking</em>
              <strong style={{ fontWeight: 600, display: 'block' }}>Balloon Décor</strong>
              <span style={{ fontWeight: 300 }}>for Every Event</span>
            </h1>

            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)',
              fontWeight: 300, lineHeight: 1.8,
              color: 'rgba(255,255,255,0.62)',
              maxWidth: '440px', marginBottom: '36px',
              animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.35s both',
            }}>
              Professional balloon installations, custom backdrops, and full event styling.
              Delivered, installed, and picture-perfect before your guests arrive.
            </p>

            <div style={{
              display: 'flex', gap: '12px', flexWrap: 'wrap',
              animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.45s both',
            }}>
              <Link href="/#packages" className="btn-primary">
                See Packages & Pricing <ArrowRight size={15} />
              </Link>
              <Link href="/gallery" className="btn-ghost">
                View Our Work
              </Link>
            </div>
          </div>

          {/* Right — photo stack */}
          <div style={{
            position: 'relative', height: '500px',
            animation: 'fadeScale 1s cubic-bezier(0.16,1,0.3,1) 0.3s both',
          }} className="hero-photos">
            {/* Badge */}
            <div style={{
              position: 'absolute', top: '24px', left: '-12px',
              zIndex: 10,
              background: 'rgba(13,15,15,0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(91,191,191,0.3)',
              borderRadius: '16px', padding: '14px 18px',
            }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#5BBFBF', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>Summer 2025</p>
              <p className="font-display" style={{ fontSize: '1.3rem', fontWeight: 600, color: 'white', lineHeight: 1 }}>Booking Now</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>Limited dates available</p>
            </div>

            {/* Main photo */}
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: '86%', height: '440px',
              borderRadius: '20px', overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
            }}>
              <Image src="/images/hero-main.jpg" alt="Blue Luna Events balloon installation" fill style={{ objectFit: 'cover' }} priority />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(91,191,191,0.08) 0%, transparent 60%)' }} />
            </div>

            {/* Secondary photo */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0,
              width: '50%', height: '240px',
              borderRadius: '16px', overflow: 'hidden',
              border: '3px solid #0D0F0F',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            }}>
              <Image src="/images/hero-sec.jpg" alt="Blue Luna Events backdrop" fill style={{ objectFit: 'cover', opacity: 0.9 }} />
            </div>

            {/* Teal accent */}
            <div style={{
              position: 'absolute', bottom: '48px', right: '-8px',
              width: '72px', height: '72px',
              border: '1.5px solid rgba(91,191,191,0.3)',
              borderRadius: '12px',
            }} />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(13,15,15,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div className="container">
          <div style={{ display: 'flex', overflowX: 'auto' }}>
            {[
              { n: '200+', l: 'Events Styled' },
              { n: '5.0★', l: 'Google Rating' },
              { n: '1-Stop', l: 'Balloons · Booth · Audio · MC' },
              { n: '~2hr', l: 'Quote Turnaround' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: '1', minWidth: '80px',
                padding: '18px 12px',
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                textAlign: 'center',
              }}>
                <p className="font-display" style={{ fontSize: 'clamp(1.2rem,2vw,1.8rem)', fontWeight: 600, color: 'white', lineHeight: 1, marginBottom: '4px' }}>
                  <span style={{ color: '#5BBFBF' }}></span>{s.n}
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.6rem,1vw,0.72rem)', fontWeight: 400, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:768px) {
          .hero-photos { display: none !important; }
        }
      `}</style>
    </section>
  )
}
