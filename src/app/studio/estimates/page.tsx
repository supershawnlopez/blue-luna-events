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
}

type DisplayStatus = 'in_progress' | 'draft' | 'sent' | 'partial_paid' | 'paid_full' | 'declined' | 'owing'

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

export default function EstimatesList() {
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'invoices'>('pending')

  useEffect(() => {
    fetch('/api/studio/estimates')
      .then(res => res.json())
      .then(data => setEstimates(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  function discardInProgress(id: string) {
    setEstimates(prev => prev.filter(e => e.id !== id))
    fetch(`/api/studio/estimates/${id}`, { method: 'DELETE' }).catch(() => {})
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
        </div>

        {loading ? (
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
              const href = inProgress ? `/studio/estimates/new?draft=${est.id}` : `/studio/estimates/${est.id}`
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
                        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Tap to continue</p>
                      ) : (
                        <>
                          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                            {est.event_type}{est.event_date ? ` · ${est.event_date}` : ''}
                          </p>
                        </>
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
                  {inProgress && (
                    <button
                      onClick={() => discardInProgress(est.id)}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', padding: '6px', flexShrink: 0 }}
                      aria-label="Discard"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
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
