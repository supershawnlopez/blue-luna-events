'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, ChevronRight, FileText, Trash2 } from 'lucide-react'
import StudioNav from '@/components/studio/StudioNav'
import SwipeRow from '@/components/studio/SwipeRow'
import { labelForEventType } from '@/lib/config'
import { computeBalance } from '@/lib/estimateBalance'
import { isAccepted } from '@/lib/documentLabel'

type Estimate = {
  id: string
  client_name: string
  client_email: string
  event_type: string | null
  event_date?: string | null
  package_name?: string | null
  quoted_total: number
  status: 'draft' | 'sent' | 'declined' | string
  created_at: string
  share_token: string
  discount_type?: string | null
  discount_value?: number | null
  custom_items?: import('@/lib/estimateBalance').CustomItem[] | null
  accepted_at?: string | null
  total_paid: number
  deleted_at?: string | null
}

type DisplayStatus = 'in_progress' | 'draft' | 'sent' | 'partial_paid' | 'paid_full' | 'declined' | 'owing'
type EstimateTab = 'pending' | 'invoices' | 'trash'

// Same words and colors as the Schedule's dots (Shawn, 2026-11-17):
// Sent = grey, Accepted = teal (waiting on deposit), Deposit Paid = booked.
const STATUS_STYLES: Record<DisplayStatus, { label: string; color: string }> = {
  in_progress:  { label: 'In Progress',  color: '#C9A96E' },
  draft:        { label: 'Draft',        color: 'rgba(255,255,255,0.45)' },
  sent:         { label: 'Sent',         color: 'rgba(255,255,255,0.7)' },
  owing:        { label: 'Accepted',     color: '#5BBFBF' },
  partial_paid: { label: 'Deposit Paid', color: '#8DD4D4' },
  paid_full:    { label: 'Paid in Full', color: '#4ade80' },
  declined:     { label: 'Declined',     color: 'rgba(239,68,68,0.75)' },
}

// A "draft" with nothing added yet is still mid-creation (autosaved from the
// wizard, possibly abandoned partway through) — route back into the wizard
// to continue it instead of the completed-estimate detail/edit page.
function isInProgress(est: Estimate): boolean {
  return est.status === 'draft' && Number(est.quoted_total) === 0
}

function displayStatus(est: Estimate, accepted: boolean, balance: ReturnType<typeof computeBalance>): DisplayStatus {
  if (est.status === 'declined') return 'declined'
  if (balance.isPaidInFull) return 'paid_full'
  if (accepted) return balance.totalPaid > 0 ? 'partial_paid' : 'owing'
  if (est.status === 'sent') return 'sent'
  if (isInProgress(est)) return 'in_progress'
  return 'draft'
}

