'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, Link2, Images, X } from 'lucide-react'
import StudioNav from '@/components/studio/StudioNav'

type Gallery = {
  id: string
  slug: string
  display_name: string
  is_active: boolean
  created_at: string
  media_count: number
  cover: { thumbnail_url?: string; url: string; type: string } | null
}

export default function StudioGalleries() {
  const router = useRouter()
  const [galleries, setGalleries]   = useState<Gallery[]>([])
  const [loading, setLoading]       = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName]       = useState('')
  const [creating, setCreating]     = useState(false)
  const [copied, setCopied]         = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/studio/galleries')
      .then(r => r.json())
      .then(d => { setGalleries(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function createGallery() {
    if (!newName.trim() || creating) return
    setCreating(true)
    const res = await fetch('/api/studio/galleries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: newName.trim() }),
    })
    if (res.ok) {
      const gallery = await res.json()
      setShowCreate(false)
      setNewName('')
      router.push(`/studio/galleries/${gallery.id}`)
    }
    setCreating(false)
  }

  async function copyLink(slug: string) {
    const url = `${window.location.origin}/gallery/${slug}`
    await navigator.clipboard.writeText(url)
    setCopied(slug)
    setTimeout(() => setCopied(null), 2000)
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bluelunaevents.com'

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '120px' }}>

      {/* Header */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 20px) 20px 8px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/studio" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', display: 'flex', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
              <ChevronLeft size={18} />
            </Link>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em', color: '#5BBFBF', textTransform: 'uppercase', margin: 0 }}>Blue Luna</p>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', margin: 0, letterSpacing: '-0.01em' }}>Client Galleries</h1>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#5BBFBF', border: 'none', borderRadius: '10px', padding: '9px 14px', color: '#0D0F0F', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
            <Plus size={15} /> New
          </button>
        </div>
      </div>

      {/* Gallery list */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '8px 20px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '60px 0' }}>Loading…</p>
        ) : galleries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(91,191,191,0.1)', border: '1px solid rgba(91,191,191,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Images size={24} color="#5BBFBF" />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 600 }}>No galleries yet</p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', marginBottom: '24px' }}>Create one to share a client&apos;s event photos</p>
            <button onClick={() => setShowCreate(true)}
              style={{ background: '#5BBFBF', border: 'none', borderRadius: '10px', padding: '12px 24px', color: '#0D0F0F', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
              Create First Gallery
            </button>
          </div>
        ) : (
          // Full-width rows with a photo thumbnail (DESIGN_DECISIONS "STUDIO
          // LISTS"). The whole row opens the gallery; Copy stays one tap.
          <div style={{ margin: '0 -20px' }}>
            {galleries.map((g, i) => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '0 20px' }}>
                <Link href={`/studio/galleries/${g.id}`} style={{ flexShrink: 0, display: 'block', width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', background: '#1A1A1A' }}>
                  {g.cover ? (
                    <img src={g.cover.thumbnail_url || g.cover.url} alt={g.display_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Images size={20} color="rgba(255,255,255,0.15)" />
                    </div>
                  )}
                </Link>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.07)' }}>
                  <Link href={`/studio/galleries/${g.id}`} style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}>
                    <p style={{ fontSize: '0.98rem', fontWeight: 600, color: 'white', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.display_name}</p>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                      {!g.is_active && <span style={{ color: 'rgba(239,68,68,0.85)', fontWeight: 600 }}>Hidden ·</span>}
                      {g.media_count} photo{g.media_count !== 1 ? 's' : ''}
                    </p>
                  </Link>
                  <button onClick={() => copyLink(g.slug)} aria-label="Copy gallery link"
                    style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px', background: copied === g.slug ? 'rgba(91,191,191,0.15)' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '99px', padding: '7px 12px', cursor: 'pointer', color: copied === g.slug ? '#5BBFBF' : 'rgba(255,255,255,0.6)', fontSize: '0.74rem', fontWeight: 600 }}>
                    <Link2 size={13} /> {copied === g.slug ? 'Copied' : 'Copy link'}
                  </button>
                  <Link href={`/studio/galleries/${g.id}`} aria-label={`Open ${g.display_name}`} style={{ display: 'flex', flexShrink: 0 }}>
                    <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create gallery sheet */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} onClick={() => setShowCreate(false)} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#161616', borderRadius: '20px 20px 0 0', padding: '16px 20px 44px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <div style={{ width: '32px', height: '4px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px', marginBottom: '14px' }} />
                <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', margin: 0 }}>New Client Gallery</p>
              </div>
              <button onClick={() => setShowCreate(false)} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                <X size={16} color="rgba(255,255,255,0.5)" />
              </button>
            </div>

            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Gallery Name
            </label>
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createGallery()}
              placeholder="e.g. Rodriguez Quinceañera 2024"
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '14px 16px', color: 'white', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' }}
            />
            {newName.trim() && (
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', margin: '0 0 16px' }}>
                Link: {origin}/gallery/{newName.trim().toLowerCase().replace(/[^a-z0-9\s-]/gi, '').trim().replace(/\s+/g, '-')}
              </p>
            )}

            <button onClick={createGallery} disabled={!newName.trim() || creating}
              style={{ width: '100%', background: newName.trim() ? '#5BBFBF' : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '12px', padding: '15px', color: newName.trim() ? '#0D0F0F' : 'rgba(255,255,255,0.25)', fontSize: '0.9rem', fontWeight: 700, cursor: newName.trim() ? 'pointer' : 'default', transition: 'all 0.15s ease' }}>
              {creating ? 'Creating…' : 'Create Gallery & Add Photos →'}
            </button>
          </div>
        </div>
      )}

      <StudioNav />
    </div>
  )
}
