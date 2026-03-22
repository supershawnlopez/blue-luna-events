'use client'

import { useRef } from 'react'
import { Star } from 'lucide-react'

const REVIEWS = [
  { text: "Blue Luna transformed our baby shower into something out of a Pinterest dream. The backdrop and balloons were beyond beautiful.", name: "Jessica R.", loc: "Tucson, AZ", init: "J", bg: "#5BBFBF" },
  { text: "I was blown away by the creativity and detail. They made my daughter's quinceañera look like a magazine shoot.", name: "Maria V.", loc: "Oro Valley, AZ", init: "M", bg: "#C9A96E" },
  { text: "Monica and her team are the definition of professional. We hired Blue Luna for everything — balloons, photo booth, sound system, and MC. Our quinceañera ran flawlessly. Every single guest asked who did our décor. Worth every penny.", name: "Ana & Carlos Mendoza", loc: "Sahuarita, AZ", init: "A", bg: "#3A8F8F" },
  { text: "From the first message to the last balloon, Monica made everything so easy. Our daughter's birthday was absolutely magical. Will book again for sure!", name: "Sandra L.", loc: "Marana, AZ", init: "S", bg: "#5BBFBF" },
]

function Stars() {
  return (
    <div style={{ display: 'flex', gap: '3px', marginBottom: '14px' }}>
      {[...Array(5)].map((_,i) => <Star key={i} size={13} color="#C9A96E" fill="#C9A96E" />)}
    </div>
  )
}

export default function Reviews() {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <section id="reviews" style={{ padding: 'clamp(64px,10vw,120px) 0', background: '#FDFCFA', overflow: 'hidden' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '48px' }} className="reveal">
          <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Client Love</span></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, color: '#0D0F0F', lineHeight: 1.1 }}>
              Tucson Families <em style={{ fontStyle: 'italic', color: '#3A8F8F' }}>Trust</em> Blue Luna
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_,i) => <Star key={i} size={14} color="#C9A96E" fill="#C9A96E" />)}
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 500, color: '#6B7280' }}>5.0 on Google</span>
            </div>
          </div>
        </div>

        {/* Desktop grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="reviews-desktop reveal">
          {REVIEWS.map((r, i) => (
            <div key={i} className="card" style={{ padding: '28px' }}>
              <Stars />
              <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1rem', fontWeight: 300, fontStyle: 'italic', color: '#0D0F0F', lineHeight: 1.7, marginBottom: '18px' }}>
                &ldquo;{r.text}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: 'white', fontWeight: 600, flexShrink: 0 }}>
                  {r.init}
                </div>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.84rem', fontWeight: 600, color: '#0D0F0F' }}>{r.name}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 300, color: '#9CA3AF' }}>{r.loc} · Google</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile peek carousel */}
        <div className="reviews-mobile">
          <div
            ref={scrollRef}
            style={{
              display: 'flex', gap: '16px',
              overflowX: 'auto', scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch',
              paddingBottom: '12px', paddingLeft: '24px', paddingRight: '24px',
              marginLeft: '-24px', marginRight: '-24px',
            }}
          >
            {REVIEWS.map((r, i) => (
              <div key={i} style={{
                flexShrink: 0,
                width: 'calc(85vw)',
                maxWidth: '340px',
                scrollSnapAlign: 'center',
                background: 'white',
                borderRadius: '20px',
                border: '1px solid #E5E7EB',
                padding: '24px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              }}>
                <Stars />
                <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.05rem', fontWeight: 300, fontStyle: 'italic', color: '#0D0F0F', lineHeight: 1.7, marginBottom: '18px' }}>
                  &ldquo;{r.text}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: 'white', fontWeight: 600, flexShrink: 0 }}>
                    {r.init}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.84rem', fontWeight: 600, color: '#0D0F0F' }}>{r.name}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 300, color: '#9CA3AF' }}>{r.loc} · Google</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Scroll hint dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
            {REVIEWS.map((_,i) => (
              <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === 0 ? '#5BBFBF' : '#E5E7EB', transition: 'background 0.2s' }} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .reviews-desktop { display: grid !important; }
        .reviews-mobile { display: none !important; }
        @media (max-width: 768px) {
          .reviews-desktop { display: none !important; }
          .reviews-mobile { display: block !important; }
        }
        /* Hide scrollbar but keep functionality */
        .reviews-mobile > div::-webkit-scrollbar { display: none; }
        .reviews-mobile > div { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  )
}
