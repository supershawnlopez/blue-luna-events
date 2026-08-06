'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Phone, Mail, MessageSquare, Flame, Sun, Snowflake, X, FileText, ChevronRight, BookUser } from 'lucide-react'
import StudioNav from '@/components/studio/StudioNav'

type Lead = {
  id: string
  created_at: string
  name: string
  phone: string
  email: string
  event_type: string | null
  event_date: string | null
  venue: string | null
  vision: string | null
  budget_range: string | null
  status: 'new' | 'contacted' | 'quoted' | 'booked' | 'completed'
  temperature: 'hot' | 'warm' | 'cold' | null
  source: string | null
  referral_source: string | null
}

const STATUSES: { id: Lead['status']; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'quoted', label: 'Quoted' },
  { id: 'booked', label: 'Booked' },
  { id: 'completed', label: 'Completed' },
]

const TEMPS: { id: NonNullable<Lead['temperature']>; label: string; icon: typeof Flame; color: string }[] = [
  { id: 'hot', label: 'Hot', icon: Flame, color: '#EF4444' },
  { id: 'warm', label: 'Warm', icon: Sun, color: '#F59E0B' },
  { id: 'cold', label: 'Cold', icon: Snowflake, color: '#60A5FA' },
]

function daysAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  return d === 0 ? 'today' : d === 1 ? '1 day ago' : `${d} days ago`
}

