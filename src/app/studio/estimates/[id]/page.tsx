'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Copy, Check, ExternalLink, Download, Mail, Plus, Trash2, Tag, Pencil, X } from 'lucide-react'
import StudioNav from '@/components/studio/StudioNav'
import { computeBalance, type EstimatePayment } from '@/lib/estimateBalance'
import { labelForAddOn, labelForEventType, PACKAGE_CATALOG, ADD_ONS, getPackagesForEvent, type EventTypeId } from '@/lib/config'

type Estimate = {
  id: string
  client_name: string
  client_email: string
  client_phone?: string | null
  event_type?: string | null
  event_date?: string | null
  venue?: string | null
  package_id?: string | null
  package_name?: string | null
  add_ons?: string | null
  custom_items?: CustomItem[] | null
  quoted_total: number
  notes?: string | null
  status: string
  share_token: string
  discount_type?: string | null
  discount_value?: number | null
  discount_note?: string | null
}

type CustomItem = { label: string; description?: string; price: number }

const METHODS = [
  { id: 'zelle', label: 'Zelle' },
  { id: 'cash', label: 'Cash' },
  { id: 'check', label: 'Check' },
  { id: 'other', label: 'Other' },
]

function fmt(n: number) {
  return `$${n.toLocaleString()}`
}

