'use client'

import { useReducer, useState } from 'react'
import { Check, ArrowRight, ArrowLeft, Phone, Mail, Calendar, MapPin, User, Sparkles, Plus, Minus } from 'lucide-react'
import {
  CONFIGURATOR_EVENT_TYPES,
  ADD_ONS,
  getPackagesForEvent,
  type EventTypeId,
  type AddOn,
} from '@/lib/config'
import {
  computeTotal,
  computeCustomTotal,
  emptyCustomBuild,
  formatPrice,
  GARLAND_RATES,
  BACKDROP_PRICES,
  COLUMN_PRICES,
  MARQUEE_PRICES,
  CENTERPIECE_PRICES,
  DELIVERY_PRICES,
  type CustomBuild,
} from '@/lib/pricing'
import { submitLead } from '@/lib/actions'

// ─── State Machine ─────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4
type StartMode = 'package' | 'custom'

type ConfigState = {
  step: Step
  eventTypeId: EventTypeId | null
  startMode: StartMode | null
  packageId: string | null
  addOnIds: string[]
  customBuild: CustomBuild
  customRequest: string
}

type ConfigAction =
  | { type: 'SELECT_EVENT'; id: EventTypeId }
  | { type: 'SET_MODE'; mode: StartMode }
  | { type: 'SELECT_PACKAGE'; id: string }
  | { type: 'TOGGLE_ADDON'; id: string }
  | { type: 'UPDATE_BUILD'; patch: Partial<CustomBuild> }
  | { type: 'SET_CUSTOM_REQUEST'; text: string }
  | { type: 'NEXT' }
  | { type: 'BACK' }

const initialState: ConfigState = {
  step: 1,
  eventTypeId: null,
  startMode: null,
  packageId: null,
  addOnIds: [],
  customBuild: emptyCustomBuild,
  customRequest: '',
}

function reducer(state: ConfigState, action: ConfigAction): ConfigState {
  switch (action.type) {
    case 'SELECT_EVENT':
      return { ...initialState, step: 1, eventTypeId: action.id }
    case 'SET_MODE':
      return { ...state, startMode: action.mode, packageId: null, addOnIds: [], customBuild: emptyCustomBuild, step: 3 }
    case 'SELECT_PACKAGE':
      return { ...state, packageId: action.id }
    case 'TOGGLE_ADDON':
      return {
        ...state,
        addOnIds: state.addOnIds.includes(action.id)
          ? state.addOnIds.filter(id => id !== action.id)
          : [...state.addOnIds, action.id],
      }
    case 'UPDATE_BUILD':
      return { ...state, customBuild: { ...state.customBuild, ...action.patch } }
    case 'SET_CUSTOM_REQUEST':
      return { ...state, customRequest: action.text }
    case 'NEXT':
      return { ...state, step: Math.min(4, state.step + 1) as Step }
    case 'BACK':
      if (state.step === 3) return { ...state, step: 2 }
      return { ...state, step: Math.max(1, state.step - 1) as Step }
    default:
      return state
  }
}

// ─── Shared styles ─────────────────────────────────────────────────────────────

const TEAL = '#5BBFBF'
const DARK = '#0D0F0F'
const MUTED = '#6B7280'
const BORDER = '#E5E7EB'
const WARM = '#F9FAFB'

function pill(active: boolean, color: string = TEAL) {
  return {
    background: active ? color : 'white',
    color: active ? (color === DARK ? 'white' : DARK) : MUTED,
    border: active ? `1.5px solid ${color}` : `1.5px solid ${BORDER}`,
    borderRadius: '999px',
    padding: '7px 16px',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.82rem',
    fontWeight: active ? 700 : 400,
    transition: 'all 0.15s',
  } as React.CSSProperties
}

