'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Copy, Check, ExternalLink, Download } from 'lucide-react'
import StudioNav from '@/components/studio/StudioNav'

type Estimate = {
  id: string
  client_name: string
  client_email: string
  client_phone?: string | null
  event_type?: string | null
  event_date?: string | null
  venue?: string | null
  package_name?: string | null
  add_ons?: string | null
  quoted_total: number
  deposit_amount: number
  balance_amount: number
  notes?: string | null
  status: string
  share_token: string
  deposit_paid: boolean
  deposit_paid_at?: string | null
  balance_paid: boolean
  balance_paid_at?: string | null
}

function fmt(n: number) {
  return `$${n.toLocaleString()}`
}

function parseAddOns(raw?: string | null): string[] {
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <p style={{ width: '90px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', flexShrink: 0, margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
      <p style={{ fontSize: '13px', fontWeight: 500, color: 'white', margin: 0 }}>{value}</p>
    </div>
  )
}

export default function EstimateDetail() {
  const params = useParams()
  const id = params.id as string
  const [est, setEst] = useState<Estimate | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/studio/estimates/${id}`)
      .then(res => res.ok ? res.json() : null)
      .then(setEst)
      .finally(() => setLoading(false))
  }, [id])

  async function markPaid(field: 'deposit' | 'balance', paid: boolean) {
    setSaving(true)
    const body = paid
      ? { [`${field}_paid`]: true, [`${field}_paid_at`]: new Date().toISOString() }
      : { [`${field}_paid`]: false, [`${field}_paid_at`]: null }
    const res = await fetch(`/api/studio/estimates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) setEst(await res.json())
    setSaving(false)
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

        {/* Share link */}
        <div style={{ background: 'rgba(91,191,191,0.06)', border: '1px solid rgba(91,191,191,0.2)', borderRadius: '14px', padding: '16px 18px', marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#5BBFBF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Client Share Link</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <p style={{ flex: 1, fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', wordBreak: 'break-all', margin: 0 }}>{shareUrl}</p>
            <button onClick={copyLink} style={{ background: copied ? '#5BBFBF' : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', flexShrink: 0 }}>
              {copied ? <Check size={15} color="#0D0F0F" /> : <Copy size={15} color="rgba(255,255,255,0.6)" />}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#5BBFBF', color: '#0D0F0F', borderRadius: '10px', padding: '10px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
              Open <ExternalLink size={13} />
            </a>
            <a href={`/api/studio/estimates/${est.id}/pdf`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', borderRadius: '10px', padding: '10px', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none' }}>
              PDF <Download size={13} />
            </a>
          </div>
        </div>

        {/* Event details */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px 18px', marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Details</p>
          <Field label="Email" value={est.client_email} />
          <Field label="Phone" value={est.client_phone} />
          <Field label="Event" value={est.event_type} />
          <Field label="Date" value={est.event_date} />
          <Field label="Venue" value={est.venue} />
          <Field label="Notes" value={est.notes} />
        </div>

        {/* Selection */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px 18px', marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Selection</p>
          {est.package_name && (
            <p style={{ fontSize: '0.9rem', color: 'white', fontWeight: 600, marginBottom: '6px' }}>{est.package_name} Package</p>
          )}
          {addOns.map((a, i) => (
            <p key={i} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', margin: '4px 0' }}>+ {a}</p>
          ))}
        </div>

        {/* Payment */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', margin: 0 }}>Total</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>{fmt(est.quoted_total)}</p>
          </div>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', marginBottom: '2px' }}>Deposit</p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{fmt(est.deposit_amount)}{est.deposit_paid_at ? ` · ${new Date(est.deposit_paid_at).toLocaleDateString()}` : ''}</p>
            </div>
            <button
              onClick={() => markPaid('deposit', !est.deposit_paid)}
              disabled={saving}
              style={{
                background: est.deposit_paid ? 'rgba(91,191,191,0.15)' : 'rgba(255,255,255,0.06)',
                border: est.deposit_paid ? '1px solid #5BBFBF' : '1px solid rgba(255,255,255,0.12)',
                color: est.deposit_paid ? '#5BBFBF' : 'rgba(255,255,255,0.5)',
                borderRadius: '8px', padding: '7px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
              }}
            >
              {est.deposit_paid ? '✓ Paid' : 'Mark Paid'}
            </button>
          </div>
          <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', marginBottom: '2px' }}>Balance</p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{fmt(est.balance_amount)}{est.balance_paid_at ? ` · ${new Date(est.balance_paid_at).toLocaleDateString()}` : ''}</p>
            </div>
            <button
              onClick={() => markPaid('balance', !est.balance_paid)}
              disabled={saving || !est.deposit_paid}
              style={{
                background: est.balance_paid ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                border: est.balance_paid ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.12)',
                color: est.balance_paid ? '#4ade80' : est.deposit_paid ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
                borderRadius: '8px', padding: '7px 12px', fontSize: '0.75rem', fontWeight: 700,
                cursor: est.deposit_paid ? 'pointer' : 'not-allowed',
              }}
            >
              {est.balance_paid ? '✓ Paid' : 'Mark Paid'}
            </button>
          </div>
        </div>

        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
          "Mark Paid" is for Zelle, check, or cash payments Monica takes directly. Card payments through the client link update automatically.
        </p>
      </div>

      <StudioNav />
    </div>
  )
}
