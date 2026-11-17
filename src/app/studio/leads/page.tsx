'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Phone, Mail, MessageSquare, Flame, Sun, Snowflake, X, FileText, ChevronRight, Users } from 'lucide-react'
import StudioNav from '@/components/studio/StudioNav'
import { labelForEventType, HONOREE_RELATIONS, labelForRelation } from '@/lib/config'
import { LOST_REASONS, lostReasonLabel, STAGE_LABELS, type Stage } from '@/lib/lifecycle'

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
  setup_time: string | null
  guest_count: string | null
  looking_for: string[] | null
  inspo_photos: string[] | null
  // Lifecycle, computed by the API (src/lib/lifecycle.ts)
  stage: Stage
  stage_note: string
  stage_reason: string | null
  lost_reason?: string | null
  lost_note?: string | null
  lost_by?: 'client' | 'monica' | null
  // Who the celebration is for (inquiry form, or Claude's guess from their notes)
  honoree_relation?: string | null
  honoree_name?: string | null
  honoree_milestone?: string | null
  honoree_date?: string | null
  honoree_confirmed?: boolean
}

type HonoreeForm = { relation: string; name: string; milestone: string; date: string }

// What the date means depends on the party.
function honoreeDateLabel(eventType?: string | null) {
  const t = (eventType ?? '').toLowerCase()
  if (t.includes('baby')) return "Baby's due date"
  if (t.includes('wedding') || t.includes('bridal')) return 'Wedding date'
  if (t.includes('birthday') || t.includes('quince')) return 'Their birthday'
  return 'Date to remember'
}

type LeadView = 'active' | 'not_now'
const ACTIVE_STAGES: Stage[] = ['new', 'estimate_sent']
// Same dot language as Schedule/Estimates.
const STAGE_COLORS: Record<Stage, string> = {
  new: '#C9A96E',
  estimate_sent: '#5BBFBF',
  client: '#8DD4D4',
  past_client: '#4ade80',
  not_now: 'rgba(255,255,255,0.4)',
}

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
  return (
    <Suspense fallback={null}>
      <StudioLeadsInner />
    </Suspense>
  )
}

