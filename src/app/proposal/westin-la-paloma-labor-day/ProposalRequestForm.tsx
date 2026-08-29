'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Check, Download, Send } from 'lucide-react'
import { formatMoney, westinProposal } from '@/lib/proposals/westinLaPalomaLaborDay'

type Status = 'idle' | 'sending' | 'sent' | 'error'

type WestinWindow = Window & {
  __westinSelectedPackageId?: string
}

type Quantities = Record<string, number>

function quantitiesForPackage(packageId: string): Quantities {
  return Object.fromEntries(
    westinProposal.refinementItems.map(item => {
      const packageQuantities = item.packageQuantities as Record<string, number>
      return [item.id, packageQuantities[packageId] ?? 0]
    })
  )
}

function packageCode(packageName: string) {
  return packageName.split(' - ')[0]
}

function packageTitle(packageName: string) {
  return packageName.replace(/^[^-]+ - /, '')
}

function formatDeltaMoney(value: number) {
  if (value === 0) return formatMoney(0)
  return `${value > 0 ? '+' : '-'}${formatMoney(Math.abs(value))}`
}

function formatQuantity(quantity: number, unitLabel: string) {
  const singularLabels: Record<string, string> = {
    columns: 'column',
    centerpieces: 'centerpiece',
    treatments: 'treatment',
    clusters: 'cluster',
    desks: 'desk',
    zones: 'zone',
  }
  return `${quantity} ${Math.abs(quantity) === 1 ? singularLabels[unitLabel] ?? unitLabel : unitLabel}`
}