function parseAddOns(raw?: string | null): string[] {
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

export default function EstimateDetail() {
  const params = useParams()
  const id = params.id as string
  const [est, setEst] = useState<Estimate | null>(null)
  const [payments, setPayments] = useState<EstimatePayment[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)

  // Discount editor
  const [discountOpen, setDiscountOpen] = useState(false)
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [discountNote, setDiscountNote] = useState('')

  // Add payment
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('zelle')
  const [paymentNote, setPaymentNote] = useState('')

  // Email
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState<string | null>(null)

  // Edit details (client info + event info)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [dName, setDName] = useState('')
  const [dEmail, setDEmail] = useState('')
  const [dPhone, setDPhone] = useState('')
  const [dEventDate, setDEventDate] = useState('')
  const [dVenue, setDVenue] = useState('')
  const [dNotes, setDNotes] = useState('')

  // Edit selection (package + add-ons + custom items)
  const [selectionOpen, setSelectionOpen] = useState(false)
  const [selPackageId, setSelPackageId] = useState<string | null>(null)
  const [selAddOnIds, setSelAddOnIds] = useState<string[]>([])
  const [selCustomItems, setSelCustomItems] = useState<CustomItem[]>([])
  const [newItemLabel, setNewItemLabel] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')

  const load = useCallback(async () => {
    const [estRes, paymentsRes] = await Promise.all([
      fetch(`/api/studio/estimates/${id}`),
      fetch(`/api/studio/estimates/${id}/payments`),
    ])
    if (estRes.ok) {
      const data = await estRes.json()
      setEst(data)
      setDiscountType(data.discount_type === 'flat' ? 'flat' : 'percent')
      setDiscountValue(data.discount_value ? String(data.discount_value) : '')
      setDiscountNote(data.discount_note ?? '')
      setDName(data.client_name ?? '')
      setDEmail(data.client_email ?? '')
      setDPhone(data.client_phone ?? '')
      setDEventDate(data.event_date ?? '')
      setDVenue(data.venue ?? '')
      setDNotes(data.notes ?? '')
      setSelPackageId(data.package_id ?? null)
      setSelAddOnIds(parseAddOns(data.add_ons))
      setSelCustomItems(Array.isArray(data.custom_items) ? data.custom_items : [])
    }
    if (paymentsRes.ok) setPayments(await paymentsRes.json())
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  async function saveDiscount() {
    setSaving(true)
    const value = parseFloat(discountValue)
    await fetch(`/api/studio/estimates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discount_type: value > 0 ? discountType : null,
        discount_value: value > 0 ? value : null,
        discount_note: value > 0 ? discountNote : null,
      }),
    })
    await load()
    setSaving(false)
    setDiscountOpen(false)
  }

  async function clearDiscount() {
    setSaving(true)
    await fetch(`/api/studio/estimates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discount_type: null, discount_value: null, discount_note: null }),
    })
    setDiscountType('percent'); setDiscountValue(''); setDiscountNote('')
    await load()
    setSaving(false)
  }

  async function saveDetails() {
    setSaving(true)
    await fetch(`/api/studio/estimates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: dName,
        client_email: dEmail,
        client_phone: dPhone || null,
        event_date: dEventDate || null,
        venue: dVenue || null,
        notes: dNotes || null,
      }),
    })
    await load()
    setSaving(false)
    setDetailsOpen(false)
  }

  function calcSelectionTotal(): number {
    const pkgPrice = selPackageId ? (PACKAGE_CATALOG.find(p => p.id === selPackageId)?.price ?? 0) : 0
    const addOnsTotal = selAddOnIds.reduce((sum, aid) => sum + (ADD_ONS.find(a => a.id === aid)?.price ?? 0), 0)
    const customTotal = selCustomItems.reduce((sum, it) => sum + (Number(it.price) || 0), 0)
    return pkgPrice + addOnsTotal + customTotal
  }

  async function saveSelection() {
    setSaving(true)
    const pkg = selPackageId ? PACKAGE_CATALOG.find(p => p.id === selPackageId) : null
    const total = calcSelectionTotal()
    await fetch(`/api/studio/estimates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        package_id: selPackageId,
        package_name: pkg?.name ?? null,
        add_ons: JSON.stringify(selAddOnIds),
        custom_items: selCustomItems,
        quoted_total: total,
      }),
    })
    await load()
    setSaving(false)
    setSelectionOpen(false)
  }

  function toggleSelAddOn(addonId: string) {
    setSelAddOnIds(ids => ids.includes(addonId) ? ids.filter(i => i !== addonId) : [...ids, addonId])
  }

  function addCustomItem() {
    const price = parseFloat(newItemPrice)
    if (!newItemLabel.trim() || !price || price <= 0) return
    setSelCustomItems(items => [...items, { label: newItemLabel.trim(), description: newItemDescription.trim() || undefined, price }])
    setNewItemLabel('')
    setNewItemDescription('')
    setNewItemPrice('')
  }

  function removeCustomItem(index: number) {
    setSelCustomItems(items => items.filter((_, i) => i !== index))
  }

  async function addPayment() {
    const amount = parseFloat(paymentAmount)
    if (!amount || amount <= 0) return
    setSaving(true)
    await fetch(`/api/studio/estimates/${id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, method: paymentMethod, note: paymentNote || null }),
    })
    setPaymentAmount(''); setPaymentNote(''); setPaymentOpen(false)
    await load()
    setSaving(false)
  }

  async function deletePayment(paymentId: string) {
    setSaving(true)
    await fetch(`/api/studio/estimates/${id}/payments?paymentId=${paymentId}`, { method: 'DELETE' })
    await load()
    setSaving(false)
  }

  async function sendEmail() {
    setEmailSending(true)
    setEmailSent(null)
    const res = await fetch(`/api/studio/estimates/${id}/email`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    const data = await res.json()
    if (res.ok) setEmailSent(data.sentTo)
    setEmailSending(false)
  }

  function copyLink() {
    if (!est) return
    navigator.clipboard.writeText(`${window.location.origin}/q/${est.share_token}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0F0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Loading…</p>
      </div>
    )
  }

  if (!est) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0F0F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Estimate not found</p>
        <Link href="/studio/estimates" style={{ color: '#5BBFBF', fontSize: '0.85rem' }}>Back to Estimates</Link>
      </div>
    )
  }

  const addOns = parseAddOns(est.add_ons)
  const balance = computeBalance(est, payments)
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/q/${est.share_token}`

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '100px' }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 20px) 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/studio/estimates" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', display: 'flex', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
            <ChevronLeft size={18} />
          </Link>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.15em', color: '#5BBFBF', textTransform: 'uppercase', margin: '0 0 2px' }}>Estimate</p>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', margin: 0 }}>{est.client_name}</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px' }}>

        {/* Share link + actions */}
        <div style={{ background: 'rgba(91,191,191,0.06)', border: '1px solid rgba(91,191,191,0.2)', borderRadius: '14px', padding: '16px 18px', marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#5BBFBF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Client Share Link</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <p style={{ flex: 1, fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', wordBreak: 'break-all', margin: 0 }}>{shareUrl}</p>
            <button onClick={copyLink} style={{ background: copied ? '#5BBFBF' : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', flexShrink: 0 }}>
              {copied ? <Check size={15} color="#0D0F0F" /> : <Copy size={15} color="rgba(255,255,255,0.6)" />}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#5BBFBF', color: '#0D0F0F', borderRadius: '10px', padding: '10px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
              Open <ExternalLink size={13} />
            </a>
            <a href={`/api/studio/estimates/${est.id}/pdf`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', borderRadius: '10px', padding: '10px', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none' }}>
              PDF <Download size={13} />
            </a>
          </div>
          <button
            onClick={sendEmail}
            disabled={emailSending}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)',
              border: 'none', borderRadius: '10px', padding: '10px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
            }}
          >
            <Mail size={13} /> {emailSending ? 'Sending…' : 'Email Estimate to Client'}
          </button>
          {emailSent && (
            <p style={{ fontSize: '0.75rem', color: '#5BBFBF', textAlign: 'center', marginTop: '8px' }}>✓ Sent to {emailSent}</p>
          )}
        </div>

        {/* Event details */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px 18px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Details</p>
            {!detailsOpen && (
              <button onClick={() => setDetailsOpen(true)} style={{ background: 'none', border: 'none', color: '#5BBFBF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700 }}>
                <Pencil size={12} /> Edit
              </button>
            )}
          </div>

          {!detailsOpen && [
            ['Email', est.client_email], ['Phone', est.client_phone], ['Event', labelForEventType(est.event_type)],
            ['Date', est.event_date], ['Venue', est.venue], ['Notes', est.notes],
          ].filter(([, v]) => v).map(([label, value], i) => (
            <div key={i} style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ width: '90px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', flexShrink: 0, margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'white', margin: 0 }}>{value}</p>
            </div>
          ))}

          {detailsOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              {[
                { label: 'Client Name', value: dName, set: setDName, type: 'text' },
                { label: 'Email', value: dEmail, set: setDEmail, type: 'email' },
                { label: 'Phone', value: dPhone, set: setDPhone, type: 'tel' },
                { label: 'Event Date', value: dEventDate, set: setDEventDate, type: 'date' },
                { label: 'Venue', value: dVenue, set: setDVenue, type: 'text' },
                { label: 'Notes', value: dNotes, set: setDNotes, type: 'text' },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{f.label}</label>
                  <input
                    type={f.type} value={f.value} onChange={e => f.set(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px 12px', fontSize: '0.85rem', color: 'white', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button onClick={() => { setDetailsOpen(false); setDName(est.client_name); setDEmail(est.client_email); setDPhone(est.client_phone ?? ''); setDEventDate(est.event_date ?? ''); setDVenue(est.venue ?? ''); setDNotes(est.notes ?? '') }} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={saveDetails} disabled={saving || !dName || !dEmail} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#5BBFBF', border: 'none', color: '#0D0F0F', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>Save</button>
              </div>
            </div>
          )}
        </div>

        {/* Selection */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px 18px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Selection</p>
            {!selectionOpen && (
              <button onClick={() => setSelectionOpen(true)} style={{ background: 'none', border: 'none', color: '#5BBFBF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700 }}>
                <Pencil size={12} /> Edit
              </button>
            )}
          </div>

          {!selectionOpen && (
            <>
              {est.package_name && (
                <p style={{ fontSize: '0.9rem', color: 'white', fontWeight: 600, marginBottom: '6px' }}>{est.package_name} Package</p>
              )}
              {addOns.map((a, i) => (
                <p key={i} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', margin: '4px 0' }}>+ {labelForAddOn(a)}</p>
              ))}
              {(est.custom_items ?? []).map((it, i) => (
                <div key={`c${i}`} style={{ margin: '4px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0, marginRight: '10px' }}>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>+ {it.label}</p>
                    {it.description && (
                      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>{it.description}</p>
                    )}
                  </div>
                  <span style={{ color: '#5BBFBF', fontWeight: 600, fontSize: '0.82rem', flexShrink: 0 }}>${Number(it.price).toLocaleString()}</span>
                </div>
              ))}
              {!est.package_name && addOns.length === 0 && (est.custom_items ?? []).length === 0 && (
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Nothing selected yet.</p>
              )}
            </>
          )}

          {selectionOpen && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Package (optional — leave off for a fully custom quote)</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <button
                  onClick={() => setSelPackageId(null)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left',
                    background: !selPackageId ? 'rgba(91,191,191,0.1)' : 'rgba(255,255,255,0.04)',
                    border: !selPackageId ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px', padding: '12px 14px', cursor: 'pointer',
                  }}
                >
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', margin: 0 }}>No Package — Custom Only</p>
                  {!selPackageId && <Check size={16} color="#5BBFBF" />}
                </button>
                {getPackagesForEvent(est.event_type as EventTypeId | null).map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelPackageId(p.id)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left',
                      background: selPackageId === p.id ? 'rgba(91,191,191,0.1)' : 'rgba(255,255,255,0.04)',
                      border: selPackageId === p.id ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px', padding: '12px 14px', cursor: 'pointer',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', margin: 0 }}>{p.name}</p>
                      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{p.tagline}</p>
                    </div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#5BBFBF', flexShrink: 0, marginLeft: '12px' }}>${p.price.toLocaleString()}</p>
                  </button>
                ))}
              </div>

              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Add-Ons</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                {ADD_ONS.filter(a => a.eventTypes === 'all' || (est.event_type && a.eventTypes.includes(est.event_type as EventTypeId))).map(a => {
                  const selected = selAddOnIds.includes(a.id)
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleSelAddOn(a.id)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left',
                        background: selected ? 'rgba(91,191,191,0.1)' : 'rgba(255,255,255,0.04)',
                        border: selected ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px', padding: '10px 14px', cursor: 'pointer',
                      }}
                    >
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: selected ? 'white' : 'rgba(255,255,255,0.7)', margin: 0 }}>{a.label}</p>
                      <p style={{ fontSize: '0.82rem', fontWeight: 700, color: selected ? '#5BBFBF' : 'rgba(255,255,255,0.4)', flexShrink: 0, marginLeft: '10px' }}>+${a.price}</p>
                    </button>
                  )
                })}
              </div>

              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Custom Items — anything from a call that isn&apos;t in the catalog above</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                {selCustomItems.map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px' }}>
                    <div style={{ minWidth: 0, marginRight: '10px' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white', margin: 0 }}>{it.label}</p>
                      {it.description && (
                        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{it.description}</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#5BBFBF', margin: 0 }}>${Number(it.price).toLocaleString()}</p>
                      <button onClick={() => removeCustomItem(i)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '2px' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Item Name</label>
                  <input
                    type="text" placeholder="e.g. Extra floral arrangement" value={newItemLabel}
                    onChange={e => setNewItemLabel(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '11px 12px', fontSize: '16px', color: 'white', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Description (optional)</label>
                  <input
                    type="text" placeholder="Any detail worth noting" value={newItemDescription}
                    onChange={e => setNewItemDescription(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '11px 12px', fontSize: '16px', color: 'white', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Price</label>
                  <input
                    type="number" inputMode="decimal" placeholder="$" value={newItemPrice}
                    onChange={e => setNewItemPrice(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '11px 12px', fontSize: '16px', color: 'white', boxSizing: 'border-box' }}
                  />
                </div>
                <button
                  onClick={addCustomItem}
                  disabled={!newItemLabel.trim() || !newItemPrice}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%',
                    background: (!newItemLabel.trim() || !newItemPrice) ? 'rgba(91,191,191,0.2)' : '#5BBFBF',
                    border: 'none', borderRadius: '8px', padding: '11px', color: (!newItemLabel.trim() || !newItemPrice) ? 'rgba(91,191,191,0.4)' : '#0D0F0F',
                    fontWeight: 700, fontSize: '0.85rem', cursor: (!newItemLabel.trim() || !newItemPrice) ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Plus size={15} /> Add Item
                </button>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
                New total: <strong style={{ color: 'white' }}>${calcSelectionTotal().toLocaleString()}</strong>
              </p>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { setSelectionOpen(false); setSelPackageId(est.package_id ?? null); setSelAddOnIds(addOns); setSelCustomItems(est.custom_items ?? []); setNewItemLabel(''); setNewItemDescription(''); setNewItemPrice('') }} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', cursor: 'pointer' }}>
                  <X size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Cancel
                </button>
                <button onClick={saveSelection} disabled={saving} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#5BBFBF', border: 'none', color: '#0D0F0F', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>Save</button>
              </div>
            </div>
          )}
        </div>

        {/* Pricing + Discount */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Subtotal</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', margin: 0 }}>{fmt(balance.subtotal)}</p>
          </div>
          {balance.discountAmount > 0 && (
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Discount{est.discount_note ? ` — ${est.discount_note}` : ''}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#5BBFBF', margin: 0 }}>-{fmt(balance.discountAmount)}</p>
                <button onClick={clearDiscount} disabled={saving} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '2px' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', margin: 0 }}>Total</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>{fmt(balance.finalTotal)}</p>
          </div>
          <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Paid so far</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', margin: 0 }}>{fmt(balance.totalPaid)}</p>
          </div>
          <div style={{ padding: '14px 18px', background: balance.isPaidInFull ? 'rgba(34,197,94,0.08)' : 'rgba(201,169,110,0.08)', display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', margin: 0 }}>{balance.isPaidInFull ? 'Paid in Full' : 'Amount Owed'}</p>
            {!balance.isPaidInFull && <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#C9A96E', margin: 0 }}>{fmt(balance.amountOwed)}</p>}
            {balance.isPaidInFull && <Check size={20} color="#4ade80" />}
          </div>

          {!discountOpen && (
            <button onClick={() => setDiscountOpen(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', background: 'rgba(255,255,255,0.03)', border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
              <Tag size={13} /> {balance.discountAmount > 0 ? 'Edit Discount' : 'Add Discount'}
            </button>
          )}

          {discountOpen && (
            <div style={{ padding: '16px 18px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.15)' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <button onClick={() => setDiscountType('percent')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: discountType === 'percent' ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.12)', background: discountType === 'percent' ? 'rgba(91,191,191,0.1)' : 'transparent', color: discountType === 'percent' ? '#5BBFBF' : 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>%</button>
                <button onClick={() => setDiscountType('flat')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: discountType === 'flat' ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.12)', background: discountType === 'flat' ? 'rgba(91,191,191,0.1)' : 'transparent', color: discountType === 'flat' ? '#5BBFBF' : 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>$</button>
              </div>
              <input
                type="number" placeholder={discountType === 'percent' ? 'e.g. 10' : 'e.g. 50'} value={discountValue}
                onChange={e => setDiscountValue(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px 12px', fontSize: '0.9rem', color: 'white', marginBottom: '8px', boxSizing: 'border-box' }}
              />
              <input
                type="text" placeholder="Note — birthday discount, friend discount..." value={discountNote}
                onChange={e => setDiscountNote(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px 12px', fontSize: '0.85rem', color: 'white', marginBottom: '10px', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setDiscountOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={saveDiscount} disabled={saving} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#5BBFBF', border: 'none', color: '#0D0F0F', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>Save</button>
              </div>
            </div>
          )}
        </div>

        {/* Payment ledger */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Payments</p>
            <button onClick={() => setPaymentOpen(o => !o)} style={{ background: 'none', border: 'none', color: '#5BBFBF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700 }}>
              <Plus size={14} /> Add
            </button>
          </div>

          {payments.length === 0 && !paymentOpen && (
            <p style={{ padding: '16px 18px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>No payments recorded yet.</p>
          )}

          {payments.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', marginBottom: '2px', textTransform: 'capitalize' }}>{p.method}{p.note ? ` — ${p.note}` : ''}</p>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{new Date(p.created_at).toLocaleDateString()}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#5BBFBF', margin: 0 }}>{fmt(Number(p.amount))}</p>
                <button onClick={() => deletePayment(p.id)} disabled={saving} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', padding: '2px' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          {paymentOpen && (
            <div style={{ padding: '16px 18px', background: 'rgba(0,0,0,0.15)' }}>
              <input
                type="number" placeholder="Amount" value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px 12px', fontSize: '0.9rem', color: 'white', marginBottom: '8px', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                {METHODS.map(m => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id)} style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', border: paymentMethod === m.id ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.12)', background: paymentMethod === m.id ? 'rgba(91,191,191,0.1)' : 'transparent', color: paymentMethod === m.id ? '#5BBFBF' : 'rgba(255,255,255,0.6)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>{m.label}</button>
                ))}
              </div>
              <input
                type="text" placeholder="Note (optional)" value={paymentNote}
                onChange={e => setPaymentNote(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px 12px', fontSize: '0.85rem', color: 'white', marginBottom: '10px', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setPaymentOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={addPayment} disabled={saving} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#5BBFBF', border: 'none', color: '#0D0F0F', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>Record Payment</button>
              </div>
            </div>
          )}
        </div>

        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
          "Add" payments for Zelle, check, or cash Monica takes directly. Card payments through the client link record automatically.
        </p>
      </div>

      <StudioNav />
    </div>
  )
}
