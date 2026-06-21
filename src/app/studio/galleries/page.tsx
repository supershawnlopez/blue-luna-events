'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, Link2, Images, X } from 'lucide-react'

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
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '100px' }}>

      {/* Header */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 28px) 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
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
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px 20px' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {galleries.map(g => (
              <div key={g.id} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>

                {/* Cover thumbnail */}
                <div style={{ width: '72px', height: '72px', flexShrink: 0, background: '#1A1A1A', position: 'relative' }}>
                  {g.cover ? (
                    <img src={g.cover.thumbnail_url || g.cover.url} alt={g.display_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Images size={20} color="rgba(255,255,255,0.15)" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, padding: '12px 14px', minWidth: 0 }}>
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'white', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.display_name}</p>
                  <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    /{g.slug}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                      {g.media_count} photo{g.media_count !== 1 ? 's' : ''}
                    </span>
                    {!g.is_active && (
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '4px', padding: '1px 5px' }}>
                        HIDDEN
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 12px', flexShrink: 0 }}>
                  <button onClick={() => copyLink(g.slug)}
                    style={{ background: copied === g.slug ? 'rgba(91,191,191,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copied === g.slug ? 'rgba(91,191,191,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', padding: '7px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Link2 size={13} color={copied === g.slug ? '#5BBFBF' : 'rgba(255,255,255,0.4)'} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: copied === g.slug ? '#5BBFBF' : 'rgba(255,255,255,0.4)' }}>
                      {copied === g.slug ? 'Copied!' : 'Copy'}
                    </span>
                  </button>
                  <Link href={`/studio/galleries/${g.id}`}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', display: 'flex', textDecoration: 'none' }}>
                    <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
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

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, background: 'rgba(13,15,15,0.97)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 24px env(safe-area-inset-bottom,16px)' }}>
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
