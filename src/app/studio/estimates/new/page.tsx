'use client'

import { useState, useReducer } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ArrowRight, Check, Copy, ExternalLink } from 'lucide-react'
import { PACKAGE_CATALOG, ADD_ONS, CONFIGURATOR_EVENT_TYPES, getPackagesForEvent, type EventTypeId } from '@/lib/config'
import { computeTotal, computeCustomTotal, formatPrice, type CustomBuild, emptyCustomBuild } from '@/lib/pricing'

type Step = 'client' | 'event' | 'package' | 'addons' | 'review'

type ClientInfo = {
  name: string
  email: string
  phone: string
  event_date: string
  venue: string
  notes: string
}

type State = {
  step: Step
  client: ClientInfo
  eventTypeId: EventTypeId | null
  packageId: string | null
  addOnIds: string[]
}

type Action =
  | { type: 'SET_STEP'; step: Step }
  | { type: 'SET_CLIENT'; client: Partial<ClientInfo> }
  | { type: 'SET_EVENT'; eventTypeId: EventTypeId }
  | { type: 'SET_PACKAGE'; packageId: string }
  | { type: 'TOGGLE_ADDON'; addonId: string }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_STEP': return { ...state, step: action.step }
    case 'SET_CLIENT': return { ...state, client: { ...state.client, ...action.client } }
    case 'SET_EVENT': return { ...state, eventTypeId: action.eventTypeId, packageId: null, addOnIds: [] }
    case 'SET_PACKAGE': return { ...state, packageId: action.packageId }
    case 'TOGGLE_ADDON':
      return {
        ...state,
        addOnIds: state.addOnIds.includes(action.addonId)
          ? state.addOnIds.filter(id => id !== action.addonId)
          : [...state.addOnIds, action.addonId],
      }
    default: return state
  }
}

const INITIAL: State = {
  step: 'client',
  client: { name: '', email: '', phone: '', event_date: '', venue: '', notes: '' },
  eventTypeId: null,
  packageId: null,
  addOnIds: [],
}

