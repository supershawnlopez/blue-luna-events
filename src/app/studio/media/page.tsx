'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, Upload, Camera, Heart, Star, Play, Check, Trash2, X, ChevronRight, Tag } from 'lucide-react'

type MediaItem = {
  id: string
  url: string
  type: 'photo' | 'video'
  event_type?: string | null
  show_on_website: boolean
  social_export: boolean
  file_name: string
  created_at: string
  file_fingerprint?: string | null
}

const EVENT_TYPES = [
  { id: 'quinceanera', label: 'Quinceañera', emoji: '👑' },
  { id: 'graduation',  label: 'Graduation',  emoji: '🎓' },
  { id: 'birthday',    label: 'Birthday',     emoji: '🎂' },
  { id: 'baby_shower', label: 'Baby Shower',  emoji: '🍼' },
  { id: 'wedding',     label: 'Wedding',      emoji: '💍' },
  { id: 'corporate',   label: 'Corporate',    emoji: '💼' },
  { id: 'other',       label: 'Other',        emoji: '🎈' },
]

type Filter = 'all' | 'website' | 'social'

function getLabel(id?: string | null) { return EVENT_TYPES.find(e => e.id === id)?.label ?? 'Tag it' }
function getEmoji(id?: string | null) { return EVENT_TYPES.find(e => e.id === id)?.emoji ?? null }

