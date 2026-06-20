'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// Placeholder photos using existing local images.
// Once Supabase Storage is connected, replace with:
//   select * from gallery_media where show_on_website = true order by created_at desc limit 6
const PREVIEW_PHOTOS = [
  { src: '/images/gal-1.jpg', alt: 'Balloon décor by Blue Luna Events', wide: true },
  { src: '/images/gal-2.jpg', alt: 'Shimmer backdrop Blue Luna Events' },
  { src: '/images/gal-3.jpg', alt: 'Quinceañera balloon arch Tucson' },
  { src: '/images/gal-4.jpg', alt: 'Balloon garland setup Tucson AZ' },
  { src: '/images/hero-sec.jpg', alt: 'Event styling Blue Luna Events' },
  { src: '/images/gal-5.jpg', alt: 'Graduation balloon décor Tucson' },
]

export default function GalleryPreview() {
  return (
    <section id="gallery-preview" style={{ padding: 'clamp(56px,8vw,96px) 0', background: '#FDFCFA' }}>
      <div className="container">

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '36px' }} className="reveal">
          <div>
            <div className="eyebrow" style={{ marginBottom: '14px' }}>
              <div className="eyebrow-line" />
              <span className="eyebrow-text">Our Work</span>
            </div>
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 400, color: '#0D0F0F', lineHeight: 1.05 }}>
              Every Event. <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>Documented.</em>
            </h2>
          </div>
          <Link href="/gallery" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 600,
            color: '#5BBFBF', textDecoration: 'none', letterSpacing: '0.04em',
            borderBottom: '1px solid rgba(91,191,191,0.4)', paddingBottom: '2px',
          }}>
            View Full Gallery <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }} className="reveal reveal-delay-1">
          {PREVIEW_PHOTOS.map((photo, i) => (
            <div key={i} style={{
              position: 'relative', borderRadius: '16px', overflow: 'hidden',
              gridColumn: i === 0 ? 'span 2' : 'span 1',
              aspectRatio: i === 0 ? '16/9' : '1/1',
            }}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover', transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)' }}
              />
            </div>
          ))}
        </div>

        <p className="reveal" style={{ fontFamily: 'Inter, sans-serif', textAlign: 'center', marginTop: '28px', fontSize: '0.88rem', fontWeight: 300, color: '#9CA3AF' }}>
          Follow Monica&apos;s work on Instagram{' '}
          <a href="https://instagram.com/bluelunamagic" target="_blank" rel="noopener noreferrer"
            style={{ color: '#5BBFBF', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid rgba(91,191,191,0.4)' }}>
            @BlueLunaMagic
          </a>
        </p>
      </div>

      <style>{`
        @media (max-width: 600px) {
          #gallery-preview .container > div:nth-child(2) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          #gallery-preview .container > div:nth-child(2) > div:first-child {
            grid-column: span 2 !important;
            aspect-ratio: 4/3 !important;
          }
        }
      `}</style>
    </section>
  )
}
