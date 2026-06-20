'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Camera, Upload, Heart, Star, ChevronLeft, X, Check } from 'lucide-react'

type MediaItem = {
  id: string
  url: string
  type: 'photo' | 'video'
  show_on_website: boolean
  social_export: boolean
  caption?: string
}

type Filter = 'all' | 'website' | 'social'

export default function StudioMedia() {
  const [filter, setFilter] = useState<Filter>('all')
  const [media, setMedia] = useState<MediaItem[]>([]) // populated from Supabase once connected
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = media.filter(m => {
    if (filter === 'website') return m.show_on_website
    if (filter === 'social') return m.social_export
    return true
  })

  async function handleFiles(files: FileList) {
    setUploading(true)
    setUploadProgress(0)
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const form = new FormData()
      form.append('file', file)
      await fetch('/api/studio/media/upload', { method: 'POST', body: form })
      setUploadProgress(Math.round(((i + 1) / files.length) * 100))
    }
    setUploading(false)
    // TODO: reload media list from Supabase
  }

  async function toggleWebsite(id: string, current: boolean) {
    // TODO: update gallery_media set show_on_website = !current where id = id
    setMedia(prev => prev.map(m => m.id === id ? { ...m, show_on_website: !current } : m))
  }

  async function toggleSocial(id: string, current: boolean) {
    // TODO: update gallery_media set social_export = !current where id = id
    setMedia(prev => prev.map(m => m.id === id ? { ...m, social_export: !current } : m))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ padding: '56px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Link href="/studio" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', display: 'flex', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              <ChevronLeft size={18} />
            </Link>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'white', letterSpacing: '-0.01em' }}>My Work</h1>
          </div>

          {/* Upload buttons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              capture="environment"
              style={{ display: 'none' }}
              onChange={e => e.target.files && handleFiles(e.target.files)}
            />
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute('capture')
                  fileInputRef.current.click()
                }
              }}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: '#5BBFBF', color: '#0D0F0F', border: 'none', borderRadius: '12px',
                padding: '14px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
              }}
            >
              <Upload size={17} /> Upload Photos
            </button>
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute('capture', 'environment')
                  fileInputRef.current.click()
                }
              }}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: 'rgba(91,191,191,0.12)', color: '#5BBFBF',
                border: '1.5px solid rgba(91,191,191,0.3)', borderRadius: '12px',
                padding: '14px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
              }}
            >
              <Camera size={17} /> Take Photo
            </button>
          </div>

          {uploading && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '99px', height: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#5BBFBF', width: `${uploadProgress}%`, transition: 'width 0.3s' }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '8px' }}>
                Uploading… {uploadProgress}%
              </p>
            </div>
          )}

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['all', 'website', 'social'] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '8px 18px', borderRadius: '99px', border: 'none', cursor: 'pointer',
                  background: filter === f ? '#5BBFBF' : 'rgba(255,255,255,0.06)',
                  color: filter === f ? '#0D0F0F' : 'rgba(255,255,255,0.5)',
                  fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.04em', textTransform: 'capitalize',
                  transition: 'all 0.15s',
                }}
              >
                {f === 'all' ? 'All' : f === 'website' ? '❤️ On Website' : '⭐ Social Queue'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Media grid */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 24px 0' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Camera size={40} color="rgba(255,255,255,0.1)" style={{ marginBottom: '16px' }} />
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>
              {filter === 'all' ? 'No photos yet' : filter === 'website' ? 'No photos on your website yet' : 'No photos in your social queue'}
            </p>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.2)' }}>
              {filter === 'all' ? 'Upload some of your work to get started' : 'Tap ❤️ on a photo to add it'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '3px' }}>
            {filtered.map(item => (
              <div key={item.id} style={{ position: 'relative', aspectRatio: '1/1', background: 'rgba(255,255,255,0.04)' }}>
                <Image src={item.url} alt="" fill style={{ objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                }} />
                <div style={{ position: 'absolute', bottom: '6px', left: '6px', display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => toggleWebsite(item.id, item.show_on_website)}
                    style={{
                      width: '30px', height: '30px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: item.show_on_website ? '#5BBFBF' : 'rgba(0,0,0,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    title="Show on website"
                  >
                    <Heart size={14} color={item.show_on_website ? '#0D0F0F' : 'rgba(255,255,255,0.7)'} fill={item.show_on_website ? '#0D0F0F' : 'none'} />
                  </button>
                  <button
                    onClick={() => toggleSocial(item.id, item.social_export)}
                    style={{
                      width: '30px', height: '30px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: item.social_export ? '#C9A96E' : 'rgba(0,0,0,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    title="Add to social export"
                  >
                    <Star size={14} color={item.social_export ? '#0D0F0F' : 'rgba(255,255,255,0.7)'} fill={item.social_export ? '#0D0F0F' : 'none'} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(91,191,191,0.06)', border: '1px solid rgba(91,191,191,0.15)', borderRadius: '12px' }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            <strong style={{ color: 'rgba(91,191,191,0.9)' }}>❤️ Heart</strong> a photo to publish it to your website gallery automatically.<br />
            <strong style={{ color: 'rgba(201,169,110,0.9)' }}>⭐ Star</strong> a photo to add it to your Social Export queue.
          </p>
        </div>
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(13,15,15,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '12px 0 env(safe-area-inset-bottom, 12px)',
        display: 'flex', zIndex: 100,
      }}>
        {[
          { href: '/studio/media', icon: Camera, label: 'My Work', active: true },
          { href: '/studio/estimates', icon: FileText, label: 'Estimates', active: false },
          { href: '/studio/exports', icon: Sparkles, label: 'Export', active: false },
        ].map(({ href, label, active }) => (
          <Link key={href} href={href} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            textDecoration: 'none', color: active ? '#5BBFBF' : 'rgba(255,255,255,0.4)',
            fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            {label === 'My Work' ? <Camera size={22} /> : label === 'Estimates' ? <FileText size={22} /> : <Sparkles size={22} />}
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

function FileText({ size, ...props }: { size: number; [key: string]: unknown }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
}

function Sparkles({ size, ...props }: { size: number; [key: string]: unknown }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5z"/><path d="M19 13l.5 1.5L21 15l-1.5.5L19 17l-.5-1.5L17 15l1.5-.5z"/></svg>
}