function qtyBtn(onClick: () => void, icon: React.ReactNode) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${BORDER}`, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
    >
      {icon}
    </button>
  )
}

// ─── Running Total Bar ─────────────────────────────────────────────────────────

function RunningTotal({ total, isConsultation }: { total: number; isConsultation: boolean }) {
  if (total === 0) return null
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: `1px solid ${BORDER}`, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: MUTED }}>
        {isConsultation ? 'Custom quote — Monica will finalize' : 'Running total'}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isConsultation && <Sparkles size={14} color={TEAL} />}
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: DARK, letterSpacing: '-0.02em' }}>
          {isConsultation ? 'Custom' : formatPrice(total)}
        </span>
      </div>
    </div>
  )
}

// ─── Step Indicator ────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  const steps = ['Event', 'Starting Point', 'Customize', 'Details']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
      {steps.map((label, i) => {
        const n = (i + 1) as Step
        const active = step === n
        const done = step > n
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? TEAL : active ? DARK : '#F3F4F6', border: `2px solid ${done ? TEAL : active ? DARK : BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                {done
                  ? <Check size={14} color="white" />
                  : <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: active ? 'white' : '#9CA3AF' }}>{n}</span>
                }
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: active ? 600 : 400, color: active ? DARK : '#9CA3AF', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < 3 && <div style={{ flex: 1, height: 2, background: done ? TEAL : BORDER, margin: '0 4px', marginBottom: 22, transition: 'background 0.3s' }} />}
          </div>
        )
      })}
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
      <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 300, color: DARK, marginBottom: 8 }}>
        What are we <em style={{ fontStyle: 'italic', color: TEAL }}>celebrating?</em>
      </h2>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 300, color: MUTED, marginBottom: 32 }}>
        Choose your event type and we&apos;ll show you the best options.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,160px),1fr))', gap: 12 }}>
        {CONFIGURATOR_EVENT_TYPES.map(et => (
          <button
            key={et.id}
            onClick={() => select(et.id)}
            style={{ background: 'white', border: `1.5px solid ${BORDER}`, borderRadius: 16, padding: '20px 16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = TEAL; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 3px rgba(91,191,191,0.12)` }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none' }}
          >
            <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>{et.emoji}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: DARK, marginBottom: 4 }}>{et.label}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 300, color: '#9CA3AF', lineHeight: 1.4 }}>{et.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Step 2: Starting Point ─────────────────────────────────────────────────────

function Step2({ state, dispatch }: { state: ConfigState; dispatch: React.Dispatch<ConfigAction> }) {
  const packages = getPackagesForEvent(state.eventTypeId)

  function selectPackage(id: string) {
    dispatch({ type: 'SELECT_PACKAGE', id })
    dispatch({ type: 'SET_MODE', mode: 'package' })
  }

  function selectCustom() {
    dispatch({ type: 'SET_MODE', mode: 'custom' })
  }

  return (
    <div>
      <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 300, color: DARK, marginBottom: 8 }}>
        Pick a <em style={{ fontStyle: 'italic', color: TEAL }}>starting point</em>
      </h2>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 300, color: MUTED, marginBottom: 32 }}>
        Choose a package to start, then make it yours — or build completely from scratch.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {packages.map(pkg => {
          const accentColor = pkg.color === 'teal' ? TEAL : pkg.color === 'gold' ? '#C9A96E' : pkg.color === 'rose' ? '#F9A8D4' : BORDER
          return (
            <button
              key={pkg.id}
              onClick={() => selectPackage(pkg.id)}
              style={{ background: 'white', border: `1.5px solid ${BORDER}`, borderRadius: 16, padding: 20, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', position: 'relative' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = accentColor; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 3px ${accentColor}20` }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none' }}
            >
              {pkg.badge && (
                <div style={{ position: 'absolute', top: -1, right: 16, background: accentColor, color: DARK, fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '0 0 8px 8px' }}>
                  {pkg.badge}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 3 }}>{pkg.tier}</p>
                  <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 700, color: DARK, marginBottom: 4 }}>{pkg.name}</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 300, color: MUTED, lineHeight: 1.4 }}>{pkg.tagline}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: DARK, lineHeight: 1, letterSpacing: '-0.02em' }}>{formatPrice(pkg.price)}</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: '#9CA3AF', marginTop: 2 }}>{pkg.priceNote}</div>
                </div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {pkg.features.map(f => (
                  <span key={f} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: MUTED, background: WARM, border: `1px solid #F3F4F6`, borderRadius: 6, padding: '3px 8px' }}>{f}</span>
                ))}
              </div>
            </button>
          )
        })}

        {/* Build My Own */}
        <button
          onClick={selectCustom}
          style={{ background: 'white', border: `1.5px dashed ${BORDER}`, borderRadius: 16, padding: '20px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = DARK; (e.currentTarget as HTMLButtonElement).style.background = WARM }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER; (e.currentTarget as HTMLButtonElement).style.background = 'white' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 700, color: DARK, marginBottom: 4 }}>Build My Own</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 300, color: MUTED, lineHeight: 1.4 }}>
                Choose exactly what you want — garlands, backdrops, columns, letters, and more. Price updates live.
              </p>
            </div>
            <ArrowRight size={18} color={MUTED} style={{ flexShrink: 0, marginLeft: 12 }} />
          </div>
        </button>
      </div>
    </div>
  )
}

