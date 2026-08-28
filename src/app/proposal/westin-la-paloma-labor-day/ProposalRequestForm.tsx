'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Check, Download, Send } from 'lucide-react'
import { formatMoney, westinProposal } from '@/lib/proposals/westinLaPalomaLaborDay'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function ProposalRequestForm() {
  const [selectedPackageId, setSelectedPackageId] = useState('package-a')
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
    setMessage('Package direction received. Blue Luna Events will confirm final details before preparing the official estimate and payment link.')
  }

  return (
    <section id="request-package" className="proposal-request">
      <div className="request-shell">
        <div>
          <p className="request-kicker">
            Select a Package
          </p>
          <h2>
            Choose a package direction.
          </h2>
          <p className="request-copy">
            Choose the package that fits the direction best. Blue Luna Events will confirm final placement, timing, and logistics before preparing the official estimate and payment link.
          </p>
        </div>

        <form onSubmit={submit} className="request-form">
          <div className="package-options">
            {westinProposal.packages.map(pkg => {
              const active = pkg.id === selectedPackageId
              return (
                <button
                  type="button"
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={active ? 'package-option active' : 'package-option'}
                >
                  <span className="package-option-main">
                    <span>{pkg.name}</span>
                    <strong>{formatMoney(pkg.partnerPrice)}</strong>
                  </span>
                  {pkg.badge && (
                    <span className="package-option-badge">
                      {pkg.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="field-grid">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes or changes for Blue Luna to review" rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
          </div>

          <label className="terms-check">
            <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} />
            <span>
              I reviewed the design/weather notes and understand final placement is subject to venue access, setup timing, and safe installation conditions.
            </span>
          </label>

          <button
            type="submit"
            disabled={status === 'sending' || status === 'sent'}
            className={status === 'sent' ? 'request-submit sent' : 'request-submit'}
          >
            {status === 'sent' ? <Check size={17} /> : <Send size={17} />}
            {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Package Direction Sent' : `Submit ${selectedPackage.name.split(' - ')[0]} Direction`}
          </button>

          {message && (
            <p className={status === 'error' ? 'form-message error' : 'form-message'}>
              {message}
            </p>
          )}

          <div className="bottom-pdf">
            <p>Need to share the proposal internally?</p>
            <a href={westinProposal.pdfPath} download>
              <Download size={16} />
              Download PDF
            </a>
          </div>
        </form>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .proposal-request {
          background: #0d0f0f;
          color: white;
          padding: 72px 24px;
        }
        .request-shell {
          max-width: 1120px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(420px, 1.1fr);
          gap: 48px;
          align-items: start;
        }
        .request-kicker {
          color: #5bbfbf;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: 0.72rem;
          font-weight: 800;
          margin: 0 0 12px;
        }
        .proposal-request h2 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(2.5rem, 7vw, 4.6rem);
          line-height: 0.95;
          letter-spacing: 0;
          margin: 0 0 18px;
          font-weight: 700;
        }
        .request-copy {
          color: rgba(255,255,255,0.68);
          font-size: 1rem;
          line-height: 1.75;
          margin: 0;
          max-width: 440px;
        }
        .request-form {
          background: white;
          color: #0d0f0f;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.24);
        }
        .package-options,
        .field-grid {
          display: grid;
          gap: 12px;
        }
        .package-options {
          margin-bottom: 22px;
        }
        .package-option {
          text-align: left;
          border: 1px solid #e5e7eb;
          background: #fff;
          border-radius: 14px;
          padding: 14px 16px;
          cursor: pointer;
          color: #0d0f0f;
          font: inherit;
        }
        .package-option.active {
          border: 1.5px solid #5bbfbf;
          background: rgba(91,191,191,0.08);
        }
        .package-option-main {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
        }
        .package-option-main span {
          font-weight: 800;
          font-size: 0.92rem;
          line-height: 1.25;
        }
        .package-option-main strong {
          font-weight: 900;
          font-size: 1rem;
          white-space: nowrap;
        }
        .package-option-badge {
          color: #3a8f8f;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 0.66rem;
          font-weight: 800;
          display: inline-block;
          margin-top: 6px;
        }
        .terms-check {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          margin: 18px 0;
          color: #667085;
          font-size: 0.82rem;
          line-height: 1.45;
        }
        .terms-check input {
          margin-top: 3px;
          flex: 0 0 auto;
        }
        .request-submit {
          width: 100%;
          border: 0;
          border-radius: 999px;
          background: #5bbfbf;
          color: #0d0f0f;
          font-weight: 900;
          font-size: 1rem;
          padding: 17px 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 14px 32px rgba(91,191,191,0.34);
          transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
        }
        .request-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 40px rgba(91,191,191,0.42);
        }
        .request-submit:disabled {
          cursor: default;
          transform: none;
        }
        .request-submit.sent {
          background: #22c55e;
          box-shadow: 0 14px 32px rgba(34,197,94,0.26);
        }
        .form-message {
          color: #374151;
          font-size: 0.82rem;
          line-height: 1.5;
          margin: 14px 0 0;
        }
        .form-message.error {
          color: #b91c1c;
        }
        .bottom-pdf {
          border-top: 1px solid #e5e7eb;
          margin-top: 22px;
          padding-top: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }
        .bottom-pdf p {
          color: #667085;
          font-size: 0.82rem;
          line-height: 1.4;
          margin: 0;
        }
        .bottom-pdf a {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #0d0f0f;
          font-size: 0.88rem;
          font-weight: 900;
          text-decoration: none;
          white-space: nowrap;
        }
        @media (max-width: 820px) {
          .proposal-request {
            padding: 48px 16px 56px;
          }
          .request-shell {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .request-copy {
            max-width: none;
          }
          .request-form {
            border-radius: 22px;
            padding: 18px;
          }
          .package-option-main {
            align-items: flex-start;
          }
          .bottom-pdf {
            align-items: flex-start;
            flex-direction: column;
          }
          .bottom-pdf a {
            background: #f4fbfb;
            border: 1px solid rgba(91,191,191,0.45);
            border-radius: 999px;
            padding: 11px 14px;
          }
        }
      `,
        }}
      />
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
