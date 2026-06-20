'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, Camera, Crown, Check, ArrowRight } from 'lucide-react'
import { PACKAGE_CATALOG, type Package } from '@/lib/config'

const FEATURES = [
  { icon: Sparkles, title: 'Custom Luxury Garlands', text: 'Floor-to-ceiling balloon garlands in your exact colors — rose gold, blush, champagne, or anything you envision.' },
  { icon: Camera, title: 'Shimmer Backdrops', text: 'Photo-ready shimmer backdrops that make every photo look like it came from a professional magazine shoot.' },
  { icon: Crown, title: 'Columns & Entrance Displays', text: 'Grand balloon columns flanking the entrance set the tone before guests even walk in the door.' },
]

const PACKAGES: Package[] = PACKAGE_CATALOG.filter(
  p => Array.isArray(p.eventTypes) && p.eventTypes.includes('quinceanera')
)

const FAQS = [
  { q: 'How much does quinceañera balloon décor cost in Tucson?', a: 'Our quinceañera packages start at $450 for the Starter and go up to $2,800 for the Grand Experience with photo booth, audio, and MC. Most Tucson families choose the Classic ($950) or Signature ($1,600) package.' },
  { q: 'How far in advance should I book?', a: 'We recommend 4–6 weeks in advance. Spring and summer book quickly. A 50% deposit secures your date.' },
  { q: 'Do you serve Oro Valley, Sahuarita, and surrounding areas?', a: 'Yes! We serve all of Tucson and surrounding areas. Distance fees apply beyond 20 miles from Tucson.' },
  { q: 'Can you match my daughter\'s quinceañera colors exactly?', a: 'Absolutely. We work with any color palette. Just share your vision and we\'ll bring it to life.' },
]