// ─── Step 3A: Package Path — Add-Ons ───────────────────────────────────────────

function Step3Package({ state, dispatch }: { state: ConfigState; dispatch: React.Dispatch<ConfigAction> }) {
  const pkg = getPackagesForEvent(state.eventTypeId).find(p => p.id === state.packageId)
  const result = state.packageId ? computeTotal(state.packageId, state.addOnIds) : null
  const availableAddOns: AddOn[] = ADD_ONS.filter(
    a => a.eventTypes === 'all' || (Array.isArray(a.eventTypes) && state.eventTypeId && a.eventTypes.includes(state.eventTypeId))
  )

  return (
    <div>
      <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 300, color: DARK, marginBottom: 8 }}>
        Make it <em style={{ fontStyle: 'italic', color: TEAL }}>yours</em>
      </h2>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 300, color: MUTED, marginBottom: 24 }}>
        Starting with the <strong>{pkg?.name}</strong> package. Add anything you&apos;d like on top.
      </p>

      {/* Package base */}
      <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: DARK }}>{pkg?.name} Package</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: DARK }}>{pkg ? formatPrice(pkg.price) : ''}</span>
        </div>
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {pkg?.features.map(f => (
            <span key={f} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: MUTED, background: 'white', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '2px 7px' }}>{f}</span>
          ))}
        </div>
      </div>

      {/* Running total */}
      {result && (
        <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: MUTED }}>Running total</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: DARK, letterSpacing: '-0.02em' }}>{formatPrice(result.total)}</span>
        </div>
      )}

      {/* Add-ons */}
      {availableAddOns.length > 0 && (
        <>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Add-Ons</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {availableAddOns.map(addOn => {
              const checked = state.addOnIds.includes(addOn.id)
              return (
                <button
                  key={addOn.id}
                  onClick={() => dispatch({ type: 'TOGGLE_ADDON', id: addOn.id })}
                  style={{ background: checked ? 'rgba(91,191,191,0.06)' : 'white', border: checked ? `1.5px solid ${TEAL}` : `1.5px solid ${BORDER}`, borderRadius: 14, padding: '16px 18px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'all 0.15s' }}
                >
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: checked ? TEAL : 'white', border: checked ? `2px solid ${TEAL}` : `2px solid #D1D5DB`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 0.15s' }}>
                    {checked && <Check size={13} color="white" strokeWidth={2.5} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: DARK }}>{addOn.label}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: checked ? TEAL : DARK, flexShrink: 0 }}>+{formatPrice(addOn.price)}</span>
                    </div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 300, color: MUTED, marginTop: 3, lineHeight: 1.4 }}>{addOn.description}</p>
                    {addOn.socialProof && (
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', fontWeight: 500, color: TEAL, marginTop: 5 }}>✓ {addOn.socialProof}</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* Custom request */}
      <CustomRequestField state={state} dispatch={dispatch} />
    </div>
  )
}

// ─── Step 3B: Custom Path — Component Builder ──────────────────────────────────

function Step3Custom({ state, dispatch }: { state: ConfigState; dispatch: React.Dispatch<ConfigAction> }) {
  const b = state.customBuild
  const total = computeCustomTotal(b)
  const isConsultation = total >= 1200

  function patch(p: Partial<CustomBuild>) {
    dispatch({ type: 'UPDATE_BUILD', patch: p })
  }

  const sectionHead = (label: string) => (
    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '28px 0 12px' }}>
      {label}
    </p>
  )

  const linePrice = (n: number) => n > 0
    ? <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: TEAL, marginLeft: 'auto', flexShrink: 0 }}>{formatPrice(n)}</span>
    : null

  return (
    <div>
      <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 300, color: DARK, marginBottom: 8 }}>
        Build your <em style={{ fontStyle: 'italic', color: TEAL }}>setup</em>
      </h2>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 300, color: MUTED, marginBottom: 4 }}>
        Pick exactly what you want. Price updates as you go.
      </p>

      {/* Running total */}
      <div style={{ background: total > 0 ? WARM : 'white', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 20px', margin: '16px 0 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: MUTED }}>Running total</span>
          {isConsultation && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: TEAL, margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><Sparkles size={10} />Monica will finalize pricing with you</p>}
        </div>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: DARK, letterSpacing: '-0.02em' }}>
          {total > 0 ? (isConsultation ? 'Custom' : formatPrice(total)) : '—'}
        </span>
      </div>

      {/* ── Garland ── */}
      {sectionHead('🎈 Balloon Garland')}
      <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: MUTED, marginBottom: 12 }}>Choose a style — price is per foot</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {(['basic', 'full', 'luxury'] as const).map(tier => (
            <button key={tier} type="button" onClick={() => patch({ garlandTier: b.garlandTier === tier ? null : tier })} style={pill(b.garlandTier === tier)}>
              {tier === 'basic' ? `Basic — $${GARLAND_RATES.basic}/ft` : tier === 'full' ? `Full — $${GARLAND_RATES.full}/ft` : `Luxury — $${GARLAND_RATES.luxury}/ft`}
            </button>
          ))}
        </div>
        {b.garlandTier && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {qtyBtn(() => patch({ garlandFt: Math.max(1, b.garlandFt - 1) }), <Minus size={12} />)}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: DARK }}>{b.garlandFt} ft</span>
            </div>
            {qtyBtn(() => patch({ garlandFt: b.garlandFt + 1 }), <Plus size={12} />)}
            {linePrice(GARLAND_RATES[b.garlandTier] * b.garlandFt)}
          </div>
        )}
      </div>

      {/* ── Backdrop ── */}
      {sectionHead('🖼️ Backdrop')}
      <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { id: 'shimmer' as const, label: 'Shimmer Backdrop + Frame', desc: 'White, silver, or gold shimmer wall — every photo looks incredible', price: BACKDROP_PRICES.shimmer },
            { id: 'hoop' as const, label: 'Hoop Frame', desc: 'Circular frame — you provide draping or florals', price: BACKDROP_PRICES.hoop },
            { id: 'rect' as const, label: 'Rectangle Frame', desc: 'Clean rectangle — you provide draping', price: BACKDROP_PRICES.rect },
          ].map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => patch({ backdrop: b.backdrop === opt.id ? null : opt.id })}
              style={{ background: b.backdrop === opt.id ? 'rgba(91,191,191,0.06)' : 'white', border: b.backdrop === opt.id ? `1.5px solid ${TEAL}` : `1.5px solid ${BORDER}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s' }}
            >
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: b.backdrop === opt.id ? TEAL : 'white', border: b.backdrop === opt.id ? `2px solid ${TEAL}` : `2px solid #D1D5DB`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {b.backdrop === opt.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: DARK }}>{opt.label}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: MUTED, marginTop: 2 }}>{opt.desc}</div>
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: b.backdrop === opt.id ? TEAL : MUTED, flexShrink: 0 }}>{formatPrice(opt.price)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Columns ── */}
      {sectionHead('🏛️ Balloon Columns')}
      <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: MUTED, marginBottom: 12 }}>Choose a height</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {(['6ft', '7ft', '8ft'] as const).map(size => (
            <button key={size} type="button" onClick={() => patch({ columnSize: b.columnSize === size ? null : size })} style={pill(b.columnSize === size)}>
              {size} — {formatPrice(COLUMN_PRICES[size])} each
            </button>
          ))}
        </div>
        {b.columnSize && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              {qtyBtn(() => patch({ columnQty: Math.max(1, b.columnQty - 1) }), <Minus size={12} />)}
              <div style={{ flex: 1, textAlign: 'center' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: DARK }}>{b.columnQty} {b.columnQty === 1 ? 'column' : 'columns'}</span>
              </div>
              {qtyBtn(() => patch({ columnQty: b.columnQty + 1 }), <Plus size={12} />)}
              {linePrice(COLUMN_PRICES[b.columnSize] * b.columnQty)}
            </div>
            <button
              type="button"
              onClick={() => patch({ columnToppers: !b.columnToppers })}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
            >
              <div style={{ width: 20, height: 20, borderRadius: 4, background: b.columnToppers ? TEAL : 'white', border: b.columnToppers ? `2px solid ${TEAL}` : `2px solid #D1D5DB`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {b.columnToppers && <Check size={11} color="white" strokeWidth={2.5} />}
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: DARK }}>Add custom toppers <span style={{ color: MUTED }}>— $25 per column</span></span>
            </button>
          </>
        )}
      </div>

      {/* ── Marquee ── */}
      {sectionHead('✨ Marquee Letters & Numbers')}
      <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {(['large', 'small'] as const).map(size => (
            <button key={size} type="button" onClick={() => patch({ marqueeSize: b.marqueeSize === size ? null : size })} style={pill(b.marqueeSize === size)}>
              {size === 'large' ? `Large — ${formatPrice(MARQUEE_PRICES.large)} each` : `Small — ${formatPrice(MARQUEE_PRICES.small)} each`}
            </button>
          ))}
        </div>
        {b.marqueeSize && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {qtyBtn(() => patch({ marqueeQty: Math.max(1, b.marqueeQty - 1) }), <Minus size={12} />)}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: DARK }}>{b.marqueeQty} {b.marqueeQty === 1 ? 'letter' : 'letters'}</span>
            </div>
            {qtyBtn(() => patch({ marqueeQty: b.marqueeQty + 1 }), <Plus size={12} />)}
            {linePrice(MARQUEE_PRICES[b.marqueeSize] * b.marqueeQty)}
          </div>
        )}
      </div>

      {/* ── Centerpieces ── */}
      {sectionHead('🌸 Centerpieces')}
      <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {(['basic', 'premium'] as const).map(type => (
            <button key={type} type="button" onClick={() => patch({ centerpieceType: b.centerpieceType === type ? null : type })} style={pill(b.centerpieceType === type)}>
              {type === 'basic' ? `Basic — ${formatPrice(CENTERPIECE_PRICES.basic)} each` : `Premium — ${formatPrice(CENTERPIECE_PRICES.premium)} each`}
            </button>
          ))}
        </div>
        {b.centerpieceType && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {qtyBtn(() => patch({ centerpieceQty: Math.max(1, b.centerpieceQty - 1) }), <Minus size={12} />)}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: DARK }}>{b.centerpieceQty} {b.centerpieceQty === 1 ? 'centerpiece' : 'centerpieces'}</span>
            </div>
            {qtyBtn(() => patch({ centerpieceQty: b.centerpieceQty + 1 }), <Plus size={12} />)}
            {linePrice(CENTERPIECE_PRICES[b.centerpieceType] * b.centerpieceQty)}
          </div>
        )}
      </div>

      {/* ── Specialty ── */}
      {sectionHead('🎁 Extras')}
      <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { field: 'bouquetSmall' as const, label: 'Balloon Bouquet (5–7 balloons)', price: 35 },
          { field: 'bouquetLarge' as const, label: 'Balloon Bouquet (10–12 balloons)', price: 50 },
        ].map(item => (
          <button
            key={item.field}
            type="button"
            onClick={() => patch({ [item.field]: !b[item.field] })}
            style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{ width: 22, height: 22, borderRadius: 6, background: b[item.field] ? TEAL : 'white', border: b[item.field] ? `2px solid ${TEAL}` : `2px solid #D1D5DB`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {b[item.field] && <Check size={13} color="white" strokeWidth={2.5} />}
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: DARK, flex: 1, textAlign: 'left' }}>{item.label}</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: b[item.field] ? TEAL : MUTED }}>{formatPrice(item.price)}</span>
          </button>
        ))}
      </div>

      {/* ── Delivery ── */}
      {sectionHead('🚐 Delivery & Setup')}
      <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { id: 'standard' as const, label: 'Standard Delivery & Setup', desc: 'We deliver and set up. You handle takedown.', price: DELIVERY_PRICES.standard },
            { id: 'premium' as const, label: 'Premium — includes same-day takedown', desc: 'Delivery, setup, AND we remove everything that night. Zero cleanup.', price: DELIVERY_PRICES.premium },
            { id: 'setup_only' as const, label: 'Setup Only / Client Pickup', desc: 'You pick up and we help set up on site.', price: DELIVERY_PRICES.setup_only },
          ].map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => patch({ delivery: opt.id })}
              style={{ background: b.delivery === opt.id ? 'rgba(91,191,191,0.06)' : 'white', border: b.delivery === opt.id ? `1.5px solid ${TEAL}` : `1.5px solid ${BORDER}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s' }}
            >
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: b.delivery === opt.id ? TEAL : 'white', border: b.delivery === opt.id ? `2px solid ${TEAL}` : `2px solid #D1D5DB`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {b.delivery === opt.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: DARK }}>{opt.label}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: MUTED, marginTop: 2 }}>{opt.desc}</div>
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: b.delivery === opt.id ? TEAL : MUTED, flexShrink: 0 }}>{formatPrice(opt.price)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom request */}
      <div style={{ marginTop: 28 }}>
        <CustomRequestField state={state} dispatch={dispatch} />
      </div>
    </div>
  )
}

