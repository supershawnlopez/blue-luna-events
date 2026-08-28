'use client'

import { useState, useReducer, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronDown, ArrowRight, Check, Copy, ExternalLink, Plus, Trash2, Pencil } from 'lucide-react'
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
  | { type: 'RESET' }
  | { type: 'HYDRATE'; state: State }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_STEP': return { ...state, step: action.step }
    case 'SET_CLIENT': return { ...state, client: { ...state.client, ...action.client } }
    case 'SET_EVENT': return { ...state, eventTypeId: action.eventTypeId, items: [] }
    case 'ADD_ITEM': return { ...state, items: [...state.items, action.item] }
    case 'UPDATE_ITEM': return { ...state, items: state.items.map((it, i) => i === action.index ? action.item : it) }
    case 'REMOVE_ITEM': return { ...state, items: state.items.filter((_, i) => i !== action.index) }
    case 'RESET': return INITIAL
    case 'HYDRATE': return action.state
    default: return state
  }
}

const INITIAL: State = {
  step: 'client',
  client: { name: '', email: '', phone: '', event_date: '', venue: '', notes: '' },
  eventTypeId: null,
  items: [],
}

// Team decision, 2026-08-16: an in-progress estimate now autosaves to the
// real `estimates` table (status: 'draft') as soon as name+email are filled,
// so it's visible in the Estimates list and reachable from any device —
// not just the phone/browser she started on. Local storage is only a
// first-line safety net for the moment BEFORE that (e.g. she's typed a name
// but no email yet, so there isn't enough to save a real row).
const DRAFT_KEY = 'bl_new_estimate_draft'
const DRAFT_ID_KEY = 'bl_new_estimate_draft_id'

function isBlankState(s: State): boolean {
  return !s.client.name && !s.client.email && !s.client.phone && !s.client.event_date &&
    !s.client.venue && !s.client.notes && !s.eventTypeId && s.items.length === 0
}

function loadLocalDraft(): State | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const step: Step = ['client', 'event', 'items'].includes(parsed.step) ? parsed.step : 'client'
    return {
      step,
      client: { ...INITIAL.client, ...parsed.client },
      eventTypeId: parsed.eventTypeId ?? null,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    }
  } catch {
    return null
  }
}

