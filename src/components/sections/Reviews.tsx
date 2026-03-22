'use client'

import { Star } from 'lucide-react'

const REVIEWS = [
  { text: "Blue Luna transformed our baby shower into something out of a Pinterest dream. The backdrop and balloons were beyond beautiful.", name: "Jessica R.", loc: "Tucson, AZ", init: "J", bg: "#5BBFBF" },
  { text: "I was blown away by the creativity and detail. They made my daughter's quinceañera look like a magazine shoot.", name: "Maria V.", loc: "Oro Valley, AZ", init: "M", bg: "#C9A96E" },
  { text: "Monica and her team are the definition of professional. We hired Blue Luna for everything — balloons, photo booth, sound system, and MC. Our quinceañera ran flawlessly. Every single guest asked who did our décor. Worth every penny.", name: "Ana & Carlos Mendoza", loc: "Sahuarita, AZ", init: "A", bg: "#3A8F8F", wide: true },
]

function Stars() {
  return <div style={{ display: 'flex', gap: '3px', marginBottom: '14px' }}>{[...Array(5)].map((_,i) => <Star key={i} size={13} color="#C9A96E" fill="#C9A96E" />)}</div>
}

export default function Reviews() {
  return (
    <section id="reviews" style={{ padding: 'clamp(64px,10vw,120px) 0', background: '#FDFCFA' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,280px),1fr))', gap: '48px', alignItems: 'start' }}>
          <div className="reveal">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Client Love</span></div>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 300, color: '#0D0F0F', lineHeight: 1.1, marginBottom: '14px' }}>
              Tucson Families <em style={{ fontStyle: 'italic', color: '#3A8F8F' }}>Trust</em> Blue Luna
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 300, color: '#6B7280', lineHeight: 1.7, marginBottom: '24px' }}>
              Real reviews from real Tucson families.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Stars />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 500, color: '#6B7280', letterSpacing: '0.08em' }}>5.0 on Google</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="reveal reveal-delay-2">
            {REVIEWS.map((r, i) => (
              <div key={i} className="card" style={{
                padding: '24px',
                gridColumn: r.wide ? '1 / -1' : undefined,
                transition: 'all 0.3s',
              }}>
                <Stars />
                <p className="font-display" style={{ fontSize: r.wide ? '1.05rem' : '0.95rem', fontWeight: 300, fontStyle: 'italic', color: '#0D0F0F', lineHeight: 1.65, marginBottom: '16px' }}>
                  &ldquo;{r.text}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: '0.95rem', color: 'white', fontWeight: 600, flexShrink: 0 }}>
                    {r.init}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: '#0D0F0F' }}>{r.name}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 300, color: '#9CA3AF' }}>{r.loc} · Google</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
