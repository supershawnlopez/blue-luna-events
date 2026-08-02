import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, Gift, PartyPopper, Check, ArrowRight } from 'lucide-react'
import { HOMEPAGE_PACKAGES } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Baby Shower Balloon Décor in Tucson, AZ | Blue Luna Events',
  description: 'Baby shower balloon garlands, gender reveal styling, and gift table accents in Tucson, AZ. Soft palettes and custom themes. Tell us your vision for a personal quote.',
  openGraph: {
    title: 'Baby Shower Balloon Décor in Tucson, AZ | Blue Luna Events',
    description: 'Baby shower balloon garlands, gender reveal styling, and gift table accents in Tucson, AZ — custom-built around your vision.',
    url: 'https://bluelunaevents.com/baby-showers',
    images: [{ url: 'https://myumgaqlafbynsgnkdnj.supabase.co/storage/v1/object/public/media/media/1782013254653-sca7wxa90ih.webp', width: 1200, height: 630, alt: 'Baby shower balloon décor in Tucson, AZ' }],
  },
  alternates: { canonical: 'https://bluelunaevents.com/baby-showers' },
}

const FEATURES = [
  { icon: Sparkles, title: 'Soft Palette Garlands', text: 'Blush, sage, cream, and pastel balloon garlands styled around your nursery colors or shower theme.' },
  { icon: PartyPopper, title: 'Gender Reveal Styling', text: 'A confetti-pop or color-reveal balloon moment built for the photo and the video everyone will replay.' },
  { icon: Gift, title: 'Gift & Cake Table Accents', text: 'Balloon arrangements and a backdrop that frame the gift table and cake without crowding the room.' },
]

const PACKAGES = HOMEPAGE_PACKAGES

const FAQS = [
  { q: 'How much does baby shower balloon décor cost in Tucson?', a: 'It depends on garland size, whether you want a gender reveal element, and any backdrop or table accents. Tell us what you\'re picturing and Monica will personally put together a custom quote.' },
  { q: 'Do you do gender reveal setups?', a: 'Yes — confetti-pop balloons, color-reveal installations, and matching backdrops are one of our most requested baby shower add-ons.' },
  { q: 'Can the décor match a specific theme, like safari or boho?', a: 'Absolutely. Share your theme, Pinterest board, or nursery colors and we\'ll build the palette around it.' },
  { q: 'Do you set up indoors and outdoors?', a: 'Both. We regularly style backyard showers, home living rooms, and rented venues all over Tucson.' },
]

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(faq => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
}

