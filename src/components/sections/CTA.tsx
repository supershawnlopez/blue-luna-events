'use client'

import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'

export default function CTA() {
  return (
    <section id="contact" style={{ padding: 'clamp(80px,12vw,140px) 0', background: '#FDFCFA' }}>
      <div className="container">
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <div className="eyebrow" style={{ justifyContent: 'center', marginBottom: '20px' }}>
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Ready to Book?</span>
            <div className="eyebrow-line" />
          </div>

          <h2 className="font-display reveal" style={{ fontSize: 'clamp(2.2rem,5vw,3.8rem)', fontWeight: 300, color: '#0D0F0F', lineHeight: 1.1, marginBottom: '20px' }}>
            Let&apos;s Make Your Event <em style={{ fontStyle: 'italic', color: '#3A8F8F' }}>Unforgettable</em>
          </h2>

          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 300, color: '#6B7280', lineHeight: 1.75, marginBottom: '40px' }} className="reveal reveal-delay-1">
            Tell us about your event and we&apos;ll send a custom estimate within 24 hours.
            A 50% deposit holds your date — availability is limited.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }} className="reveal reveal-delay-2">
            <Link href="/get-a-quote" className="btn-dark" style={{ fontSize: '0.9rem', padding: '16px 36px' }}>
              Get Your Custom Estimate <ArrowRight size={15} />
            </Link>
            <Link href="tel:5202226142" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              border: '1.5px solid #E5E7EB', color: '#0D0F0F',
              fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 500,
              padding: '15px 28px', borderRadius: '999px',
              textDecoration: 'none', transition: 'all 0.2s',
            }}>
              <Phone size={15} /> Call or Text Monica
            </Link>
          </div>

          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 300, color: '#9CA3AF' }} className="reveal reveal-delay-3">
            We respond within <strong style={{ color: '#3A8F8F', fontWeight: 500 }}>a few hours</strong>. Zelle · Check · Cash accepted.
          </p>
        </div>
      </div>
    </section>
  )
}
