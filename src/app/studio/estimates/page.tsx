'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, ChevronRight, FileText } from 'lucide-react'
import StudioNav from '@/components/studio/StudioNav'
import { computeBalance } from '@/lib/estimateBalance'

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
  total_paid: number
}

type DisplayStatus = 'draft' | 'sent' | 'partial_paid' | 'paid_full' | 'declined'

const STATUS_STYLES: Record<DisplayStatus, { label: string; bg: string; color: string }> = {
  draft:        { label: 'Draft',       bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' },
  sent:         { label: 'Sent',        bg: 'rgba(91,191,191,0.12)',  color: '#5BBFBF' },
  partial_paid: { label: 'Partial',     bg: 'rgba(91,191,191,0.2)',   color: '#8DD4D4' },
  paid_full:    { label: 'Paid in Full', bg: 'rgba(34,197,94,0.15)',  color: '#4ade80' },
  declined:     { label: 'Declined',    bg: 'rgba(239,68,68,0.1)',    color: 'rgba(239,68,68,0.7)' },
}

function displayStatus(est: Estimate): DisplayStatus {
  if (est.status === 'declined') return 'declined'
  const balance = computeBalance(est, [{ id: '', method: '', created_at: '', amount: est.total_paid }])
  if (balance.isPaidInFull) return 'paid_full'
  if (balance.totalPaid > 0) return 'partial_paid'
  if (est.status === 'sent') return 'sent'
  return 'draft'
}

function fmt(n: number) {
  return `$${n.toLocaleString()}`
}

export default function EstimatesList() {
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/studio/estimates')
      .then(res => res.json())
      .then(data => setEstimates(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

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
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {estimates.map(est => {
              const s = STATUS_STYLES[displayStatus(est)]
              return (
                <Link key={est.id} href={`/studio/estimates/${est.id}`} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px', padding: '16px 18px', textDecoration: 'none',
                }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '10px',
                    background: 'rgba(91,191,191,0.1)', border: '1px solid rgba(91,191,191,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <FileText size={18} color="#5BBFBF" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white', margin: 0 }}>{est.client_name}</p>
                      <span style={{ padding: '2px 8px', borderRadius: '99px', background: s.bg, color: s.color, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                        {s.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                      {est.event_type}{est.event_date ? ` · ${est.event_date}` : ''}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '2px' }}>{fmt(est.quoted_total)}</p>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                      {est.total_paid > 0 ? `${fmt(est.total_paid)} paid` : 'Unpaid'}
                    </p>
                  </div>
                  <ChevronRight size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <StudioNav />
    </div>
  )
}
