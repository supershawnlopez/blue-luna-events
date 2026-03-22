'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const stats = [
  { n: '200+', l: 'Events Styled' },
  { n: '5★', l: 'Google Rating' },
  { n: '4-in-1', l: 'Balloons · Booth · Audio · MC' },
  { n: '24hr', l: 'Quote Turnaround' },
]

export default function Hero() {
  return (
    <section style={{
      position: 'relative', minHeight: '100svh',
      background: '#0D0F0F',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', overflow: 'hidden',
    }}>
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 70% 55% at 65% 40%, rgba(91,191,191,0.13) 0%, transparent 60%), radial-gradient(ellipse 40% 35% at 15% 70%, rgba(201,169,110,0.07) 0%, transparent 55%), linear-gradient(160deg, #0D0F0F 0%, #141A1A 60%, #0F1515 100%)',
      }} />

      {/* Glow orbs */}
      <div style={{
        position: 'absolute', width: '400px', height: '400px',
        top: '-80px', right: '-60px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(91,191,191,0.12) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
        animation: 'orbFloat1 12s ease-in-out infinite',
      }} />

      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, #5BBFBF, transparent)',
        opacity: 0.4,
      }} />

      {/* CONTENT */}
      <div style={{
        position: 'relative', zIndex: 2,
        maxWidth: '1280px', margin: '0 auto',
        padding: '100px 24px 120px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
        gap: '48px',
        alignItems: 'center',
        width: '100%',
      }}>
        {/* LEFT */}
        <div>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            marginBottom: '24px',
            opacity: 0, animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s forwards',
          }}>
            <div style={{width:'28px', height:'1px', background:'#5BBFBF'}} />
            <span style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '11px', fontWeight: 300,
              color: '#5BBFBF', letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}>
              Tucson&apos;s Premier Event Studio
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 'clamp(3rem, 7vw, 5.5rem)',
            fontWeight: 300, lineHeight: 1.04,
            color: 'white', marginBottom: '12px',
            opacity: 0, animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.25s forwards',
          }}>
            <em style={{fontStyle:'italic', color:'#5BBFBF'}}>Breathtaking</em>
            <br />
            <strong style={{fontWeight: 600}}>Balloon Décor</strong>
            <br />
            <span style={{fontWeight: 300}}>for Every Event</span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
            fontWeight: 300, fontStyle: 'italic',
            color: '#E8CCA0', marginBottom: '20px',
            opacity: 0, animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.35s forwards',
          }}>
            Quinceañeras · Weddings · Graduations · Birthdays
          </p>

          {/* Body */}
          <p style={{
            fontSize: '15px', fontWeight: 300, lineHeight: 1.75,
            color: 'rgba(255,255,255,0.6)',
            maxWidth: '440px', marginBottom: '36px',
            opacity: 0, animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.42s forwards',
          }}>
            Professional balloon installations, custom backdrops, and full event styling —
            delivered, installed, and picture-perfect before your guests arrive.
            Serving Tucson, Oro Valley, Sahuarita &amp; beyond.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '12px',
            opacity: 0, animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s forwards',
          }}>
            <Link href="/#packages" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#5BBFBF', color: '#0D0F0F',
              fontSize: '14px', fontWeight: 600,
              padding: '14px 28px', borderRadius: '999px',
              boxShadow: '0 4px 20px rgba(91,191,191,0.4)',
              transition: 'all 0.2s', minHeight: 'unset',
            }}>
              See Packages & Pricing <ArrowRight size={15} />
            </Link>
            <Link href="/gallery" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '14px', fontWeight: 400,
              padding: '14px 24px', borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.2s', minHeight: 'unset',
            }}>
              View Our Work
            </Link>
          </div>
        </div>

        {/* RIGHT — photo stack, hidden on mobile */}
        <div className="hidden lg:block" style={{
          position: 'relative', height: '520px',
          opacity: 0, animation: 'fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.35s forwards',
        }}>
          {/* Booking badge */}
          <div style={{
            position: 'absolute', top: '24px', left: '-12px', zIndex: 10,
            background: 'rgba(13,15,15,0.94)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(91,191,191,0.3)',
            borderRadius: '14px', padding: '14px 18px',
          }}>
            <p style={{fontFamily:'DM Mono,monospace', fontSize:'9px', color:'#5BBFBF', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'4px'}}>Summer 2025</p>
            <p style={{fontFamily:'Cormorant Garamond,serif', fontSize:'20px', fontWeight:600, color:'white', lineHeight:1}}>Booking Now</p>
            <p style={{fontSize:'11px', color:'rgba(255,255,255,0.45)', marginTop:'3px'}}>Limited dates available</p>
          </div>

          {/* Main photo */}
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: '84%', height: '450px',
            borderRadius: '20px', overflow: 'hidden',
          }}>
            <Image src="/images/hero-main.jpg" alt="Stunning balloon arch by Blue Luna Events Tucson" fill style={{objectFit:'cover'}} priority />
            <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(91,191,191,0.08) 0%,transparent 60%)'}} />
          </div>

          {/* Secondary photo */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0,
            width: '50%', height: '250px',
            borderRadius: '16px', overflow: 'hidden',
            border: '3px solid #0D0F0F',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          }}>
            <Image src="/images/hero-sec.jpg" alt="Elegant event backdrop Blue Luna Events" fill style={{objectFit:'cover', opacity:0.9}} />
          </div>

          {/* Teal corner accent */}
          <div style={{
            position: 'absolute', bottom: '50px', right: '-8px',
            width: '72px', height: '72px',
            border: '1.5px solid rgba(91,191,191,0.25)',
            borderRadius: '10px',
          }} />
        </div>
      </div>

      {/* STATS BAR */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(13,15,15,0.6)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        zIndex: 2,
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              padding: '16px 12px',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              opacity: 0,
              animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${0.8 + i * 0.08}s forwards`,
            }}>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                fontWeight: 600, color: 'white', lineHeight: 1,
                marginBottom: '3px',
              }}>{s.n}</div>
              <div style={{fontSize: 'clamp(9px, 1.5vw, 11px)', color: 'rgba(255,255,255,0.38)', fontWeight: 300}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
