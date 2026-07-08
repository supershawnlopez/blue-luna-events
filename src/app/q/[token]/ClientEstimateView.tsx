'use client'

import { useState } from 'react'
import { Check, CreditCard, Download, Phone } from 'lucide-react'
import { SITE_CONFIG, labelForAddOn, labelForEventType } from '@/lib/config'
import { computeBalance, type EstimatePayment } from '@/lib/estimateBalance'

type Estimate = {
  id: string
  client_name: string
  client_email: string
  client_phone?: string
  event_type?: string
  event_date?: string
  venue?: string
  package_name?: string
  add_ons?: string
  quoted_total: number
  discount_type?: string | null
  discount_value?: number | null
  discount_note?: string | null
  status: string
  share_token: string
  payments: EstimatePayment[]
}

function fmt(n: number) {
  return `$${n.toLocaleString()}`
}

function firstName(name: string) {
  return name.trim().split(' ')[0]
}

function parseAddOns(raw?: string): string[] {
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

export default function ClientEstimateView({ estimate: est }: { estimate: Estimate }) {
  const [paying, setPaying] = useState(false)
  const first = firstName(est.client_name)
  const addOns = parseAddOns(est.add_ons)
  const balance = computeBalance(est, est.payments)
  const hasPaidAnything = balance.totalPaid > 0

  async function handlePay() {
    setPaying(true)
    const res = await fetch('/api/stripe/estimate-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estimateId: est.id, mode: hasPaidAnything ? 'balance' : 'deposit' }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setPaying(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2', fontFamily: 'Inter, -apple-system, sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* Header */}
      <div style={{ background: '#0D0F0F', padding: '28px 24px' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', color: '#5BBFBF', textTransform: 'uppercase', margin: 0 }}>Blue Luna Events</p>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Your Estimate</p>
          </div>
          <a href={`/api/studio/estimates/${est.id}/pdf`} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 14px', color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
            <Download size={14} /> PDF
          </a>
        </div>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '28px 20px 60px' }}>

        {/* Greeting */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0D0F0F', marginBottom: '6px', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Hi {first}! Here&apos;s your estimate. ✨
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
            {balance.isPaidInFull
              ? "You're all paid up — thank you!"
              : hasPaidAnything
                ? 'Review your remaining balance below. Monica will confirm final details as your date approaches.'
                : "Review your selections below. When you're ready, pay the deposit to lock in your date — Monica will confirm within 2 hours."}
          </p>
        </div>

        {/* Status banner */}
        {balance.isPaidInFull && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Check size={18} color="#22c55e" />
            <p style={{ fontSize: '0.85rem', color: '#0D0F0F', fontWeight: 600, margin: 0 }}>Paid in full — you&apos;re all set! Monica will see you on {est.event_date ?? 'your event day'}.</p>
          </div>
        )}
        {hasPaidAnything && !balance.isPaidInFull && (
          <div style={{ background: 'rgba(91,191,191,0.1)', border: '1px solid rgba(91,191,191,0.25)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Check size={18} color="#5BBFBF" />
            <p style={{ fontSize: '0.85rem', color: '#0D0F0F', fontWeight: 600, margin: 0 }}>{fmt(balance.totalPaid)} received so far. {fmt(balance.amountOwed)} remaining.</p>
          </div>
        )}

        {/* Event details card */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9CA3AF', margin: 0 }}>Event Details</p>
          </div>
          <div style={{ padding: '4px 0' }}>
            {([
              { label: 'Name', value: est.client_name },
              est.event_type ? { label: 'Event', value: labelForEventType(est.event_type) } : null,
              est.event_date ? { label: 'Date', value: est.event_date } : null,
              est.venue ? { label: 'Venue', value: est.venue } : null,
            ].filter((row): row is { label: string; value: string } => row !== null)).map((row, i) => (
              <div key={i} style={{ display: 'flex', padding: '10px 20px', borderBottom: '1px solid #F9FAFB' }}>
                <p style={{ width: '90px', fontSize: '12px', fontWeight: 600, color: '#9CA3AF', flexShrink: 0, margin: 0 }}>{row.label}</p>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#0D0F0F', margin: 0 }}>{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Line items */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9CA3AF', margin: 0 }}>Your Selection</p>
          </div>
          <div>
            {est.package_name && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: addOns.length > 0 ? '1px solid #F3F4F6' : 'none' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#0D0F0F', marginBottom: '2px' }}>{est.package_name} Package</p>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>Base package</p>
                </div>
              </div>
            )}
            {addOns.map((a, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderBottom: i < addOns.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <p style={{ fontSize: '13px', color: '#374151', margin: 0 }}>{labelForAddOn(a)}</p>
                <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>Add-on</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing summary */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ padding: '4px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #F3F4F6' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#0D0F0F', margin: 0 }}>Subtotal</p>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#0D0F0F', margin: 0 }}>{fmt(balance.subtotal)}</p>
            </div>
            {balance.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #F3F4F6' }}>
                <p style={{ fontSize: '13px', color: '#374151', margin: 0 }}>Discount{est.discount_note ? ` — ${est.discount_note}` : ''}</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#5BBFBF', margin: 0 }}>-{fmt(balance.discountAmount)}</p>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #F3F4F6' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D0F0F', margin: 0 }}>Total</p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#0D0F0F', margin: 0 }}>{fmt(balance.finalTotal)}</p>
            </div>
            {hasPaidAnything && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #F3F4F6' }}>
                <p style={{ fontSize: '13px', color: '#374151', margin: 0 }}>Paid so far</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#0D0F0F', margin: 0 }}>{fmt(balance.totalPaid)}</p>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', background: balance.isPaidInFull ? 'rgba(34,197,94,0.06)' : 'rgba(201,169,110,0.06)' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D0F0F', margin: 0 }}>{balance.isPaidInFull ? 'Status' : 'Amount Due'}</p>
              <p style={{ fontSize: '16px', fontWeight: 700, color: balance.isPaidInFull ? '#22c55e' : '#0D0F0F', margin: 0 }}>{balance.isPaidInFull ? 'Paid in Full ✓' : fmt(balance.amountOwed)}</p>
            </div>
          </div>
        </div>

        {/* Payment CTA */}
        {!balance.isPaidInFull && (
          <button
            onClick={handlePay}
            disabled={paying}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              background: paying ? '#9CA3AF' : '#5BBFBF', color: '#0D0F0F',
              border: 'none', borderRadius: '14px', padding: '18px',
              fontSize: '1rem', fontWeight: 700, cursor: paying ? 'not-allowed' : 'pointer',
              boxShadow: paying ? 'none' : '0 6px 24px rgba(91,191,191,0.35)',
              marginBottom: '12px',
            }}
          >
            <CreditCard size={18} />
            {paying ? 'Redirecting to payment…' : hasPaidAnything ? `Pay Remaining Balance — ${fmt(balance.amountOwed)}` : `Pay Deposit — ${fmt(balance.suggestedDeposit)}`}
          </button>
        )}

        {/* Download PDF */}
        <a
          href={`/api/studio/estimates/${est.id}/pdf`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%',
            background: 'transparent', border: '1.5px solid #E5E7EB', borderRadius: '14px', padding: '14px',
            fontSize: '0.9rem', fontWeight: 600, color: '#374151', textDecoration: 'none', marginBottom: '24px',
          }}
        >
          <Download size={16} /> Download Quote as PDF
        </a>

        {/* Monica contact */}
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D0F0F', marginBottom: '4px' }}>Questions? Monica is here.</p>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>She personally handles every event.</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <a href={`tel:${SITE_CONFIG.phoneRaw}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#0D0F0F', color: 'white', borderRadius: '10px', padding: '10px 18px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
              <Phone size={14} /> Call Monica
            </a>
            <a href={`sms:${SITE_CONFIG.phoneRaw}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'white', border: '1.5px solid #E5E7EB', color: '#374151', borderRadius: '10px', padding: '10px 18px', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none' }}>
              💬 Text
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