export default function StudioMedia() {
  const [media, setMedia]                   = useState<MediaItem[]>([])
  const [loading, setLoading]               = useState(true)
  const [filter, setFilter]                 = useState<Filter>('all')
  const [pendingFiles, setPendingFiles]     = useState<File[]>([])
  const [toast, setToast]                   = useState<string | null>(null)
  const [pendingSource, setPendingSource]   = useState<'file' | 'camera' | null>(null)
  const [pendingEventType, setPendingEventType] = useState<string | null>(null)
  const [showTypeSheet, setShowTypeSheet]   = useState(false)
  const [uploading, setUploading]           = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [editingTypeId, setEditingTypeId]   = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex]   = useState<number | null>(null)
  const fileRef      = useRef<HTMLInputElement>(null)
  const cameraRef    = useRef<HTMLInputElement>(null)
  const touchStartX  = useRef(0)

  const filtered = media.filter(m => {
    if (filter === 'website') return m.show_on_website
    if (filter === 'social')  return m.social_export
    return true
  })

  const knownFingerprints = new Set(media.map(m => m.file_fingerprint).filter(Boolean))
  const lightboxItem = lightboxIndex !== null ? filtered[lightboxIndex] : null

  useEffect(() => {
    fetch('/api/studio/media')
      .then(r => r.json())
      .then(d => { setMedia(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (lightboxIndex === null) return
    const len = filtered.length
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') setLightboxIndex(i => i !== null ? (i + 1) % len : null)
      else if (e.key === 'ArrowLeft') setLightboxIndex(i => i !== null ? (i - 1 + len) % len : null)
      else if (e.key === 'Escape') setLightboxIndex(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, filtered.length])

  function goNext() { setLightboxIndex(i => i !== null ? (i + 1) % filtered.length : null) }
  function goPrev() { setLightboxIndex(i => i !== null ? (i - 1 + filtered.length) % filtered.length : null) }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  function openTypeSheet(source: 'file' | 'camera') {
    setPendingSource(source)
    setShowTypeSheet(true)
  }

  function fingerprint(file: File) { return `${file.name}::${file.size}` }

  function selectType(eventType: string | null) {
    setPendingEventType(eventType)
    setShowTypeSheet(false)
    if (pendingSource === 'camera') cameraRef.current?.click()
    else fileRef.current?.click()
  }

  async function compressImage(file: File): Promise<{ file: File; type: string }> {
    return new Promise(resolve => {
      const img = new window.Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const MAX = 1920
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX }
          else { width = Math.round(width * MAX / height); height = MAX }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        canvas.toBlob(blob => {
          if (!blob) { resolve({ file, type: file.type }); return }
          const webp = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' })
          resolve({ file: webp, type: 'image/webp' })
        }, 'image/webp', 0.85)
      }
      img.onerror = () => { URL.revokeObjectURL(url); resolve({ file, type: file.type }) }
      img.src = url
    })
  }

  async function uploadFile(raw: File, eventType: string | null, onProgress: (pct: number) => void) {
    const isVideo = raw.type.startsWith('video')
    let uploadFile = raw
    let contentType = raw.type

    if (!isVideo) {
      const compressed = await compressImage(raw)
      uploadFile = compressed.file
      contentType = compressed.type
    }

    const signRes = await fetch('/api/studio/media/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: uploadFile.name, contentType }),
    })
    if (!signRes.ok) return null
    const { signedUrl, path } = await signRes.json()

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)) }
      xhr.onload = () => xhr.status < 300 ? resolve() : reject()
      xhr.onerror = reject
      xhr.open('PUT', signedUrl)
      xhr.setRequestHeader('Content-Type', contentType)
      xhr.send(uploadFile)
    })

    const recRes = await fetch('/api/studio/media/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path,
        filename: raw.name,
        type: isVideo ? 'video' : 'photo',
        event_type: eventType,
        file_size: uploadFile.size,
        file_fingerprint: fingerprint(raw),
      }),
    })
    return recRes.ok ? recRes.json() : null
  }

  async function onFilesChosen(files: FileList | null) {
    if (!files?.length) return
    const all = Array.from(files)
    const dupes = all.filter(f => knownFingerprints.has(fingerprint(f)))
    const fresh = all.filter(f => !knownFingerprints.has(fingerprint(f)))

    if (dupes.length > 0 && fresh.length === 0) {
      showToast(`All ${dupes.length} selected file${dupes.length !== 1 ? 's have' : ' has'} already been uploaded — nothing new to add.`)
      if (fileRef.current)   fileRef.current.value = ''
      if (cameraRef.current) cameraRef.current.value = ''
      return
    }
    if (dupes.length > 0) {
      showToast(`${dupes.length} duplicate${dupes.length !== 1 ? 's' : ''} skipped — uploading ${fresh.length} new file${fresh.length !== 1 ? 's' : ''}.`)
    }
    await runUploads(fresh)
  }

  async function runUploads(chosen: File[]) {
    if (chosen.length === 0) return
    setPendingFiles(chosen)
    setUploading(true)
    setUploadProgress(0)
    for (let i = 0; i < chosen.length; i++) {
      const item = await uploadFile(chosen[i], pendingEventType, pct => {
        const base = (i / chosen.length) * 100
        setUploadProgress(Math.round(base + pct / chosen.length))
      })
      if (item) setMedia(prev => [item, ...prev])
      setUploadProgress(Math.round(((i + 1) / chosen.length) * 100))
    }
    setUploading(false)
    setPendingFiles([])
    setPendingEventType(null)
    setPendingSource(null)
    setUploadProgress(0)
    if (fileRef.current)   fileRef.current.value = ''
    if (cameraRef.current) cameraRef.current.value = ''
  }

  async function toggle(id: string, field: 'show_on_website' | 'social_export', current: boolean) {
    setMedia(prev => prev.map(m => m.id === id ? { ...m, [field]: !current } : m))
    fetch(`/api/studio/media/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: !current }),
    })
  }

  async function changeType(id: string, eventType: string) {
    setEditingTypeId(null)
    setMedia(prev => prev.map(m => m.id === id ? { ...m, event_type: eventType } : m))
    fetch(`/api/studio/media/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: eventType }),
    })
  }

  async function deleteItem(id: string) {
    setConfirmDeleteId(null)
    if (lightboxIndex !== null) setLightboxIndex(null)
    setMedia(prev => prev.filter(m => m.id !== id))
    fetch(`/api/studio/media/${id}`, { method: 'DELETE' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '100px' }}>

      <input ref={fileRef} type="file" multiple accept="image/*,video/*"
        style={{ display: 'none' }} onChange={e => onFilesChosen(e.target.files)} />
      <input ref={cameraRef} type="file" accept="image/*,video/*" capture="environment"
        style={{ display: 'none' }} onChange={e => onFilesChosen(e.target.files)} />

      {/* Header */}
      <div style={{ padding: '56px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link href="/studio" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', display: 'flex', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
                <ChevronLeft size={18} />
              </Link>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: 0 }}>Studio</p>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'white', margin: 0 }}>My Work</h1>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => openTypeSheet('camera')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 13px', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                <Camera size={14} /> Shoot
              </button>
              <button onClick={() => openTypeSheet('file')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#5BBFBF', border: 'none', borderRadius: '10px', padding: '9px 13px', color: '#0D0F0F', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                <Upload size={14} /> Upload
              </button>
            </div>
          </div>

          {uploading && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Uploading…</span>
                <span style={{ fontSize: '0.75rem', color: '#5BBFBF', fontWeight: 700 }}>{uploadProgress}%</span>
              </div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px' }}>
                <div style={{ height: '100%', width: `${uploadProgress}%`, background: '#5BBFBF', borderRadius: '99px', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}

          {/* Filter tabs — flat Lucide icons, no emoji */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['all', 'website', 'social'] as Filter[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 13px', borderRadius: '999px', border: filter === f ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.1)', background: filter === f ? 'rgba(91,191,191,0.12)' : 'transparent', color: filter === f ? '#5BBFBF' : 'rgba(255,255,255,0.35)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                {f === 'website' && <Heart size={11} fill="currentColor" />}
                {f === 'social'  && <Star  size={11} fill="currentColor" />}
                {f === 'all'     ? `All (${media.length})` : f === 'website' ? `Website (${media.filter(m => m.show_on_website).length})` : `Social (${media.filter(m => m.social_export).length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '12px 20px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '60px 0', fontSize: '0.9rem' }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.88rem', marginBottom: '20px' }}>
              {filter === 'all' ? 'No photos or videos yet.' : `Nothing tagged for ${filter === 'website' ? 'the website' : 'social'} yet.`}
            </p>
            {filter === 'all' && (
              <button onClick={() => fileRef.current?.click()}
                style={{ background: '#5BBFBF', border: 'none', borderRadius: '10px', padding: '12px 24px', color: '#0D0F0F', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
                Upload Your First Photo or Video
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '3px' }}>
            {filtered.map((item, idx) => (
              <div key={item.id}
                onClick={() => setLightboxIndex(idx)}
                style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '6px', overflow: 'hidden', background: '#1A1A1A', cursor: 'pointer' }}>

                {item.type === 'video' ? (
                  <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    muted playsInline preload="metadata" />
                ) : (
                  <Image src={item.url} alt={item.file_name} fill style={{ objectFit: 'cover' }} sizes="200px" />
                )}

                {item.type === 'video' && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <div style={{ background: 'rgba(0,0,0,0.55)', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Play size={13} color="white" fill="white" />
                    </div>
                  </div>
                )}

                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 45%)' }} />

                {/* Event type badge — Tag icon instead of emoji */}
                <button onClick={e => { e.stopPropagation(); setEditingTypeId(editingTypeId === item.id ? null : item.id) }}
                  style={{ position: 'absolute', top: '5px', left: '5px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '5px', padding: '3px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  {getEmoji(item.event_type)
                    ? <span style={{ fontSize: '8px' }}>{getEmoji(item.event_type)}</span>
                    : <Tag size={8} color="rgba(255,255,255,0.45)" />}
                  <span style={{ fontSize: '8px', fontWeight: 700, color: item.event_type ? 'white' : 'rgba(255,255,255,0.45)' }}>{getLabel(item.event_type)}</span>
                </button>

                {/* Delete */}
                <button onClick={e => { e.stopPropagation(); setConfirmDeleteId(item.id) }}
                  style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '5px', padding: '4px', cursor: 'pointer', display: 'flex' }}>
                  <Trash2 size={10} color="rgba(255,255,255,0.45)" />
                </button>

                {/* Heart + Star */}
                <div style={{ position: 'absolute', bottom: '5px', left: '5px', right: '5px', display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={e => { e.stopPropagation(); toggle(item.id, 'show_on_website', item.show_on_website) }}
                    style={{ background: item.show_on_website ? 'rgba(239,68,68,0.85)' : 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '6px', padding: '5px 6px', cursor: 'pointer', display: 'flex' }}>
                    <Heart size={12} color="white" fill={item.show_on_website ? 'white' : 'none'} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); toggle(item.id, 'social_export', item.social_export) }}
                    style={{ background: item.social_export ? 'rgba(234,179,8,0.85)' : 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '6px', padding: '5px 6px', cursor: 'pointer', display: 'flex' }}>
                    <Star size={12} color="white" fill={item.social_export ? 'white' : 'none'} />
                  </button>
                </div>

                {/* Inline event type picker */}
                {editingTypeId === item.id && (
                  <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', inset: 0, background: 'rgba(13,15,15,0.96)', display: 'flex', flexDirection: 'column', padding: '6px', gap: '3px', overflowY: 'auto', zIndex: 10 }}>
                    {EVENT_TYPES.map(et => (
                      <button key={et.id} onClick={() => changeType(item.id, et.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: item.event_type === et.id ? 'rgba(91,191,191,0.18)' : 'rgba(255,255,255,0.04)', border: item.event_type === et.id ? '1px solid rgba(91,191,191,0.5)' : '1px solid rgba(255,255,255,0.07)', borderRadius: '5px', padding: '5px 7px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '11px' }}>{et.emoji}</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: 'white' }}>{et.label}</span>
                        {item.event_type === et.id && <Check size={9} color="#5BBFBF" style={{ marginLeft: 'auto' }} />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Delete confirm */}
                {confirmDeleteId === item.id && (
                  <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', inset: 0, background: 'rgba(13,15,15,0.96)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 10 }}>
                    <p style={{ fontSize: '10px', color: 'white', fontWeight: 700, textAlign: 'center', margin: 0 }}>Delete this?</p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => deleteItem(item.id)}
                        style={{ background: '#ef4444', border: 'none', borderRadius: '6px', padding: '6px 10px', color: 'white', fontSize: '9px', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                      <button onClick={() => setConfirmDeleteId(null)}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', padding: '6px 10px', color: 'white', fontSize: '9px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxItem && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.97)', display: 'flex', flexDirection: 'column' }}
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
          onTouchEnd={e => {
            const diff = touchStartX.current - e.changedTouches[0].clientX
            if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev()
          }}>

          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '56px 20px 12px', flexShrink: 0 }}>
            <button onClick={() => setLightboxIndex(null)}
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '10px', padding: '8px', display: 'flex', cursor: 'pointer' }}>
              <X size={18} color="white" />
            </button>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
              {lightboxIndex !== null ? lightboxIndex + 1 : 0} / {filtered.length}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px 10px' }}>
              {getEmoji(lightboxItem.event_type)
                ? <span style={{ fontSize: '11px' }}>{getEmoji(lightboxItem.event_type)}</span>
                : <Tag size={10} color="rgba(255,255,255,0.4)" />}
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: lightboxItem.event_type ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)' }}>
                {getLabel(lightboxItem.event_type)}
              </span>
            </div>
          </div>

          {/* Media */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            {lightboxItem.type === 'video' ? (
              <video
                key={lightboxItem.id}
                src={lightboxItem.url}
                controls
                playsInline
                style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px' }}
              />
            ) : (
              <img
                key={lightboxItem.id}
                src={lightboxItem.url}
                alt={lightboxItem.file_name}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }}
              />
            )}

            {/* Prev / Next arrows (desktop) */}
            {filtered.length > 1 && (
              <>
                <button onClick={goPrev}
                  style={{ position: 'absolute', left: '12px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronLeft size={20} color="white" />
                </button>
                <button onClick={goNext}
                  style={{ position: 'absolute', right: '12px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronRight size={20} color="white" />
                </button>
              </>
            )}
          </div>

          {/* Bottom bar — heart + star */}
          <div style={{ padding: '16px 24px env(safe-area-inset-bottom, 24px)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexShrink: 0 }}>
            <button onClick={() => toggle(lightboxItem.id, 'show_on_website', lightboxItem.show_on_website)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px 20px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: lightboxItem.show_on_website ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)', border: lightboxItem.show_on_website ? '1.5px solid rgba(239,68,68,0.5)' : '1.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease' }}>
                <Heart size={22} color={lightboxItem.show_on_website ? '#ef4444' : 'rgba(255,255,255,0.4)'} fill={lightboxItem.show_on_website ? '#ef4444' : 'none'} />
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: lightboxItem.show_on_website ? '#ef4444' : 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>Website</span>
            </button>

            <button onClick={() => toggle(lightboxItem.id, 'social_export', lightboxItem.social_export)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px 20px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: lightboxItem.social_export ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.06)', border: lightboxItem.social_export ? '1.5px solid rgba(234,179,8,0.5)' : '1.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease' }}>
                <Star size={22} color={lightboxItem.social_export ? '#eab308' : 'rgba(255,255,255,0.4)'} fill={lightboxItem.social_export ? '#eab308' : 'none'} />
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: lightboxItem.social_export ? '#eab308' : 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>Social</span>
            </button>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div style={{ position: 'fixed', top: '72px', left: '50%', transform: 'translateX(-50%)', zIndex: 60, maxWidth: '340px', width: 'calc(100% - 40px)' }}>
          <div style={{ background: '#1F1F1F', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5BBFBF', flexShrink: 0 }} />
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.4 }}>{toast}</p>
          </div>
        </div>
      )}

      {/* Event type bottom sheet */}
      {showTypeSheet && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} onClick={() => setShowTypeSheet(false)} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#161616', borderRadius: '20px 20px 0 0', padding: '16px 20px 44px' }}>
            <div style={{ width: '32px', height: '4px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px', margin: '0 auto 16px' }} />
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 4px' }}>What type of event?</p>
            <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center', margin: '0 0 16px' }}>
              Tag your photos so they show in the right gallery filter
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              {EVENT_TYPES.map(et => (
                <button key={et.id} onClick={() => selectType(et.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '13px 14px', cursor: 'pointer' }}>
                  <span style={{ fontSize: '18px' }}>{et.emoji}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'white' }}>{et.label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => selectType(null)}
              style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
              Skip — upload without tagging
            </button>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(13,15,15,0.97)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 24px env(safe-area-inset-bottom,10px)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', justifyContent: 'space-around' }}>
          {[['My Work', '/studio/media'], ['Estimates', '/studio/estimates'], ['Export', '/studio/exports']].map(([label, href]) => (
            <Link key={href} href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: href === '/studio/media' ? '#5BBFBF' : 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: href === '/studio/media' ? '#5BBFBF' : 'transparent' }} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
