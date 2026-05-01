'use client'

import { useReducer, useState } from 'react'
import { Check, ArrowRight, ArrowLeft, Phone, Mail, Calendar, MapPin, User, Sparkles } from 'lucide-react'
import {
  CONFIGURATOR_EVENT_TYPES,
  ADD_ONS,
  getPackagesForEvent,
  type EventTypeId,
  type Package,
  type AddOn,
} from '@/lib/config'
import { computeTotal, formatPrice } from '@/lib/pricing'
import { submitLead } from '@/lib/actions'

// ─── State Machine ─────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4

type ConfigState = {
  step: Step
  eventTypeId: EventTypeId | null
  packageId: string | null
  addOnIds: string[]
}

type ConfigAction =
  | { type: 'SELECT_EVENT'; id: EventTypeId }
  | { type: 'SELECT_PACKAGE'; id: string }
  | { type: 'TOGGLE_ADDON'; id: string }
  | { type: 'NEXT' }
  | { type: 'BACK' }

function reducer(state: ConfigState, action: ConfigAction): ConfigState {
  switch (action.type) {
    case 'SELECT_EVENT':
      return { ...state, eventTypeId: action.id, packageId: null, addOnIds: [] }
    case 'SELECT_PACKAGE':
      return { ...state, packageId: action.id }
    case 'TOGGLE_ADDON':
      return {
        ...state,
        addOnIds: state.addOnIds.includes(action.id)
          ? state.addOnIds.filter(id => id !== action.id)
          : [...state.addOnIds, action.id],
      }
    case 'NEXT':
      return { ...state, step: Math.min(4, state.step + 1) as Step }
    case 'BACK':
      return { ...state, step: Math.max(1, state.step - 1) as Step }
    default:
      return state
  }
}

const initialState: ConfigState = { step: 1, eventTypeId: null, packageId: null, addOnIds: [] }

