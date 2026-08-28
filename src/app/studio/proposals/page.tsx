'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { Check, Copy, Download, ExternalLink, FileText, RefreshCw } from 'lucide-react'
import StudioNav from '@/components/studio/StudioNav'
import { formatMoney, westinProposal } from '@/lib/proposals/westinLaPalomaLaborDay'

type ProposalSelection = {
  id: string
  created_at: string
  proposal_title: string
  venue: string | null
  client_name: string | null
  event_type: string | null
  event_date: string | null
  package_id: string
  package_name: string
  standard_price: number
  partner_price: number
  included_items: { title: string; detail?: string }[] | null
  notes: string | null
  accepted_disclosures: boolean
  status: string
  estimate_id: string | null
}

function timeLabel(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default function StudioProposalsPage() {
  const [copied, setCopied] = useState(false)
  const [selections, setSelections] = useState<ProposalSelection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const proposalUrl = typeof window === 'undefined'
    ? '/proposal/westin-la-paloma-labor-day'
    : `${window.location.origin}/proposal/westin-la-paloma-labor-day`

  const openSelectionId = useMemo(() => {
    if (typeof window === 'undefined') return ''
    return new URLSearchParams(window.location.search).get('open') ?? ''
  }, [])

  async function copyLink() {
    await navigator.clipboard.writeText(proposalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  async function loadSelections() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/studio/proposals')
    if (!res.ok) {
      setError('No package selections are showing yet. Once the client submits a direction, it will appear here for estimate review.')
      setLoading(false)
      return
    }
    const data = await res.json()
    setSelections(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    loadSelections()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '120px' }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 24px) 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.22em', color: '#5BBFBF', textTransform: 'uppercase', margin: '0 0 4px' }}>
            Blue Luna Studio
          </p>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 700, color: 'white', margin: 0 }}>
            Proposals
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.86rem', lineHeight: 1.6, margin: '8px 0 0' }}>
            Share luxury proposal links, then turn approved package directions into official estimates.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '28px 24px 0' }}>
        <article style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: 'rgba(91,191,191,0.12)', border: '1px solid rgba(91,191,191,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={20} color="#5BBFBF" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#5BBFBF', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 8px' }}>
                Ready to Send
              </p>
              <h2 style={{ color: 'white', fontSize: '1.25rem', lineHeight: 1.2, margin: '0 0 6px' }}>
                {westinProposal.title}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: '0.82rem', lineHeight: 1.6, margin: '0 0 16px' }}>
                Four package options from {formatMoney(westinProposal.packages[0].partnerPrice)} to {formatMoney(westinProposal.packages[westinProposal.packages.length - 1].partnerPrice)} with PDF download and package direction selection.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Link href="/proposal/westin-la-paloma-labor-day" target="_blank" style={primaryAction}>
                  <ExternalLink size={14} /> Open
                </Link>
                <button type="button" onClick={copyLink} style={secondaryButton}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy Link'}
                </button>
                <a href={westinProposal.pdfPath} download style={secondaryLink}>
                  <Download size={14} /> PDF
                </a>
              </div>
            </div>
          </div>
        </article>

        <div style={{ background: 'rgba(91,191,191,0.07)', border: '1px solid rgba(91,191,191,0.18)', borderRadius: '16px', padding: '18px', marginTop: '18px' }}>
          <p style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', margin: '0 0 4px' }}>How this works</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', lineHeight: 1.6, margin: 0 }}>
            The client reviews the proposal, chooses a package direction, and Monica gets the selection here. Monica then creates the official estimate from that selection before payment starts.
          </p>
        </div>

        <section style={{ marginTop: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '12px' }}>
            <div>
              <p style={{ color: '#5BBFBF', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 4px' }}>Selections</p>
              <h2 style={{ color: 'white', fontSize: '1.1rem', lineHeight: 1.2, margin: 0 }}>Ready for estimate review</h2>
            </div>
            <button type="button" onClick={loadSelections} style={secondaryButton}>
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {loading ? (
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.86rem', padding: '28px 0', textAlign: 'center' }}>Loading selections...</p>
          ) : error ? (
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.86rem', lineHeight: 1.6, padding: '18px 0' }}>{error}</p>
          ) : selections.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.86rem', lineHeight: 1.6, padding: '24px 0', textAlign: 'center' }}>
              No package selections yet. When the client submits a package direction, it will appear here so Monica can create the official estimate.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {selections.map(selection => {
                const active = openSelectionId === selection.id
                const converted = selection.status === 'estimate_created' && selection.estimate_id
                return (
                  <article key={selection.id} style={{ background: active ? 'rgba(91,191,191,0.1)' : 'rgba(255,255,255,0.04)', border: active ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px' }}>{timeLabel(selection.created_at)}</p>
                        <h3 style={{ color: 'white', fontSize: '1rem', lineHeight: 1.25, margin: '0 0 6px' }}>{selection.package_name}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', lineHeight: 1.5, margin: 0 }}>
                          {selection.venue || westinProposal.venue} · {formatMoney(Number(selection.partner_price || 0))} Westin Partner Price
                        </p>
                      </div>
                      <span style={{ color: converted ? '#22c55e' : '#5BBFBF', background: converted ? 'rgba(34,197,94,0.12)' : 'rgba(91,191,191,0.12)', border: converted ? '1px solid rgba(34,197,94,0.28)' : '1px solid rgba(91,191,191,0.28)', borderRadius: '999px', padding: '6px 10px', fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {converted ? 'Estimate Created' : 'Selected'}
                      </span>
                    </div>

                    {selection.notes && (
                      <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.82rem', lineHeight: 1.55, margin: '14px 0 0', borderLeft: '2px solid #5BBFBF', paddingLeft: '12px' }}>{selection.notes}</p>
                    )}

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
                      {converted ? (
                        <Link href={`/studio/estimates/${selection.estimate_id}`} style={primaryAction}>
                          <ExternalLink size={14} /> Open Estimate
                        </Link>
                      ) : (
                        <Link href={`/studio/estimates/new?proposal_selection_id=${selection.id}`} style={primaryAction}>
                          <FileText size={14} /> Create Estimate
                        </Link>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <StudioNav />
    </div>
  )
}

const primaryAction: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: '#5BBFBF',
  color: '#0D0F0F',
  borderRadius: '999px',
  padding: '10px 14px',
  fontSize: '0.78rem',
  fontWeight: 800,
  textDecoration: 'none',
}

const secondaryButton: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: 'rgba(255,255,255,0.06)',
  color: 'rgba(255,255,255,0.74)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '999px',
  padding: '10px 14px',
  fontSize: '0.78rem',
  fontWeight: 800,
  cursor: 'pointer',
}

const secondaryLink: CSSProperties = {
  ...secondaryButton,
  textDecoration: 'none',
}