export default function BabyShowers() {
  return (
    <div style={{ minHeight: '100vh', background: '#FDFCFA' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      {/* Hero */}
      <div style={{ background: '#FDFCFA', paddingTop: '72px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 60% 50%, rgba(91,191,191,0.1) 0%, transparent 60%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 2, padding: 'clamp(40px,6vw,80px) 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,440px),1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: '20px' }}><div className="eyebrow-line" /><span className="eyebrow-text">Tucson, AZ</span></div>
            <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 300, lineHeight: 1.05, color: '#0D0F0F', marginBottom: '20px' }}>
              Baby Shower<br/><em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>Décor in Tucson</em>
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 300, lineHeight: 1.75, color: '#6B7280', maxWidth: '420px', marginBottom: '32px' }}>
              Welcoming someone new deserves a room this soft, this styled, this ready for every photo.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href="#packages" className="btn-primary">See Packages <ArrowRight size={15} /></a>
              <Link href="/event-questionnaire" className="btn-ghost" style={{ color: '#0D0F0F', borderColor: '#E5E7EB' }}>Tell Us Your Vision</Link>
            </div>
          </div>
          <div style={{ position: 'relative', height: 'clamp(260px,40vw,420px)' }}>
            <div style={{
              position: 'absolute', inset: '6% 12%', borderRadius: '50%',
              background: 'var(--twilight-glow)', filter: 'blur(16px)', pointerEvents: 'none',
            }} />
            <div style={{ position: 'absolute', top: '4%', left: '10%', width: '76%', height: '76%', borderRadius: '50%', overflow: 'hidden', border: '4px solid white', boxShadow: '0 16px 44px rgba(13,15,15,0.16)' }}>
              <Image src="https://myumgaqlafbynsgnkdnj.supabase.co/storage/v1/object/public/media/media/1782013254653-sca7wxa90ih.webp" alt="Baby shower balloon décor Tucson AZ" fill sizes="(max-width: 900px) 90vw, 45vw" priority style={{ objectFit: 'cover' }} />
            </div>
            <div style={{ position: 'absolute', bottom: '2%', right: '0%', width: '38%', height: '38%', borderRadius: '50%', overflow: 'hidden', border: '4px solid white', boxShadow: '0 10px 32px rgba(13,15,15,0.16)' }}>
              <Image src="https://myumgaqlafbynsgnkdnj.supabase.co/storage/v1/object/public/media/media/1782013252329-dq64sgbvcgk.webp" alt="Baby shower balloon décor Tucson AZ" fill sizes="(max-width: 900px) 45vw, 20vw" priority style={{ objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container" style={{ padding: 'clamp(48px,8vw,96px) 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">What We Offer</span><div className="eyebrow-line" /></div>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 300, color: '#0D0F0F' }}>
            Baby Shower <em style={{ fontStyle: 'italic', color: '#3A8F8F' }}>Specialists</em>
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
            <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">Curated Packages</span><div className="eyebrow-line" /></div>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 300, color: '#0D0F0F' }}>
              Baby Shower <em style={{ fontStyle: 'italic', color: '#3A8F8F' }}>Packages</em>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,260px),1fr))', gap: '18px', marginBottom: '32px' }}>
            {PACKAGES.map((pkg, i) => (
              <div key={pkg.id} className="card" style={{ overflow: 'hidden', border: pkg.color === 'teal' ? '1.5px solid #5BBFBF' : '1px solid #E5E7EB', boxShadow: pkg.color === 'teal' ? '0 8px 40px rgba(91,191,191,0.18)' : undefined }}>
                <div style={{ position: 'relative', height: `${120 + i * 25}px` }}>
                  <Image src={pkg.image} alt={pkg.name} fill style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,15,15,0.4)' }} />
                  {pkg.badge && <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#5BBFBF', color: '#0D0F0F', fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '999px' }}>{pkg.badge}</div>}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: pkg.color === 'teal' ? 'linear-gradient(90deg,#5BBFBF,#8DD4D4)' : pkg.color === 'gold' ? 'linear-gradient(90deg,#C9A96E,#E8CCA0)' : pkg.color === 'rose' ? 'linear-gradient(90deg,#F9A8D4,#FBCFE8)' : 'linear-gradient(90deg,#E5E7EB,#D1D5DB)' }} />
                </div>
                <div style={{ padding: '20px' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '3px' }}>{pkg.tier}</p>
                  <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 400, color: '#0D0F0F', marginBottom: '3px' }}>{pkg.name}</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 300, color: '#6B7280', marginBottom: '14px', lineHeight: 1.4, paddingBottom: '14px', borderBottom: '1px solid #F3F4F6' }}>{pkg.tagline}</p>
                  <ul style={{ listStyle: 'none', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {pkg.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <Check size={13} color={pkg.color === 'gold' ? '#C9A96E' : '#5BBFBF'} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 300, color: '#374151', lineHeight: 1.4 }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/event-questionnaire" style={{ width: '100%', padding: '12px', background: pkg.color === 'teal' ? '#5BBFBF' : pkg.color === 'gold' ? 'linear-gradient(135deg,#C9A96E,#E8CCA0)' : pkg.color === 'rose' ? 'linear-gradient(135deg,#F9A8D4,#FBCFE8)' : 'transparent', color: '#0D0F0F', border: pkg.color === 'gray' ? '1.5px solid #E5E7EB' : 'none', borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
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
            Let&apos;s Style the <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>Welcome</em>
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 300, color: 'rgba(255,255,255,0.55)', marginBottom: '28px', maxWidth: '440px', margin: '0 auto 28px' }}>
            Tell us your vision and Monica will personally put together a custom quote within 24 hours.
          </p>
          <Link href="/event-questionnaire" className="btn-primary">Get a Free Estimate <ArrowRight size={15} /></Link>
        </div>
      </div>

    </div>
  )
}