export default function Quinceaneras() {
  return (
    <div style={{ minHeight: '100vh', background: '#FDFCFA' }}>
      {/* Hero */}
      <div style={{ background: '#0D0F0F', paddingTop: '72px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 60% 50%, rgba(91,191,191,0.12) 0%, transparent 60%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 2, padding: 'clamp(40px,6vw,80px) 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,440px),1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: '20px' }}><div className="eyebrow-line" /><span className="eyebrow-text">Tucson, AZ</span></div>
            <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 300, lineHeight: 1.05, color: 'white', marginBottom: '20px' }}>
              Quinceañera Balloon<br/><em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>Décor in Tucson</em>
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 300, lineHeight: 1.75, color: 'rgba(255,255,255,0.6)', maxWidth: '420px', marginBottom: '32px' }}>
              Your daughter&apos;s quinceañera deserves more than just balloons — it deserves a moment she&apos;ll never forget. Packages from $450.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href="#packages" className="btn-primary">See Packages <ArrowRight size={15} /></a>
              <Link href="/get-a-quote" className="btn-ghost">Get a Custom Quote</Link>
            </div>
          </div>
          <div style={{ position: 'relative', height: 'clamp(260px,40vw,420px)', borderRadius: '20px', overflow: 'hidden' }}>
            <Image src="/images/gal-2.jpg" alt="Quinceañera balloon décor Tucson AZ" fill style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container" style={{ padding: 'clamp(48px,8vw,96px) 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">What We Offer</span><div className="eyebrow-line" /></div>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 300, color: '#0D0F0F' }}>
            Quinceañera <em style={{ fontStyle: 'italic', color: '#3A8F8F' }}>Specialists</em>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,240px),1fr))', gap: '20px', marginBottom: '64px' }}>
          {FEATURES.map(f => (
            <div key={f.title} className="card" style={{ padding: '28px', textAlign: 'center' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(91,191,191,0.1)', border: '1px solid rgba(91,191,191,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <f.icon size={22} color="#5BBFBF" />
              </div>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#0D0F0F', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.84rem', fontWeight: 300, color: '#6B7280', lineHeight: 1.65 }}>{f.text}</p>
            </div>
          ))}
        </div>

        {/* Packages */}
        <div id="packages" style={{ scrollMarginTop: '90px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">Transparent Pricing</span><div className="eyebrow-line" /></div>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 300, color: '#0D0F0F' }}>
              Quinceañera <em style={{ fontStyle: 'italic', color: '#3A8F8F' }}>Packages</em>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,260px),1fr))', gap: '18px', marginBottom: '32px' }}>
            {PACKAGES.map((pkg) => (
              <div key={pkg.id} className="card" style={{ overflow: 'hidden', border: pkg.color === 'teal' ? '1.5px solid #5BBFBF' : '1px solid #E5E7EB', boxShadow: pkg.color === 'teal' ? '0 8px 40px rgba(91,191,191,0.18)' : undefined }}>
                <div style={{ position: 'relative', height: '140px' }}>
                  <Image src={pkg.image} alt={pkg.name} fill style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,15,15,0.4)' }} />
                  {pkg.badge && <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#5BBFBF', color: '#0D0F0F', fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '999px' }}>{pkg.badge}</div>}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: pkg.color === 'teal' ? 'linear-gradient(90deg,#5BBFBF,#8DD4D4)' : pkg.color === 'gold' ? 'linear-gradient(90deg,#C9A96E,#E8CCA0)' : pkg.color === 'rose' ? 'linear-gradient(90deg,#F9A8D4,#FBCFE8)' : 'linear-gradient(90deg,#E5E7EB,#D1D5DB)' }} />
                </div>
                <div style={{ padding: '20px' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '3px' }}>{pkg.tier}</p>
                  <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 400, color: '#0D0F0F', marginBottom: '3px' }}>{pkg.name}</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 300, color: '#6B7280', marginBottom: '14px', lineHeight: 1.4 }}>{pkg.tagline}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #F3F4F6' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#9CA3AF' }}>from</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.9rem', fontWeight: 700, color: '#0D0F0F', lineHeight: 1, letterSpacing: '-0.02em' }}>${pkg.price.toLocaleString()}</span>
                  </div>
                  <ul style={{ listStyle: 'none', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {pkg.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <Check size={13} color={pkg.color === 'gold' ? '#C9A96E' : '#5BBFBF'} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 300, color: '#374151', lineHeight: 1.4 }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/get-a-quote" style={{ width: '100%', padding: '12px', background: pkg.color === 'teal' ? '#5BBFBF' : pkg.color === 'gold' ? 'linear-gradient(135deg,#C9A96E,#E8CCA0)' : pkg.color === 'rose' ? 'linear-gradient(135deg,#F9A8D4,#FBCFE8)' : 'transparent', color: '#0D0F0F', border: pkg.color === 'gray' ? '1.5px solid #E5E7EB' : 'none', borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                    {pkg.cta} <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: '680px', margin: '64px auto 0' }}>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 300, color: '#0D0F0F', textAlign: 'center', marginBottom: '32px' }}>
            Frequently Asked <em style={{ fontStyle: 'italic', color: '#3A8F8F' }}>Questions</em>
          </h2>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid #E5E7EB', padding: '20px 0' }}>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#0D0F0F', marginBottom: '8px' }}>{faq.q}</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 300, color: '#6B7280', lineHeight: 1.7 }}>{faq.a}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: '#0D0F0F', borderRadius: '24px', padding: 'clamp(40px,6vw,64px)', textAlign: 'center', marginTop: '64px' }}>
          <h2 className="font-display" style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, color: 'white', marginBottom: '16px' }}>
            Let&apos;s Make Her Day <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>Unforgettable</em>
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 300, color: 'rgba(255,255,255,0.55)', marginBottom: '28px', maxWidth: '440px', margin: '0 auto 28px' }}>
            Packages from $450. Custom estimates in 24 hours. 50% deposit holds your date.
          </p>
          <Link href="/get-a-quote" className="btn-primary">Get a Free Estimate <ArrowRight size={15} /></Link>
        </div>
      </div>

    </div>
  )
}
