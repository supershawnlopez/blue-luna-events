'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Palette, Camera, Zap, Check, ArrowRight, GraduationCap } from 'lucide-react'
import { BookingSheet } from '@/components/sections/Packages'

const FEATURES = [
  { icon: Palette, title: 'School Color Palettes', text: "We match your grad's school colors perfectly — garlands, backdrops, and centerpieces all coordinated." },
  { icon: Camera, title: 'Photo-Ready Setups', text: 'Every setup is designed to look incredible in photos. Instagram-worthy guaranteed.' },
  { icon: Zap, title: 'Fast Turnaround', text: 'Need it quick? We accommodate rush bookings. Call us today — dates are filling fast.' },
]

const PACKAGES = [
  {
    tier: '01', name: 'Celebrate',
    tagline: 'Backyard parties and budget-conscious grads',
    price: '$299', color: 'gray', image: '/images/gal-5.jpg',
    features: ['Up to 8 ft balloon garland', 'Custom school colors', 'Standard delivery & setup', '1 centerpiece'],
    cta: 'Book Celebrate',
  },
  {
    tier: '02', name: 'Classic', badge: 'Most Popular',
    tagline: 'The perfect grad party setup — festive and memorable',
    price: '$550', color: 'teal', image: '/images/gal-4.jpg',
    features: ['Up to 15 ft balloon garland', 'Shimmer backdrop', '2 balloon columns', '2 centerpieces', 'Standard delivery & setup'],
    cta: 'Book Classic',
  },
  {
    tier: '03', name: 'Grand',
    tagline: 'Full wow factor — the grad party of the year',
    price: '$950', color: 'gold', image: '/images/hero-main.jpg',
    features: ['Up to 20 ft luxury garland', 'Shimmer backdrop + frame', '2 balloon columns with toppers', '3 premium centerpieces', 'Photo booth rental (2 hrs)', 'Premium delivery, setup & takedown'],
    cta: 'Book Grand',
  },
]

const FAQS = [
  { q: 'How much does a graduation party balloon setup cost in Tucson?', a: 'Graduation setups start at $299 for the Celebrate package. Most families choose the Classic at $550. For a full party experience with photo booth, the Grand package is $950.' },
  { q: "Can you match my grad's school colors?", a: "Absolutely! We can match any school color palette. Just let us know the colors when you request your quote." },
  { q: 'How quickly can you set up?', a: 'We typically need 2–4 hours for setup. Rush bookings under 48 hours have a $75 fee. We recommend booking at least 2 weeks in advance.' },
  { q: 'Do you do outdoor graduation parties?', a: 'Yes! We do both indoor and outdoor setups using weighted bases and wind-resistant techniques.' },
]

