'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, Search, Plus, Phone, Mail, MessageSquare, Download, X, Trash2, Send } from 'lucide-react'

type Contact = {
  id: string
  name: string
  email: string | null
  phone: string | null
  notes: string | null
  source: string
  created_at: string
}

export default function StudioContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [active, setActive] = useState<Contact | null>(null)
  const [importing, setImporting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  function load() {
    setLoading(true)
    fetch('/api/studio/contacts')
      .then(r => r.ok ? r.json() : [])
      .then(d => { setContacts(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    )
  }, [contacts, query])

  async function handleImport() {
    setImporting(true)
    const res = await fetch('/api/studio/contacts/import', { method: 'POST' })
    setImporting(false)
    if (res.ok) {
      const data = await res.json()
      showToast(data.added > 0 ? `Added ${data.added} contact${data.added === 1 ? '' : 's'} from your estimates.` : 'Nothing new to import — already up to date.')
      load()
    }
  }

  async function handleAdd() {
    if (!form.name.trim()) return
    setSaving(true)
    const res = await fetch('/api/studio/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      setShowAdd(false)
      setForm({ name: '', email: '', phone: '', notes: '' })
      load()
    }
  }

  async function handleDelete(id: string) {
    setConfirmDeleteId(null)
    setActive(null)
    setContacts(prev => prev.filter(c => c.id !== id))
    await fetch(`/api/studio/contacts/${id}`, { method: 'DELETE' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '60px' }}>

      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 24px) 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <Link href="/studio/leads" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', display: 'flex', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              <ChevronLeft size={18} />
            </Link>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.22em', color: '#5BBFBF', textTransform: 'uppercase', margin: '0 0 2px' }}>Blue Luna Studio</p>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', margin: 0 }}>Contacts</h1>
            </div>
          </div>

          <Link href="/studio/templates" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(91,191,191,0.1)', border: '1px solid rgba(91,191,191,0.3)', borderRadius: '10px', padding: '11px', color: '#5BBFBF', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', marginBottom: '10px' }}>
            <Send size={14} /> Email Templates &amp; Campaigns
          </Link>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <button onClick={handleImport} disabled={importing}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
              <Download size={14} /> {importing ? 'Importing…' : 'Import from Estimates'}
            </button>
            <button onClick={() => setShowAdd(true)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#5BBFBF', border: 'none', borderRadius: '10px', padding: '11px 16px', color: '#0D0F0F', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
              <Plus size={14} /> Add
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={15} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              placeholder="Search name, email, phone…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px 11px 38px', color: 'white', fontSize: '0.85rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px 20px 0' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '60px 0', fontSize: '0.9rem' }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', padding: '60px 0', fontSize: '0.88rem' }}>
            {contacts.length === 0 ? 'No contacts yet — import from your estimates or add one.' : 'No matches.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(c => (
              <button key={c.id} onClick={() => setActive(c)}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '13px 16px', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(91,191,191,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#5BBFBF', fontSize: '0.78rem', fontWeight: 700 }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.86rem', fontWeight: 600, color: 'white', margin: '0 0 2px' }}>{c.name}</p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {[c.email, c.phone].filter(Boolean).join(' · ') || 'No contact info'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add sheet */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} onClick={() => setShowAdd(false)} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#161616', borderRadius: '24px 24px 0 0', padding: '20px 20px calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: '0 0 20px' }}>Add Contact</p>
            {[
              { key: 'name', label: 'Name', placeholder: 'Maria Hernandez' },
              { key: 'email', label: 'Email', placeholder: 'maria@email.com' },
              { key: 'phone', label: 'Phone', placeholder: '(520) 555-0100' },
              { key: 'notes', label: 'Notes', placeholder: 'Repeat client, prefers pastel colors…' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                <input
                  placeholder={f.placeholder}
                  value={(form as Record<string, string>)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 14px', color: 'white', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '15px 0', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAdd} disabled={!form.name.trim() || saving} style={{ flex: 1, padding: '15px 0', borderRadius: '12px', border: 'none', background: '#5BBFBF', color: '#0D0F0F', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', opacity: !form.name.trim() || saving ? 0.5 : 1 }}>
                {saving ? 'Saving…' : 'Add Contact'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail sheet */}
      {active && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} onClick={() => setActive(null)} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#161616', borderRadius: '24px 24px 0 0', padding: '20px 20px calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>{active.name}</p>
              <button onClick={() => setActive(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex' }}>
                <X size={16} color="rgba(255,255,255,0.5)" />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {active.phone && (
                <a href={`tel:${active.phone}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(91,191,191,0.1)', border: '1px solid rgba(91,191,191,0.3)', borderRadius: '12px', padding: '13px', color: '#5BBFBF', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                  <Phone size={15} /> Call
                </a>
              )}
              {active.phone && (
                <a href={`sms:${active.phone}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '13px', color: 'white', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                  <MessageSquare size={15} /> Text
                </a>
              )}
              {active.email && (
                <a href={`mailto:${active.email}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '13px', color: 'white', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                  <Mail size={15} /> Email
                </a>
              )}
            </div>

            {active.notes && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Notes</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: 0 }}>{active.notes}</p>
              </div>
            )}

            <button onClick={() => setConfirmDeleteId(active.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: '12px', padding: '14px', color: '#EF4444', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              <Trash2 size={15} /> Remove Contact
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDeleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 70 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} onClick={() => setConfirmDeleteId(null)} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#161616', borderRadius: '24px 24px 0 0', padding: '28px 24px calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 24px' }}>Remove this contact?</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setConfirmDeleteId(null)} style={{ flex: 1, padding: '15px 0', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDeleteId)} style={{ flex: 1, padding: '15px 0', borderRadius: '12px', border: 'none', background: '#EF4444', color: 'white', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', top: '72px', left: '50%', transform: 'translateX(-50%)', zIndex: 80, maxWidth: '340px', width: 'calc(100% - 40px)' }}>
          <div style={{ background: '#1F1F1F', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5BBFBF', flexShrink: 0 }} />
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.4 }}>{toast}</p>
          </div>
        </div>
      )}
    </div>
  )
}
