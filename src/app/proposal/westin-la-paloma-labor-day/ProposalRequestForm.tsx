'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Check, Send } from 'lucide-react'
import { formatMoney, westinProposal } from '@/lib/proposals/westinLaPalomaLaborDay'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function ProposalRequestForm() {
  const [selectedPackageId, setSelectedPackageId] = useState('package-a')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const selectedPackage = westinProposal.packages.find(pkg => pkg.id === selectedPackageId) ?? westinProposal.packages[0]

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!termsAccepted) {
      setMessage('Please review the decor notes before requesting a package.')
      return
    }

    setStatus('sending')
    setMessage('')

    const res = await fetch('/api/proposals/westin-la-paloma-labor-day/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageId: selectedPackage.id,
        name,
        email,
        phone,
        notes,
        acceptedDisclosures: termsAccepted,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setStatus('error')
      setMessage(data.error ?? 'Could not send the request. Please contact Blue Luna Events directly.')
      return
    }

    setStatus('sent')
    setMessage('Request received. Blue Luna Events will confirm the final details and send the official estimate/payment link.')
  }

  return (
    <section id="request-package" style={{ background: '#0D0F0F', color: 'white', padding: '72px 24px' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(320px, 1.1fr)', gap: '48px', alignItems: 'start' }}>
        <div>
          <p style={{ color: '#5BBFBF', textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.72rem', fontWeight: 800, margin: '0 0 12px' }}>
            Select a Package
          </p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2.5rem, 7vw, 4.6rem)', lineHeight: 0.95, margin: '0 0 18px', fontWeight: 700 }}>
            Ready to move forward?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: '1rem', lineHeight: 1.75, margin: 0 }}>
            Choose the package that fits the direction best. Blue Luna Events will confirm final placement, timing, and logistics before sending the official estimate and payment link.
          </p>
        </div>

        <form onSubmit={submit} style={{ background: 'white', color: '#0D0F0F', borderRadius: '24px', padding: '24px', boxShadow: '0 24px 80px rgba(0,0,0,0.24)' }}>
          <div style={{ display: 'grid', gap: '10px', marginBottom: '22px' }}>
            {westinProposal.packages.map(pkg => {
              const active = pkg.id === selectedPackageId
              return (
                <button
                  type="button"
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id)}
                  style={{
                    textAlign: 'left',
                    border: active ? '1.5px solid #5BBFBF' : '1px solid #E5E7EB',
                    background: active ? 'rgba(91,191,191,0.08)' : '#FFFFFF',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>{pkg.name}</span>
                    <span style={{ fontWeight: 900, fontSize: '1rem' }}>{formatMoney(pkg.partnerPrice)}</span>
                  </span>
                  {pkg.badge && (
                    <span style={{ color: '#3A8F8F', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.66rem', fontWeight: 800 }}>
                      {pkg.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            <input required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={inputStyle} />
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" style={inputStyle} />
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes or changes you want Blue Luna to review" rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
          </div>

          <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', margin: '18px 0', color: '#667085', fontSize: '0.82rem', lineHeight: 1.45 }}>
            <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} style={{ marginTop: '3px' }} />
            <span>
              I reviewed the design/weather notes and understand final placement is subject to venue access, setup timing, and safe installation conditions.
            </span>
          </label>

          <button
            type="submit"
            disabled={status === 'sending' || status === 'sent'}
            style={{
              width: '100%',
              border: 0,
              borderRadius: '999px',
              background: status === 'sent' ? '#22c55e' : '#5BBFBF',
              color: '#0D0F0F',
              fontWeight: 900,
              fontSize: '0.95rem',
              padding: '15px 18px',
              cursor: status === 'sending' || status === 'sent' ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {status === 'sent' ? <Check size={17} /> : <Send size={17} />}
            {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Package Requested' : `Request ${selectedPackage.name.split(' - ')[0]}`}
          </button>

          {message && (
            <p style={{ color: status === 'error' ? '#B91C1C' : '#374151', fontSize: '0.82rem', lineHeight: 1.5, margin: '14px 0 0' }}>
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  )
}

const inputStyle: CSSProperties = {
  width: '100%',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  padding: '13px 14px',
  font: 'inherit',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
}