// Whole dollars stay clean ("$485"); cents always show two digits ("$242.50").
function fmt(n: number) {
  const whole = Number.isInteger(Math.round(n * 100) / 100)
  return `$${n.toLocaleString('en-US', whole ? { maximumFractionDigits: 0 } : { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// "Dec 5" — adds the year only when it isn't this year ("Jan 7, 2027").
// (The weekday lives on the Schedule; here it crowded the row.)
function eventDateLabel(iso: string) {
  const d = new Date(iso.slice(0, 10) + 'T00:00:00')
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) })
}

// Two drafts for the same client (e.g. after Duplicate) look identical
// otherwise — this is the one permanent way to tell them apart on the list.
function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function tabFromUrl(): EstimateTab {
  if (typeof window === 'undefined') return 'pending'
  const tab = new URLSearchParams(window.location.search).get('tab')
  return tab === 'invoices' || tab === 'trash' ? tab : 'pending'
}

export default function EstimatesList() {
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [trashed, setTrashed] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTabState] = useState<EstimateTab>(tabFromUrl)
  const [openRowId, setOpenRowId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/studio/estimates').then(r => r.json()),
      fetch('/api/studio/estimates?trash=1').then(r => r.json()),
    ])
      .then(([active, trash]) => {
        setEstimates(Array.isArray(active) ? active : [])
        setTrashed(Array.isArray(trash) ? trash : [])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setTabState(tabFromUrl())
  }, [])

  function setTab(nextTab: EstimateTab) {
    setTabState(nextTab)
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (nextTab === 'pending') url.searchParams.delete('tab')
    else url.searchParams.set('tab', nextTab)
    window.history.replaceState(null, '', `${url.pathname}${url.search}`)
  }

  // Swipe left on a row → Delete (Shawn, 2026-11-17; replaced the per-row
  // trash can). The swipe + tap is the confirmation: this is a soft-delete
  // (see the API route), always restorable from the Trash tab. The API also
  // refuses to delete anything with recorded payments, surfaced on the row
  // instead of silently doing nothing.
  async function confirmDelete(id: string) {
    setDeletingId(id)
    setRowError(null)
    const res = await fetch(`/api/studio/estimates/${id}`, { method: 'DELETE' })
    if (res.ok) {
      const moved = estimates.find(e => e.id === id)
      setEstimates(prev => prev.filter(e => e.id !== id))
      if (moved) setTrashed(prev => [{ ...moved, deleted_at: new Date().toISOString() }, ...prev])
    } else {
      const data = await res.json().catch(() => null)
      setRowError({ id, message: data?.error || "Couldn't delete this estimate." })
    }
    setDeletingId(null)
    setOpenRowId(null)
  }

  async function restoreEstimate(id: string) {
    setRestoringId(id)
    const res = await fetch(`/api/studio/estimates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deleted_at: null }),
    })
    if (res.ok) {
      const data = await res.json()
      setTrashed(prev => prev.filter(e => e.id !== id))
      setEstimates(prev => [data, ...prev])
    }
    setRestoringId(null)
  }

  const withMeta = estimates.map(est => {
    const balance = computeBalance(est, [{ id: '', method: '', created_at: '', amount: est.total_paid }])
    return { est, balance, accepted: isAccepted(est, balance.totalPaid) }
  })
  const pending = withMeta.filter(x => !x.accepted)
  // Invoices: upcoming events first (soonest on top), past events after.
  const todayIso = new Date().toISOString().slice(0, 10)
  const invoices = withMeta.filter(x => x.accepted).sort((a, b) => {
    const da = a.est.event_date ?? '9999', db = b.est.event_date ?? '9999'
    const pa = da < todayIso, pb = db < todayIso
    if (pa !== pb) return pa ? 1 : -1
    return pa ? db.localeCompare(da) : da.localeCompare(db)
  })
  const visible = tab === 'pending' ? pending : invoices

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 20px) 20px 16px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.22em', color: '#5BBFBF', textTransform: 'uppercase', margin: '0 0 2px' }}>Blue Luna</p>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', letterSpacing: '-0.01em', margin: 0 }}>Estimates</h1>
          </div>
          <Link href="/studio/estimates/new" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#5BBFBF', color: '#0D0F0F',
            borderRadius: '10px', padding: '10px 16px',
            fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none',
          }}>
            <Plus size={16} /> New
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* iPhone-style segmented control — counts are small badges so the
            labels never wrap onto a second line. */}
        <div style={{ padding: '16px 20px 8px' }}>
          <div role="tablist" style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '3px' }}>
            {([
              { id: 'pending', label: 'Estimates', count: pending.length },
              { id: 'invoices', label: 'Invoices', count: invoices.length },
              { id: 'trash', label: null, count: trashed.length },
            ] as const).map(t => {
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  aria-label={t.label ?? 'Trash'}
                  onClick={() => { setTab(t.id); setOpenRowId(null) }}
                  style={{
                    flex: t.label ? 1 : '0 0 64px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '9px 6px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                    background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                    color: active ? 'white' : 'rgba(255,255,255,0.5)',
                    fontSize: '0.84rem', fontWeight: 600, whiteSpace: 'nowrap',
                  }}
                >
                  {t.label ?? <Trash2 size={15} />}
                  <span style={{
                    minWidth: '20px', padding: '1px 6px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700,
                    background: active ? 'rgba(91,191,191,0.22)' : 'rgba(255,255,255,0.08)',
                    color: active ? '#8DD4D4' : 'rgba(255,255,255,0.45)',
                  }}>{t.count}</span>
                </button>
              )
            })}
          </div>
          {tab !== 'trash' && visible.length > 0 && (
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', margin: '10px 2px 0' }}>Swipe left on a row to delete.</p>
          )}
        </div>

        {tab === 'trash' ? (
          loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>Loading…</p>
            </div>
          ) : trashed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)' }}>Nothing in Trash.</p>
            </div>
          ) : (
            <div>
              {trashed.map((est, i) => (
                <div key={est.id} style={{ padding: '0 20px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                    padding: '14px 0',
                    borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.07)',
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{est.client_name || 'Untitled'}</p>
                      <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                        {fmt(Number(est.quoted_total))} · Deleted {est.deleted_at ? shortDate(est.deleted_at) : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => restoreEstimate(est.id)}
                      disabled={restoringId === est.id}
                      style={{ background: 'rgba(91,191,191,0.1)', border: '1px solid rgba(91,191,191,0.3)', borderRadius: '99px', padding: '8px 16px', color: '#5BBFBF', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', flexShrink: 0 }}
                    >
                      {restoringId === est.id ? 'Restoring…' : 'Restore'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>Loading…</p>
          </div>
        ) : estimates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FileText size={40} color="rgba(255,255,255,0.1)" style={{ marginBottom: '16px' }} />
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>No estimates yet</p>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.2)', marginBottom: '28px' }}>Create your first estimate to share with a client</p>
            <Link href="/studio/estimates/new" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#5BBFBF', color: '#0D0F0F',
              borderRadius: '12px', padding: '14px 24px',
              fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none',
            }}>
              <Plus size={16} /> Create First Estimate
            </Link>
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)' }}>
              {tab === 'pending' ? 'Nothing pending — everything sent has been accepted.' : 'No invoices yet — nothing has been accepted.'}
            </p>
          </div>
        ) : (
          <div>
            {visible.map(({ est, balance, accepted }, i) => {
              const inProgress = isInProgress(est)
              const s = STATUS_STYLES[displayStatus(est, accepted, balance)]
              const hasDiscount = balance.totalSavings > 0
              const fromTab = encodeURIComponent(tab)
              const href = inProgress ? `/studio/estimates/new?draft=${est.id}&fromTab=${fromTab}` : `/studio/estimates/${est.id}?fromTab=${fromTab}`
              const eventLabel = labelForEventType(est.event_type)
              const meta = inProgress
                ? `Tap to continue · Started ${shortDate(est.created_at)}`
                : [eventLabel, est.event_date ? eventDateLabel(est.event_date) : null].filter(Boolean).join(' · ')
              // Only say something the status dot doesn't already say.
              const owedLine = !balance.isPaidInFull && balance.totalPaid > 0 ? `${fmt(balance.amountOwed)} left` : null

              return (
                <SwipeRow
                  key={est.id}
                  actionLabel="Delete"
                  actionBusyLabel="Deleting…"
                  busy={deletingId === est.id}
                  onAction={() => confirmDelete(est.id)}
                  open={openRowId === est.id}
                  onOpenChange={o => { setOpenRowId(o ? est.id : null); setRowError(null) }}
                >
                  <Link href={href} style={{ display: 'block', padding: '0 20px', textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '15px 0',
                      borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.07)',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: '0.98rem', fontWeight: 600, color: 'white', margin: '0 0 4px', lineHeight: 1.3,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>{est.client_name || 'Untitled'}</p>
                        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                          <span style={{ color: s.color, fontWeight: 600, whiteSpace: 'nowrap' }}>{s.label}</span>
                          {meta && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>· {meta}</span>}
                        </p>
                        {rowError?.id === est.id && (
                          <p style={{ fontSize: '0.72rem', color: '#f87171', margin: '6px 0 0' }}>{rowError.message}</p>
                        )}
                      </div>
                      {!inProgress && (
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ margin: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '6px' }}>
                            {hasDiscount && <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>{fmt(balance.grossSubtotal)}</span>}
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>{fmt(balance.finalTotal)}</span>
                          </p>
                          {owedLine && (
                            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', margin: '3px 0 0', whiteSpace: 'nowrap' }}>{owedLine}</p>
                          )}
                        </div>
                      )}
                      <ChevronRight size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
                    </div>
                  </Link>
                </SwipeRow>
              )
            })}
          </div>
        )}
      </div>

      <StudioNav />
    </div>
  )
}
