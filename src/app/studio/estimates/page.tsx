'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, ChevronRight, FileText, Trash2 } from 'lucide-react'
import StudioNav from '@/components/studio/StudioNav'
import { computeBalance } from '@/lib/estimateBalance'
import { isAccepted } from '@/lib/documentLabel'

function paidLine(totalPaid: number, amountOwed: number, isPaidInFull: boolean) {
  if (isPaidInFull) return 'Paid in full'
  if (totalPaid > 0) return `${fmt(totalPaid)} paid · ${fmt(amountOwed)} left`
  return 'Unpaid'
}

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
  accepted_at?: string | null
  total_paid: number
  deleted_at?: string | null
}

type DisplayStatus = 'in_progress' | 'draft' | 'sent' | 'partial_paid' | 'paid_full' | 'declined' | 'owing'
type EstimateTab = 'pending' | 'invoices' | 'trash'

const STATUS_STYLES: Record<DisplayStatus, { label: string; bg: string; color: string }> = {
  in_progress:  { label: 'In Progress', bg: 'rgba(201,169,110,0.15)', color: '#C9A96E' },
  draft:        { label: 'Draft',       bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' },
  sent:         { label: 'Sent',        bg: 'rgba(91,191,191,0.12)',  color: '#5BBFBF' },
  owing:        { label: 'Owing',       bg: 'rgba(201,169,110,0.15)', color: '#C9A96E' },
  partial_paid: { label: 'Partial',     bg: 'rgba(91,191,191,0.2)',   color: '#8DD4D4' },
  paid_full:    { label: 'Paid in Full', bg: 'rgba(34,197,94,0.15)',  color: '#4ade80' },
  declined:     { label: 'Declined',    bg: 'rgba(239,68,68,0.1)',    color: 'rgba(239,68,68,0.7)' },
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

function fmt(n: number) {
  return `$${n.toLocaleString()}`
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
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
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

  // Every row gets a delete option (Shawn's ask, 2026-08-16) — gated behind
  // an inline confirm since a real client estimate isn't as disposable as an
  // abandoned $0 draft. This is a soft-delete (see the API route) so it can
  // always be undone from the Trash tab — the API also refuses to delete
  // anything with recorded payments, surfaced here instead of silently
  // doing nothing.
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
    setConfirmingId(null)
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
  const invoices = withMeta.filter(x => x.accepted)
  const visible = tab === 'pending' ? pending : invoices

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 20px) 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
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

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 24px 0' }}>
        {/* Pending Estimates / Invoices tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          <button
            onClick={() => setTab('pending')}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer',
              border: tab === 'pending' ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.1)',
              background: tab === 'pending' ? 'rgba(91,191,191,0.1)' : 'rgba(255,255,255,0.03)',
              color: tab === 'pending' ? '#5BBFBF' : 'rgba(255,255,255,0.5)',
              fontSize: '0.82rem', fontWeight: 700,
            }}
          >
            Pending Estimates ({pending.length})
          </button>
          <button
            onClick={() => setTab('invoices')}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer',
              border: tab === 'invoices' ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.1)',
              background: tab === 'invoices' ? 'rgba(91,191,191,0.1)' : 'rgba(255,255,255,0.03)',
              color: tab === 'invoices' ? '#5BBFBF' : 'rgba(255,255,255,0.5)',
              fontSize: '0.82rem', fontWeight: 700,
            }}
          >
            Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setTab('trash')}
            style={{
              padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
              border: tab === 'trash' ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.1)',
              background: tab === 'trash' ? 'rgba(91,191,191,0.1)' : 'rgba(255,255,255,0.03)',
              color: tab === 'trash' ? '#5BBFBF' : 'rgba(255,255,255,0.5)',
              fontSize: '0.82rem', fontWeight: 700, flexShrink: 0,
            }}
          >
            <Trash2 size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{trashed.length}
          </button>
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
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden' }}>
              {trashed.map((est, i) => (
                <div key={est.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                  padding: '16px 18px',
                  borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', margin: '0 0 2px' }}>{est.client_name || 'Untitled'}</p>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                      {fmt(Number(est.quoted_total))} · Deleted {est.deleted_at ? shortDate(est.deleted_at) : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => restoreEstimate(est.id)}
                    disabled={restoringId === est.id}
                    style={{ background: 'rgba(91,191,191,0.1)', border: '1px solid rgba(91,191,191,0.3)', borderRadius: '8px', padding: '8px 14px', color: '#5BBFBF', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', flexShrink: 0 }}
                  >
                    {restoringId === est.id ? 'Restoring…' : 'Restore'}
                  </button>
                </div>
              ))}
            </div>
          )
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>Loading…</p>
          </div>
        ) : estimates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
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
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)' }}>
              {tab === 'pending' ? 'Nothing pending — everything sent has been accepted.' : 'No invoices yet — nothing has been accepted.'}
            </p>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden' }}>
            {visible.map(({ est, balance, accepted }, i) => {
              const inProgress = isInProgress(est)
              const s = STATUS_STYLES[displayStatus(est, accepted, balance)]
              const hasDiscount = balance.discountAmount > 0
              const fromTab = encodeURIComponent(tab)
              const href = inProgress ? `/studio/estimates/new?draft=${est.id}&fromTab=${fromTab}` : `/studio/estimates/${est.id}?fromTab=${fromTab}`
              const confirming = confirmingId === est.id

              if (confirming) {
                return (
                  <div key={est.id} style={{
                    padding: '16px 18px',
                    borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(239,68,68,0.06)',
                  }}>
                    <p style={{ fontSize: '0.85rem', color: 'white', marginBottom: '10px' }}>
                      Delete {est.client_name || 'this'} estimate? This can't be undone.
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setConfirmingId(null)} disabled={deletingId === est.id} style={{ flex: 1, padding: '9px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', cursor: 'pointer' }}>
                        Cancel
                      </button>
                      <button onClick={() => confirmDelete(est.id)} disabled={deletingId === est.id} style={{ flex: 1, padding: '9px', borderRadius: '8px', background: '#ef4444', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                        {deletingId === est.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )
              }

              return (
                <div key={est.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '16px 18px',
                  borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)',
                }}>
                  <Link href={href} style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0, textDecoration: 'none' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white', margin: 0 }}>{est.client_name || 'Untitled'}</p>
                        <span style={{ padding: '2px 8px', borderRadius: '99px', background: s.bg, color: s.color, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                          {s.label}
                        </span>
                      </div>
                      {inProgress ? (
                        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Tap to continue · Added {shortDate(est.created_at)}</p>
                      ) : (
                        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                          {est.event_type}{est.event_date ? ` · ${est.event_date}` : ''} · Added {shortDate(est.created_at)}
                        </p>
                      )}
                      {rowError?.id === est.id && (
                        <p style={{ fontSize: '0.72rem', color: '#f87171', margin: '4px 0 0' }}>{rowError.message}</p>
                      )}
                    </div>
                    {!inProgress && (
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {hasDiscount ? (
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', justifyContent: 'flex-end', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>{fmt(balance.subtotal)}</span>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>{fmt(balance.finalTotal)}</span>
                          </div>
                        ) : (
                          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '2px' }}>{fmt(balance.finalTotal)}</p>
                        )}
                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                          {paidLine(balance.totalPaid, balance.amountOwed, balance.isPaidInFull)}
                        </p>
                      </div>
                    )}
                    <ChevronRight size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
                  </Link>
                  <button
                    onClick={() => { setConfirmingId(est.id); setRowError(null) }}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', padding: '6px', flexShrink: 0 }}
                    aria-label="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <StudioNav />
    </div>
  )
}
