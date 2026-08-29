'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Check, ChevronDown, Printer, Send } from 'lucide-react'
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
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
  const [refinementOpen, setRefinementOpen] = useState(false)
  const selectedPackage = westinProposal.packages.find(pkg => pkg.id === selectedPackageId) ?? westinProposal.packages[0]
  const adjustedPartnerPrice = westinProposal.refinementItems.reduce(
    (total, item) => total + (quantities[item.id] ?? 0) * item.partnerUnitPrice,
    0,
  )
  const adjustedStandardPrice = westinProposal.refinementItems.reduce(
    (total, item) => total + (quantities[item.id] ?? 0) * item.standardUnitPrice,
    0,
  )
  const partnerSavings = Math.max(0, adjustedStandardPrice - adjustedPartnerPrice)
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
  const refinementItemsWithQuantities = westinProposal.refinementItems.map(item => {
    const packageQuantities = item.packageQuantities as Record<string, number>
    const includedQuantity = packageQuantities[selectedPackage.id] ?? 0
    const quantity = quantities[item.id] ?? 0
    return { ...item, includedQuantity, quantity }
  })
  const includedRefinementItems = refinementItemsWithQuantities.filter(item => item.includedQuantity > 0)
  const optionalRefinementItems = refinementItemsWithQuantities.filter(item => item.includedQuantity === 0)
  const summaryBlock = (
    <div className="selected-summary-items summary-zone">
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
      <span>Package Adjustments</span>
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
        <p>No adjustments selected. Monica can use this package as shown.</p>
      )}
      <div className="summary-total">
        <div>
          <span>Westin Partner Price</span>
          <strong>{formatMoney(adjustedPartnerPrice)}</strong>
        </div>
        <div className="summary-savings">
          <span>Westin Partner Savings</span>
          <strong>{formatMoney(partnerSavings)}</strong>
        </div>
      </div>
    </div>
  )

  function choosePackage(packageId: string) {
    const pkg = westinProposal.packages.find(item => item.id === packageId)
    if (!pkg) return
    const nextQuantities = quantitiesForPackage(packageId)
    setSelectedPackageId(packageId)
    setQuantities(nextQuantities)
    setRefinementOpen(false)
    setMessage('')
    setSelectionPulse(false)
    window.setTimeout(() => setSelectionPulse(true), 20)
    setSelectionGuidance(`${packageCode(pkg.name)} is selected. Keep reviewing, adjust anything you would like included, then send the package details when it feels right.`)
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
      setMessage('Please review and acknowledge the design/weather notes before sending your package details.')
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
    setMessage('Package details received. Blue Luna Events will confirm final details before sending the invoice and payment link.')
  }

  function updateQuantity(itemId: string, nextQuantity: number) {
    const quantity = Math.max(0, Math.min(40, Math.round(nextQuantity)))
    setQuantities(current => ({ ...current, [itemId]: quantity }))
    setMessage('')
  }

  function printChoices() {
    const chosenCode = packageCode(selectedPackage.name)
    const chosenTitle = packageTitle(selectedPackage.name)
    const includedRows = packageItems
      .map(item => `
        <div class="choice-row">
          <span>${escapeHtml(formatQuantity(item.quantity, item.unitLabel))} - ${escapeHtml(item.title)}</span>
          <strong>${escapeHtml(formatMoney(item.quantity * item.partnerUnitPrice))}</strong>
        </div>
      `)
      .join('')
    const adjustmentRows = changedItems.length > 0
      ? changedItems
        .map(item => `
          <div class="choice-row">
            <span>${item.delta > 0 ? '+' : ''}${escapeHtml(formatQuantity(item.delta, item.unitLabel))} - ${escapeHtml(item.title)}</span>
            <strong>${escapeHtml(formatDeltaMoney(item.delta * item.partnerUnitPrice))}</strong>
          </div>
        `)
        .join('')
      : '<p class="muted">No adjustments selected. Monica can use this package as shown.</p>'
    const noteCopy = notes.trim()
      ? escapeHtml(notes.trim()).replace(/\n/g, '<br />')
      : 'No additional notes added.'
    const printWindow = window.open('', '_blank', 'width=900,height=1100')
    if (!printWindow) {
      window.print()
      return
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${escapeHtml(westinProposal.title)} - ${escapeHtml(chosenTitle)}</title>
          <style>
            @page { size: letter; margin: 0.5in; }
            * { box-sizing: border-box; }
            body {
              color: #0d0f0f;
              font-family: Inter, Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            .sheet {
              width: 100%;
            }
            .top {
              align-items: flex-start;
              border-bottom: 2px solid #0d0f0f;
              display: flex;
              justify-content: space-between;
              margin-bottom: 24px;
              padding-bottom: 16px;
            }
            .right { text-align: right; }
            .eyebrow {
              color: #3a8f8f;
              display: block;
              font-size: 9px;
              font-weight: 900;
              letter-spacing: 0.16em;
              margin-bottom: 6px;
              text-transform: uppercase;
            }
            .brand {
              display: block;
              font-family: Georgia, 'Times New Roman', serif;
              font-size: 27px;
              line-height: 1;
            }
            .confirmation {
              background: #f4fbfb;
              border: 1px solid rgba(91,191,191,0.45);
              border-radius: 16px;
              margin-bottom: 18px;
              padding: 18px;
            }
            .chosen {
              align-items: center;
              display: flex;
              gap: 12px;
              margin-bottom: 10px;
            }
            .code {
              align-items: center;
              background: #5bbfbf;
              border-radius: 999px;
              color: #0d0f0f;
              display: inline-flex;
              font-size: 13px;
              font-weight: 900;
              height: 34px;
              justify-content: center;
              min-width: 34px;
              padding: 0 9px;
            }
            h1 {
              font-size: 27px;
              line-height: 1.05;
              margin: 0;
            }
            .confirmation p,
            .muted {
              color: #374151;
              font-size: 12px;
              line-height: 1.45;
              margin: 0;
            }
            .card {
              border: 1px solid #e5e7eb;
              border-radius: 16px;
              margin-bottom: 16px;
              padding: 16px 18px;
            }
            h2 {
              font-size: 16px;
              line-height: 1.2;
              margin: 0 0 12px;
            }
            .choice-row {
              align-items: baseline;
              border-bottom: 1px solid #eef0f2;
              display: grid;
              gap: 16px;
              grid-template-columns: minmax(0, 1fr) auto;
              padding: 7px 0;
            }
            .choice-row:last-child {
              border-bottom: 0;
            }
            .choice-row span {
              color: #374151;
              font-size: 12px;
              font-weight: 700;
              line-height: 1.35;
            }
            .choice-row strong {
              font-size: 12px;
              white-space: nowrap;
            }
            .total {
              align-items: start;
              background: #0d0f0f;
              border-radius: 16px;
              color: white;
              display: grid;
              gap: 24px;
              grid-template-columns: minmax(0, 1fr) auto;
              margin: 18px 0;
              padding: 18px;
            }
            .total strong {
              display: block;
              font-size: 32px;
              line-height: 1;
              margin-top: 7px;
            }
            .savings {
              border-left: 1px solid rgba(255,255,255,0.18);
              padding-left: 18px;
              text-align: right;
            }
            .savings strong {
              color: #5bbfbf;
              font-size: 21px;
            }
            .notes {
              min-height: 78px;
            }
            .ack {
              border-top: 1px solid #e5e7eb;
              color: #374151;
              font-size: 10px;
              line-height: 1.4;
              margin-top: 14px;
              padding-top: 12px;
            }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <main class="sheet">
            <section class="top">
              <div>
                <span class="eyebrow">Blue Luna Events</span>
                <strong class="brand">Westin La Paloma</strong>
              </div>
              <div class="right">
                <span class="eyebrow">Labor Day 2026</span>
                <strong class="brand">Package Choice Summary</strong>
              </div>
            </section>
            <section class="confirmation">
              <span class="eyebrow">This is the package you chose</span>
              <div class="chosen">
                <span class="code">${escapeHtml(chosenCode)}</span>
                <h1>${escapeHtml(chosenTitle)}</h1>
              </div>
              <p>Package details selected for Monica to confirm before sending the invoice and payment link.</p>
            </section>
            <section class="card">
              <span class="eyebrow">Your Current Package</span>
              <h2>${escapeHtml(chosenTitle)}</h2>
              ${includedRows}
            </section>
            <section class="card">
              <span class="eyebrow">Package Adjustments</span>
              ${adjustmentRows}
            </section>
            <section class="total">
              <div>
                <span class="eyebrow">Westin Partner Price</span>
                <strong>${escapeHtml(formatMoney(adjustedPartnerPrice))}</strong>
              </div>
              <div class="savings">
                <span class="eyebrow">Westin Partner Savings</span>
                <strong>${escapeHtml(formatMoney(partnerSavings))}</strong>
              </div>
            </section>
            <section class="card notes">
              <span class="eyebrow">Notes for Monica</span>
              <p class="muted">${noteCopy}</p>
            </section>
            <section class="ack">
              <strong>Design + Weather Acknowledgement</strong><br />
              Final placement is subject to venue access, setup timing, weather conditions, and safe installation requirements.
            </section>
          </main>
          <script>
            window.addEventListener('load', () => {
              window.print()
              window.setTimeout(() => window.close(), 500)
            })
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
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
            Choose the package you like, make any small quantity changes, and leave Monica a note if there is anything else she should know.
          </p>
        </div>

        <form onSubmit={submit} className="request-form">
          <div className="print-choice-header" aria-hidden="true">
            <div>
              <span>Blue Luna Events</span>
              <strong>Westin La Paloma</strong>
            </div>
            <div>
              <span>Labor Day 2026</span>
              <strong>Package Choice Summary</strong>
            </div>
          </div>

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
                    <span className="package-option-title">
                      <span className="package-code" aria-hidden="true">{packageCode(pkg.name)}</span>
                      <span>{packageTitle(pkg.name)}</span>
                    </span>
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

          <div className="selected-summary">
            <div className="selected-summary-top" aria-live="polite">
              <div>
                <span>This is the package you chose</span>
                <strong>
                  <span className="package-code selected-code" aria-hidden="true">{packageCode(selectedPackage.name)}</span>
                  {packageTitle(selectedPackage.name)}
                </strong>
                <p>Keep it as shown, or adjust the quantities below before sending your package details.</p>
              </div>
            </div>
            <div className="refine-panel">
              {!refinementOpen && summaryBlock}
              <div className="adjust-package">
                <button
                  type="button"
                  className={refinementOpen ? 'adjust-toggle open' : 'adjust-toggle'}
                  onClick={() => setRefinementOpen(open => !open)}
                  aria-expanded={refinementOpen}
                >
                  <span>Adjust Package Details</span>
                  <ChevronDown size={17} />
                </button>
                <p>Need to add or remove a few pieces? You can adjust the package before sending it to Monica.</p>
              </div>
              {refinementOpen && (
                <div className="refine-list">
                  <div className="refine-group included">
                    <p className="refine-group-label">Included in this package</p>
                    {includedRefinementItems.map(item => (
                      <div className={item.quantity > 0 ? 'refine-row active' : 'refine-row'} key={item.id}>
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.includedQuantity} included in {packageCode(selectedPackage.name)} · {item.partner}</p>
                        </div>
                        <div className="quantity-control" aria-label={`${item.title} quantity`}>
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Decrease ${item.title}`}>
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Increase ${item.title}`}>
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="refine-group optional">
                    <p className="refine-group-label">Optional additions</p>
                    {optionalRefinementItems.map(item => (
                      <div className={item.quantity > 0 ? 'refine-row active' : 'refine-row'} key={item.id}>
                        <div>
                          <strong>{item.title}</strong>
                          <p>Optional · {item.partner}</p>
                        </div>
                        <div className="quantity-control" aria-label={`${item.title} quantity`}>
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Decrease ${item.title}`}>
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Increase ${item.title}`}>
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {refinementOpen && summaryBlock}
            </div>
          </div>

          <label className="notes-label" htmlFor="westin-proposal-notes">
            Notes for Monica
          </label>
          <p className="notes-help">Please add any notes or details you would like Monica to see.</p>
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
            {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Package Details Sent' : 'Send Package Details'}
          </button>

          {message && (
            <p className={status === 'error' ? 'form-message error' : 'form-message'}>
              {message}
            </p>
          )}

          <div className="bottom-pdf">
            <p>Need a copy for your team?</p>
            <button type="button" onClick={printChoices}>
              <Printer size={16} />
              Print / Save Your Choices
            </button>
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
          --form-pad: 24px;
          background: white;
          color: #0d0f0f;
          border-radius: 24px;
          padding: var(--form-pad);
          box-shadow: 0 24px 80px rgba(0,0,0,0.24);
        }
        .print-choice-header {
          display: none;
        }
        .package-options,
        .field-grid {
          display: grid;
        }
        .package-options {
          border-bottom: 1px solid #e5e7eb;
          border-top: 1px solid #e5e7eb;
          margin-bottom: 30px;
          margin-left: calc(var(--form-pad) * -1);
          margin-right: calc(var(--form-pad) * -1);
        }
        .package-option {
          text-align: left;
          border: 0;
          border-bottom: 1px solid #e5e7eb;
          background: #fff;
          border-radius: 0;
          padding: 16px var(--form-pad);
          cursor: pointer;
          color: #0d0f0f;
          font: inherit;
          position: relative;
          transition: background 160ms ease, box-shadow 160ms ease;
        }
        .package-option:last-child {
          border-bottom: 0;
        }
        .package-option.active {
          background: linear-gradient(90deg, rgba(91,191,191,0.14), rgba(91,191,191,0.04));
          box-shadow: inset 4px 0 0 #5bbfbf;
        }
        .package-option-main {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
        }
        .package-option-title {
          align-items: center;
          display: flex;
          gap: 12px;
          min-width: 0;
        }
        .package-option-title > span:last-child {
          font-weight: 800;
          font-size: 0.92rem;
          line-height: 1.25;
        }
        .package-code {
          align-items: center;
          background: #0d0f0f;
          border-radius: 999px;
          color: #fff;
          display: inline-flex;
          flex: 0 0 auto;
          font-size: 0.68rem;
          font-weight: 900;
          height: 30px;
          justify-content: center;
          letter-spacing: 0;
          line-height: 1;
          min-width: 30px;
          padding: 0 8px;
        }
        .package-option.active .package-code {
          background: #5bbfbf;
          color: #0d0f0f;
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
          margin: 0 0 18px;
        }
        .selected-summary-top {
          background: #f4fbfb;
          border: 1px solid rgba(91,191,191,0.32);
          border-radius: 18px;
          color: #0d0f0f;
          margin-bottom: 24px;
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
          align-items: center;
          display: flex;
          font-size: 1.12rem;
          gap: 12px;
          line-height: 1.25;
        }
        .selected-code {
          background: #5bbfbf;
        }
        .selected-summary-top .package-code {
          color: #fff;
          display: inline-flex;
        }
        .selected-summary-top .selected-code {
          color: #0d0f0f;
        }
        .selected-summary-top p {
          color: #667085;
          font-size: 0.84rem;
          line-height: 1.45;
          margin: 8px 0 0;
        }
        .refine-panel {
          background: #fff;
        }
        .refine-list {
          border-top: 1px solid #eef0f2;
          display: grid;
          margin-left: calc(var(--form-pad) * -1);
          margin-right: calc(var(--form-pad) * -1);
          margin-top: 22px;
          padding: 0;
        }
        .refine-group {
          display: grid;
          padding: 18px var(--form-pad) 16px;
        }
        .refine-group.included {
          background: #fbfefe;
        }
        .refine-group.optional {
          background: #f6f7f7;
          border-top: 1px solid #e5e7eb;
        }
        .refine-group-label {
          color: #8a94a3;
          font-size: 0.66rem;
          font-weight: 900;
          letter-spacing: 0.12em;
          line-height: 1.25;
          margin: 0 0 4px;
          text-transform: uppercase;
        }
        .refine-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) max-content;
          gap: 12px;
          align-items: center;
          border-bottom: 1px solid #eef0f2;
          padding: 10px 0;
        }
        .refine-row:last-child {
          border-bottom: 0;
        }
        .refine-row.active {
          background: transparent;
        }
        .refine-row strong {
          display: block;
          font-size: 0.86rem;
          line-height: 1.25;
          margin-bottom: 4px;
        }
        .refine-row p {
          color: #667085;
          font-size: 0.74rem;
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
          grid-template-columns: 28px 30px 28px;
          min-height: 32px;
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
          font-size: 0.95rem;
          font-weight: 900;
          height: 32px;
          justify-content: center;
          padding: 0;
        }
        .quantity-control button:hover {
          background: rgba(91,191,191,0.15);
        }
        .quantity-control span {
          color: #0d0f0f;
          font-size: 0.84rem;
          font-weight: 900;
          text-align: center;
        }
        .selected-summary-items {
          padding: 18px 0 0;
        }
        .summary-zone {
          background: #fbfbfa;
          border-top: 1px solid #e5e7eb;
          margin-top: 22px;
          margin-left: calc(var(--form-pad) * -1);
          margin-right: calc(var(--form-pad) * -1);
          padding: 20px var(--form-pad) 0;
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
          border-radius: 16px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          justify-content: space-between;
          gap: 22px;
          align-items: start;
          margin-top: 20px;
          padding: 20px;
        }
        .summary-total span {
          color: #5bbfbf;
          display: block;
          font-size: 0.68rem;
          font-weight: 900;
          letter-spacing: 0.12em;
          line-height: 1.25;
          text-transform: uppercase;
        }
        .summary-total strong {
          color: white;
          display: block;
          font-size: 1.9rem;
          line-height: 1;
          margin-top: 8px;
          white-space: nowrap;
        }
        .summary-savings {
          border-left: 1px solid rgba(255,255,255,0.14);
          padding-left: 16px;
          text-align: right;
        }
        .summary-savings span {
          color: rgba(91,191,191,0.82);
          font-size: 0.62rem;
        }
        .summary-savings strong {
          color: #5bbfbf;
          font-size: 1.25rem;
        }
        .adjust-package {
          border-top: 1px solid #eef0f2;
          padding: 22px 0 0;
        }
        .adjust-toggle {
          align-items: center;
          background: #fff;
          border: 1px solid rgba(91,191,191,0.42);
          border-radius: 999px;
          color: #0d0f0f;
          cursor: pointer;
          display: inline-flex;
          font: inherit;
          font-size: 0.88rem;
          font-weight: 900;
          gap: 8px;
          justify-content: center;
          padding: 12px 16px;
        }
        .adjust-toggle svg {
          color: #3a8f8f;
          transition: transform 160ms ease;
        }
        .adjust-toggle.open svg {
          transform: rotate(180deg);
        }
        .adjust-package p {
          color: #667085;
          font-size: 0.8rem;
          line-height: 1.45;
          margin: 10px 0 0;
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
        .bottom-pdf button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 0;
          color: #0d0f0f;
          cursor: pointer;
          font: inherit;
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
            --form-pad: 18px;
            border-radius: 22px;
            padding: var(--form-pad);
          }
          .package-option-main {
            align-items: flex-start;
          }
          .refine-row {
            grid-template-columns: minmax(0, 1fr) max-content;
          }
          .quantity-control {
            width: auto;
          }
          .bottom-pdf {
            align-items: flex-start;
            flex-direction: column;
          }
          .summary-total {
            grid-template-columns: 1fr;
          }
          .summary-savings {
            border-left: 0;
            border-top: 1px solid rgba(255,255,255,0.14);
            padding-left: 0;
            padding-top: 12px;
            text-align: left;
          }
          .bottom-pdf button {
            background: #f4fbfb;
            border: 1px solid rgba(91,191,191,0.45);
            border-radius: 999px;
            padding: 11px 14px;
          }
        }
        @media print {
          @page {
            size: letter;
            margin: 0.45in;
          }
          body * {
            visibility: hidden;
          }
          #request-package,
          #request-package * {
            visibility: visible;
          }
          #request-package {
            background: white;
            color: #0d0f0f;
            left: 0;
            padding: 0;
            position: absolute;
            top: 0;
            width: 100%;
          }
          #request-package .request-shell {
            display: block;
            max-width: none;
          }
          #request-package .request-shell > div:first-child,
          #request-package .package-options,
          #request-package .selection-guidance,
          #request-package .refine-list,
          #request-package .adjust-package,
          #request-package .request-submit,
          #request-package .bottom-pdf,
          #request-package .form-message {
            display: none;
          }
          #request-package .request-form {
            border: 0;
            box-shadow: none;
            padding: 0;
          }
          #request-package .print-choice-header {
            align-items: start;
            border-bottom: 2px solid #0d0f0f;
            display: flex;
            justify-content: space-between;
            margin-bottom: 22px;
            padding-bottom: 16px;
          }
          #request-package .print-choice-header div:last-child {
            text-align: right;
          }
          #request-package .print-choice-header span {
            color: #5bbfbf;
            display: block;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 0.16em;
            margin-bottom: 5px;
            text-transform: uppercase;
          }
          #request-package .print-choice-header strong {
            color: #0d0f0f;
            display: block;
            font-family: 'Cormorant Garamond', Georgia, serif;
            font-size: 24px;
            line-height: 1;
          }
          #request-package .selected-summary {
            border: 0;
            margin: 0;
            padding: 0;
          }
          #request-package .selected-summary-top {
            background: #f4fbfb !important;
            border: 1px solid rgba(91,191,191,0.38);
            border-radius: 14px;
            color: #0d0f0f !important;
            margin-bottom: 18px;
          }
          #request-package .selected-summary-top div {
            padding: 16px 18px;
          }
          #request-package .selected-summary-top span,
          #request-package .selected-summary-items > span {
            color: #3a8f8f !important;
            font-size: 8.5px;
          }
          #request-package .selected-summary-top strong {
            font-size: 22px;
          }
          #request-package .selected-summary-top p {
            color: #374151;
            font-size: 11px;
            line-height: 1.45;
          }
          #request-package .selected-summary-top .package-code {
            height: 26px;
            min-width: 26px;
          }
          #request-package .summary-zone {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            margin: 0;
            padding: 16px 18px;
          }
          #request-package .summary-title {
            font-size: 16px;
            margin-bottom: 10px;
          }
          #request-package .selected-summary-items ul {
            gap: 6px;
          }
          #request-package .selected-summary-items li {
            border-bottom: 1px solid #eef0f2;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            padding-bottom: 6px;
          }
          #request-package .selected-summary-items li:last-child {
            border-bottom: 0;
          }
          #request-package .selected-summary-items li span,
          #request-package .selected-summary-items p {
            color: #374151;
            font-size: 11px;
            line-height: 1.35;
          }
          #request-package .selected-summary-items li strong {
            color: #0d0f0f;
            font-size: 11px;
          }
          #request-package .summary-divider {
            margin: 13px 0;
          }
          #request-package .summary-total {
            background: #0d0f0f !important;
            border-radius: 14px;
            color: white !important;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            margin-top: 16px;
            padding: 16px 18px;
          }
          #request-package .summary-total strong {
            font-size: 28px;
          }
          #request-package .summary-savings {
            border-left: 1px solid rgba(255,255,255,0.18);
            border-top: 0;
            padding-left: 18px;
            padding-top: 0;
            text-align: right;
          }
          #request-package .summary-savings strong {
            color: #5bbfbf;
            font-size: 18px;
          }
          #request-package .notes-label {
            border-top: 1px solid #e5e7eb;
            display: block;
            font-size: 9px;
            letter-spacing: 0.14em;
            margin-top: 18px;
            padding-top: 14px;
            text-transform: uppercase;
          }
          #request-package .notes-help {
            color: #374151;
            font-size: 11px;
            margin-bottom: 8px;
          }
          #request-package textarea {
            border: 1px solid #d1d5db !important;
            border-radius: 12px !important;
            min-height: 86px;
            padding: 12px !important;
          }
          #request-package .terms-check {
            border-top: 1px solid #e5e7eb;
            color: #374151;
            display: flex;
            font-size: 10px;
            line-height: 1.35;
            margin-top: 14px;
            padding-top: 12px;
          }
          #request-package .terms-check input {
            display: none;
          }
          #request-package .terms-check strong {
            color: #0d0f0f;
            font-size: 10px;
            margin-bottom: 3px;
          }
          #request-package .terms-check a {
            display: none;
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
