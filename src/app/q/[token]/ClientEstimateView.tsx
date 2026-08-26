'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { loadStripe } from '@stripe/stripe-js'
import { Check, Copy, CreditCard, Download, MessageCircle, Phone, PartyPopper } from 'lucide-react'
import { SITE_CONFIG, labelForAddOn, labelForEventType } from '@/lib/config'
import { computeBalance, type EstimatePayment } from '@/lib/estimateBalance'
import { getDocumentLabel, isAccepted } from '@/lib/documentLabel'

type Estimate = {
  id: string
  client_name: string
  event_type?: string
  event_date?: string
  venue?: string
  package_name?: string
  add_ons?: string
  custom_items?: { label: string; description?: string; price: number }[]
  quoted_total: number
  discount_type?: string | null
  discount_value?: number | null
  discount_note?: string | null
  deposit_type?: string | null
  deposit_value?: number | null
  accepted_at?: string | null
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

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = publishableKey?.startsWith('pk_') ? loadStripe(publishableKey) : null

export default function ClientEstimateView({ estimate: initialEstimate, token }: { estimate: Estimate; token: string }) {
  const [est, setEst] = useState(initialEstimate)
  const [paying, setPaying] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'checking' | 'confirmed' | 'processing' | 'error'>('idle')
  const [paymentStatusMessage, setPaymentStatusMessage] = useState('')
  const first = firstName(est.client_name)
  const addOns = parseAddOns(est.add_ons)
  const customItems = est.custom_items ?? []
  const balance = computeBalance(est, est.payments)
  const hasPaidAnything = balance.totalPaid > 0
  const accepted = isAccepted(est, balance.totalPaid)
  const docLabel = getDocumentLabel(accepted, balance)
  const isFullPaymentDue = hasPaidAnything || balance.suggestedDeposit >= balance.amountOwed
  const paymentAmount = isFullPaymentDue ? balance.amountOwed : balance.suggestedDeposit
  const paymentMode = isFullPaymentDue ? 'balance' : 'deposit'
  const paymentLabel = isFullPaymentDue ? `Pay Now — ${fmt(paymentAmount)}` : `Pay Deposit — ${fmt(paymentAmount)}`

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    const checkoutComplete = params.get('checkout') === 'complete'
    if (!checkoutComplete || !sessionId) return

    let cancelled = false
    let attempts = 0

    async function checkPayment() {
      attempts += 1
      setPaymentStatus('checking')
      setPaymentStatusMessage('Checking your payment...')

      try {
        const res = await fetch('/api/stripe/estimate-payment-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, token }),
        })
        const data = await res.json()
        if (cancelled) return

        if (res.ok && (data.status === 'recorded' || data.status === 'already_recorded')) {
          setPaymentStatus('confirmed')
          setPaymentStatusMessage(`Payment received${data.amount ? `: ${fmt(Number(data.amount))}` : ''}. Updating your invoice...`)
          setTimeout(() => window.location.replace(`/q/${token}`), 1400)
          return
        }

        if (res.ok && data.status === 'processing' && attempts < 10) {
          setPaymentStatus('processing')
          setPaymentStatusMessage('Your card payment is still processing. This page will keep checking.')
          setTimeout(checkPayment, 3000)
          return
        }

        setPaymentStatus('error')
        setPaymentStatusMessage('We could not confirm the payment yet. Please text Monica before trying again.')
      } catch {
        if (cancelled) return
        if (attempts < 10) {
          setPaymentStatus('processing')
          setPaymentStatusMessage('Still checking your payment. Please keep this page open.')
          setTimeout(checkPayment, 3000)
          return
        }
        setPaymentStatus('error')
        setPaymentStatusMessage('We could not confirm the payment yet. Please text Monica before trying again.')
      }
    }

    checkPayment()

    return () => {
      cancelled = true
    }
  }, [token])

  async function handleAccept() {
    setAccepting(true)
    const res = await fetch(`/api/q/${token}/accept`, { method: 'POST' })
    const data = await res.json()
    setAccepting(false)
    if (res.ok && data.accepted_at) setEst(prev => ({ ...prev, accepted_at: data.accepted_at }))
  }

  async function handlePay() {
    if (stripePromise) {
      setShowCheckout(true)
      return
    }

    setPaying(true)
    const res = await fetch('/api/stripe/estimate-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estimateId: est.id, mode: paymentMode, uiMode: 'hosted' }),
    })
    const data = await res.json()
    if (data.url) window.location.assign(data.url)
    else setPaying(false)
  }

  async function copyInvoiceLink() {
    await navigator.clipboard.writeText(window.location.href)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2500)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2', fontFamily: 'Inter, -apple-system, sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* Header */}
      <div style={{ background: '#0D0F0F', padding: '36px 24px' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Image src="/images/logo-white.png" alt="Blue Luna Events" width={220} height={70} style={{ height: '54px', width: 'auto', objectFit: 'contain', display: 'block', marginBottom: '8px' }} priority />
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Your {docLabel}</p>
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
            {balance.isPaidInFull
              ? <>Hi {first}! Here&apos;s your receipt. ✨</>
              : accepted
                ? <>Hi {first}! Here&apos;s your invoice. ✨</>
                : <>Hi {first}! Here&apos;s your estimate. ✨</>}
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
            {balance.isPaidInFull
              ? "You're all paid up — thank you!"
              : accepted
                ? 'Review your remaining balance below. Monica will confirm final details as your date approaches.'
                : "Review your selections below. When you're ready, accept your estimate to lock in your date."}
          </p>
        </div>

        {/* Status banner */}
        {paymentStatus !== 'idle' && !balance.isPaidInFull && (
          <div style={{ background: paymentStatus === 'error' ? 'rgba(248,113,113,0.1)' : 'rgba(91,191,191,0.1)', border: `1px solid ${paymentStatus === 'error' ? 'rgba(248,113,113,0.25)' : 'rgba(91,191,191,0.25)'}`, borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Check size={18} color={paymentStatus === 'error' ? '#f87171' : '#5BBFBF'} />
            <p style={{ fontSize: '0.85rem', color: '#0D0F0F', fontWeight: 600, margin: 0 }}>{paymentStatusMessage}</p>
          </div>
        )}
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
        {accepted && !hasPaidAnything && (
          <div style={{ background: 'rgba(91,191,191,0.1)', border: '1px solid rgba(91,191,191,0.25)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PartyPopper size={18} color="#5BBFBF" />
            <p style={{ fontSize: '0.85rem', color: '#0D0F0F', fontWeight: 600, margin: 0 }}>{isFullPaymentDue ? `You're all set! Complete your ${fmt(paymentAmount)} payment below.` : 'You&apos;re all set! Ready to lock in your date? Pay your deposit below.'}</p>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: (addOns.length > 0 || customItems.length > 0) ? '1px solid #F3F4F6' : 'none' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#0D0F0F', marginBottom: '2px' }}>{est.package_name} Package</p>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>Base package</p>
                </div>
              </div>
            )}
            {addOns.map((a, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderBottom: (i < addOns.length - 1 || customItems.length > 0) ? '1px solid #F3F4F6' : 'none' }}>
                <p style={{ fontSize: '13px', color: '#374151', margin: 0 }}>{labelForAddOn(a)}</p>
                <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>Add-on</p>
              </div>
            ))}
            {customItems.map((it, i) => (
              <div key={`c${i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 20px', borderBottom: i < customItems.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <div style={{ minWidth: 0, marginRight: '12px' }}>
                  <p style={{ fontSize: '13px', color: '#374151', margin: 0 }}>{it.label}</p>
                  {it.description && (
                    <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '2px 0 0' }}>{it.description}</p>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0, flexShrink: 0 }}>{fmt(it.price)}</p>
              </div>
            ))}
            {!est.package_name && addOns.length === 0 && customItems.length === 0 && (
              <div style={{ padding: '14px 20px' }}>
                <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>Custom {docLabel.toLowerCase()} — see pricing below.</p>
              </div>
            )}
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

        {/* Accept / Payment CTA */}
        {!accepted && (
          <button
            onClick={handleAccept}
            disabled={accepting}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              background: accepting ? '#9CA3AF' : '#5BBFBF', color: '#0D0F0F',
              border: 'none', borderRadius: '14px', padding: '18px',
              fontSize: '1rem', fontWeight: 700, cursor: accepting ? 'not-allowed' : 'pointer',
              boxShadow: accepting ? 'none' : '0 6px 24px rgba(91,191,191,0.35)',
              marginBottom: '12px',
            }}
          >
            <Check size={18} />
            {accepting ? 'One sec…' : 'Accept This Estimate'}
          </button>
        )}
        {accepted && !balance.isPaidInFull && (
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
            {paying ? 'Opening secure Blue Luna checkout…' : paymentLabel}
          </button>
        )}

        {showCheckout && (
          <EmbeddedCheckout
            estimateId={est.id}
            mode={paymentMode}
            onClose={() => setShowCheckout(false)}
          />
        )}

        {accepted && !balance.isPaidInFull && (
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '16px', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D0F0F', margin: '0 0 4px' }}>Company browser blocking the payment?</p>
            <p style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.55, margin: '0 0 12px' }}>Some protected work browsers block secure card checkout. Copy this invoice link and open it in regular Chrome or Safari, or text Monica and she&apos;ll help right away.</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={copyInvoiceLink}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#0D0F0F', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 14px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
              >
                {linkCopied ? <Check size={14} /> : <Copy size={14} />}
                {linkCopied ? 'Copied' : 'Copy Invoice Link'}
              </button>
              <a href={`sms:${SITE_CONFIG.phoneRaw}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'white', border: '1.5px solid #E5E7EB', color: '#374151', borderRadius: '10px', padding: '10px 14px', fontWeight: 600, fontSize: '0.78rem', textDecoration: 'none' }}>
                <MessageCircle size={14} /> Text Monica
              </a>
            </div>
          </div>
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
          <Download size={16} /> Download {docLabel} as PDF
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

function EmbeddedCheckout({ estimateId, mode, onClose }: { estimateId: string; mode: 'deposit' | 'balance'; onClose: () => void }) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const checkoutRef = useRef<{ destroy: () => void } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function mountCheckout() {
      try {
        const stripe = await stripePromise
        if (!stripe || !mountRef.current) throw new Error('Payment setup is unavailable.')

        const checkout = await stripe.createEmbeddedCheckoutPage({
          fetchClientSecret: async () => {
            const res = await fetch('/api/stripe/estimate-checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ estimateId, mode, uiMode: 'embedded' }),
            })
            const data = await res.json()
            if (!res.ok || !data.clientSecret) throw new Error(data.error ?? 'Could not start payment.')
            return data.clientSecret
          },
        })

        if (!active || !mountRef.current) {
          checkout.destroy()
          return
        }

        checkoutRef.current = checkout
        checkout.mount(mountRef.current)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not start payment.')
      }
    }

    mountCheckout()

    return () => {
      active = false
      checkoutRef.current?.destroy()
      checkoutRef.current = null
    }
  }, [estimateId, mode])

  return (
    <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '16px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D0F0F', margin: 0 }}>Secure Blue Luna card checkout</p>
        <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#6B7280', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Close</button>
      </div>
      {error ? (
        <p style={{ fontSize: '12px', color: '#B91C1C', lineHeight: 1.55, margin: 0 }}>{error} If you are using a protected work browser, copy the invoice link below and open it in regular Chrome or Safari.</p>
      ) : (
        <div ref={mountRef} style={{ minHeight: '520px' }} />
      )}
    </div>
  )
}