// Server draft record -> wizard State, landing on whichever step she'd
// actually reached rather than always restarting at step 1.
function stateFromEstimate(data: {
  client_name?: string; client_email?: string; client_phone?: string | null
  event_type?: string | null; event_date?: string | null; venue?: string | null
  notes?: string | null; custom_items?: LineItem[] | null
}): State {
  const eventTypeId = (data.event_type ?? null) as EventTypeId | null
  const items = Array.isArray(data.custom_items) ? data.custom_items : []
  const step: Step = eventTypeId ? 'items' : (data.client_name && data.client_email ? 'event' : 'client')
  return {
    step,
    client: {
      name: data.client_name ?? '',
      email: data.client_email ?? '',
      phone: data.client_phone ?? '',
      event_date: data.event_date ?? '',
      venue: data.venue ?? '',
      notes: data.notes ?? '',
    },
    eventTypeId,
    items,
  }
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

async function persistDraft(state: State, id: string | null, leadId: string | null): Promise<string | null> {
  const total = state.items.reduce((sum, it) => sum + (Number(it.price) || 0), 0)
  const body: Record<string, unknown> = {
    client_name: state.client.name,
    client_email: state.client.email,
    client_phone: state.client.phone || null,
    event_type: state.eventTypeId,
    event_date: state.client.event_date || null,
    venue: state.client.venue || null,
    custom_items: state.items,
    quoted_total: total,
    notes: state.client.notes || null,
  }
  try {
    if (id) {
      const res = await fetch(`/api/studio/estimates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      return res.ok ? id : null
    }
    const res = await fetch('/api/studio/estimates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, status: 'draft', deposit_amount: Math.round(total * 0.5), balance_amount: total - Math.round(total * 0.5), lead_id: leadId || null }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.id ?? null
  } catch {
    return null
  }
}

function DraftRestoredBanner({ onDiscard }: { onDiscard: () => void }) {
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px 24px 0' }}>
      <div style={{ background: 'rgba(91,191,191,0.08)', border: '1px solid rgba(91,191,191,0.25)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>Picked up where you left off — nothing was lost.</p>
        <button onClick={onDiscard} style={{ background: 'none', border: 'none', color: '#5BBFBF', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
          Start Over
        </button>
      </div>
    </div>
  )
}

function SaveStatusLine({ status }: { status: SaveStatus }) {
  const text = status === 'saving' ? 'Saving…'
    : status === 'saved' ? 'Saved — visible in Estimates from any device'
    : status === 'error' ? "Couldn't save — check your connection"
    : 'Autosaves as you go'
  const color = status === 'error' ? 'rgba(248,113,113,0.7)' : 'rgba(255,255,255,0.25)'
  return (
    <p style={{ fontSize: '0.68rem', color, textAlign: 'center', marginTop: '10px' }}>{text}</p>
  )
}

// Compact top-of-page indicator for steps 1-2, before the sticky bottom bar
// (which has its own full SaveStatusLine) exists to show it.
function TopSaveIndicator({ status }: { status: SaveStatus }) {
  const text = status === 'saving' ? 'Saving…'
    : status === 'saved' ? 'Saved'
    : status === 'error' ? "Couldn't save"
    : 'Autosaves as you go'
  const color = status === 'error' ? '#f87171' : status === 'idle' ? 'rgba(255,255,255,0.3)' : '#5BBFBF'
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '10px 24px 0', display: 'flex', justifyContent: 'flex-end' }}>
      <p style={{ fontSize: '0.72rem', fontWeight: 600, color, margin: 0 }}>{text}</p>
    </div>
  )
}

function ProposalNotice({ text }: { text: string }) {
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px 24px 0' }}>
      <div style={{ background: 'rgba(91,191,191,0.1)', border: '1px solid rgba(91,191,191,0.28)', borderRadius: '12px', padding: '12px 14px' }}>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.78)', lineHeight: 1.5, margin: 0 }}>{text}</p>
      </div>
    </div>
  )
}

type CatalogItem = {
  id: string
  label: string
  description: string | null
  pricing_type: 'flat' | 'per_unit'
  price: number
  unit: string | null
}

type ProposalSelection = {
  id: string
  client_name: string | null
  client_email: string | null
  client_phone: string | null
  event_type: EventTypeId | null
  event_date: string | null
  venue: string | null
  package_name: string
  partner_price: number
  standard_price: number
  included_items: { title: string; detail?: string }[] | null
  notes: string | null
}

function stateFromProposalSelection(selection: ProposalSelection): State {
  const included = Array.isArray(selection.included_items) ? selection.included_items : []
  const description = included
    .map(item => item.detail ? `${item.title}: ${item.detail}` : item.title)
    .join('\n')
  const notes = [
    `${selection.package_name} selected from Westin proposal.`,
    `Westin Partner Price: $${Number(selection.partner_price || 0).toLocaleString()}.`,
    `Standard Price: $${Number(selection.standard_price || 0).toLocaleString()}.`,
    selection.notes ? `Client notes: ${selection.notes}` : '',
  ].filter(Boolean).join('\n')

  return {
    step: selection.client_email ? 'items' : 'client',
    client: {
      name: selection.client_name ?? '',
      email: selection.client_email ?? '',
      phone: selection.client_phone ?? '',
      event_date: selection.event_date ?? '',
      venue: selection.venue ?? '',
      notes,
    },
    eventTypeId: selection.event_type ?? 'corporate',
    items: [{
      label: selection.package_name,
      description,
      price: Number(selection.partner_price || 0),
    }],
  }
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

  // A deep link from a lead (?name=&email=...) means Monica explicitly chose
  // to start a fresh estimate for that person — never resurrect an unrelated
  // stale draft over that. A `?draft=<id>` link (from the Estimates list'
  // "In Progress" row) means load that real server draft instead — this is
  // what makes an in-progress estimate reachable from a different device.
  const [initial] = useState(() => {
    const hasPrefillParams = ['name', 'email', 'phone', 'event_date', 'venue', 'proposal_selection_id'].some(k => searchParams.get(k))
    const urlDraftId = searchParams.get('draft')
    if (hasPrefillParams) return { state: INITIAL, restored: false, draftId: null as string | null, loadingDraft: false }
    if (urlDraftId) return { state: INITIAL, restored: false, draftId: urlDraftId, loadingDraft: true }
    const pointerId = typeof window !== 'undefined' ? window.localStorage.getItem(DRAFT_ID_KEY) : null
    if (pointerId) return { state: INITIAL, restored: false, draftId: pointerId, loadingDraft: true }
    const draft = loadLocalDraft()
    if (draft && !isBlankState(draft)) return { state: draft, restored: true, draftId: null, loadingDraft: false }
    return { state: INITIAL, restored: false, draftId: null, loadingDraft: false }
  })

  const [state, dispatch] = useReducer(reducer, initial.state)
  const [draftRestored, setDraftRestored] = useState(initial.restored)
  const [draftId, setDraftId] = useState<string | null>(initial.draftId)
  const [loadingDraft, setLoadingDraft] = useState(initial.loadingDraft)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<{ id: string; shareToken: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [proposalSelectionId] = useState(() => searchParams.get('proposal_selection_id'))
  const [proposalNotice, setProposalNotice] = useState('')

  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([])
  const [itemCatalogId, setItemCatalogId] = useState('')
  const [itemLabel, setItemLabel] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [itemQty, setItemQty] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [itemSheetOpen, setItemSheetOpen] = useState(false)
  const [catalogPickerOpen, setCatalogPickerOpen] = useState(false)

  useEffect(() => {
    fetch('/api/studio/catalog').then(r => r.ok ? r.json() : []).then(d => setCatalogItems(Array.isArray(d) ? d : []))
  }, [])

  useEffect(() => {
    if (!proposalSelectionId) return
    fetch(`/api/studio/proposals/${proposalSelectionId}`)
      .then(r => r.ok ? r.json() : null)
      .then((selection: ProposalSelection | null) => {
        if (!selection) {
          setProposalNotice('Could not load that proposal selection. You can still build the estimate manually.')
          return
        }
        window.localStorage.removeItem(DRAFT_KEY)
        window.localStorage.removeItem(DRAFT_ID_KEY)
        dispatch({ type: 'HYDRATE', state: stateFromProposalSelection(selection) })
        setProposalNotice(`${selection.package_name} was loaded from the Westin proposal. Confirm the recipient email, adjust anything needed, then send the official estimate.`)
      })
      .catch(() => setProposalNotice('Could not load that proposal selection. You can still build the estimate manually.'))
  }, [proposalSelectionId])

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

  // Load a real server draft — either she followed a `?draft=<id>` link (from
  // the Estimates list, works from any device) or this same browser has a
  // pointer to a draft it already created server-side.
  useEffect(() => {
    if (!draftId || !loadingDraft) return
    fetch(`/api/studio/estimates/${draftId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          window.localStorage.removeItem(DRAFT_KEY)
          window.localStorage.setItem(DRAFT_ID_KEY, draftId)
          dispatch({ type: 'HYDRATE', state: stateFromEstimate(data) })
          setDraftRestored(true)
        } else {
          // Draft no longer exists (deleted, or a stale pointer) — start clean.
          window.localStorage.removeItem(DRAFT_ID_KEY)
          setDraftId(null)
        }
        setLoadingDraft(false)
      })
      .catch(() => setLoadingDraft(false))
  }, [draftId, loadingDraft])

  // Local-only safety net for BEFORE there's enough info (name + email) to
  // save a real draft to the server — see DRAFT_KEY comment above.
  useEffect(() => {
    if (loadingDraft || draftId) return
    if (isBlankState(state)) {
      window.localStorage.removeItem(DRAFT_KEY)
      return
    }
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(state))
  }, [state, loadingDraft, draftId])

  // Real server autosave, debounced, once she's typed enough to save a real
  // row — this is what makes the draft show up in the Estimates list and
  // reachable from any device, per the team decision on 2026-08-16.
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const draftIdRef = useRef<string | null>(draftId)
  useEffect(() => { draftIdRef.current = draftId }, [draftId])

  useEffect(() => {
    if (loadingDraft) return
    if (!state.client.name.trim() || !state.client.email.trim()) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(async () => {
      setSaveStatus('saving')
      const id = await persistDraft(state, draftIdRef.current, searchParams.get('lead_id'))
      if (id) {
        if (!draftIdRef.current) {
          setDraftId(id)
          window.localStorage.setItem(DRAFT_ID_KEY, id)
          window.localStorage.removeItem(DRAFT_KEY)
        }
        setSaveStatus('saved')
      } else {
        setSaveStatus('error')
      }
    }, 1200)
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, loadingDraft])

  async function discardDraft() {
    window.localStorage.removeItem(DRAFT_KEY)
    window.localStorage.removeItem(DRAFT_ID_KEY)
    if (draftId) {
      fetch(`/api/studio/estimates/${draftId}`, { method: 'DELETE' }).catch(() => {})
    }
    setDraftId(null)
    setSaveStatus('idle')
    dispatch({ type: 'RESET' })
    setDraftRestored(false)
  }

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
      lead_id: searchParams.get('lead_id') || null,
    }
    // Reuse the autosaved draft row if one already exists, instead of
    // creating a second, duplicate estimate for the same client.
    const res = draftId
      ? await fetch(`/api/studio/estimates/${draftId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      : await fetch('/api/studio/estimates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
    if (res.ok) {
      const data = await res.json()
      if (proposalSelectionId && data.id) {
        fetch(`/api/studio/proposals/${proposalSelectionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'estimate_created', estimate_id: data.id }),
        }).catch(() => {})
      }
      window.localStorage.removeItem(DRAFT_KEY)
      window.localStorage.removeItem(DRAFT_ID_KEY)
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

  // ── Loading an existing draft from the server ───────────────────────────────────
  if (loadingDraft) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0F0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Loading…</p>
      </div>
    )
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
        {draftRestored && <DraftRestoredBanner onDiscard={discardDraft} />}
        {proposalNotice && <ProposalNotice text={proposalNotice} />}
        <TopSaveIndicator status={saveStatus} />
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
              onClick={() => dispatch({ type: 'SET_STEP', step: state.eventTypeId && state.items.length > 0 ? 'items' : 'event' })}
              disabled={!valid}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: valid ? '#5BBFBF' : 'rgba(91,191,191,0.2)', color: valid ? '#0D0F0F' : 'rgba(91,191,191,0.4)',
                border: 'none', borderRadius: '12px', padding: '16px', fontWeight: 700, fontSize: '0.95rem',
                cursor: valid ? 'pointer' : 'not-allowed', marginTop: '8px',
              }}
            >
              {state.eventTypeId && state.items.length > 0 ? 'Review Items' : 'Choose Event Type'} <ArrowRight size={16} />
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
        {draftRestored && <DraftRestoredBanner onDiscard={discardDraft} />}
        {proposalNotice && <ProposalNotice text={proposalNotice} />}
        <TopSaveIndicator status={saveStatus} />
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
        {draftRestored && <DraftRestoredBanner onDiscard={discardDraft} />}
        {proposalNotice && <ProposalNotice text={proposalNotice} />}

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
            <SaveStatusLine status={saveStatus} />
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
                    type="text" placeholder="e.g. Balloon Garland" value={itemLabel}
                    onChange={e => setItemLabel(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 14px', fontSize: '16px', color: 'white', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Description (optional)</label>
                  <textarea
                    placeholder="Any detail worth noting" value={itemDescription} rows={3}
                    onChange={e => setItemDescription(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 14px', fontSize: '16px', color: 'white', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
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

        {/* Price List picker — same branded sheet as the estimate detail page,
            replacing the native <select>'s squished default OS dropdown. */}
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
                  style={{ width: '100%', textAlign: 'left', background: !itemCatalogId ? 'rgba(91,191,191,0.1)' : 'rgba(255,255,255,0.04)', border: !itemCatalogId ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '13px 16px', marginBottom: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: !itemCatalogId ? '#5BBFBF' : 'rgba(255,255,255,0.6)' }}>Type a custom item instead</span>
                  {!itemCatalogId && <Check size={16} color="#5BBFBF" />}
                </button>
                {catalogItems.map(c => {
                  const selected = itemCatalogId === c.id
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
      </div>
    )
  }

  return null
}
