'use client'

import Link from 'next/link'
import { Plus, ChevronLeft, ChevronRight, FileText, Clock } from 'lucide-react'

type EstimateStatus = 'draft' | 'sent' | 'deposit_paid' | 'balance_paid' | 'completed' | 'declined'

type Estimate = {
  id: string
  client_name: string
  client_email: string
  event_type: string
  event_date?: string
  quoted_total: number
  status: EstimateStatus
  created_at: string
  share_token: string
  deposit_paid: boolean
  balance_paid: boolean
}

const STATUS_STYLES: Record<EstimateStatus, { label: string; bg: string; color: string }> = {
  draft:         { label: 'Draft',         bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' },
  sent:          { label: 'Sent',          bg: 'rgba(91,191,191,0.12)',  color: '#5BBFBF' },
  deposit_paid:  { label: 'Deposit Paid',  bg: 'rgba(91,191,191,0.2)',   color: '#8DD4D4' },
  balance_paid:  { label: 'Paid in Full',  bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
  completed:     { label: 'Complete',      bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
  declined:      { label: 'Declined',      bg: 'rgba(239,68,68,0.1)',    color: 'rgba(239,68,68,0.7)' },
}

function fmt(n: number) {
  return `$${n.toLocaleString()}`
}

export default function EstimatesList() {
  // This will be populated from Supabase once connected
  const estimates: Estimate[] = []

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ padding: '56px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Link href="/studio" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', display: 'flex', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              <ChevronLeft size={18} />
            </Link>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'white', letterSpacing: '-0.01em', flex: 1 }}>Estimates</h1>
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
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 24px 0' }}>
        {estimates.length === 0 ? (
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
              const s = STATUS_STYLES[est.status]
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
                      {est.deposit_paid ? (est.balance_paid ? 'Paid in full' : '50% deposit paid') : 'Unpaid'}
                    </p>
                  </div>
                  <ChevronRight size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(13,15,15,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '12px 0 env(safe-area-inset-bottom, 12px)',
        display: 'flex', zIndex: 100,
      }}>
        {[
          { href: '/studio/media', label: 'My Work' },
          { href: '/studio/estimates', label: 'Estimates', active: true },
          { href: '/studio/exports', label: 'Export' },
        ].map(({ href, label, active }) => (
          <Link key={href} href={href} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            textDecoration: 'none', color: active ? '#5BBFBF' : 'rgba(255,255,255,0.4)',
            fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            {label === 'My Work' ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              : label === 'Estimates' ? <FileText size={22} />
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/></svg>}
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
