'use client'

import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'

export default function CTA() {
  return (
    <section id="contact" style={{ padding: 'clamp(64px,9vw,110px) 0', background: '#0D0F0F', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(91,191,191,0.08) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>

          <div className="eyebrow" style={{ justifyContent: 'center', marginBottom: '24px' }} >
            <div className="eyebrow-line" />
            <span className="eyebrow-text" style={{ color: 'rgba(91,191,191,0.8)' }}>Let&apos;s Get Started</span>
            <div className="eyebrow-line" />
          </div>

          <h2 className="font-display reveal" style={{
            fontSize: 'clamp(2.4rem,5vw,4rem)',
            fontWeight: 400, color: 'white',
            lineHeight: 1.0, marginBottom: '24px',
          }}>
            Your Date Won&apos;t Wait.<br />
            <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>Neither Should You.</em>
          </h2>

          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem', fontWeight: 300,
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.75, marginBottom: '44px',
            maxWidth: '460px', margin: '0 auto 44px',
          }} className="reveal reveal-delay-1">
            Share your vision and Monica will personally reach out within a few hours. A 50% deposit holds your date.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }} className="reveal reveal-delay-2">
            <Link href="/get-a-quote" className="btn-primary" style={{ fontSize: '0.88rem', padding: '16px 36px' }}>
              Start Building Your Package <ArrowRight size={15} />
            </Link>
            <Link href="tel:5202226142" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              border: '1.5px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)',
              fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 500,
              padding: '15px 28px', borderRadius: '999px',
              textDecoration: 'none', transition: 'all 0.2s',
            }}>
              <Phone size={15} /> Call or Text Monica
            </Link>
          </div>

          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 300, color: 'rgba(255,255,255,0.3)' }} className="reveal reveal-delay-3">
            Zelle · Check · Cash accepted
          </p>
        </div>
      </div>
    </section>
  )
}