export default function NewEstimate() {
  const router = useRouter()
  const [state, dispatch] = useReducer(reducer, INITIAL)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<{ id: string; shareToken: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const pkg = state.packageId ? PACKAGE_CATALOG.find(p => p.id === state.packageId) : null
  const pricing = pkg ? computeTotal(state.packageId!, state.addOnIds) : null
  const total = pricing?.total ?? 0
  const deposit = Math.round(total * 0.5)
  const balance = total - deposit
  const packages = getPackagesForEvent(state.eventTypeId)
  const filteredAddOns = ADD_ONS.filter(a =>
    a.eventTypes === 'all' || (state.eventTypeId && a.eventTypes.includes(state.eventTypeId))
  )

  async function handleSave(send: boolean) {
    setSaving(true)
    const body = {
      client_name: state.client.name,
      client_email: state.client.email,
      client_phone: state.client.phone,
      event_type: state.eventTypeId,
      event_date: state.client.event_date,
      venue: state.client.venue,
      package_id: state.packageId,
      package_name: pkg?.name,
      add_ons: JSON.stringify(state.addOnIds),
      quoted_total: total,
      deposit_amount: deposit,
      balance_amount: balance,
      notes: state.client.notes,
      status: send ? 'sent' : 'draft',
    }
    const res = await fetch('/api/studio/estimates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const data = await res.json()
      setSaved({ id: data.id, shareToken: data.share_token })
    }
    setSaving(false)
  }

  function copyLink() {
    if (!saved) return
    const url = `${window.location.origin}/q/${saved.shareToken}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Saved state ───────────────────────────────────────────────────────────────
  if (saved) {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/q/${saved.shareToken}`
    return (
      <div style={{ minHeight: '100vh', background: '#0D0F0F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(91,191,191,0.12)', border: '2px solid #5BBFBF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Check size={28} color="#5BBFBF" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Estimate Created</h2>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>
            Share this link with {state.client.name} so they can view their quote and pay the deposit.
          </p>

          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <p style={{ flex: 1, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', wordBreak: 'break-all', textAlign: 'left', margin: 0 }}>{url}</p>
            <button onClick={copyLink} style={{ background: copied ? '#5BBFBF' : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', flexShrink: 0 }}>
              {copied ? <Check size={16} color="#0D0F0F" /> : <Copy size={16} color="rgba(255,255,255,0.6)" />}
            </button>
          </div>

          <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#5BBFBF', color: '#0D0F0F', borderRadius: '12px', padding: '14px', fontWeight: 700, textDecoration: 'none', marginBottom: '12px' }}>
            Preview Client View <ExternalLink size={15} />
          </a>

          <Link href="/studio/estimates" style={{ display: 'block', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none', marginTop: '8px' }}>
            Back to Estimates
          </Link>
        </div>
      </div>
    )
  }

  // ── Client info step ──────────────────────────────────────────────────────────
  if (state.step === 'client') {
    const { client } = state
    const valid = client.name && client.email
    return (
      <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '40px' }}>
        <div style={{ padding: '56px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/studio/estimates" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', display: 'flex', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              <ChevronLeft size={18} />
            </Link>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Step 1 of 4</p>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'white' }}>Client Info</h1>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '28px 24px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { key: 'name', label: 'Client Name', placeholder: 'Maria Hernandez', required: true, type: 'text' },
              { key: 'email', label: 'Email', placeholder: 'maria@email.com', required: true, type: 'email' },
              { key: 'phone', label: 'Phone', placeholder: '(520) 555-0100', type: 'tel' },
              { key: 'event_date', label: 'Event Date', type: 'date' },
              { key: 'venue', label: 'Venue', placeholder: 'Radisson Hotel, Tucson', type: 'text' },
              { key: 'notes', label: 'Notes (private)', placeholder: 'Colors requested, special setup notes...', type: 'text' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {field.label}{field.required && <span style={{ color: '#5BBFBF' }}> *</span>}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={(client as Record<string, string>)[field.key]}
                  onChange={e => dispatch({ type: 'SET_CLIENT', client: { [field.key]: e.target.value } })}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', padding: '13px 16px', fontSize: '0.95rem', color: 'white', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
            <button
              onClick={() => dispatch({ type: 'SET_STEP', step: 'event' })}
              disabled={!valid}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: valid ? '#5BBFBF' : 'rgba(91,191,191,0.2)', color: valid ? '#0D0F0F' : 'rgba(91,191,191,0.4)',
                border: 'none', borderRadius: '12px', padding: '16px', fontWeight: 700, fontSize: '0.95rem',
                cursor: valid ? 'pointer' : 'not-allowed', marginTop: '8px',
              }}
            >
              Choose Event Type <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Event type step ───────────────────────────────────────────────────────────
  if (state.step === 'event') {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '40px' }}>
        <div style={{ padding: '56px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => dispatch({ type: 'SET_STEP', step: 'client' })} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', display: 'flex', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
              <ChevronLeft size={18} />
            </button>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Step 2 of 4</p>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'white' }}>Event Type</h1>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '28px 24px 0', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
          {CONFIGURATOR_EVENT_TYPES.map(et => (
            <button
              key={et.id}
              onClick={() => {
                dispatch({ type: 'SET_EVENT', eventTypeId: et.id })
                dispatch({ type: 'SET_STEP', step: 'package' })
              }}
              style={{
                background: state.eventTypeId === et.id ? 'rgba(91,191,191,0.15)' : 'rgba(255,255,255,0.04)',
                border: state.eventTypeId === et.id ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px', padding: '18px 16px', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <p style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{et.emoji}</p>
              <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'white', marginBottom: '3px' }}>{et.label}</p>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{et.description}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Package step ──────────────────────────────────────────────────────────────
  if (state.step === 'package') {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '40px' }}>
        <div style={{ padding: '56px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => dispatch({ type: 'SET_STEP', step: 'event' })} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', display: 'flex', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
              <ChevronLeft size={18} />
            </button>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Step 3 of 4</p>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'white' }}>Base Package</h1>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px 24px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {packages.map(p => (
            <button
              key={p.id}
              onClick={() => {
                dispatch({ type: 'SET_PACKAGE', packageId: p.id })
                dispatch({ type: 'SET_STEP', step: 'addons' })
              }}
              style={{
                background: state.packageId === p.id ? 'rgba(91,191,191,0.12)' : 'rgba(255,255,255,0.04)',
                border: state.packageId === p.id ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px', padding: '18px 20px', cursor: 'pointer', textAlign: 'left',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '3px' }}>{p.tier}</p>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'white', marginBottom: '2px' }}>{p.name}</p>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{p.tagline}</p>
              </div>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#5BBFBF', flexShrink: 0, marginLeft: '16px' }}>
                ${p.price.toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Add-ons step ──────────────────────────────────────────────────────────────
  if (state.step === 'addons') {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '120px' }}>
        <div style={{ padding: '56px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => dispatch({ type: 'SET_STEP', step: 'package' })} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', display: 'flex', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
              <ChevronLeft size={18} />
            </button>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Step 4 of 4</p>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'white' }}>Add-Ons</h1>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px 24px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredAddOns.map(a => {
            const selected = state.addOnIds.includes(a.id)
            return (
              <button
                key={a.id}
                onClick={() => dispatch({ type: 'TOGGLE_ADDON', addonId: a.id })}
                style={{
                  background: selected ? 'rgba(91,191,191,0.1)' : 'rgba(255,255,255,0.04)',
                  border: selected ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', padding: '14px 16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left',
                }}
              >
                <div style={{
                  width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                  background: selected ? '#5BBFBF' : 'rgba(255,255,255,0.08)',
                  border: selected ? 'none' : '1.5px solid rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {selected && <Check size={13} color="#0D0F0F" />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'white', marginBottom: '2px' }}>{a.label}</p>
                  <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.4)' }}>{a.description}</p>
                </div>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: selected ? '#5BBFBF' : 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
                  +${a.price}
                </p>
              </button>
            )
          })}
        </div>

        {/* Sticky total + save */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(13,15,15,0.98)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '16px 24px env(safe-area-inset-bottom, 16px)',
        }}>
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Total</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{formatPrice(total)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Deposit (50%)</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#5BBFBF' }}>{formatPrice(deposit)}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                style={{
                  flex: 1, padding: '14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
                }}
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving || total === 0}
                style={{
                  flex: 2, padding: '14px', background: total > 0 ? '#5BBFBF' : 'rgba(91,191,191,0.2)',
                  color: total > 0 ? '#0D0F0F' : 'rgba(91,191,191,0.4)',
                  border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem',
                  cursor: total > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {saving ? 'Saving…' : <><span>Get Share Link</span><ArrowRight size={15} /></>}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