// ─── Custom Request Field (shared) ─────────────────────────────────────────────

function CustomRequestField({ state, dispatch }: { state: ConfigState; dispatch: React.Dispatch<ConfigAction> }) {
  return (
    <div style={{ background: WARM, border: `1.5px dashed ${BORDER}`, borderRadius: 14, padding: '18px 20px' }}>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: DARK, marginBottom: 4 }}>
        Have something custom in mind?
      </p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: MUTED, marginBottom: 12, lineHeight: 1.5 }}>
        Describe it — painted wood signs, character cutouts, themed backdrops, anything unique. Monica will price it and add it to your quote.
      </p>
      <textarea
        value={state.customRequest}
        onChange={e => dispatch({ type: 'SET_CUSTOM_REQUEST', text: e.target.value })}
        placeholder="e.g. Winnie the Pooh honeycomb wood cutout, round top foam board backdrop with custom text..."
        rows={3}
        style={{ width: '100%', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: DARK, border: `1.5px solid ${BORDER}`, borderRadius: 10, padding: '12px 14px', resize: 'vertical', outline: 'none', background: 'white', boxSizing: 'border-box', lineHeight: 1.5 }}
      />
    </div>
  )
}

// ─── Step 4: Details + Submit ───────────────────────────────────────────────────

function Step4({ state }: { state: ConfigState }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', event_date: '', venue: '' })

  const isPackage = state.startMode === 'package'
  const pkg = isPackage ? getPackagesForEvent(state.eventTypeId).find(p => p.id === state.packageId) : null
  const packageResult = isPackage && state.packageId ? computeTotal(state.packageId, state.addOnIds) : null
  const customTotal = !isPackage ? computeCustomTotal(state.customBuild) : 0
  const total = isPackage ? (packageResult?.total ?? 0) : customTotal
  const isConsultation = total >= 1200 || (isPackage && (packageResult?.isConsultation ?? false))
  const deposit = isConsultation ? 0 : Math.round(total * 0.5)

  const selectedAddOns = ADD_ONS.filter(a => state.addOnIds.includes(a.id))

  function buildVision(): string {
    const parts: string[] = []
    if (isPackage && pkg) {
      parts.push(`Package: ${pkg.name}`)
      if (selectedAddOns.length) parts.push(`Add-ons: ${selectedAddOns.map(a => a.label).join(', ')}`)
    } else {
      const b = state.customBuild
      if (b.garlandTier && b.garlandFt > 0) parts.push(`${b.garlandFt}ft ${b.garlandTier} garland`)
      if (b.backdrop) parts.push(`${b.backdrop} backdrop`)
      if (b.columnSize && b.columnQty) parts.push(`${b.columnQty}x ${b.columnSize} columns${b.columnToppers ? ' with toppers' : ''}`)
      if (b.marqueeSize && b.marqueeQty) parts.push(`${b.marqueeQty}x ${b.marqueeSize} marquee letters`)
      if (b.centerpieceType && b.centerpieceQty) parts.push(`${b.centerpieceQty}x ${b.centerpieceType} centerpieces`)
      if (b.bouquetSmall) parts.push('small bouquet')
      if (b.bouquetLarge) parts.push('large bouquet')
      if (b.delivery) parts.push(`delivery: ${b.delivery}`)
    }
    if (state.customRequest) parts.push(`Custom request: ${state.customRequest}`)
    return parts.join(' | ')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
      vision: buildVision(),
      package_id: pkg?.id ?? (state.startMode === 'custom' ? 'custom' : undefined),
      package_name: pkg?.name ?? (state.startMode === 'custom' ? 'Custom Build' : undefined),
      add_ons: isPackage ? JSON.stringify(state.addOnIds) : JSON.stringify(Object.entries(state.customBuild).filter(([, v]) => v).map(([k]) => k)),
      quoted_total: total,
      is_consultation: isConsultation,
      deposit_amount: deposit,
      deposit_paid: false,
      source: 'configurator',
      custom_build: !isPackage ? (state.customBuild as Record<string, unknown>) : undefined,
      custom_request: state.customRequest || undefined,
    })

    if (!response.success) {
      setLoading(false)
      setSubmitError(true)
      return
    }

    if (isConsultation) {
      setLoading(false)
      setDone(true)
      return
    }

    // Non-consultation: redirect to Stripe Checkout for deposit
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: response.leadId,
          deposit,
          name: cleanName,
          email: cleanEmail,
          packageName: pkg?.name ?? 'Custom Build',
          eventType: state.eventTypeId ?? 'event',
        }),
      })
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setLoading(false)
      setSubmitError(true)
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(91,191,191,0.12)', border: `2px solid ${TEAL}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Check size={32} color={TEAL} />
        </div>
        <h2 className="font-display" style={{ fontSize: '2.2rem', fontWeight: 300, color: DARK, marginBottom: 12 }}>You&apos;re on the list! 🌙</h2>
        {isConsultation ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 300, color: MUTED, lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
            This is a custom event — Monica will reach out personally within 2 hours to walk through your vision and finalize pricing.
          </p>
        ) : (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 300, color: MUTED, lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
            Monica will text you within 2 hours to confirm your date and send your deposit link ({formatPrice(deposit)} to secure your spot).
          </p>
        )}
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 300, color: DARK, marginBottom: 8 }}>
        Almost there — <em style={{ fontStyle: 'italic', color: TEAL }}>tell us about you</em>
      </h2>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 300, color: MUTED, marginBottom: 28 }}>
        Takes 30 seconds. Monica reviews every request personally.
      </p>

      {/* Order summary */}
      <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, marginBottom: 28 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 12 }}>Your Selection</p>
        {isPackage && pkg && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#374151' }}>{pkg.name} Package</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: DARK }}>{formatPrice(pkg.price)}</span>
            </div>
            {selectedAddOns.map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: MUTED }}>{a.label}</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: MUTED }}>+{formatPrice(a.price)}</span>
              </div>
            ))}
          </>
        )}
        {!isPackage && (() => {
          const b = state.customBuild
          const lines: { label: string; price: number }[] = []
          if (b.garlandTier && b.garlandFt > 0) lines.push({ label: `${b.garlandFt}ft ${b.garlandTier} garland`, price: GARLAND_RATES[b.garlandTier] * b.garlandFt })
          if (b.backdrop) lines.push({ label: `${b.backdrop === 'shimmer' ? 'Shimmer Backdrop' : b.backdrop === 'hoop' ? 'Hoop Frame' : 'Rectangle Frame'}`, price: BACKDROP_PRICES[b.backdrop] })
          if (b.columnSize && b.columnQty) {
            lines.push({ label: `${b.columnQty}x ${b.columnSize} columns`, price: COLUMN_PRICES[b.columnSize] * b.columnQty })
            if (b.columnToppers) lines.push({ label: 'Column toppers', price: 25 * b.columnQty })
          }
          if (b.marqueeSize && b.marqueeQty) lines.push({ label: `${b.marqueeQty}x ${b.marqueeSize} marquee letters`, price: MARQUEE_PRICES[b.marqueeSize] * b.marqueeQty })
          if (b.centerpieceType && b.centerpieceQty) lines.push({ label: `${b.centerpieceQty}x ${b.centerpieceType} centerpieces`, price: CENTERPIECE_PRICES[b.centerpieceType] * b.centerpieceQty })
          if (b.bouquetSmall) lines.push({ label: 'Small balloon bouquet', price: 35 })
          if (b.bouquetLarge) lines.push({ label: 'Large balloon bouquet', price: 50 })
          if (b.delivery) lines.push({ label: b.delivery === 'standard' ? 'Standard delivery & setup' : b.delivery === 'premium' ? 'Premium service + takedown' : 'Setup only', price: DELIVERY_PRICES[b.delivery] })
          return lines.map(l => (
            <div key={l.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#374151' }}>{l.label}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: DARK }}>{formatPrice(l.price)}</span>
            </div>
          ))
        })()}
        {state.customRequest && (
          <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(91,191,191,0.08)', borderRadius: 8 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: TEAL, fontWeight: 500 }}>Custom: </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: MUTED }}>{state.customRequest}</span>
          </div>
        )}
        <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: DARK }}>Total</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: DARK, letterSpacing: '-0.02em' }}>
            {isConsultation ? 'Custom quote' : formatPrice(total)}
          </span>
        </div>
        {isConsultation
          ? <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: TEAL, marginTop: 6 }}>Monica will finalize pricing with you directly.</p>
          : <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#9CA3AF', marginTop: 6 }}>Deposit: {formatPrice(deposit)} · Balance due 1 week before event</p>
        }
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { icon: <User size={11} />, label: 'Your Name', key: 'name', type: 'text', placeholder: 'Maria Hernandez', required: true },
          { icon: <Phone size={11} />, label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '(520) 555-0100', required: true },
          { icon: <Mail size={11} />, label: 'Email Address', key: 'email', type: 'email', placeholder: 'maria@email.com', required: true },
          { icon: <Calendar size={11} />, label: 'Event Date', key: 'event_date', type: 'date', placeholder: '', required: false, optional: true },
          { icon: <MapPin size={11} />, label: 'Venue or Location', key: 'venue', type: 'text', placeholder: 'Loews Ventana Canyon, backyard, etc.', required: false, optional: true },
        ].map(f => (
          <div key={f.key}>
            <label className="input-label">
              <span style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }}>{f.icon}</span>
              {f.label}
              {f.optional && <span style={{ color: '#9CA3AF' }}> (optional)</span>}
            </label>
            <input
              className="input-field"
              type={f.type}
              placeholder={f.placeholder}
              required={f.required}
              value={form[f.key as keyof typeof form]}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 17, background: loading ? '#9CA3AF' : TEAL, color: DARK, border: 'none', borderRadius: 14, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: loading ? 'none' : '0 4px 20px rgba(91,191,191,0.4)', marginTop: 4, transition: 'all 0.2s' }}
        >
          {loading ? 'Sending...' : isConsultation
            ? <><span>Request My Custom Quote</span><ArrowRight size={16} /></>
            : <><span>Submit & Reserve My Date</span><ArrowRight size={16} /></>
          }
        </button>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#9CA3AF', textAlign: 'center', lineHeight: 1.5 }}>
          No charge now — Monica confirms your date and sends a deposit link.
        </p>
        {submitError && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#EF4444', textAlign: 'center' }}>
            Something went wrong — please try again or call Monica at (520) 222-6142.
          </p>
        )}
      </form>
    </div>
  )
}