// ─── Sub-components ─────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  const steps = ['Event', 'Package', 'Add-Ons', 'Details']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '40px' }}>
      {steps.map((label, i) => {
        const n = (i + 1) as Step
        const active = step === n
        const done = step > n
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: done ? '#5BBFBF' : active ? '#0D0F0F' : '#F3F4F6',
                border: active ? '2px solid #0D0F0F' : done ? '2px solid #5BBFBF' : '2px solid #E5E7EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                {done
                  ? <Check size={14} color="white" />
                  : <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: active ? 'white' : '#9CA3AF' }}>{n}</span>
                }
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: active ? 600 : 400, color: active ? '#0D0F0F' : '#9CA3AF', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < 3 && (
              <div style={{ flex: 1, height: '2px', background: done ? '#5BBFBF' : '#E5E7EB', margin: '0 4px', marginBottom: '22px', transition: 'background 0.3s' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function PriceSummary({ packageId, addOnIds }: { packageId: string | null; addOnIds: string[] }) {
  if (!packageId) return null
  const result = computeTotal(packageId, addOnIds)
  return (
    <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#6B7280' }}>Running total</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#0D0F0F', letterSpacing: '-0.02em' }}>{formatPrice(result.total)}</span>
      </div>
      {result.isConsultation && (
        <div style={{ background: 'rgba(91,191,191,0.1)', border: '1px solid rgba(91,191,191,0.3)', borderRadius: '10px', padding: '10px 14px', marginTop: '10px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 500, color: '#5BBFBF', lineHeight: 1.5 }}>
            <Sparkles size={12} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
            Custom event — Monica will reach out personally within 2 hours to finalize your pricing.
          </p>
        </div>
      )}
      {!result.isConsultation && (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '6px' }}>
          50% deposit to book · Balance due 1 week before event
        </p>
      )}
    </div>
  )
}

// ─── Step 1: Event Type ─────────────────────────────────────────────────────────

function Step1({ state, dispatch }: { state: ConfigState; dispatch: React.Dispatch<ConfigAction> }) {
  function select(id: EventTypeId) {
    dispatch({ type: 'SELECT_EVENT', id })
    dispatch({ type: 'NEXT' })
  }

  return (
    <div>
      <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 300, color: '#0D0F0F', marginBottom: '8px' }}>
        What are we <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>celebrating?</em>
      </h2>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 300, color: '#6B7280', marginBottom: '32px' }}>Choose your event type to see tailored packages and pricing.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,160px),1fr))', gap: '12px' }}>
        {CONFIGURATOR_EVENT_TYPES.map(et => (
          <button
            key={et.id}
            onClick={() => select(et.id)}
            style={{
              background: state.eventTypeId === et.id ? '#0D0F0F' : 'white',
              border: state.eventTypeId === et.id ? '2px solid #0D0F0F' : '1.5px solid #E5E7EB',
              borderRadius: '16px',
              padding: '20px 16px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: '1.8rem', marginBottom: '10px' }}>{et.emoji}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: state.eventTypeId === et.id ? 'white' : '#0D0F0F', marginBottom: '4px' }}>{et.label}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 300, color: state.eventTypeId === et.id ? 'rgba(255,255,255,0.65)' : '#9CA3AF', lineHeight: 1.4 }}>{et.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Step 2: Base Package ───────────────────────────────────────────────────────

function Step2({ state, dispatch }: { state: ConfigState; dispatch: React.Dispatch<ConfigAction> }) {
  const packages = getPackagesForEvent(state.eventTypeId)

  function select(id: string) {
    dispatch({ type: 'SELECT_PACKAGE', id })
    dispatch({ type: 'NEXT' })
  }

  return (
    <div>
      <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 300, color: '#0D0F0F', marginBottom: '8px' }}>
        Choose your <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>base package</em>
      </h2>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 300, color: '#6B7280', marginBottom: '32px' }}>You can add more in the next step. Select what fits your vision.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {packages.map(pkg => {
          const selected = state.packageId === pkg.id
          const accentColor = pkg.color === 'teal' ? '#5BBFBF' : pkg.color === 'gold' ? '#C9A96E' : pkg.color === 'rose' ? '#F9A8D4' : '#E5E7EB'
          return (
            <button
              key={pkg.id}
              onClick={() => select(pkg.id)}
              style={{
                background: selected ? '#0D0F0F' : 'white',
                border: selected ? `2px solid #0D0F0F` : `1.5px solid #E5E7EB`,
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                position: 'relative',
              }}
            >
              {pkg.badge && (
                <div style={{ position: 'absolute', top: '-1px', right: '16px', background: accentColor, color: '#0D0F0F', fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '0 0 8px 8px' }}>
                  {pkg.badge}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: 600, color: selected ? 'rgba(255,255,255,0.4)' : '#9CA3AF', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '3px' }}>{pkg.tier}</p>
                  <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 700, color: selected ? 'white' : '#0D0F0F', marginBottom: '4px' }}>{pkg.name}</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 300, color: selected ? 'rgba(255,255,255,0.55)' : '#6B7280', lineHeight: 1.4 }}>{pkg.tagline}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: selected ? 'white' : '#0D0F0F', lineHeight: 1, letterSpacing: '-0.02em' }}>{formatPrice(pkg.price)}</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: selected ? 'rgba(255,255,255,0.4)' : '#9CA3AF', marginTop: '2px' }}>{pkg.priceNote}</div>
                </div>
              </div>
              <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {pkg.features.map(f => (
                  <span key={f} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 400, color: selected ? 'rgba(255,255,255,0.65)' : '#6B7280', background: selected ? 'rgba(255,255,255,0.08)' : '#F9FAFB', border: selected ? '1px solid rgba(255,255,255,0.12)' : '1px solid #F3F4F6', borderRadius: '6px', padding: '3px 8px' }}>{f}</span>
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 3: Add-Ons ────────────────────────────────────────────────────────────

function Step3({ state, dispatch }: { state: ConfigState; dispatch: React.Dispatch<ConfigAction> }) {
  const availableAddOns: AddOn[] = ADD_ONS.filter(
    a => a.eventTypes === 'all' || (Array.isArray(a.eventTypes) && state.eventTypeId && a.eventTypes.includes(state.eventTypeId))
  )

  const result = state.packageId ? computeTotal(state.packageId, state.addOnIds) : null

  // Upgrade nudge: show if not already in consultation territory
  const selectedPkg = state.packageId ? getPackagesForEvent(state.eventTypeId).find(p => p.id === state.packageId) : null
  const allPkgs = getPackagesForEvent(state.eventTypeId)
  const selectedIdx = selectedPkg ? allPkgs.indexOf(selectedPkg) : -1
  const nextPkg: Package | undefined = selectedIdx >= 0 ? allPkgs[selectedIdx + 1] : undefined
  const upgradeGap = nextPkg && selectedPkg ? nextPkg.price - selectedPkg.price - (state.addOnIds.reduce((s, id) => s + (ADD_ONS.find(a => a.id === id)?.price ?? 0), 0)) : null

  return (
    <div>
      <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 300, color: '#0D0F0F', marginBottom: '8px' }}>
        Personalize your <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>setup</em>
      </h2>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 300, color: '#6B7280', marginBottom: '24px' }}>Optional add-ons. Select as many as you like — or skip to the next step.</p>

      {result && <PriceSummary packageId={state.packageId} addOnIds={state.addOnIds} />}

      {/* Upgrade nudge */}
      {nextPkg && upgradeGap !== null && upgradeGap > 0 && (
        <div style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.25)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 500, color: '#7A5C2A', lineHeight: 1.5 }}>
            Add <strong>{formatPrice(upgradeGap)}</strong> more in add-ons to reach the <strong>{nextPkg.name}</strong> package level — or upgrade directly and get more included.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {availableAddOns.map(addOn => {
          const checked = state.addOnIds.includes(addOn.id)
          return (
            <button
              key={addOn.id}
              onClick={() => dispatch({ type: 'TOGGLE_ADDON', id: addOn.id })}
              style={{
                background: checked ? 'rgba(91,191,191,0.06)' : 'white',
                border: checked ? '1.5px solid #5BBFBF' : '1.5px solid #E5E7EB',
                borderRadius: '14px',
                padding: '16px 18px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: checked ? '#5BBFBF' : 'white', border: checked ? '2px solid #5BBFBF' : '2px solid #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', transition: 'all 0.15s' }}>
                {checked && <Check size={13} color="white" strokeWidth={2.5} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: '#0D0F0F' }}>{addOn.label}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: checked ? '#5BBFBF' : '#0D0F0F', flexShrink: 0 }}>+{formatPrice(addOn.price)}</span>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 300, color: '#6B7280', marginTop: '3px', lineHeight: 1.4 }}>{addOn.description}</p>
                {addOn.socialProof && (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', fontWeight: 500, color: '#5BBFBF', marginTop: '5px' }}>✓ {addOn.socialProof}</p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 4: Details + Submit ───────────────────────────────────────────────────

function Step4({ state }: { state: ConfigState }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', event_date: '', venue: '' })

  const result = state.packageId ? computeTotal(state.packageId, state.addOnIds) : null
  const selectedPkg = state.packageId ? getPackagesForEvent(state.eventTypeId).find(p => p.id === state.packageId) : null
  const selectedAddOns = ADD_ONS.filter(a => state.addOnIds.includes(a.id))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!result || !selectedPkg) return
    const cleanName = form.name.trim()
    const cleanPhone = form.phone.trim()
    const cleanEmail = form.email.trim()
    if (!cleanName || !cleanPhone || !cleanEmail) return
    setLoading(true)
    setSubmitError(false)
    const response = await submitLead({
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      event_date: form.event_date,
      venue: form.venue,
      event_type: state.eventTypeId ?? 'unknown',
      vision: selectedAddOns.length > 0
        ? `Package: ${selectedPkg.name}. Add-ons: ${selectedAddOns.map(a => a.label).join(', ')}`
        : `Package: ${selectedPkg.name}`,
      package_id: selectedPkg.id,
      package_name: selectedPkg.name,
      add_ons: JSON.stringify(state.addOnIds),
      quoted_total: result.total,
      is_consultation: result.isConsultation,
      deposit_amount: result.deposit,
      deposit_paid: false,
      source: 'configurator',
    })
    setLoading(false)
    if (response.success) setDone(true)
    else setSubmitError(true)
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(91,191,191,0.12)', border: '2px solid #5BBFBF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Check size={32} color="#5BBFBF" />
        </div>
        <h2 className="font-display" style={{ fontSize: '2.2rem', fontWeight: 300, color: '#0D0F0F', marginBottom: '12px' }}>You&apos;re on our list! 🌙</h2>
        {result?.isConsultation ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 300, color: '#6B7280', lineHeight: 1.7, maxWidth: '400px', margin: '0 auto' }}>
            This is a custom event — Monica will reach out personally within 2 hours to walk through your vision and finalize pricing.
          </p>
        ) : (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 300, color: '#6B7280', lineHeight: 1.7, maxWidth: '400px', margin: '0 auto' }}>
            Monica will text you within 2 hours to confirm your date and send your deposit link ({result && formatPrice(result.deposit)} to secure your spot).
          </p>
        )}
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 300, color: '#0D0F0F', marginBottom: '8px' }}>
        Almost there — <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>tell us about you</em>
      </h2>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 300, color: '#6B7280', marginBottom: '28px' }}>Takes 30 seconds. Monica reviews every request personally.</p>

      {/* Order summary */}
      {result && selectedPkg && (
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px', marginBottom: '28px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '12px' }}>Your Selection</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#374151' }}>{selectedPkg.name} Package</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#0D0F0F' }}>{formatPrice(selectedPkg.price)}</span>
          </div>
          {selectedAddOns.map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#6B7280' }}>{a.label}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#6B7280' }}>+{formatPrice(a.price)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #E5E7EB', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#0D0F0F' }}>Total</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: '#0D0F0F', letterSpacing: '-0.02em' }}>{formatPrice(result.total)}</span>
          </div>
          {result.isConsultation ? (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#5BBFBF', marginTop: '8px' }}>Custom event — Monica will finalize pricing with you directly.</p>
          ) : (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '8px' }}>Deposit: {formatPrice(result.deposit)} · Balance due 1 week before event</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label className="input-label"><User size={11} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />Your Name</label>
          <input className="input-field" placeholder="Maria Hernandez" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </div>
        <div>
          <label className="input-label"><Phone size={11} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />Phone Number</label>
          <input className="input-field" type="tel" placeholder="(520) 555-0100" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        </div>
        <div>
          <label className="input-label"><Mail size={11} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />Email Address</label>
          <input className="input-field" type="email" placeholder="maria@email.com" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div>
          <label className="input-label"><Calendar size={11} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />Event Date <span style={{ color: '#9CA3AF' }}>(optional)</span></label>
          <input className="input-field" type="date" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} />
        </div>
        <div>
          <label className="input-label"><MapPin size={11} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />Venue or Location <span style={{ color: '#9CA3AF' }}>(optional)</span></label>
          <input className="input-field" placeholder="Loews Ventana Canyon, backyard, etc." value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '17px', background: loading ? '#9CA3AF' : '#5BBFBF', color: '#0D0F0F', border: 'none', borderRadius: '14px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: loading ? 'none' : '0 4px 20px rgba(91,191,191,0.4)', marginTop: '4px', transition: 'all 0.2s' }}
        >
          {loading ? 'Sending...' : result?.isConsultation
            ? <><span>Request My Custom Quote</span><ArrowRight size={16} /></>
            : <><span>Submit & Reserve My Date</span><ArrowRight size={16} /></>
          }
        </button>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#9CA3AF', textAlign: 'center', lineHeight: 1.5 }}>
          No charge now — Monica confirms your date and sends a deposit link.
        </p>
        {submitError && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#EF4444', textAlign: 'center', lineHeight: 1.5 }}>
            Something went wrong — please try again or call/text Monica directly at (520) 222-6142.
          </p>
        )}
      </form>
    </div>
  )
}

