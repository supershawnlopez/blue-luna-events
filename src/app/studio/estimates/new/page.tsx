'use client'

import { useState, useReducer, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ArrowRight, Check, Copy, ExternalLink, Plus, Trash2, Pencil } from 'lucide-react'
import { CONFIGURATOR_EVENT_TYPES, type EventTypeId } from '@/lib/config'
import { formatPrice } from '@/lib/pricing'

type Step = 'client' | 'event' | 'items'

type ClientInfo = {
  name: string
  email: string
  phone: string
  event_date: string
  venue: string
  notes: string
}

type LineItem = { label: string; description?: string; price: number }

type State = {
  step: Step
  client: ClientInfo
  eventTypeId: EventTypeId | null
  items: LineItem[]
}

type Action =
  | { type: 'SET_STEP'; step: Step }
  | { type: 'SET_CLIENT'; client: Partial<ClientInfo> }
  | { type: 'SET_EVENT'; eventTypeId: EventTypeId }
  | { type: 'ADD_ITEM'; item: LineItem }
  | { type: 'UPDATE_ITEM'; index: number; item: LineItem }
  | { type: 'REMOVE_ITEM'; index: number }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_STEP': return { ...state, step: action.step }
    case 'SET_CLIENT': return { ...state, client: { ...state.client, ...action.client } }
    case 'SET_EVENT': return { ...state, eventTypeId: action.eventTypeId, items: [] }
    case 'ADD_ITEM': return { ...state, items: [...state.items, action.item] }
    case 'UPDATE_ITEM': return { ...state, items: state.items.map((it, i) => i === action.index ? action.item : it) }
    case 'REMOVE_ITEM': return { ...state, items: state.items.filter((_, i) => i !== action.index) }
    default: return state
  }
}

const INITIAL: State = {
  step: 'client',
  client: { name: '', email: '', phone: '', event_date: '', venue: '', notes: '' },
  eventTypeId: null,
  items: [],
}

type CatalogItem = {
  id: string
  label: string
  description: string | null
  pricing_type: 'flat' | 'per_unit'
  price: number
  unit: string | null
}

export default function NewEstimate() {
  return (
    <Suspense fallback={null}>
      <NewEstimateInner />
    </Suspense>
  )
}

function NewEstimateInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, dispatch] = useReducer(reducer, INITIAL)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<{ id: string; shareToken: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([])
  const [itemCatalogId, setItemCatalogId] = useState('')
  const [itemLabel, setItemLabel] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [itemQty, setItemQty] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [itemSheetOpen, setItemSheetOpen] = useState(false)

  useEffect(() => {
    fetch('/api/studio/catalog').then(r => r.ok ? r.json() : []).then(d => setCatalogItems(Array.isArray(d) ? d : []))
  }, [])

  // Pre-fill from a lead-email deep link (?name=&email=&phone=&event_date=&venue=)
  useEffect(() => {
    const prefill: Partial<ClientInfo> = {}
    const name = searchParams.get('name')
    const email = searchParams.get('email')
    const phone = searchParams.get('phone')
    const event_date = searchParams.get('event_date')
    const venue = searchParams.get('venue')
    if (name) prefill.name = name
    if (email) prefill.email = email
    if (phone) prefill.phone = phone
    if (event_date) prefill.event_date = event_date
    if (venue) prefill.venue = venue
    if (Object.keys(prefill).length > 0) dispatch({ type: 'SET_CLIENT', client: prefill })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const total = state.items.reduce((sum, it) => sum + (Number(it.price) || 0), 0)
  const deposit = Math.round(total * 0.5)
  const balance = total - deposit
  const selectedCatalogItem = catalogItems.find(c => c.id === itemCatalogId)

  function resetItemForm() {
    setItemCatalogId('')
    setItemLabel('')
    setItemDescription('')
    setItemPrice('')
    setItemQty('')
    setEditingIndex(null)
    setItemSheetOpen(false)
  }

  function openAddItemSheet() {
    resetItemForm()
    setItemSheetOpen(true)
  }

  function selectCatalogItem(catalogId: string) {
    setItemCatalogId(catalogId)
    const item = catalogItems.find(c => c.id === catalogId)
    if (!item) { setItemLabel(''); setItemDescription(''); setItemPrice(''); setItemQty(''); return }
    setItemLabel(item.label)
    setItemDescription(item.description ?? '')
    if (item.pricing_type === 'per_unit') {
      setItemQty('')
      setItemPrice('')
    } else {
      setItemPrice(String(item.price))
    }
  }

  function updateQty(qty: string) {
    setItemQty(qty)
    const item = catalogItems.find(c => c.id === itemCatalogId)
    if (item && item.pricing_type === 'per_unit') {
      const n = parseFloat(qty)
      setItemPrice(n > 0 ? String(Math.round(item.price * n * 100) / 100) : '')
    }
  }

  function saveItem() {
    const price = parseFloat(itemPrice)
    if (!itemLabel.trim() || !price || price <= 0) return
    const item = { label: itemLabel.trim(), description: itemDescription.trim() || undefined, price }
    if (editingIndex !== null) {
      dispatch({ type: 'UPDATE_ITEM', index: editingIndex, item })
    } else {
      dispatch({ type: 'ADD_ITEM', item })
    }
    resetItemForm()
  }

  function editItem(index: number) {
    const it = state.items[index]
    setItemCatalogId('')
    setItemLabel(it.label)
    setItemDescription(it.description ?? '')
    setItemPrice(String(it.price))
    setItemQty('')
    setEditingIndex(index)
    setItemSheetOpen(true)
  }

  function removeItem(index: number) {
    dispatch({ type: 'REMOVE_ITEM', index })
    if (editingIndex === index) resetItemForm()
  }

  async function handleSave(send: boolean) {
    setSaving(true)
    const body = {
      client_name: state.client.name,
      client_email: state.client.email,
      client_phone: state.client.phone,
      event_type: state.eventTypeId,
      event_date: state.client.event_date,
      venue: state.client.venue,
      custom_items: state.items,
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
            Share this link with {state.client.name} so they can view their estimate and pay the deposit.
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
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Step 1 of 3</p>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'white' }}>Client Info</h1>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '28px 24px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { key: 'name', label: 'Client Name', placeholder: 'Type the client\'s full name', required: true, type: 'text' },
              { key: 'email', label: 'Email', placeholder: 'Type their email address', required: true, type: 'email' },
              { key: 'phone', label: 'Phone', placeholder: 'Type their phone number', type: 'tel' },
              { key: 'event_date', label: 'Event Date', type: 'date' },
              { key: 'venue', label: 'Venue', placeholder: 'Type the venue name or address', type: 'text' },
              { key: 'notes', label: 'Notes (private)', placeholder: 'Colors requested, special setup notes...', type: 'text' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {field.label}{field.required && <span style={{ color: '#5BBFBF' }}> *</span>}
                </label>
                <input
                  className="est-client-input"
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
            {/* Placeholder hint text must read as unmistakably "not real data" —
                confirmed with a real live client that realistic-looking example
                text ("Maria Hernandez") got mistaken for an already-filled-in
                template. Inline styles can't target ::placeholder, hence this. */}
            <style>{`
              .est-client-input::placeholder { color: rgba(255,255,255,0.32); font-style: italic; }
            `}</style>
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
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Step 2 of 3</p>
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
                dispatch({ type: 'SET_STEP', step: 'items' })
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

  // ── Items step ────────────────────────────────────────────────────────────────
  if (state.step === 'items') {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '160px' }}>
        <div style={{ padding: '56px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => dispatch({ type: 'SET_STEP', step: 'event' })} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', display: 'flex', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
              <ChevronLeft size={18} />
            </button>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Step 3 of 3</p>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'white' }}>Items</h1>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px 24px 0' }}>
          {state.items.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              {state.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: editingIndex === i ? 'rgba(91,191,191,0.08)' : 'rgba(255,255,255,0.04)', border: editingIndex === i ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px' }}>
                  <button onClick={() => editItem(i)} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', minWidth: 0, marginRight: '10px', flex: 1 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', margin: 0 }}>{it.label}</p>
                    {it.description && <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{it.description}</p>}
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#5BBFBF', margin: 0 }}>${Number(it.price).toLocaleString()}</p>
                    <button onClick={() => editItem(i)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '2px' }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '2px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={openAddItemSheet}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(91,191,191,0.1)', border: '1.5px dashed rgba(91,191,191,0.4)', borderRadius: '10px', padding: '13px', color: '#5BBFBF', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}
          >
            <Plus size={15} /> Add Item
          </button>
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

        {/* Add/Edit Item sheet — anchored to the viewport, same pattern as the
            estimate detail page's item editor, so a long items list can never
            open the form somewhere scrolled out of view. */}
        {itemSheetOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} onClick={resetItemForm} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '85vh', overflowY: 'auto', background: '#161616', borderTop: '2px solid #5BBFBF', boxShadow: '0 -8px 32px rgba(0,0,0,0.5)', borderRadius: '24px 24px 0 0', padding: '20px 20px calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
              <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px', margin: '0 auto 20px' }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 20px' }}>
                {editingIndex !== null ? 'Edit Item' : 'Add Item'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {catalogItems.length > 0 && (
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Pick from Price List (optional)</label>
                    <select
                      value={itemCatalogId}
                      onChange={e => selectCatalogItem(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 14px', fontSize: '16px', color: 'white', boxSizing: 'border-box' }}
                    >
                      <option value="">— Type a custom item instead —</option>
                      {catalogItems.map(c => (
                        <option key={c.id} value={c.id}>{c.label} — ${c.price}{c.pricing_type === 'per_unit' ? `/${c.unit}` : ''}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Item Name</label>
                  <input
                    type="text" placeholder="e.g. Balloon Garland" value={itemLabel}
                    onChange={e => setItemLabel(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 14px', fontSize: '16px', color: 'white', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Description (optional)</label>
                  <input
                    type="text" placeholder="Any detail worth noting" value={itemDescription}
                    onChange={e => setItemDescription(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 14px', fontSize: '16px', color: 'white', boxSizing: 'border-box' }}
                  />
                </div>
                {selectedCatalogItem?.pricing_type === 'per_unit' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                      Quantity ({selectedCatalogItem.unit}) — ${selectedCatalogItem.price}/{selectedCatalogItem.unit}
                    </label>
                    <input
                      type="number" inputMode="decimal" placeholder="e.g. 12" value={itemQty}
                      onChange={e => updateQty(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 14px', fontSize: '16px', color: 'white', boxSizing: 'border-box' }}
                    />
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Price</label>
                  <input
                    type="number" inputMode="decimal" placeholder="$" value={itemPrice}
                    onChange={e => setItemPrice(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 14px', fontSize: '16px', color: 'white', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button onClick={resetItemForm} style={{ flex: 1, padding: '15px 0', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button
                  onClick={saveItem}
                  disabled={!itemLabel.trim() || !itemPrice}
                  style={{
                    flex: 1, padding: '15px 0', borderRadius: '12px', border: 'none',
                    background: (!itemLabel.trim() || !itemPrice) ? 'rgba(91,191,191,0.3)' : '#5BBFBF',
                    color: '#0D0F0F', fontSize: '0.9rem', fontWeight: 700,
                    cursor: (!itemLabel.trim() || !itemPrice) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {editingIndex !== null ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
