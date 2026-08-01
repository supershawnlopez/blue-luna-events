'use client'

import { Star, MessageSquarePlus } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/config'

const REVIEW = {
  text: "Highly, highly, highly recommend Blue Luna Events! They helped elevate a vision to perfection for our daughter's quinceañera. The team was incredibly professional and easy to work with.",
  name: 'Christian Ortiz',
  meta: 'Local Guide · Quinceañera',
  init: 'C',
}

function Stars({ size = 13 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', gap: '3px', marginBottom: '16px' }}>
      {[...Array(5)].map((_, i) => <Star key={i} size={size} color="#C9A96E" fill="#C9A96E" />)}
    </div>
  )
}

export default function Reviews() {
  return (
    <section id="reviews" style={{ padding: 'clamp(56px,8vw,96px) 0', background: '#FDFCFA', overflow: 'hidden', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: '-10%', left: '-6%', width: '340px', height: '340px',
        borderRadius: '50%', background: 'var(--twilight-glow)', filter: 'blur(30px)',
        pointerEvents: 'none', opacity: 0.6,
      }} />
      <div className="container" style={{ position: 'relative' }}>

        {/* Header */}
        <div style={{ marginBottom: '56px' }} className="reveal">
          <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">What Families Say</span></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 400, color: '#0D0F0F', lineHeight: 1.05 }}>
              They Were Nervous.<br />
              <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>Then They Saw the Room.</em>
            </h2>
          </div>
        </div>

        <div className="reviews-grid reveal">
          {/* Real Google review */}
          <div className="card" style={{ padding: 'clamp(28px,4vw,40px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <Stars size={15} />
              <p style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: 'clamp(1.15rem,2vw,1.4rem)', fontWeight: 400, fontStyle: 'italic',
                color: '#0D0F0F', lineHeight: 1.7, marginBottom: '28px',
              }}>
                &ldquo;{REVIEW.text}&rdquo;
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: '#5BBFBF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '1.15rem', color: 'white', fontWeight: 600, flexShrink: 0,
                }}>
                  {REVIEW.init}
                </div>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#0D0F0F' }}>{REVIEW.name}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 300, color: '#9CA3AF', marginTop: '2px' }}>{REVIEW.meta}</p>
                </div>
              </div>
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 500,
                color: '#9CA3AF', letterSpacing: '0.04em',
              }}>
                Posted on Google
              </span>
            </div>
          </div>

          {/* Ask for a review */}
          <div style={{
            borderRadius: '20px', background: '#0D0F0F', padding: 'clamp(28px,4vw,40px)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', bottom: '-20%', right: '-15%', width: '160px', height: '160px',
              borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,191,191,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'rgba(91,191,191,0.12)', border: '1px solid rgba(91,191,191,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MessageSquarePlus size={18} color="#5BBFBF" />
            </div>
            <h3 className="font-display" style={{ fontSize: 'clamp(1.3rem,2vw,1.6rem)', fontWeight: 400, color: 'white', lineHeight: 1.2 }}>
              Worked with Monica?<br /><em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>Tell the next family.</em>
            </h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 300, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
              A minute of your time helps another family find her.
            </p>
            <a
              href={SITE_CONFIG.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ alignSelf: 'flex-start', fontSize: '0.82rem', padding: '13px 24px' }}
            >
              Leave a Google Review <Star size={14} />
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