export default function Graduations() {
  const [selectedPkg, setSelectedPkg] = useState<{ name: string; price: string; image: string } | null>(null)

  return (
    <div style={{ minHeight: '100vh', background: '#FDFCFA' }}>
      {/* Hero */}
      <div style={{ background: '#0D0F0F', paddingTop: '72px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 40% 50%, rgba(201,169,110,0.1) 0%, transparent 60%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 2, padding: 'clamp(40px,6vw,80px) 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,440px),1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.25)', borderRadius: '999px', padding: '6px 14px', marginBottom: '20px' }}>
              <GraduationCap size={14} color="#E8CCA0" />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#E8CCA0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Class of 2026</span>
            </div>
            <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 300, lineHeight: 1.05, color: 'white', marginBottom: '16px' }}>
              Graduation Party<br/><em style={{ fontStyle: 'italic', color: '#E8CCA0' }}>Balloon Décor</em>
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 300, lineHeight: 1.75, color: 'rgba(255,255,255,0.6)', maxWidth: '420px', marginBottom: '12px' }}>
              They worked hard for this moment — celebrate it right. Packages from $299.
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 500, color: '#E8CCA0', marginBottom: '28px' }}>
              May &amp; June dates filling fast — book now to secure yours.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href="#packages" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg,#C9A96E,#E8CCA0)', color: '#0D0F0F', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 700, padding: '14px 28px', borderRadius: '999px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(201,169,110,0.4)' }}>
                See Packages <ArrowRight size={15} />
              </a>
              <Link href="/get-a-quote" className="btn-ghost">Get a Custom Quote</Link>
            </div>
          </div>
          <div style={{ position: 'relative', height: 'clamp(260px,40vw,420px)', borderRadius: '20px', overflow: 'hidden' }}>
            <Image src="/images/gal-4.jpg" alt="Graduation party balloon décor Tucson AZ" fill style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </div>

      {/* Urgency strip */}
      <div style={{ background: 'linear-gradient(135deg,#C9A96E,#E8CCA0)', padding: '14px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 500, color: '#0D0F0F' }}>
          <GraduationCap size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
          <strong>Graduation season is here.</strong> Limited May &amp; June dates remaining —{' '}
          <Link href="/get-a-quote" style={{ color: '#0D0F0F', fontWeight: 700, textDecoration: 'underline' }}>book today before your date is gone.</Link>
        </p>
      </div>

      <div className="container" style={{ padding: 'clamp(48px,8vw,96px) 24px' }}>
        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,240px),1fr))', gap: '20px', marginBottom: '64px' }}>
          {FEATURES.map(f => (
            <div key={f.title} className="card" style={{ padding: '28px', textAlign: 'center' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <f.icon size={22} color="#C9A96E" />
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
              Graduation <em style={{ fontStyle: 'italic', color: '#3A8F8F' }}>Packages</em>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,280px),1fr))', gap: '18px', marginBottom: '32px' }}>
            {PACKAGES.map(pkg => (
              <div key={pkg.name} className="card" style={{ overflow: 'hidden', cursor: 'pointer', border: pkg.color === 'teal' ? '1.5px solid #5BBFBF' : '1px solid #E5E7EB', boxShadow: pkg.color === 'teal' ? '0 8px 40px rgba(91,191,191,0.18)' : undefined }} onClick={() => setSelectedPkg(pkg)}>
                <div style={{ position: 'relative', height: '160px' }}>
                  <Image src={pkg.image} alt={pkg.name} fill style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,15,15,0.35)' }} />
                  {pkg.badge && <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#5BBFBF', color: '#0D0F0F', fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '999px' }}>{pkg.badge}</div>}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: pkg.color === 'teal' ? 'linear-gradient(90deg,#5BBFBF,#8DD4D4)' : pkg.color === 'gold' ? 'linear-gradient(90deg,#C9A96E,#E8CCA0)' : 'linear-gradient(90deg,#E5E7EB,#D1D5DB)' }} />
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 400, color: '#0D0F0F', marginBottom: '3px' }}>{pkg.name}</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 300, color: '#6B7280', marginBottom: '14px', lineHeight: 1.4 }}>{pkg.tagline}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #F3F4F6' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#9CA3AF' }}>from</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.9rem', fontWeight: 700, color: '#0D0F0F', lineHeight: 1, letterSpacing: '-0.02em' }}>{pkg.price}</span>
                  </div>
                  <ul style={{ listStyle: 'none', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {pkg.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <Check size={13} color={pkg.color === 'gold' ? '#C9A96E' : '#5BBFBF'} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 300, color: '#374151', lineHeight: 1.4 }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => setSelectedPkg(pkg)} style={{ width: '100%', padding: '12px', background: pkg.color === 'teal' ? '#5BBFBF' : pkg.color === 'gold' ? 'linear-gradient(135deg,#C9A96E,#E8CCA0)' : 'transparent', color: '#0D0F0F', border: pkg.color === 'gray' ? '1.5px solid #E5E7EB' : 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    {pkg.cta} <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: '680px', margin: '64px auto 0' }}>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 300, color: '#0D0F0F', textAlign: 'center', marginBottom: '32px' }}>
            Graduation Party <em style={{ fontStyle: 'italic', color: '#3A8F8F' }}>FAQ</em>
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
            Celebrate the <em style={{ fontStyle: 'italic', color: '#E8CCA0' }}>Class of 2026</em>
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 300, color: 'rgba(255,255,255,0.55)', marginBottom: '10px', maxWidth: '400px', margin: '0 auto 10px' }}>
            Packages from $299. Dates are filling fast.
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#E8CCA0', marginBottom: '28px' }}>May &amp; June availability is limited</p>
          <Link href="/get-a-quote" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg,#C9A96E,#E8CCA0)', color: '#0D0F0F', fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 700, padding: '15px 32px', borderRadius: '999px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(201,169,110,0.4)' }}>
            Reserve Your Graduation Date <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {selectedPkg && <BookingSheet pkg={selectedPkg} onClose={() => setSelectedPkg(null)} />}
    </div>
  )
}