// ─── Main Configurator ──────────────────────────────────────────────────────────

export default function PackageConfigurator() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const canAdvance =
    (state.step === 1 && state.eventTypeId !== null) ||
    (state.step === 2 && state.packageId !== null) ||
    state.step === 3

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px' }}>
      <StepIndicator step={state.step} />

      <div style={{ minHeight: '400px' }}>
        {state.step === 1 && <Step1 state={state} dispatch={dispatch} />}
        {state.step === 2 && <Step2 state={state} dispatch={dispatch} />}
        {state.step === 3 && <Step3 state={state} dispatch={dispatch} />}
        {state.step === 4 && <Step4 state={state} />}
      </div>

      {/* Nav buttons — not shown on step 1 (auto-advances) or step 4 (has its own submit) */}
      {state.step !== 1 && state.step !== 4 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', gap: '12px' }}>
          <button
            onClick={() => dispatch({ type: 'BACK' })}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1.5px solid #E5E7EB', borderRadius: '12px', padding: '13px 20px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 500, color: '#6B7280' }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <button
            onClick={() => dispatch({ type: 'NEXT' })}
            disabled={!canAdvance}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: canAdvance ? '#5BBFBF' : '#F3F4F6', border: 'none', borderRadius: '12px', padding: '13px 24px', cursor: canAdvance ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: canAdvance ? '#0D0F0F' : '#9CA3AF', transition: 'all 0.15s' }}
          >
            {state.step === 3 ? 'Continue to Details' : 'Next'} <ArrowRight size={14} />
          </button>
        </div>
      )}

      {state.step === 4 && (
        <button
          onClick={() => dispatch({ type: 'BACK' })}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', padding: '12px 0', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 400, color: '#9CA3AF', marginTop: '12px' }}
        >
          <ArrowLeft size={13} /> Edit my selection
        </button>
      )}
    </div>
  )
}