export default function StudioLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<Lead['status'] | 'all'>('all')
  const [activeLead, setActiveLead] = useState<Lead | null>(null)
  const [confirmDeleteLead, setConfirmDeleteLead] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch('/api/studio/leads')
      .then(r => r.ok ? r.json() : [])
      .then(d => { setLeads(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(
    () => statusFilter === 'all' ? leads : leads.filter(l => l.status === statusFilter),
    [leads, statusFilter]
  )

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length }
    for (const s of STATUSES) c[s.id] = leads.filter(l => l.status === s.id).length
    return c
  }, [leads])

  async function updateLead(id: string, patch: Partial<Pick<Lead, 'status' | 'temperature'>>) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l))
    setActiveLead(prev => prev && prev.id === id ? { ...prev, ...patch } : prev)
    await fetch(`/api/studio/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
  }

  async function deleteLead(id: string) {
    setDeleting(true)
    await fetch(`/api/studio/leads/${id}`, { method: 'DELETE' })
    setLeads(prev => prev.filter(l => l.id !== id))
    setDeleting(false)
    setConfirmDeleteLead(false)
    setActiveLead(null)
  }

  function estimateHref(l: Lead) {
    const params = new URLSearchParams()
    params.set('name', l.name)
    if (l.email) params.set('email', l.email)
    if (l.phone) params.set('phone', l.phone)
    if (l.event_date) params.set('event_date', l.event_date)
    if (l.venue) params.set('venue', l.venue)
    params.set('lead_id', l.id)
    return `/studio/estimates/new?${params.toString()}`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '120px' }}>

      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 24px) 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.22em', color: '#5BBFBF', textTransform: 'uppercase', margin: '0 0 4px' }}>Blue Luna Studio</p>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', margin: 0, letterSpacing: '-0.01em' }}>Leads</h1>
          </div>
          <Link href="/studio/contacts" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 13px', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
            <BookUser size={14} /> Contacts
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 20px 0' }}>

        {/* Status filter pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '16px', scrollbarWidth: 'none' }}>
          {[{ id: 'all' as const, label: 'All' }, ...STATUSES].map(s => (
            <button key={s.id} onClick={() => setStatusFilter(s.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '999px', border: statusFilter === s.id ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.1)', background: statusFilter === s.id ? 'rgba(91,191,191,0.12)' : 'transparent', color: statusFilter === s.id ? '#5BBFBF' : 'rgba(255,255,255,0.4)', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {s.label} ({counts[s.id] ?? 0})
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '60px 0', fontSize: '0.9rem' }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', padding: '60px 0', fontSize: '0.88rem' }}>No leads here yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(l => {
              const temp = TEMPS.find(t => t.id === l.temperature)
              return (
                <button key={l.id} onClick={() => setActiveLead(l)}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: temp ? `${temp.color}1A` : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {temp ? <temp.icon size={16} color={temp.color} /> : <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>?</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'white', margin: '0 0 2px' }}>{l.name}</p>
                    <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                      {l.event_type || 'Event'} · {daysAgo(l.created_at)}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#5BBFBF', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
                    {STATUSES.find(s => s.id === l.status)?.label ?? l.status}
                  </span>
                  <ChevronRight size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Lead detail sheet */}
      {activeLead && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} onClick={() => { setActiveLead(null); setConfirmDeleteLead(false) }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#161616', borderRadius: '24px 24px 0 0', padding: '20px 20px calc(env(safe-area-inset-bottom, 0px) + 32px)', maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: '0 0 2px' }}>{activeLead.name}</p>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{activeLead.event_type || 'Event'}{activeLead.event_date ? ` · ${activeLead.event_date}` : ''}</p>
              </div>
              <button onClick={() => { setActiveLead(null); setConfirmDeleteLead(false) }} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex' }}>
                <X size={16} color="rgba(255,255,255,0.5)" />
              </button>
            </div>

            {/* Quick actions */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <a href={`tel:${activeLead.phone}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(91,191,191,0.1)', border: '1px solid rgba(91,191,191,0.3)', borderRadius: '12px', padding: '13px', color: '#5BBFBF', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                <Phone size={15} /> Call
              </a>
              <a href={`sms:${activeLead.phone}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '13px', color: 'white', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                <MessageSquare size={15} /> Text
              </a>
              <a href={`mailto:${activeLead.email}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '13px', color: 'white', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                <Mail size={15} /> Email
              </a>
            </div>

            {activeLead.vision && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Vision</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: 0 }}>{activeLead.vision}</p>
              </div>
            )}

            {activeLead.referral_source && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Heard About Us Via</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: 0 }}>{activeLead.referral_source}</p>
              </div>
            )}

            {/* Temperature */}
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Temperature</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {TEMPS.map(t => {
                const active = activeLead.temperature === t.id
                return (
                  <button key={t.id} onClick={() => updateLead(activeLead.id, { temperature: t.id })}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '12px 0', borderRadius: '12px', border: active ? `1.5px solid ${t.color}` : '1px solid rgba(255,255,255,0.1)', background: active ? `${t.color}1A` : 'rgba(255,255,255,0.04)', cursor: 'pointer' }}>
                    <t.icon size={16} color={active ? t.color : 'rgba(255,255,255,0.4)'} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: active ? t.color : 'rgba(255,255,255,0.4)' }}>{t.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Status */}
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Status</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {STATUSES.map(s => {
                const active = activeLead.status === s.id
                return (
                  <button key={s.id} onClick={() => updateLead(activeLead.id, { status: s.id })}
                    style={{ padding: '8px 14px', borderRadius: '999px', border: active ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.1)', background: active ? 'rgba(91,191,191,0.12)' : 'transparent', color: active ? '#5BBFBF' : 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                    {s.label}
                  </button>
                )
              })}
            </div>

            <Link href={estimateHref(activeLead)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#5BBFBF', color: '#0D0F0F', borderRadius: '12px', padding: '15px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', marginBottom: '12px' }}>
              <FileText size={16} /> Create Estimate
            </Link>

            {!confirmDeleteLead ? (
              <button onClick={() => setConfirmDeleteLead(true)} style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: '6px' }}>
                Delete Lead
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(239,68,68,0.08)', borderRadius: '10px' }}>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', margin: 0, flex: 1 }}>Delete this lead? This can&apos;t be undone.</p>
                <button onClick={() => setConfirmDeleteLead(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => deleteLead(activeLead.id)} disabled={deleting} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#f87171', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', padding: '6px 10px', borderRadius: '6px' }}>
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <StudioNav />
    </div>
  )
}
