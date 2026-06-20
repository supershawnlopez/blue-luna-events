'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import { HOMEPAGE_PACKAGES } from '@/lib/config'

export default function Packages() {
  return (
    <section id="packages" style={{ padding: 'clamp(56px,8vw,96px) 0', background: '#FDFCFA' }}>
      <div className="container">
        <div style={{ marginBottom: '52px' }} className="reveal">
          <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Your Experience</span></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 400, color: '#0D0F0F', lineHeight: 1.1 }}>
              Every Detail. <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>Handled.</em>
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 300, color: '#6B7280', maxWidth: '420px', lineHeight: 1.7 }}>
              From intimate backyard parties to full quinceañera productions — every package includes professional installation.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,300px),1fr))', gap: '20px' }}>
          {HOMEPAGE_PACKAGES.map((pkg, i) => (
            <div key={pkg.id} className={`card reveal reveal-delay-${i + 1}`} style={{
              overflow: 'hidden',
              border: pkg.color === 'teal' ? '1.5px solid #5BBFBF' : '1px solid #E5E7EB',
              boxShadow: pkg.color === 'teal' ? '0 8px 40px rgba(91,191,191,0.18)' : undefined,
            }}>
              <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                <Image src={pkg.image} alt={pkg.name} fill style={{ objectFit: 'cover', transition: 'transform 0.5s' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(13,15,15,0.6) 100%)' }} />
                {pkg.badge && (
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: '#5BBFBF', color: '#0D0F0F',
                    fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '4px 12px', borderRadius: '999px',
                  }}>{pkg.badge}</div>
                )}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
                  background: pkg.color === 'teal'
                    ? 'linear-gradient(90deg,#5BBFBF,#8DD4D4)'
                    : pkg.color === 'gold'
                    ? 'linear-gradient(90deg,#C9A96E,#E8CCA0)'
                    : 'linear-gradient(90deg,#E5E7EB,#D1D5DB)',
                }} />
              </div>

              <div style={{ padding: '24px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>{pkg.tier}</p>
                <h3 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 400, color: '#0D0F0F', marginBottom: '3px' }}>{pkg.name}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 300, color: '#6B7280', marginBottom: '18px', lineHeight: 1.5 }}>{pkg.tagline}</p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '18px', paddingBottom: '18px', borderBottom: '1px solid #F3F4F6' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#9CA3AF' }}>from</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.2rem', fontWeight: 700, color: '#0D0F0F', lineHeight: 1, letterSpacing: '-0.02em' }}>${pkg.price.toLocaleString()}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#9CA3AF', paddingBottom: '4px' }}>{pkg.priceNote}</span>
                </div>

                <ul style={{ listStyle: 'none', marginBottom: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pkg.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                      <Check size={14} color={pkg.color === 'gold' ? '#C9A96E' : '#5BBFBF'} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.84rem', fontWeight: 300, color: '#374151', lineHeight: 1.4 }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/get-a-quote"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    width: '100%', padding: '13px',
                    background: pkg.color === 'teal'
                      ? '#5BBFBF'
                      : pkg.color === 'gold'
                      ? 'linear-gradient(135deg,#C9A96E,#E8CCA0)'
                      : 'transparent',
                    color: '#0D0F0F',
                    border: pkg.color === 'gray' ? '1.5px solid #E5E7EB' : 'none',
                    borderRadius: '12px',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.04em',
                    boxShadow: pkg.color === 'teal' ? '0 4px 16px rgba(91,191,191,0.3)' : undefined,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {pkg.cta} <ArrowRight size={14} />
                </Link>

                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#9CA3AF', textAlign: 'center', marginTop: '10px' }}>
                  50% deposit · Balance due 1 week before
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="reveal" style={{ fontFamily: 'Inter, sans-serif', textAlign: 'center', marginTop: '28px', fontSize: '0.85rem', fontWeight: 300, color: '#6B7280' }}>
          Need something custom?{' '}
          <Link href="/get-a-quote" style={{ color: '#5BBFBF', borderBottom: '1px solid #5BBFBF', textDecoration: 'none' }}>
            Build it yourself
          </Link>
          {' '}— à la carte pricing, you choose every piece.{' '}
          <strong style={{ color: '#0D0F0F', fontWeight: 500 }}>Zelle · Check · Cash accepted.</strong>
        </p>
      </div>
    </section>
  )
}
