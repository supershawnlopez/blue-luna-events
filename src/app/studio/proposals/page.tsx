'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { Check, Copy, Download, ExternalLink, FileText } from 'lucide-react'
import StudioNav from '@/components/studio/StudioNav'
import { formatMoney, westinProposal } from '@/lib/proposals/westinLaPalomaLaborDay'

export default function StudioProposalsPage() {
  const [copied, setCopied] = useState(false)
  const proposalUrl = typeof window === 'undefined'
    ? '/proposal/westin-la-paloma-labor-day'
    : `${window.location.origin}/proposal/westin-la-paloma-labor-day`

  async function copyLink() {
    await navigator.clipboard.writeText(proposalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

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
            Luxury-style proposal links for venue, resort, school, and corporate opportunities.
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
                Four package options from {formatMoney(westinProposal.packages[0].partnerPrice)} to {formatMoney(westinProposal.packages[westinProposal.packages.length - 1].partnerPrice)} with PDF download and package request form.
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
            The client can review the digital proposal, download the PDF, and request a package. That request creates a Studio lead so Monica can confirm final details before sending the official estimate and payment link.
          </p>
        </div>
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