function StudioLeadsInner() {
  const searchParams = useSearchParams()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<LeadView>('active')
  const [pickingReason, setPickingReason] = useState(false)
  const [reasonNote, setReasonNote] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [honoreeEdit, setHonoreeEdit] = useState<HonoreeForm | null>(null)
  const [honoreeSaving, setHonoreeSaving] = useState(false)
  const [activeLead, setActiveLead] = useState<Lead | null>(null)
  const [confirmDeleteLead, setConfirmDeleteLead] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch('/api/studio/leads')
      .then(r => r.ok ? r.json() : [])
      .then(d => {
        const list: Lead[] = Array.isArray(d) ? d : []
        setLeads(list)
        setLoading(false)
        // Deep-link support — a push notification or Home's "Needs Your
        // Attention" row links straight to /studio/leads?open=<id> so
        // tapping it opens that exact customer's card, not just the list.
        const openId = searchParams.get('open')
        if (openId) {
          const match = list.find(l => l.id === openId)
          if (match) setActiveLead(match)
        }
      })
      .catch(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The Leads page only shows people Monica should act on. Clients live on
  // the Clients page; everyone else is under "Not Now" and keeps getting
  // nurture emails — nobody is ever lost (DECISIONS.md "CLIENT LIFECYCLE").
  const activeLeads = useMemo(() => leads.filter(l => ACTIVE_STAGES.includes(l.stage)), [leads])
  const notNowLeads = useMemo(() => leads.filter(l => l.stage === 'not_now'), [leads])
  const filtered = view === 'active' ? activeLeads : notNowLeads

  async function updateLead(id: string, patch: Partial<Pick<Lead, 'temperature'>>) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l))
    setActiveLead(prev => prev && prev.id === id ? { ...prev, ...patch } : prev)
    await fetch(`/api/studio/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
  }

  // Monica records why a lead isn't booking (or clears it: reason = null).
  // The stage is recomputed by the server, so reload from it afterwards.
  async function saveReason(id: string, reason: string | null) {
    setReasonError('')
    const res = await fetch(`/api/studio/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lost_reason: reason, lost_note: reason ? reasonNote.trim() || null : null }),
    })
    if (!res.ok) {
      setReasonError("Couldn't save that. Please try again.")
      return
    }
    const fresh: Lead[] = await fetch('/api/studio/leads').then(r => r.ok ? r.json() : [])
    if (Array.isArray(fresh)) {
      setLeads(fresh)
      setActiveLead(fresh.find(l => l.id === id) ?? null)
    }
    setPickingReason(false)
    setReasonNote('')
  }

  async function saveHonoree(id: string, patch: Record<string, string | null>) {
    setHonoreeSaving(true)
    const res = await fetch(`/api/studio/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    setHonoreeSaving(false)
    if (!res.ok) return
    const saved = await res.json()
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...saved } : l))
    setActiveLead(prev => prev && prev.id === id ? { ...prev, ...saved } : prev)
    setHonoreeEdit(null)
  }

  function closeSheet() {
    setHonoreeEdit(null)
    setActiveLead(null)
    setConfirmDeleteLead(false)
    setPickingReason(false)
    setReasonNote('')
    setReasonError('')
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

      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 24px) 20px 8px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.22em', color: '#5BBFBF', textTransform: 'uppercase', margin: '0 0 4px' }}>Blue Luna Studio</p>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', margin: 0, letterSpacing: '-0.01em' }}>Leads</h1>
          </div>
          <Link href="/studio/contacts" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 13px', color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
            <Users size={14} /> Clients
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '12px 20px 0' }}>

        {/* Active / Not Now — same segmented control as Estimates */}
        <div role="tablist" style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '3px', marginBottom: '8px' }}>
          {([
            { id: 'active', label: 'Active', count: activeLeads.length },
            { id: 'not_now', label: 'Not Now', count: notNowLeads.length },
          ] as const).map(t => {
            const on = view === t.id
            return (
              <button key={t.id} role="tab" aria-selected={on} onClick={() => setView(t.id)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 6px', borderRadius: '9px', border: 'none', cursor: 'pointer', background: on ? 'rgba(255,255,255,0.12)' : 'transparent', color: on ? 'white' : 'rgba(255,255,255,0.5)', fontSize: '0.84rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {t.label}
                <span style={{ minWidth: '20px', padding: '1px 6px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700, background: on ? 'rgba(91,191,191,0.22)' : 'rgba(255,255,255,0.08)', color: on ? '#8DD4D4' : 'rgba(255,255,255,0.45)' }}>{t.count}</span>
              </button>
            )
          })}
        </div>
        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', margin: '0 2px 8px' }}>
          {view === 'active'
            ? 'New inquiries and open estimates. After 21 quiet days they move to Not Now.'
            : 'Not booking right now — they still get the occasional email so they remember Blue Luna.'}
        </p>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '60px 0', fontSize: '0.9rem' }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', padding: '60px 0', fontSize: '0.88rem' }}>{view === 'active' ? "You're all caught up — no open leads." : 'Nobody here yet.'}</p>
        ) : (
          // Full-width rows, no boxes (DESIGN_DECISIONS "STUDIO LISTS", 2026-11-17).
          // No swipe-delete here on purpose: deleting a lead is permanent (no
          // Trash), so it stays behind the confirm inside the lead's sheet.
          <div style={{ margin: '0 -20px' }}>
            {filtered.map((l, i) => {
              const temp = TEMPS.find(t => t.id === l.temperature)
              return (
                <button key={l.id} onClick={() => setActiveLead(l)}
                  style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '0 20px', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.98rem', fontWeight: 600, color: 'white', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</p>
                      <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        {temp && view === 'active' && <temp.icon size={13} color={temp.color} style={{ flexShrink: 0 }} />}
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: STAGE_COLORS[l.stage], flexShrink: 0 }} />
                        <span style={{ color: STAGE_COLORS[l.stage], fontWeight: 600, whiteSpace: 'nowrap' }}>{view === 'active' ? STAGE_LABELS[l.stage] : l.stage_note}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>· {labelForEventType(l.event_type) || 'Event'} · {daysAgo(l.created_at)}</span>
                      </p>
                    </div>
                    <ChevronRight size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Lead detail sheet */}
      {activeLead && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} onClick={closeSheet} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#161616', borderRadius: '24px 24px 0 0', padding: '20px 20px calc(env(safe-area-inset-bottom, 0px) + 32px)', maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: '0 0 2px' }}>{activeLead.name}</p>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{labelForEventType(activeLead.event_type) || 'Event'}{activeLead.event_date ? ` · ${new Date(activeLead.event_date.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}` : ''}</p>
              </div>
              <button onClick={closeSheet} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex' }}>
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

            {/* Event Questionnaire — venue/budget/guests/setup, exactly what Monica already gets in her lead email, now visible in Studio too */}
            {(activeLead.venue || activeLead.budget_range || activeLead.guest_count || activeLead.setup_time) && (
              <div style={{ marginBottom: '20px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                {[
                  ['Venue', activeLead.venue],
                  ['Guests', activeLead.guest_count],
                  ['Budget', activeLead.budget_range],
                  ['Setup Time', activeLead.setup_time],
                ].filter(([, v]) => v).map(([label, value], i) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                    <span style={{ fontSize: '0.8rem', color: 'white', fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeLead.looking_for && activeLead.looking_for.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>What They&apos;re Looking For</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {activeLead.looking_for.map(item => (
                    <span key={item} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '999px', padding: '5px 12px', fontSize: '0.76rem', color: 'rgba(255,255,255,0.7)' }}>{item}</span>
                  ))}
                </div>
              </div>
            )}

            {activeLead.vision && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Vibe, Theme & Colors</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: 0 }}>{activeLead.vision}</p>
              </div>
            )}

            {activeLead.inspo_photos && activeLead.inspo_photos.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Inspiration Photos ({activeLead.inspo_photos.length})</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {activeLead.inspo_photos.map(url => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="Inspiration" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </a>
                  ))}
                </div>
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

            {/* Who it's for — feeds the personal follow-up emails ("Lily's
                17th is coming up"). A guess from their notes shows as such
                until Monica confirms or fixes it. */}
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Who It&apos;s For</p>
            {!honoreeEdit ? (
              <div style={{ marginBottom: '22px' }}>
                {(activeLead.honoree_name || activeLead.honoree_relation || activeLead.honoree_milestone || activeLead.honoree_date) ? (
                  <>
                    {(() => {
                      const who = [activeLead.honoree_name, labelForRelation(activeLead.honoree_relation)?.replace(/^My /, 'their ').replace(/^Me$/, 'themselves')].filter(Boolean).join(' · ')
                      return (
                        <p style={{ fontSize: '0.92rem', color: 'white', fontWeight: 600, margin: '0 0 3px' }}>
                          {who || activeLead.honoree_milestone || 'Someone special'}
                        </p>
                      )
                    })()}
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                      {[(activeLead.honoree_name || activeLead.honoree_relation) ? activeLead.honoree_milestone : null, activeLead.honoree_date ? `${honoreeDateLabel(activeLead.event_type)}: ${new Date(activeLead.honoree_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : null].filter(Boolean).join(' · ')}
                    </p>
                    {!activeLead.honoree_confirmed && (
                      <p style={{ fontSize: '0.74rem', color: '#C9A96E', margin: '6px 0 0' }}>Our guess from what they wrote. Is it right?</p>
                    )}
                  </>
                ) : (
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Not filled in yet.</p>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  {!activeLead.honoree_confirmed && (activeLead.honoree_name || activeLead.honoree_relation || activeLead.honoree_milestone) && (
                    <button onClick={() => saveHonoree(activeLead.id, { honoree_relation: activeLead.honoree_relation ?? null })} disabled={honoreeSaving}
                      style={{ padding: '8px 14px', borderRadius: '999px', border: 'none', background: 'rgba(91,191,191,0.14)', color: '#5BBFBF', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                      Looks right
                    </button>
                  )}
                  <button onClick={() => setHonoreeEdit({ relation: activeLead.honoree_relation ?? '', name: activeLead.honoree_name ?? '', milestone: activeLead.honoree_milestone ?? '', date: activeLead.honoree_date ?? '' })}
                    style={{ padding: '8px 14px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.14)', background: 'transparent', color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                    {activeLead.honoree_name || activeLead.honoree_relation || activeLead.honoree_milestone || activeLead.honoree_date ? 'Edit' : 'Add'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '22px', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {HONOREE_RELATIONS.map(r => {
                    const on = honoreeEdit.relation === r.id
                    return (
                      <button key={r.id} onClick={() => setHonoreeEdit({ ...honoreeEdit, relation: on ? '' : r.id })}
                        style={{ padding: '8px 12px', borderRadius: '999px', border: on ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.14)', background: on ? 'rgba(91,191,191,0.12)' : 'transparent', color: on ? '#5BBFBF' : 'rgba(255,255,255,0.75)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                        {r.label.replace(/^My /, 'Their ').replace(/^Me$/, 'Themselves')}
                      </button>
                    )
                  })}
                </div>
                {([
                  ['name', 'First name (e.g. Lily)', 'text'],
                  ['milestone', 'Milestone (e.g. Turning 16, First baby, 70th anniversary)', 'text'],
                  ['date', honoreeDateLabel(activeLead.event_type), 'date'],
                ] as const).map(([key, label, type]) => (
                  <div key={key} style={{ marginBottom: '10px' }}>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 4px' }}>{label}</p>
                    <input type={type} value={honoreeEdit[key]} onChange={e => setHonoreeEdit({ ...honoreeEdit, [key]: e.target.value })}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 12px', color: 'white', fontSize: '16px', boxSizing: 'border-box', colorScheme: 'dark' }} />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button onClick={() => setHonoreeEdit(null)} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'white', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button disabled={honoreeSaving} onClick={() => saveHonoree(activeLead.id, { honoree_relation: honoreeEdit.relation || null, honoree_name: honoreeEdit.name.trim() || null, honoree_milestone: honoreeEdit.milestone.trim() || null, honoree_date: honoreeEdit.date || null })}
                    style={{ flex: 1, padding: '11px', borderRadius: '10px', border: 'none', background: '#5BBFBF', color: '#0D0F0F', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', opacity: honoreeSaving ? 0.6 : 1 }}>
                    {honoreeSaving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            )}

            {/* Where they stand — computed stage, plus the "why" when they're
                not booking. Monica can record a reason she heard on the phone;
                a reason the client picked on their estimate shows here too. */}
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Where They Stand</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: STAGE_COLORS[activeLead.stage] }} />
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'white' }}>{STAGE_LABELS[activeLead.stage]}</span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>· {activeLead.stage_note}</span>
            </div>
            {activeLead.lost_reason && (
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 6px' }}>
                Reason: <strong style={{ color: 'white' }}>{lostReasonLabel(activeLead.lost_reason)}</strong>
                {activeLead.lost_by === 'client' ? ' (they picked this)' : ' (you added this)'}
                {activeLead.lost_note ? ` — "${activeLead.lost_note}"` : ''}
              </p>
            )}

            {(activeLead.stage === 'new' || activeLead.stage === 'estimate_sent' || activeLead.stage === 'not_now') && !pickingReason && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '8px 0 24px' }}>
                {!activeLead.lost_reason && (
                  <button onClick={() => setPickingReason(true)}
                    style={{ padding: '9px 14px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.14)', background: 'transparent', color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                    {activeLead.stage === 'not_now' ? 'Add why they didn\u2019t book' : 'Not booking? Add a reason'}
                  </button>
                )}
                {activeLead.lost_reason && activeLead.lost_by !== 'client' && (
                  <button onClick={() => saveReason(activeLead.id, null)}
                    style={{ padding: '9px 14px', borderRadius: '999px', border: '1px solid rgba(91,191,191,0.35)', background: 'rgba(91,191,191,0.08)', color: '#5BBFBF', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                    Clear reason
                  </button>
                )}
              </div>
            )}

            {pickingReason && (
              <div style={{ margin: '10px 0 24px', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)' }}>
                <p style={{ fontSize: '0.82rem', color: 'white', fontWeight: 600, margin: '0 0 10px' }}>Why aren&apos;t they booking?</p>
                <input
                  value={reasonNote}
                  onChange={e => setReasonNote(e.target.value)}
                  placeholder="Optional note, e.g. what they said on the phone"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 12px', color: 'white', fontSize: '16px', boxSizing: 'border-box', marginBottom: '10px' }}
                />
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {LOST_REASONS.map(r => (
                    <button key={r.id} onClick={() => saveReason(activeLead.id, r.id)}
                      style={{ padding: '9px 13px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.14)', background: 'transparent', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                      {r.label}
                    </button>
                  ))}
                </div>
                {reasonError && <p style={{ color: '#f87171', fontSize: '0.76rem', margin: '10px 0 0' }}>{reasonError}</p>}
                <button onClick={() => { setPickingReason(false); setReasonNote(''); setReasonError('') }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: '10px 0 0' }}>
                  Cancel
                </button>
              </div>
            )}

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
