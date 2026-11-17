'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Search, Plus, Phone, Mail, MessageSquare, X, Trash2, Send } from 'lucide-react'
import { labelForEventType } from '@/lib/config'
import type { Client } from '@/lib/lifecycleData'

// Clients (Shawn, 2026-11-17): anyone who has paid a deposit becomes a client
// automatically, computed from real payments, no importing. Upcoming first,
// then past clients, then people Monica added by hand.
function shortDate(iso: string | null) {
  if (!iso) return 'No date'
  const d = new Date(iso.slice(0, 10) + 'T00:00:00')
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) })
}
function money(n: number) {
  return `$${n.toLocaleString('en-US', Number.isInteger(n) ? { maximumFractionDigits: 0 } : { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

type Contact = {
  id: string
  name: string
  email: string | null
  phone: string | null
  notes: string | null
  source: string
  created_at: string
}

const sectionLabel: React.CSSProperties = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', margin: '0 0 4px' }
const rowButton: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '14px', width: '100%', background: 'none', border: 'none', padding: '0 20px', cursor: 'pointer', textAlign: 'left' }
const avatar: React.CSSProperties = { width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(91,191,191,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#5BBFBF', fontSize: '0.85rem', fontWeight: 700 }
const rowBody: React.CSSProperties = { flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 0' }
const rowName: React.CSSProperties = { fontSize: '0.98rem', fontWeight: 600, color: 'white', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
const rowMeta: React.CSSProperties = { fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
const actionBtn: React.CSSProperties = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '13px', color: 'white', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }

export default function StudioContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [activeClient, setActiveClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [active, setActive] = useState<Contact | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  function load() {
    setLoading(true)
    Promise.all([
      fetch('/api/studio/contacts').then(r => r.ok ? r.json() : []),
      fetch('/api/studio/clients').then(r => r.ok ? r.json() : []),
    ])
      .then(([c, cl]) => { setContacts(Array.isArray(c) ? c : []); setClients(Array.isArray(cl) ? cl : []) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const matches = (p: { name: string; email: string | null; phone: string | null }) => {
    const q = query.trim().toLowerCase()
    return !q || p.name.toLowerCase().includes(q) || !!p.email?.toLowerCase().includes(q) || !!p.phone?.includes(q)
  }
  const upcoming = useMemo(() => clients.filter(c => c.stage === 'client' && matches(c)), [clients, query]) // eslint-disable-line react-hooks/exhaustive-deps
  const past = useMemo(() => clients.filter(c => c.stage === 'past_client' && matches(c)), [clients, query]) // eslint-disable-line react-hooks/exhaustive-deps
  // Hand-added people who aren't already a paying client (matched by email).
  const filtered = useMemo(() => {
    const clientEmails = new Set(clients.map(c => c.email).filter(Boolean))
    return contacts.filter(c => !(c.email && clientEmails.has(c.email.trim().toLowerCase())) && matches(c))
  }, [contacts, clients, query]) // eslint-disable-line react-hooks/exhaustive-deps

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

      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 24px) 20px 4px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <Link href="/studio/leads" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', display: 'flex', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              <ChevronLeft size={18} />
            </Link>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.22em', color: '#5BBFBF', textTransform: 'uppercase', margin: '0 0 2px' }}>Blue Luna Studio</p>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', margin: 0 }}>Clients</h1>
            </div>
          </div>

          <Link href="/studio/templates" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(91,191,191,0.1)', border: '1px solid rgba(91,191,191,0.3)', borderRadius: '10px', padding: '11px', color: '#5BBFBF', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', marginBottom: '10px' }}>
            <Send size={14} /> Email Templates &amp; Campaigns
          </Link>
          <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.35)', margin: '0 2px 12px', lineHeight: 1.45 }}>
            Anyone who pays a deposit shows up here on their own.
          </p>

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

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '12px 20px 0' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '60px 0', fontSize: '0.9rem' }}>Loading…</p>
        ) : (
          <>
            {[
              { title: 'Upcoming', list: upcoming },
              { title: 'Past Clients', list: past },
            ].map(section => section.list.length > 0 && (
              <div key={section.title} style={{ marginBottom: '22px' }}>
                <p style={sectionLabel}>{section.title} · {section.list.length}</p>
                {/* Full-width rows, iOS Contacts style: the divider starts after
                    the initial (DESIGN_DECISIONS "STUDIO LISTS"). */}
                <div style={{ margin: '0 -20px' }}>
                  {section.list.map((c, i) => {
                    const next = c.events[0]
                    const detail = [labelForEventType(next?.eventType) || 'Event', shortDate(next?.date ?? null), c.events.length > 1 ? `${c.events.length} events` : null].filter(Boolean).join(' · ')
                    return (
                      <button key={c.key} onClick={() => setActiveClient(c)} style={rowButton}>
                        <div style={avatar}>{c.name.charAt(0).toUpperCase()}</div>
                        <div style={{ ...rowBody, borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.07)' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={rowName}>{c.name}</p>
                            <p style={rowMeta}>{detail}</p>
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.55)', flexShrink: 0 }}>{money(c.totalPaid)}</span>
                          <ChevronRight size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <p style={{ ...sectionLabel, margin: 0 }}>Added by you{filtered.length ? ` · ${filtered.length}` : ''}</p>
              <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(91,191,191,0.12)', border: 'none', borderRadius: '99px', padding: '7px 12px', color: '#5BBFBF', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}>
                <Plus size={13} /> Add someone
              </button>
            </div>
            {filtered.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.3)', padding: '12px 0 40px', fontSize: '0.82rem' }}>
                {query ? 'No matches.' : 'Add a person by hand, like a referral or a vendor you work with.'}
              </p>
            ) : (
              <div style={{ margin: '0 -20px' }}>
                {filtered.map((c, i) => (
                  <button key={c.id} onClick={() => setActive(c)} style={rowButton}>
                    <div style={avatar}>{c.name.charAt(0).toUpperCase()}</div>
                    <div style={{ ...rowBody, borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={rowName}>{c.name}</p>
                        <p style={rowMeta}>{[c.email, c.phone].filter(Boolean).join(' · ') || 'No contact info'}</p>
                      </div>
                      <ChevronRight size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
                    </div>
                  </button>
                ))}
              </div>
            )}
            {!query && clients.length === 0 && (
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', padding: '8px 0' }}>No paying clients yet.</p>
            )}
          </>
        )}
      </div>

      {/* Client sheet — a paying client: reach them, see every event they booked. */}
      {activeClient && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} onClick={() => setActiveClient(null)} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#161616', borderRadius: '24px 24px 0 0', padding: '20px 20px calc(env(safe-area-inset-bottom, 0px) + 32px)', maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: '0 0 2px' }}>{activeClient.name}</p>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                  {activeClient.stage === 'client' ? 'Client · event coming up' : 'Past client'} · {money(activeClient.totalPaid)} paid
                </p>
              </div>
              <button onClick={() => setActiveClient(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex' }}>
                <X size={16} color="rgba(255,255,255,0.5)" />
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {activeClient.phone && <a href={`tel:${activeClient.phone}`} style={{ ...actionBtn, background: 'rgba(91,191,191,0.1)', border: '1px solid rgba(91,191,191,0.3)', color: '#5BBFBF' }}><Phone size={15} /> Call</a>}
              {activeClient.phone && <a href={`sms:${activeClient.phone}`} style={actionBtn}><MessageSquare size={15} /> Text</a>}
              {activeClient.email && <a href={`mailto:${activeClient.email}`} style={actionBtn}><Mail size={15} /> Email</a>}
            </div>
            <p style={sectionLabel}>Events</p>
            <div>
              {activeClient.events.map((e, i) => (
                <Link key={e.estimateId} href={`/studio/estimates/${e.estimateId}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.07)', textDecoration: 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'white', margin: '0 0 2px' }}>{labelForEventType(e.eventType) || 'Event'}</p>
                    <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>{shortDate(e.date)} · {money(e.paid)} paid</p>
                  </div>
                  <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add sheet */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} onClick={() => setShowAdd(false)} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#161616', borderRadius: '24px 24px 0 0', padding: '20px 20px calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: '0 0 20px' }}>Add Someone</p>
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
                {saving ? 'Saving…' : 'Add'}
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
