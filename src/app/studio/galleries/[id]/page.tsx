'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, Link2, Plus, X, Check, Play, Eye, EyeOff, Trash2 } from 'lucide-react'

type MediaItem = {
  id: string
  url: string
  thumbnail_url?: string | null
  type: 'photo' | 'video'
  file_name: string
  event_type?: string | null
}

type GalleryItem = MediaItem & { assignment_id: string }

type Gallery = {
  id: string
  slug: string
  display_name: string
  is_active: boolean
  created_at: string
  media: GalleryItem[]
}

export default function GalleryDetail() {
  const { id } = useParams<{ id: string }>()
  const [gallery, setGallery]             = useState<Gallery | null>(null)
  const [loading, setLoading]             = useState(true)
  const [showAddSheet, setShowAddSheet]   = useState(false)
  const [allMedia, setAllMedia]           = useState<MediaItem[]>([])
  const [selected, setSelected]           = useState<Set<string>>(new Set())
  const [adding, setAdding]               = useState(false)
  const [copied, setCopied]               = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [togglingActive, setTogglingActive] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch(`/api/studio/galleries/${id}`)
    if (res.ok) setGallery(await res.json())
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  async function openAddSheet() {
    const res = await fetch('/api/studio/media')
    const data = await res.json()
    setAllMedia(Array.isArray(data) ? data : [])
    // Pre-select already-added media
    const existing = new Set(gallery?.media.map(m => m.id) ?? [])
    setSelected(existing)
    setShowAddSheet(true)
  }

  function toggleSelect(mediaId: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(mediaId)) next.delete(mediaId)
      else next.add(mediaId)
      return next
    })
  }

  async function addSelected() {
    if (!gallery || adding) return
    const existingIds = new Set(gallery.media.map(m => m.id))
    const toAdd = Array.from(selected).filter(id => !existingIds.has(id))
    const toRemove = gallery.media.filter(m => !selected.has(m.id))

    setAdding(true)

    await Promise.all([
      toAdd.length > 0 && fetch(`/api/studio/galleries/${id}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_ids: toAdd }),
      }),
      ...toRemove.map(m => fetch(`/api/studio/galleries/${id}/media/${m.id}`, { method: 'DELETE' })),
    ])

    setShowAddSheet(false)
    await load()
    setAdding(false)
  }

  async function removeItem(mediaId: string) {
    if (!gallery) return
    await fetch(`/api/studio/galleries/${id}/media/${mediaId}`, { method: 'DELETE' })
    setGallery(g => g ? { ...g, media: g.media.filter(m => m.id !== mediaId) } : g)
  }

  async function toggleActive() {
    if (!gallery || togglingActive) return
    setTogglingActive(true)
    const res = await fetch(`/api/studio/galleries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !gallery.is_active }),
    })
    if (res.ok) {
      const updated = await res.json()
      setGallery(g => g ? { ...g, is_active: updated.is_active } : g)
    }
    setTogglingActive(false)
  }

  async function copyLink() {
    if (!gallery) return
    await navigator.clipboard.writeText(`${window.location.origin}/gallery/${gallery.slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.2)' }}>Loading…</p>
    </div>
  )

  if (!gallery) return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.3)' }}>Gallery not found.</p>
    </div>
  )

  const selectedCount = selected.size
  const existingCount = gallery.media.length

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '100px' }}>

      {/* Header */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 28px) 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link href="/studio/galleries" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', display: 'flex', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
                <ChevronLeft size={18} />
              </Link>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: 0 }}>Gallery</p>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gallery.display_name}</h1>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <button onClick={toggleActive}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {gallery.is_active
                  ? <Eye size={14} color="#5BBFBF" />
                  : <EyeOff size={14} color="rgba(255,255,255,0.35)" />}
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: gallery.is_active ? '#5BBFBF' : 'rgba(255,255,255,0.35)' }}>
                  {gallery.is_active ? 'Live' : 'Hidden'}
                </span>
              </button>
              <button onClick={copyLink}
                style={{ background: copied ? 'rgba(91,191,191,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copied ? 'rgba(91,191,191,0.35)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '9px', padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.15s ease' }}>
                <Link2 size={14} color={copied ? '#5BBFBF' : 'rgba(255,255,255,0.4)'} />
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: copied ? '#5BBFBF' : 'rgba(255,255,255,0.4)' }}>
                  {copied ? 'Copied!' : 'Share'}
                </span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
              /gallery/{gallery.slug} · {gallery.media.length} item{gallery.media.length !== 1 ? 's' : ''}
            </p>
            <button onClick={openAddSheet}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#5BBFBF', border: 'none', borderRadius: '8px', padding: '7px 12px', color: '#0D0F0F', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
              <Plus size={13} /> Add Photos
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '12px 20px' }}>
        {gallery.media.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.88rem', marginBottom: '20px' }}>No photos in this gallery yet</p>
            <button onClick={openAddSheet}
              style={{ background: '#5BBFBF', border: 'none', borderRadius: '10px', padding: '12px 24px', color: '#0D0F0F', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
              Add Photos
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '3px' }}>
            {gallery.media.map(item => (
              <div key={item.id} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '6px', overflow: 'hidden', background: '#1A1A1A' }}>
                {item.type === 'video' && item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.file_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : item.type === 'video' ? (
                  <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline preload="metadata" />
                ) : (
                  <img src={item.url} alt={item.file_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}

                {item.type === 'video' && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <div style={{ background: 'rgba(0,0,0,0.55)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Play size={11} color="white" fill="white" />
                    </div>
                  </div>
                )}

                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />

                <button onClick={() => removeItem(item.id)}
                  style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '5px', padding: '4px', cursor: 'pointer', display: 'flex' }}>
                  <X size={10} color="rgba(255,255,255,0.6)" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Danger zone */}
        {gallery.media.length > 0 && (
          <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '9px', padding: '9px 14px', color: 'rgba(239,68,68,0.6)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                <Trash2 size={13} /> Delete Gallery
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Delete this gallery?</span>
                <button onClick={async () => {
                  await fetch(`/api/studio/galleries/${id}`, { method: 'DELETE' })
                  window.location.href = '/studio/galleries'
                }} style={{ background: '#ef4444', border: 'none', borderRadius: '7px', padding: '7px 12px', color: 'white', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                  Yes, Delete
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '7px', padding: '7px 12px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add photos sheet */}
      {showAddSheet && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', paddingTop: 'calc(env(safe-area-inset-top, 44px) + 12px)' }}>

            {/* Sheet header */}
            <div style={{ background: '#161616', padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'white', margin: '0 0 2px' }}>Choose Photos</p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                    {selectedCount} selected
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setShowAddSheet(false)}
                    style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '8px', padding: '8px 12px', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={addSelected} disabled={adding}
                    style={{ background: '#5BBFBF', border: 'none', borderRadius: '8px', padding: '8px 14px', color: '#0D0F0F', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    {adding ? 'Saving…' : `Done (${selectedCount})`}
                  </button>
                </div>
              </div>
            </div>

            {/* Media grid */}
            <div style={{ flex: 1, overflowY: 'auto', background: '#0D0F0F', padding: '8px 12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '3px' }}>
                {allMedia.map(item => {
                  const isSelected = selected.has(item.id)
                  return (
                    <div key={item.id} onClick={() => toggleSelect(item.id)}
                      style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '6px', overflow: 'hidden', background: '#1A1A1A', cursor: 'pointer', outline: isSelected ? '2.5px solid #5BBFBF' : 'none', outlineOffset: '-2.5px' }}>
                      {item.type === 'video' && item.thumbnail_url ? (
                        <img src={item.thumbnail_url} alt={item.file_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : item.type === 'video' ? (
                        <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline preload="metadata" />
                      ) : (
                        <img src={item.url} alt={item.file_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      {item.type === 'video' && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                          <div style={{ background: 'rgba(0,0,0,0.55)', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Play size={10} color="white" fill="white" />
                          </div>
                        </div>
                      )}
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '6px', right: '6px', width: '20px', height: '20px', borderRadius: '50%', background: '#5BBFBF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={11} color="#0D0F0F" strokeWidth={3} />
                        </div>
                      )}
                      {!isSelected && (
                        <div style={{ position: 'absolute', top: '6px', right: '6px', width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.3)' }} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(13,15,15,0.97)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 24px env(safe-area-inset-bottom,10px)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', justifyContent: 'space-around' }}>
          {[['My Work', '/studio/media'], ['Galleries', '/studio/galleries'], ['Estimates', '/studio/estimates']].map(([label, href]) => (
            <Link key={href} href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: href === '/studio/galleries' ? '#5BBFBF' : 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: href === '/studio/galleries' ? '#5BBFBF' : 'transparent' }} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
