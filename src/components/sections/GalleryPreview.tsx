'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const photos = [
  { src: '/images/gal-1.jpg', alt: 'Custom balloon installation — Blue Luna Events Tucson', span: true },
  { src: '/images/gal-2.jpg', alt: 'Rose gold balloon arch — Blue Luna Events' },
  { src: '/images/gal-3.jpg', alt: 'Baby shower balloon décor — Blue Luna Events' },
  { src: '/images/gal-4.jpg', alt: 'Birthday celebration setup — Blue Luna Events' },
  { src: '/images/gal-5.jpg', alt: 'Outdoor event balloons — Blue Luna Events' },
]

export default function GalleryPreview() {
  return (
    <section id="gallery" style={{ padding: 'clamp(80px,12vw,140px) 0', background: '#F7F5F2' }}>
      <div className="container">

        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          marginBottom: '48px', flexWrap: 'wrap', gap: '20px',
        }} className="reveal">
          <div>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Portfolio</span></div>
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 300, color: '#0D0F0F', lineHeight: 1.05, marginBottom: '10px' }}>
              Rooms We&apos;ve <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>Transformed</em>
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 300, color: '#6B7280', lineHeight: 1.6 }}>
              Every setup you see was built for a real Tucson family, on a real date that mattered.
            </p>
          </div>
          <Link href="/gallery" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500,
            color: '#5BBFBF', border: '1.5px solid #5BBFBF', borderRadius: '999px',
            padding: '10px 22px', textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}>
            View Full Gallery <ArrowRight size={13} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: '320px 220px',
          gap: '14px',
        }} className="reveal gallery-grid">
          {photos.map((p, i) => (
            <div key={i} style={{
              position: 'relative', borderRadius: '18px', overflow: 'hidden',
              cursor: 'pointer',
              gridRow: i === 0 ? '1 / 3' : undefined,
            }}>
              <Image
                src={p.src}
                alt={p.alt}
                fill
                style={{ objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1)' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(13,15,15,0)',
                transition: 'background 0.3s',
              }} className="gal-overlay" />
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
