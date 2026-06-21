'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { X, ChevronLeft, ChevronRight, Play, Download, Share2 } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/config'

type MediaItem = {
  id: string
  url: string
  thumbnail_url?: string | null
  type: 'photo' | 'video'
  file_name: string
}

type Gallery = {
  slug: string
  display_name: string
  media: MediaItem[]
}

export default function GalleryView({ gallery }: { gallery: Gallery }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const touchStartX = useRef(0)
  const lightboxItem = lightboxIndex !== null ? gallery.media[lightboxIndex] : null

  useEffect(() => {
    if (lightboxIndex === null) return
    const len = gallery.media.length
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') setLightboxIndex(i => i !== null ? (i + 1) % len : null)
      else if (e.key === 'ArrowLeft') setLightboxIndex(i => i !== null ? (i - 1 + len) % len : null)
      else if (e.key === 'Escape') setLightboxIndex(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, gallery.media.length])

  // Lock body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxIndex])

  function goNext() { setLightboxIndex(i => i !== null ? (i + 1) % gallery.media.length : null) }
  function goPrev() { setLightboxIndex(i => i !== null ? (i - 1 + gallery.media.length) % gallery.media.length : null) }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://bluelunaevents.com/gallery/${gallery.slug}`
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', color: 'white', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ padding: '20px 20px 0', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'env(safe-area-inset-top, 20px)', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Blue Luna wordmark */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.2em', color: '#5BBFBF', textTransform: 'uppercase' }}>Blue Luna</span>
              <span style={{ fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Events</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'white', margin: '0 0 1px' }}>{gallery.display_name}</p>
            <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{gallery.media.length} photo{gallery.media.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '12px 20px 140px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '3px' }}>
          {gallery.media.map((item, idx) => (
            <div key={item.id} onClick={() => setLightboxIndex(idx)}
              style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '4px', overflow: 'hidden', background: '#1A1A1A', cursor: 'pointer' }}>
              {item.type === 'video' && item.thumbnail_url ? (
                <img src={item.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : item.type === 'video' ? (
                <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline preload="metadata" />
              ) : (
                <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              {item.type === 'video' && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Play size={13} color="white" fill="white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sticky action bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10, background: 'rgba(13,15,15,0.97)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '14px 20px env(safe-area-inset-bottom, 14px)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '10px' }}>
          <a href={fbShareUrl} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', background: '#1877F2', borderRadius: '12px', padding: '13px', textDecoration: 'none', color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>
            <Share2 size={15} />
            Share on Facebook
          </a>
          <Link href="/get-a-quote"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#5BBFBF', borderRadius: '12px', padding: '13px', textDecoration: 'none', color: '#0D0F0F', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>
            Book Your Event →
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxItem && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.98)', display: 'flex', flexDirection: 'column' }}
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
          onTouchEnd={e => {
            const diff = touchStartX.current - e.changedTouches[0].clientX
            if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev()
          }}>

          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'calc(env(safe-area-inset-top, 20px) + 12px) 20px 12px', flexShrink: 0 }}>
            <button onClick={() => setLightboxIndex(null)}
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '10px', padding: '8px', display: 'flex', cursor: 'pointer' }}>
              <X size={18} color="white" />
            </button>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
              {lightboxIndex !== null ? lightboxIndex + 1 : 0} / {gallery.media.length}
            </span>
            <a
              href={`/api/download?url=${encodeURIComponent(lightboxItem.url)}&name=${encodeURIComponent(lightboxItem.file_name)}`}
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', textDecoration: 'none' }}>
              <Download size={14} color="rgba(255,255,255,0.7)" />
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Save</span>
            </a>
          </div>

          {/* Media */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            {lightboxItem.type === 'video' ? (
              <video
                key={lightboxItem.id}
                src={lightboxItem.url}
                controls
                playsInline
                poster={lightboxItem.thumbnail_url || undefined}
                style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '6px' }}
              />
            ) : (
              <img
                key={lightboxItem.id}
                src={lightboxItem.url}
                alt=""
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '6px' }}
              />
            )}

            {gallery.media.length > 1 && (
              <>
                <button onClick={goPrev}
                  style={{ position: 'absolute', left: '12px', background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronLeft size={20} color="white" />
                </button>
                <button onClick={goNext}
                  style={{ position: 'absolute', right: '12px', background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronRight size={20} color="white" />
                </button>
              </>
            )}
          </div>

          {/* Bottom: share + book */}
          <div style={{ padding: '12px 20px env(safe-area-inset-bottom, 20px)', display: 'flex', gap: '10px', flexShrink: 0 }}>
            <a href={fbShareUrl} target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#1877F2', borderRadius: '12px', padding: '12px', textDecoration: 'none', color: 'white', fontSize: '0.78rem', fontWeight: 700 }}>
              <Share2 size={13} /> Share
            </a>
            <Link href="/get-a-quote"
              style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#5BBFBF', borderRadius: '12px', padding: '12px', textDecoration: 'none', color: '#0D0F0F', fontSize: '0.78rem', fontWeight: 700 }}>
              Book Your Event →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
