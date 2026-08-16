'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronDown, Copy, Files, Check, ExternalLink, Download, Mail, Plus, Trash2, Tag, Pencil, X } from 'lucide-react'
import StudioNav from '@/components/studio/StudioNav'
import { computeBalance, type EstimatePayment } from '@/lib/estimateBalance'
import { labelForAddOn, labelForEventType } from '@/lib/config'
import { getDocumentLabel, isAccepted } from '@/lib/documentLabel'

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
  deposit_type?: string | null
  deposit_value?: number | null
  accepted_at?: string | null
}

type CustomItem = { label: string; description?: string; price: number }

type CatalogItem = {
  id: string
  label: string
  description: string | null
  pricing_type: 'flat' | 'per_unit'
  price: number
  unit: string | null
}

type ActivityEntry = {
  id: string
  type: 'estimate_sent' | 'receipt_sent' | string
  recipient: string | null
  created_at: string
}

function activityLabel(type: string): string {
  if (type === 'estimate_sent') return 'Estimate emailed'
  if (type === 'receipt_sent') return 'Receipt emailed'
  return type
}

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
  return (
    <Suspense fallback={null}>
      <EstimateDetailInner />
    </Suspense>
  )
}

function EstimateDetailInner() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = params.id as string
  const [showDuplicatedBanner, setShowDuplicatedBanner] = useState(() => searchParams.get('duplicated') === '1')
  const [est, setEst] = useState<Estimate | null>(null)
  const [payments, setPayments] = useState<EstimatePayment[]>([])
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const [deleteConfirming, setDeleteConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Discount editor
  const [discountOpen, setDiscountOpen] = useState(false)
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [discountNote, setDiscountNote] = useState('')

  // Deposit editor
  const [depositOpen, setDepositOpen] = useState(false)
  const [depositType, setDepositType] = useState<'percent' | 'flat'>('percent')
  const [depositValue, setDepositValue] = useState('50')

  // Add payment
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('zelle')
  const [paymentNote, setPaymentNote] = useState('')
  const [receiptSendingId, setReceiptSendingId] = useState<string | null>(null)
  const [receiptSentId, setReceiptSentId] = useState<string | null>(null)
  const [receiptErrorId, setReceiptErrorId] = useState<string | null>(null)

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
  const [selCustomItems, setSelCustomItems] = useState<CustomItem[]>([])
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([])
  const [newItemCatalogId, setNewItemCatalogId] = useState<string>('')
  const [newItemLabel, setNewItemLabel] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newItemQty, setNewItemQty] = useState('')
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [itemSheetOpen, setItemSheetOpen] = useState(false)
  const [catalogPickerOpen, setCatalogPickerOpen] = useState(false)

  const load = useCallback(async () => {
    const [estRes, paymentsRes, activityRes, catalogRes] = await Promise.all([
      fetch(`/api/studio/estimates/${id}`),
      fetch(`/api/studio/estimates/${id}/payments`),
      fetch(`/api/studio/estimates/${id}/activity`),
      fetch(`/api/studio/catalog`),
    ])
    if (estRes.ok) {
      const data = await estRes.json()
      setEst(data)
      setDiscountType(data.discount_type === 'flat' ? 'flat' : 'percent')
      setDiscountValue(data.discount_value ? String(data.discount_value) : '')
      setDiscountNote(data.discount_note ?? '')
      setDepositType(data.deposit_type === 'flat' ? 'flat' : 'percent')
      setDepositValue(data.deposit_value != null ? String(data.deposit_value) : '50')
      setDName(data.client_name ?? '')
      setDEmail(data.client_email ?? '')
      setDPhone(data.client_phone ?? '')
      setDEventDate(data.event_date ?? '')
      setDVenue(data.venue ?? '')
      setDNotes(data.notes ?? '')
      setSelCustomItems(Array.isArray(data.custom_items) ? data.custom_items : [])
    }
    if (paymentsRes.ok) setPayments(await paymentsRes.json())
    if (activityRes.ok) setActivity(await activityRes.json())
    if (catalogRes.ok) setCatalogItems(await catalogRes.json())
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

  async function saveDeposit() {
    setSaving(true)
    const value = parseFloat(depositValue)
    await fetch(`/api/studio/estimates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deposit_type: value > 0 ? depositType : null,
        deposit_value: value > 0 ? value : null,
      }),
    })
    await load()
    setSaving(false)
    setDepositOpen(false)
  }

  async function resetDepositToDefault() {
    setSaving(true)
    await fetch(`/api/studio/estimates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deposit_type: null, deposit_value: null }),
    })
    setDepositType('percent'); setDepositValue('50')
    await load()
    setSaving(false)
    setDepositOpen(false)
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
    return selCustomItems.reduce((sum, it) => sum + (Number(it.price) || 0), 0)
  }

  // Package/add-ons are eliminated from this editor going forward (team call,
  // 2026-08-04) — deliberately NOT included in this PATCH body, so package_id/
  // package_name/add_ons stay whatever they already are on older estimates
  // rather than getting silently wiped by an editor that no longer offers them.
  //
  // Every add/edit/remove persists to the server immediately (2026-08-16,
  // Shawn's real feedback: a separate "Save" step made it look like items
  // weren't actually being added) — this just pushes whatever item list is
  // passed in, right when it changes. No more discard-on-Cancel; there's
  // nothing local left to discard once every change is already saved.
  async function persistItems(items: CustomItem[]) {
    setSaving(true)
    const total = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0)
    const res = await fetch(`/api/studio/estimates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ custom_items: items, quoted_total: total }),
    })
    if (res.ok) {
      const data = await res.json()
      setEst(data)
    }
    setSaving(false)
  }

  function resetItemForm() {
    setNewItemCatalogId('')
    setNewItemLabel('')
    setNewItemDescription('')
    setNewItemPrice('')
    setNewItemQty('')
    setEditingItemIndex(null)
    setItemSheetOpen(false)
  }

  function openAddItemSheet() {
    resetItemForm()
    setItemSheetOpen(true)
  }

  function selectCatalogItem(catalogId: string) {
    setNewItemCatalogId(catalogId)
    const item = catalogItems.find(c => c.id === catalogId)
    if (!item) { setNewItemLabel(''); setNewItemDescription(''); setNewItemPrice(''); setNewItemQty(''); return }
    setNewItemLabel(item.label)
    setNewItemDescription(item.description ?? '')
    if (item.pricing_type === 'per_unit') {
      setNewItemQty('')
      setNewItemPrice('')
    } else {
      setNewItemPrice(String(item.price))
    }
  }

  function updateQty(qty: string) {
    setNewItemQty(qty)
    const item = catalogItems.find(c => c.id === newItemCatalogId)
    if (item && item.pricing_type === 'per_unit') {
      const n = parseFloat(qty)
      setNewItemPrice(n > 0 ? String(Math.round(item.price * n * 100) / 100) : '')
    }
  }

  function saveItem() {
    const price = parseFloat(newItemPrice)
    if (!newItemLabel.trim() || !price || price <= 0) return
    const item = { label: newItemLabel.trim(), description: newItemDescription.trim() || undefined, price }
    const next = editingItemIndex !== null
      ? selCustomItems.map((it, i) => i === editingItemIndex ? item : it)
      : [...selCustomItems, item]
    setSelCustomItems(next)
    resetItemForm()
    persistItems(next)
  }

  function editCustomItem(index: number) {
    const it = selCustomItems[index]
    setNewItemCatalogId('')
    setNewItemLabel(it.label)
    setNewItemDescription(it.description ?? '')
    setNewItemPrice(String(it.price))
    setNewItemQty('')
    setEditingItemIndex(index)
    setItemSheetOpen(true)
  }

  function removeCustomItem(index: number) {
    const next = selCustomItems.filter((_, i) => i !== index)
    setSelCustomItems(next)
    if (editingItemIndex === index) resetItemForm()
    persistItems(next)
  }

  const selectedCatalogItem = catalogItems.find(c => c.id === newItemCatalogId)

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

  async function resendReceipt(paymentId: string) {
    setReceiptSendingId(paymentId)
    setReceiptSentId(null)
    setReceiptErrorId(null)
    const res = await fetch(`/api/studio/estimates/${id}/payments/${paymentId}/receipt`, { method: 'POST' })
    setReceiptSendingId(null)
    if (res.ok) {
      setReceiptSentId(paymentId)
      setTimeout(() => setReceiptSentId(null), 3000)
      fetch(`/api/studio/estimates/${id}/activity`).then(r => r.ok && r.json()).then(a => a && setActivity(a))
    } else {
      setReceiptErrorId(paymentId)
    }
  }

  async function sendEmail() {
    setEmailSending(true)
    setEmailSent(null)
    const res = await fetch(`/api/studio/estimates/${id}/email`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    const data = await res.json()
    if (res.ok) {
      setEmailSent(data.sentTo)
      fetch(`/api/studio/estimates/${id}/activity`).then(r => r.ok && r.json()).then(a => a && setActivity(a))
    }
    setEmailSending(false)
  }

  function copyLink() {
    if (!est) return
    navigator.clipboard.writeText(`${window.location.origin}/q/${est.share_token}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Lets Monica offer the same client a different mix of items (more/less)
  // without touching the original estimate she may have already sent.
  async function duplicateEstimate() {
    setDuplicating(true)
    const res = await fetch(`/api/studio/estimates/${id}/duplicate`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      router.push(`/studio/estimates/${data.id}?duplicated=1`)
    } else {
      setDuplicating(false)
    }
  }

  async function deleteEstimate() {
    setDeleting(true)
    setDeleteError(null)
    const res = await fetch(`/api/studio/estimates/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/studio/estimates')
      return
    }
    const data = await res.json().catch(() => null)
    setDeleteError(data?.error || "Couldn't delete this estimate.")
    setDeleting(false)
    setDeleteConfirming(false)
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
  const accepted = isAccepted(est, balance.totalPaid)
  const docLabel = getDocumentLabel(accepted, balance)
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/q/${est.share_token}`

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '100px' }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 20px) 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/studio/estimates" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', display: 'flex', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
            <ChevronLeft size={18} />
          </Link>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.15em', color: '#5BBFBF', textTransform: 'uppercase', margin: '0 0 2px' }}>{docLabel}</p>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', margin: 0 }}>{est.client_name}</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px' }}>

        {showDuplicatedBanner && (
          <div style={{ background: 'rgba(91,191,191,0.1)', border: '1px solid rgba(91,191,191,0.3)', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '10px', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.8rem', color: 'white', margin: 0, lineHeight: 1.4 }}>
              <strong>This is a new, separate copy.</strong> The original estimate is untouched — edit this one freely.
            </p>
            <button onClick={() => setShowDuplicatedBanner(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '2px', flexShrink: 0 }}>
              <X size={14} />
            </button>
          </div>
        )}

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
            <Mail size={13} /> {emailSending ? 'Sending…' : `Email ${docLabel} to Client`}
          </button>
          {emailSent && (
            <p style={{ fontSize: '0.75rem', color: '#5BBFBF', textAlign: 'center', marginTop: '8px' }}>✓ Sent to {emailSent}</p>
          )}
          <button
            onClick={duplicateEstimate}
            disabled={duplicating}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              background: 'none', color: 'rgba(255,255,255,0.5)',
              border: 'none', borderTop: '1px solid rgba(91,191,191,0.15)', padding: '12px 0 0', marginTop: '10px',
              fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer',
            }}
          >
            <Files size={13} /> {duplicating ? 'Duplicating…' : 'Duplicate as a New Estimate'}
          </button>
        </div>

        {/* Sent history — proof of what's actually gone out, no need to ask or check email logs by hand */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px 18px', marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Sent History</p>
          {activity.length === 0 && (
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Nothing sent yet.</p>
          )}
          {activity.map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'white', margin: 0 }}>{activityLabel(a.type)}</p>
                {a.recipient && <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>to {a.recipient}</p>}
              </div>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', margin: 0, flexShrink: 0, marginLeft: '10px' }}>
                {new Date(a.created_at).toLocaleDateString()} {new Date(a.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          ))}
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
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Line Items</p>
            {!selectionOpen && (
              <button onClick={() => setSelectionOpen(true)} style={{ background: 'none', border: 'none', color: '#5BBFBF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700 }}>
                <Pencil size={12} /> Edit
              </button>
            )}
          </div>

          {!selectionOpen && (
            <>
              {/* Package/add-ons are legacy fields — still shown read-only for
                  older estimates, but this editor never sets them anymore. */}
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
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Nothing added yet.</p>
              )}
            </>
          )}

          {selectionOpen && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Items</p>
                <Link href="/studio/catalog" style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Manage Price List →</Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                {selCustomItems.map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: editingItemIndex === i ? 'rgba(91,191,191,0.08)' : 'rgba(255,255,255,0.04)', border: editingItemIndex === i ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px' }}>
                    <button onClick={() => editCustomItem(i)} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', minWidth: 0, marginRight: '10px', flex: 1 }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white', margin: 0 }}>{it.label}</p>
                      {it.description && (
                        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{it.description}</p>
                      )}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#5BBFBF', margin: 0 }}>${Number(it.price).toLocaleString()}</p>
                      <button onClick={() => editCustomItem(i)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '2px' }}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => removeCustomItem(i)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '2px' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={openAddItemSheet}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(91,191,191,0.1)', border: '1.5px dashed rgba(91,191,191,0.4)', borderRadius: '10px', padding: '12px', color: '#5BBFBF', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', marginBottom: '16px' }}
              >
                <Plus size={15} /> Add Item
              </button>

              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                Total: <strong style={{ color: 'white' }}>${calcSelectionTotal().toLocaleString()}</strong>
              </p>
              <p style={{ fontSize: '0.72rem', color: saving ? '#5BBFBF' : 'rgba(255,255,255,0.3)', marginBottom: '12px' }}>
                {saving ? 'Saving…' : 'Each change saves automatically'}
              </p>

              <button onClick={() => { setSelectionOpen(false); resetItemForm() }} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#5BBFBF', border: 'none', color: '#0D0F0F', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>Done</button>
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

          {!depositOpen && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                Deposit due at checkout: <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{fmt(balance.suggestedDeposit)}</strong>
                {(!est.deposit_type || !est.deposit_value) ? ' (default 50%)' : est.deposit_type === 'percent' ? ` (${est.deposit_value}%)` : ' (custom amount)'}
              </p>
              <button onClick={() => setDepositOpen(true)} style={{ background: 'none', border: 'none', color: '#5BBFBF', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0, marginLeft: '10px' }}>
                Edit
              </button>
            </div>
          )}

          {depositOpen && (
            <div style={{ padding: '16px 18px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.15)' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Deposit — defaults to 50%</p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <button onClick={() => setDepositType('percent')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: depositType === 'percent' ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.12)', background: depositType === 'percent' ? 'rgba(91,191,191,0.1)' : 'transparent', color: depositType === 'percent' ? '#5BBFBF' : 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>%</button>
                <button onClick={() => setDepositType('flat')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: depositType === 'flat' ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.12)', background: depositType === 'flat' ? 'rgba(91,191,191,0.1)' : 'transparent', color: depositType === 'flat' ? '#5BBFBF' : 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>$</button>
              </div>
              <input
                type="number" inputMode="decimal" placeholder={depositType === 'percent' ? 'e.g. 30' : 'e.g. 200'} value={depositValue}
                onChange={e => setDepositValue(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px 12px', fontSize: '16px', color: 'white', marginBottom: '10px', boxSizing: 'border-box' }}
              />
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>
                Deposit would be: <strong style={{ color: 'white' }}>
                  {fmt(Math.round((depositType === 'flat' ? Math.min(parseFloat(depositValue) || 0, balance.finalTotal) : balance.finalTotal * ((parseFloat(depositValue) || 0) / 100)) * 100) / 100)}
                </strong>
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { setDepositOpen(false); setDepositType(est.deposit_type === 'flat' ? 'flat' : 'percent'); setDepositValue(est.deposit_value != null ? String(est.deposit_value) : '50') }} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={resetDepositToDefault} disabled={saving} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', cursor: 'pointer' }}>Reset to 50%</button>
                <button onClick={saveDeposit} disabled={saving} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#5BBFBF', border: 'none', color: '#0D0F0F', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>Save</button>
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
            <div key={p.id} style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              <div style={{ marginTop: '8px' }}>
                <button
                  onClick={() => resendReceipt(p.id)}
                  disabled={receiptSendingId === p.id}
                  style={{ background: 'none', border: 'none', color: '#5BBFBF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 600, padding: 0 }}
                >
                  <Mail size={11} /> {receiptSendingId === p.id ? 'Sending…' : 'Resend Receipt'}
                </button>
              </div>
              <div>
                {receiptSentId === p.id && (
                  <p style={{ fontSize: '0.72rem', color: '#5BBFBF', margin: '4px 0 0' }}>✓ Sent to {est.client_email}</p>
                )}
                {receiptErrorId === p.id && (
                  <p style={{ fontSize: '0.72rem', color: '#f87171', margin: '4px 0 0' }}>Couldn&apos;t send — check Resend is configured and try again.</p>
                )}
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

        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginBottom: '28px' }}>
          "Add" payments for Zelle, check, or cash Monica takes directly. Card payments through the client link record automatically.
        </p>

        {/* Delete — deliberately placed last, low-emphasis, and gated behind
            a confirm step since this destroys a real client record. The API
            itself also refuses to delete anything with recorded payments. */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
          {!deleteConfirming ? (
            <button onClick={() => { setDeleteConfirming(true); setDeleteError(null) }} style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(239,68,68,0.6)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Trash2 size={13} /> Delete Estimate
            </button>
          ) : (
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '16px' }}>
              <p style={{ fontSize: '0.82rem', color: 'white', marginBottom: '12px', textAlign: 'center' }}>
                Delete this estimate for {est.client_name}? This can't be undone.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setDeleteConfirming(false)} disabled={deleting} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={deleteEstimate} disabled={deleting} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#ef4444', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                  {deleting ? 'Deleting…' : 'Delete Estimate'}
                </button>
              </div>
            </div>
          )}
          {deleteError && (
            <p style={{ fontSize: '0.78rem', color: '#f87171', textAlign: 'center', marginTop: '10px' }}>{deleteError}</p>
          )}
        </div>
      </div>

      {/* Add/Edit Item sheet — anchored to the viewport, not the page, so it can
          never open scrolled out of view no matter where in a long items list
          Monica taps Edit (the bug this replaced: the old inline form). */}
      {itemSheetOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} onClick={resetItemForm} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '85vh', overflowY: 'auto', background: '#161616', borderTop: '2px solid #5BBFBF', boxShadow: '0 -8px 32px rgba(0,0,0,0.5)', borderRadius: '24px 24px 0 0', padding: '20px 20px calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
            <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px', margin: '0 auto 20px' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 20px' }}>
              {editingItemIndex !== null ? 'Edit Item' : 'Add Item'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {catalogItems.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Pick from Price List (optional)</label>
                  <button
                    type="button" onClick={() => setCatalogPickerOpen(true)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 14px', fontSize: '16px', color: selectedCatalogItem ? 'white' : 'rgba(255,255,255,0.4)', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedCatalogItem ? `${selectedCatalogItem.label} — $${selectedCatalogItem.price}${selectedCatalogItem.pricing_type === 'per_unit' ? `/${selectedCatalogItem.unit}` : ''}` : 'Type a custom item instead'}
                    </span>
                    <ChevronDown size={16} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }} />
                  </button>
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Item Name</label>
                <input
                  type="text" placeholder="e.g. Extra floral arrangement" value={newItemLabel}
                  onChange={e => setNewItemLabel(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 14px', fontSize: '16px', color: 'white', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Description (optional)</label>
                <textarea
                  placeholder="Any detail worth noting" value={newItemDescription} rows={3}
                  onChange={e => setNewItemDescription(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 14px', fontSize: '16px', color: 'white', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>
              {selectedCatalogItem?.pricing_type === 'per_unit' && (
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Quantity ({selectedCatalogItem.unit}) — ${selectedCatalogItem.price}/{selectedCatalogItem.unit}
                  </label>
                  <input
                    type="number" inputMode="decimal" placeholder="e.g. 12" value={newItemQty}
                    onChange={e => updateQty(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 14px', fontSize: '16px', color: 'white', boxSizing: 'border-box' }}
                  />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Price</label>
                <input
                  type="number" inputMode="decimal" placeholder="$" value={newItemPrice}
                  onChange={e => setNewItemPrice(e.target.value)}
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
                disabled={!newItemLabel.trim() || !newItemPrice}
                style={{
                  flex: 1, padding: '15px 0', borderRadius: '12px', border: 'none',
                  background: (!newItemLabel.trim() || !newItemPrice) ? 'rgba(91,191,191,0.3)' : '#5BBFBF',
                  color: '#0D0F0F', fontSize: '0.9rem', fontWeight: 700,
                  cursor: (!newItemLabel.trim() || !newItemPrice) ? 'not-allowed' : 'pointer',
                }}
              >
                {editingItemIndex !== null ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price List picker — replaces the native <select>, which renders as
          the squished default OS dropdown with zero branding control. This
          stacks above the item sheet (zIndex 70 > 60). */}
      {catalogPickerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 70 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} onClick={() => setCatalogPickerOpen(false)} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '75vh', display: 'flex', flexDirection: 'column', background: '#161616', borderTop: '2px solid #5BBFBF', boxShadow: '0 -8px 32px rgba(0,0,0,0.5)', borderRadius: '24px 24px 0 0' }}>
            <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
              <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px', margin: '0 auto 20px' }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 16px' }}>Price List</p>
            </div>
            <div style={{ overflowY: 'auto', padding: '0 20px calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
              <button
                onClick={() => { selectCatalogItem(''); setCatalogPickerOpen(false) }}
                style={{ width: '100%', textAlign: 'left', background: !newItemCatalogId ? 'rgba(91,191,191,0.1)' : 'rgba(255,255,255,0.04)', border: !newItemCatalogId ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '13px 16px', marginBottom: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: !newItemCatalogId ? '#5BBFBF' : 'rgba(255,255,255,0.6)' }}>Type a custom item instead</span>
                {!newItemCatalogId && <Check size={16} color="#5BBFBF" />}
              </button>
              {catalogItems.map(c => {
                const selected = newItemCatalogId === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => { selectCatalogItem(c.id); setCatalogPickerOpen(false) }}
                    style={{ width: '100%', textAlign: 'left', background: selected ? 'rgba(91,191,191,0.1)' : 'rgba(255,255,255,0.04)', border: selected ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '13px 16px', marginBottom: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'white', margin: 0 }}>{c.label}</p>
                      {c.description && <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{c.description}</p>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#5BBFBF', margin: 0, whiteSpace: 'nowrap' }}>${c.price}{c.pricing_type === 'per_unit' ? `/${c.unit}` : ''}</p>
                      {selected && <Check size={16} color="#5BBFBF" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <StudioNav />
    </div>
  )
}
