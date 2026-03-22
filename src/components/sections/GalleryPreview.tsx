'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const photos = [
  { src: '/images/gal-1.jpg', alt: 'Custom balloon castle — Blue Luna Events', label: 'Custom Installation', span: true },
  { src: '/images/gal-2.jpg', alt: 'Rose gold arch — Blue Luna Events', label: 'Rose Gold Arch' },
  { src: '/images/gal-3.jpg', alt: 'Baby shower — Blue Luna Events', label: 'Baby Shower' },
  { src: '/images/gal-4.jpg', alt: 'Birthday — Blue Luna Events', label: 'Birthday Celebration' },
  { src: '/images/gal-5.jpg', alt: 'Outdoor — Blue Luna Events', label: 'Outdoor Event' },
]

export default function GalleryPreview() {
  return (
    <section id="gallery" style={{ padding: 'clamp(64px,10vw,120px) 0', background: '#F7F5F2' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }} className="reveal">
          <div>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Our Work</span></div>
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, color: '#0D0F0F', lineHeight: 1.1 }}>
              Recent <em style={{ fontStyle: 'italic', color: '#3A8F8F' }}>Creations</em>
            </h2>
          </div>
          <Link href="/gallery" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500,
            color: '#3A8F8F', border: '1.5px solid #3A8F8F', borderRadius: '999px',
            padding: '9px 20px', textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}>
            View Full Gallery <ArrowRight size={13} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: '300px 220px',
          gap: '12px',
        }} className="reveal gallery-grid">
          {photos.map((p, i) => (
            <div key={i} style={{
              position: 'relative', borderRadius: '16px', overflow: 'hidden',
              cursor: 'pointer',
              gridRow: i === 0 ? '1 / 3' : undefined,
            }}>
              <Image src={p.src} alt={p.alt} fill style={{ objectFit: 'cover', transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)' }} />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(13,15,15,0)',
                display: 'flex', alignItems: 'flex-end', padding: '18px',
                transition: 'background 0.3s',
              }} className="gal-overlay">
                <span className="font-display" style={{ fontSize: '1rem', fontStyle: 'italic', color: 'white', fontWeight: 300, opacity: 0, transition: 'opacity 0.3s' }} className="gal-label">
                  {p.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media(max-width:640px) {
          .gallery-grid { grid-template-columns: 1fr 1fr !important; grid-template-rows: auto !important; }
          .gallery-grid > div:first-child { grid-row: auto !important; height: 240px; }
          .gallery-grid > div { height: 180px; }
        }
        .gallery-grid > div:hover img { transform: scale(1.05); }
        .gallery-grid > div:hover .gal-overlay { background: rgba(13,15,15,0.55) !important; }
        .gallery-grid > div:hover .gal-label { opacity: 1 !important; }
      `}</style>
    </section>
  )
}