export default function ProposalRequestForm() {
  const [selectedPackageId, setSelectedPackageId] = useState('package-a')
  const [quantities, setQuantities] = useState<Quantities>(() => quantitiesForPackage('package-a'))
  const [notes, setNotes] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [selectionGuidance, setSelectionGuidance] = useState('')
  const [selectionPulse, setSelectionPulse] = useState(false)
  const selectedPackage = westinProposal.packages.find(pkg => pkg.id === selectedPackageId) ?? westinProposal.packages[0]
  const adjustedPartnerPrice = westinProposal.refinementItems.reduce(
    (total, item) => total + (quantities[item.id] ?? 0) * item.partnerUnitPrice,
    0,
  )
  const packageItems = westinProposal.refinementItems
    .map(item => {
      const packageQuantities = item.packageQuantities as Record<string, number>
      return { ...item, quantity: packageQuantities[selectedPackage.id] ?? 0 }
    })
    .filter(item => item.quantity > 0)
  const changedItems = westinProposal.refinementItems
    .map(item => {
      const packageQuantities = item.packageQuantities as Record<string, number>
      const packageQuantity = packageQuantities[selectedPackage.id] ?? 0
      const quantity = quantities[item.id] ?? 0
      return {
        ...item,
        packageQuantity,
        quantity,
        delta: quantity - packageQuantity,
      }
    })
    .filter(item => item.delta !== 0)

  function choosePackage(packageId: string) {
    const pkg = westinProposal.packages.find(item => item.id === packageId)
    if (!pkg) return
    const nextQuantities = quantitiesForPackage(packageId)
    setSelectedPackageId(packageId)
    setQuantities(nextQuantities)
    setMessage('')
    setSelectionPulse(false)
    window.setTimeout(() => setSelectionPulse(true), 20)
    setSelectionGuidance(`${packageCode(pkg.name)} is selected. Keep reviewing, adjust anything you would like Monica to look at, then send the direction when it feels right.`)
    const westinWindow = window as WestinWindow
    westinWindow.__westinSelectedPackageId = packageId
    window.dispatchEvent(new CustomEvent('westin-package-state-changed', { detail: { packageId } }))
  }

  useEffect(() => {
    function handlePackageSelected(event: Event) {
      const packageId = (event as CustomEvent<{ packageId?: string }>).detail?.packageId
      if (packageId) choosePackage(packageId)
    }

    window.addEventListener('westin-package-selected', handlePackageSelected)
    return () => window.removeEventListener('westin-package-selected', handlePackageSelected)
  }, [])

  useEffect(() => {
    const westinWindow = window as WestinWindow
    westinWindow.__westinSelectedPackageId = selectedPackageId
    window.dispatchEvent(new CustomEvent('westin-package-state-changed', { detail: { packageId: selectedPackageId } }))
  }, [selectedPackageId])

  useEffect(() => {
    if (!selectionPulse) return
    const timeout = window.setTimeout(() => setSelectionPulse(false), 900)
    return () => window.clearTimeout(timeout)
  }, [selectionPulse])

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!termsAccepted) {
      setMessage('Please review and acknowledge the design/weather notes before submitting your package direction.')
      return
    }

    setStatus('sending')
    setMessage('')

    const res = await fetch('/api/proposals/westin-la-paloma-labor-day/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageId: selectedPackage.id,
        adjustments: westinProposal.refinementItems.map(item => ({
          id: item.id,
          quantity: quantities[item.id] ?? 0,
        })),
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

  function updateQuantity(itemId: string, nextQuantity: number) {
    const quantity = Math.max(0, Math.min(40, Math.round(nextQuantity)))
    setQuantities(current => ({ ...current, [itemId]: quantity }))
    setMessage('')
  }

  return (
    <section id="request-package" className="proposal-request">
      <div className="request-shell">
        <div>
          <p className="request-kicker">
            Your Package
          </p>
          <h2>
            Make this easy for Monica to finalize.
          </h2>
          <p className="request-copy">
            Choose the package you like, make any small quantity changes, and leave Monica a note if there is anything you want her to review.
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
                  onClick={() => choosePackage(pkg.id)}
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

          {selectionGuidance && (
            <p className="selection-guidance">
              {selectionGuidance}
            </p>
          )}

          <div className="selected-summary">
            <div className="selected-summary-top" aria-live="polite">
              <div>
                <span>This is the package you chose</span>
                <strong>{selectedPackage.name}</strong>
                <p>Keep it as shown, or adjust the quantities below for Monica to review.</p>
              </div>
            </div>
            <div className="refine-panel">
              <div className="refine-heading">
                <span>Fine-Tune the Details</span>
                <p>Package quantities are pre-filled below. Adjust only what you would like Blue Luna to review before Monica prepares the official estimate.</p>
              </div>
              <div className="refine-list">
                {westinProposal.refinementItems.map(item => {
                  const quantity = quantities[item.id] ?? 0
                  const packageQuantities = item.packageQuantities as Record<string, number>
                  const includedQuantity = packageQuantities[selectedPackage.id] ?? 0
                  return (
                    <div className={quantity > 0 ? 'refine-row active' : 'refine-row'} key={item.id}>
                      <div>
                        <strong>{item.title}</strong>
                        <p>
                          {includedQuantity > 0 ? `${includedQuantity} included in ${packageCode(selectedPackage.name)}` : 'Optional refinement'} · {item.partner}
                        </p>
                      </div>
                      <div className="quantity-control" aria-label={`${item.title} quantity`}>
                        <button type="button" onClick={() => updateQuantity(item.id, quantity - 1)} aria-label={`Decrease ${item.title}`}>
                          -
                        </button>
                        <span>{quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, quantity + 1)} aria-label={`Increase ${item.title}`}>
                          +
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="selected-summary-items">
                <span>Your Current Package</span>
                <strong className="summary-title">{packageTitle(selectedPackage.name)}</strong>
                {packageItems.length > 0 ? (
                  <ul>
                    {packageItems.map(item => (
                      <li key={item.id}>
                          <span>{formatQuantity(item.quantity, item.unitLabel)} · {item.title}</span>
                        <strong>{formatMoney(item.quantity * item.partnerUnitPrice)}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No decor items selected.</p>
                )}
                <div className="summary-divider" />
                <span>Changes for Monica to Review</span>
                {changedItems.length > 0 ? (
                  <ul>
                    {changedItems.map(item => (
                      <li key={item.id}>
                        <span>{item.delta > 0 ? '+' : ''}{formatQuantity(item.delta, item.unitLabel)} · {item.title}</span>
                        <strong>{formatDeltaMoney(item.delta * item.partnerUnitPrice)}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No changes requested. Monica can prepare this package as shown.</p>
                )}
                <div className="summary-total">
                  <span>Updated Westin Partner Price</span>
                  <strong>{formatMoney(adjustedPartnerPrice)}</strong>
                </div>
              </div>
            </div>
          </div>

          <label className="notes-label" htmlFor="westin-proposal-notes">
            Notes for Monica
          </label>
          <p className="notes-help">Please add any notes or changes you would like Monica to review.</p>
          <div className="field-grid">
            <textarea id="westin-proposal-notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Example: We like this package but may want fewer railing clusters." rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
          </div>

          <label className="terms-check">
            <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} />
            <span>
              <strong>Design + Weather Acknowledgement</strong>
              I reviewed the design/weather notes and understand final placement is subject to venue access, setup timing, and safe installation conditions.
              <a href="#design-weather-notes">Review design/weather notes</a>
            </span>
          </label>

          <button
            type="submit"
            disabled={status === 'sending' || status === 'sent'}
            className={[
              'request-submit',
              status === 'sent' ? 'sent' : '',
              selectionPulse && status === 'idle' ? 'attention' : '',
            ].filter(Boolean).join(' ')}
          >
            {status === 'sent' ? <Check size={17} /> : <Send size={17} />}
            {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Sent to Monica' : `Send ${packageCode(selectedPackage.name)} to Monica`}
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
        .terms-check strong {
          color: #0d0f0f;
          display: block;
          font-size: 0.78rem;
          font-weight: 900;
          margin-bottom: 4px;
        }
        .terms-check a {
          color: #3a8f8f;
          display: inline-block;
          font-weight: 800;
          margin-top: 6px;
          text-decoration: underline;
          text-underline-offset: 4px;
        }
        .terms-check input {
          margin-top: 3px;
          flex: 0 0 auto;
        }
        .selection-guidance {
          background: #f4fbfb;
          border: 1px solid rgba(91,191,191,0.36);
          border-radius: 14px;
          color: #1b6868;
          font-size: 0.84rem;
          font-weight: 700;
          line-height: 1.45;
          margin: -2px 0 16px;
          padding: 12px 14px;
        }
        .selected-summary {
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          margin: 0 0 18px;
          overflow: hidden;
        }
        .selected-summary-top {
          background: #0d0f0f;
          color: white;
        }
        .selected-summary-top div {
          padding: 18px;
        }
        .selected-summary-top span,
        .selected-summary-items > span {
          color: #5bbfbf;
          display: block;
          font-size: 0.66rem;
          font-weight: 900;
          letter-spacing: 0.12em;
          margin-bottom: 6px;
          text-transform: uppercase;
        }
        .selected-summary-top strong {
          display: block;
          font-size: 1.08rem;
          line-height: 1.25;
        }
        .selected-summary-top p {
          color: rgba(255,255,255,0.66);
          font-size: 0.84rem;
          line-height: 1.45;
          margin: 8px 0 0;
        }
        .refine-panel {
          background: #fff;
          border-top: 1px solid #e5e7eb;
        }
        .refine-heading {
          border-bottom: 1px solid #eef0f2;
          padding: 16px;
        }
        .refine-heading span {
          color: #0d0f0f;
          display: block;
          font-size: 0.9rem;
          font-weight: 900;
          margin-bottom: 5px;
        }
        .refine-heading p {
          color: #667085;
          font-size: 0.82rem;
          line-height: 1.45;
          margin: 0;
        }
        .refine-list {
          display: grid;
        }
        .refine-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 14px;
          align-items: center;
          border-bottom: 1px solid #eef0f2;
          padding: 14px 16px;
        }
        .refine-row.active {
          background: #fbfefe;
        }
        .refine-row strong {
          display: block;
          font-size: 0.9rem;
          line-height: 1.25;
          margin-bottom: 4px;
        }
        .refine-row p {
          color: #667085;
          font-size: 0.78rem;
          font-weight: 700;
          line-height: 1.35;
          margin: 0;
        }
        .quantity-control {
          align-items: center;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 999px;
          display: grid;
          grid-template-columns: 34px 36px 34px;
          min-height: 38px;
          overflow: hidden;
        }
        .quantity-control button {
          align-items: center;
          background: transparent;
          border: 0;
          color: #0d0f0f;
          cursor: pointer;
          display: flex;
          font: inherit;
          font-size: 1.08rem;
          font-weight: 900;
          height: 38px;
          justify-content: center;
          padding: 0;
        }
        .quantity-control button:hover {
          background: rgba(91,191,191,0.15);
        }
        .quantity-control span {
          color: #0d0f0f;
          font-size: 0.92rem;
          font-weight: 900;
          text-align: center;
        }
        .selected-summary-items {
          background: #f9fafb;
          padding: 16px;
        }
        .selected-summary-items > span {
          color: #8a94a3;
        }
        .summary-title {
          color: #0d0f0f;
          display: block;
          font-size: 0.98rem;
          line-height: 1.25;
          margin: 0 0 12px;
        }
        .selected-summary-items p,
        .selected-summary-items ul {
          color: #667085;
          font-size: 0.84rem;
          line-height: 1.5;
          margin: 0;
        }
        .selected-summary-items ul {
          display: grid;
          gap: 8px;
          list-style: none;
          padding: 0;
        }
        .selected-summary-items li {
          display: flex;
          gap: 14px;
          justify-content: space-between;
        }
        .selected-summary-items li span {
          color: #374151;
          font-weight: 700;
        }
        .selected-summary-items li strong {
          color: #0d0f0f;
          white-space: nowrap;
        }
        .summary-divider {
          background: #e5e7eb;
          height: 1px;
          margin: 16px 0;
        }
        .summary-total {
          background: #0d0f0f;
          border-radius: 14px;
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          margin-top: 18px;
          padding: 16px;
        }
        .summary-total span {
          color: #5bbfbf;
          font-size: 0.68rem;
          font-weight: 900;
          letter-spacing: 0.12em;
          line-height: 1.25;
          text-transform: uppercase;
        }
        .summary-total strong {
          color: white;
          font-size: 1.38rem;
          line-height: 1;
          white-space: nowrap;
        }
        .notes-label {
          color: #0d0f0f;
          display: block;
          font-size: 0.78rem;
          font-weight: 900;
          margin: 0 0 8px;
        }
        .notes-help {
          color: #667085;
          font-size: 0.84rem;
          line-height: 1.45;
          margin: -2px 0 10px;
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
        .request-submit.attention {
          animation: submit-attention 820ms ease both;
        }
        .request-submit:disabled {
          cursor: default;
          transform: none;
        }
        .request-submit.sent {
          background: #22c55e;
          box-shadow: 0 14px 32px rgba(34,197,94,0.26);
        }
        @keyframes submit-attention {
          0% {
            transform: scale(1);
            box-shadow: 0 14px 32px rgba(91,191,191,0.34);
          }
          45% {
            transform: scale(1.035);
            box-shadow: 0 0 0 8px rgba(91,191,191,0.18), 0 20px 44px rgba(91,191,191,0.48);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 14px 32px rgba(91,191,191,0.34);
          }
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
          .selected-summary-top {
            grid-template-columns: 1fr;
          }
          .refine-row {
            grid-template-columns: 1fr;
          }
          .quantity-control {
            width: max-content;
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
