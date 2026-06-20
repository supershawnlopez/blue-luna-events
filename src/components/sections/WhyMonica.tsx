'use client'

import Image from 'next/image'
import { Star, Heart, MapPin } from 'lucide-react'

const TRUST_ITEMS = [
  { n: '200+', label: 'Events Styled' },
  { n: '5.0★', label: 'Google Rating' },
  { n: '2018', label: 'Serving Tucson' },
]

export default function WhyMonica() {
  return (
    <section id="about" style={{ padding: 'clamp(64px,9vw,112px) 0', background: '#0D0F0F', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(91,191,191,0.07) 0%, transparent 65%)',
        filter: 'blur(80px)', pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'clamp(240px,38%,420px) 1fr',
          gap: 'clamp(40px,6vw,96px)',
          alignItems: 'center',
        }}>

          {/* Photo */}
          <div className="reveal" style={{ position: 'relative' }}>
            <div style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              aspectRatio: '3/4',
            }}>
              <Image
                src="/images/hero-sec.jpg"
                alt="Monica Denogean — Blue Luna Events founder"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(13,15,15,0.6) 0%, transparent 50%)',
              }} />
            </div>
            {/* Floating badge */}
            <div style={{
              position: 'absolute', bottom: '24px', left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(13,15,15,0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(91,191,191,0.25)',
              borderRadius: '999px',
              padding: '10px 20px',
              display: 'flex', alignItems: 'center', gap: '8px',
              whiteSpace: 'nowrap',
            }}>
              <MapPin size={13} color="#5BBFBF" />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.03em' }}>
                Tucson, AZ · Serving Southern Arizona
              </span>
            </div>
          </div>

          {/* Copy */}
          <div className="reveal reveal-delay-1">
            <div className="eyebrow" style={{ marginBottom: '24px' }}>
              <div className="eyebrow-line" style={{ background: 'rgba(91,191,191,0.5)' }} />
              <span className="eyebrow-text" style={{ color: 'rgba(91,191,191,0.8)' }}>The Person Behind It All</span>
            </div>

            <h2 className="font-display" style={{
              fontSize: 'clamp(2.2rem,4vw,3.4rem)',
              fontWeight: 400,
              color: 'white',
              lineHeight: 1.05,
              marginBottom: '28px',
            }}>
              Monica Doesn&apos;t Just Decorate.<br />
              <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>She Creates Moments.</em>
            </h2>

            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(0.95rem,1.4vw,1.05rem)',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.85,
              marginBottom: '18px',
            }}>
              Monica Denogean has been turning empty rooms into unforgettable celebrations since 2018. From intimate backyard birthdays to elaborate quinceañeras with 300 guests, she personally handles every event — no subcontractors, no surprises.
            </p>

            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(0.95rem,1.4vw,1.05rem)',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.85,
              marginBottom: '44px',
            }}>
              She shows up early. She stays until it&apos;s perfect. And she takes it all down before your guests even leave — so your family can just celebrate.
            </p>

            {/* Stats row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: '1px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '36px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              {TRUST_ITEMS.map((t, i) => (
                <div key={i} style={{
                  background: 'rgba(13,15,15,0.8)',
                  padding: '24px 16px',
                  textAlign: 'center',
                }}>
                  <p className="font-display" style={{
                    fontSize: 'clamp(1.4rem,2.5vw,2rem)',
                    fontWeight: 600,
                    color: '#5BBFBF',
                    lineHeight: 1,
                    marginBottom: '6px',
                  }}>{t.n}</p>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.7rem',
                    fontWeight: 400,
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}>{t.label}</p>
                </div>
              ))}
            </div>

            {/* Review quote */}
            <div style={{
              borderLeft: '2px solid #5BBFBF',
              paddingLeft: '20px',
            }}>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '10px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={12} color="#C9A96E" fill="#C9A96E" />)}
              </div>
              <p className="font-display" style={{
                fontSize: '1.05rem',
                fontWeight: 400,
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.7,
                marginBottom: '10px',
              }}>
                &ldquo;I walked into my daughter&apos;s quinceañera and started crying. I had no idea balloons could look like that.&rdquo;
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                — Gabriela Morales, Tucson AZ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile layout override */}
      <style>{`
        @media (max-width: 700px) {
          #about .container > div {
            grid-template-columns: 1fr !important;
          }
          #about .container > div > div:first-child {
            max-width: 320px;
            margin: 0 auto;
          }
          #about .container > div > div:first-child > div:first-child {
            aspect-ratio: 4/3 !important;
          }
        }
      `}</style>
    </section>
  )
}