// ─── Main Export ────────────────────────────────────────────────────────────────

export default function PackageConfigurator() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const customTotal = state.startMode === 'custom' ? computeCustomTotal(state.customBuild) : 0
  const packageResult = state.startMode === 'package' && state.packageId ? computeTotal(state.packageId, state.addOnIds) : null
  const total = packageResult?.total ?? customTotal
  const isConsultation = total >= 1200 || (packageResult?.isConsultation ?? false)

  const canAdvance =
    (state.step === 2 && state.packageId !== null) ||
    state.step === 3

  const showNavButtons = state.step === 2 || state.step === 3

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px' }}>
      <StepIndicator step={state.step} />

      {state.step === 3 && total > 0 && <RunningTotal total={total} isConsultation={isConsultation} />}

      <div style={{ minHeight: 400 }}>
        {state.step === 1 && <Step1 state={state} dispatch={dispatch} />}
        {state.step === 2 && <Step2 state={state} dispatch={dispatch} />}
        {state.step === 3 && state.startMode === 'package' && <Step3Package state={state} dispatch={dispatch} />}
        {state.step === 3 && state.startMode === 'custom' && <Step3Custom state={state} dispatch={dispatch} />}
        {state.step === 4 && <Step4 state={state} />}
      </div>

      {showNavButtons && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, gap: 12 }}>
          <button
            onClick={() => dispatch({ type: 'BACK' })}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: `1.5px solid ${BORDER}`, borderRadius: 12, padding: '13px 20px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 500, color: MUTED }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          {state.step === 3 && (
            <button
              onClick={() => dispatch({ type: 'NEXT' })}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: TEAL, border: 'none', borderRadius: 12, padding: '13px 24px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: DARK, transition: 'all 0.15s' }}
            >
              Continue to Details <ArrowRight size={14} />
            </button>
          )}
          {state.step === 2 && state.packageId && (
            <button
              onClick={() => dispatch({ type: 'NEXT' })}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: TEAL, border: 'none', borderRadius: 12, padding: '13px 24px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: DARK }}
            >
              Customize <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}

      {state.step === 4 && (
        <button
          onClick={() => dispatch({ type: 'BACK' })}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', padding: '12px 0', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#9CA3AF', marginTop: 12 }}
        >
          <ArrowLeft size={13} /> Edit my selection
        </button>
      )}
    </div>
  )
}
