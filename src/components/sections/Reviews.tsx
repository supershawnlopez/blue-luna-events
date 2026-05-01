'use client'

import { Star } from 'lucide-react'

const REVIEWS = [
  {
    text: "I looked at Monica's work on Instagram for six months before I called her. Then I walked into my daughter's quinceañera and literally started crying. I had no idea balloons could look like that — it looked like something from a magazine. She exceeded every expectation.",
    name: 'Gabriela Morales',
    loc: 'Tucson, AZ',
    event: 'Quinceañera · 2025',
    init: 'G',
    bg: '#5BBFBF',
  },
  {
    text: "Monica had the whole backyard done before any guests arrived. My son walked out and his jaw dropped — the arch and shimmer backdrop in his school colors looked incredible. The photo booth made the whole night. His friends are still posting those pictures.",
    name: 'Diana & Robert Castillo',
    loc: 'Oro Valley, AZ',
    event: 'Graduation Party · 2025',
    init: 'D',
    bg: '#3A8F8F',
  },
  {
    text: "She listened to exactly the vibe I was going for, suggested a color palette I hadn't even thought of, and showed up early to set up. By the time guests arrived it looked like a styled shoot. Every single person asked who did the décor.",
    name: 'Sofia Reyes',
    loc: 'Marana, AZ',
    event: 'Baby Shower · 2024',
    init: 'S',
    bg: '#5BBFBF',
  },
]

function Stars() {
  return (
    <div style={{ display: 'flex', gap: '3px', marginBottom: '16px' }}>
      {[...Array(5)].map((_, i) => <Star key={i} size={13} color="#C9A96E" fill="#C9A96E" />)}
    </div>
  )
}

export default function Reviews() {
  return (
    <section id="reviews" style={{ padding: 'clamp(80px,12vw,140px) 0', background: '#FDFCFA', overflow: 'hidden' }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: '56px' }} className="reveal">
          <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">What Families Say</span></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 300, color: '#0D0F0F', lineHeight: 1.05 }}>
              They Were Nervous.<br />
              <em style={{ fontStyle: 'italic', color: '#3A8F8F' }}>Then They Saw the Room.</em>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} color="#C9A96E" fill="#C9A96E" />)}
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 500, color: '#6B7280' }}>5.0 on Google</span>
            </div>
          </div>
        </div>

        {/* Desktop — 3 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }} className="reviews-desktop reveal">
          {REVIEWS.map((r, i) => (
            <div key={i} className="card" style={{ padding: '32px' }}>
              <Stars />
              <p style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: '1.05rem', fontWeight: 300, fontStyle: 'italic',
                color: '#0D0F0F', lineHeight: 1.75, marginBottom: '24px',
              }}>
                &ldquo;{r.text}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: r.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '1.1rem', color: 'white', fontWeight: 600, flexShrink: 0,
                }}>
                  {r.init}
                </div>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#0D0F0F' }}>{r.name}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 300, color: '#9CA3AF', marginTop: '2px' }}>{r.event} · {r.loc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile — swipe carousel */}
        <div className="reviews-mobile">
          <div style={{
            display: 'flex', gap: '16px',
            overflowX: 'auto', scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '8px', paddingLeft: '24px', paddingRight: '24px',
            marginLeft: '-24px', marginRight: '-24px',
          }}>
            {REVIEWS.map((r, i) => (
              <div key={i} style={{
                flexShrink: 0, width: 'calc(88vw)', maxWidth: '340px',
                scrollSnapAlign: 'center',
                background: 'white', borderRadius: '20px',
                border: '1px solid #E5E7EB', padding: '28px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              }}>
                <Stars />
                <p style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: '1.05rem', fontWeight: 300, fontStyle: 'italic',
                  color: '#0D0F0F', lineHeight: 1.75, marginBottom: '20px',
                }}>
                  &ldquo;{r.text}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: 'white', fontWeight: 600, flexShrink: 0,
                  }}>
                    {r.init}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.84rem', fontWeight: 600, color: '#0D0F0F' }}>{r.name}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 300, color: '#9CA3AF', marginTop: '2px' }}>{r.event}</p>
                  </div>
                </div>
              </div>
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
        .reviews-mobile > div::-webkit-scrollbar { display: none; }
        .reviews-mobile > div { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  )
}
