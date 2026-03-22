'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, X, ArrowRight, Phone, Mail, Calendar, User } from 'lucide-react'
import { submitLead } from '@/lib/actions'

const PACKAGES = [
  {
    tier: '01', name: 'Essential',
    tagline: 'Birthdays, baby showers & intimate celebrations',
    price: '$350', color: 'gray', image: '/images/gal-4.jpg',
    features: ['Up to 12 ft balloon garland','Custom color palette','Standard delivery & setup','Up to 2 centerpieces'],
    cta: 'Book Essential',
  },
  {
    tier: '02', name: 'Signature', badge: 'Most Popular',
    tagline: 'Quinceañeras, weddings & milestone events',
    price: '$900', color: 'teal', image: '/images/gal-2.jpg',
    features: ['Up to 20 ft luxury garland','Shimmer backdrop + frame','2 balloon columns with toppers','3 premium centerpieces','Premium delivery, setup & takedown'],
    cta: 'Book Signature',
  },
  {
    tier: '03', name: 'Luxury',
    tagline: 'Full event transformation with photo booth & MC',
    price: '$1,800', color: 'gold', image: '/images/hero-main.jpg',
    features: ['Everything in Signature','Photo booth rental (4 hrs)','Professional audio setup','MC services included',"Tucson's only all-in-one studio"],
    cta: 'Book Luxury',
  },
]

export function BookingSheet({ pkg, onClose }: { pkg: { name: string; price: string; image: string } | null; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', event_date: '' })

  if (!pkg) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = await submitLead({
      ...form,
      event_type: pkg!.name + ' Package',
      vision: `Interested in the ${pkg!.name} package (from ${pkg!.price})`,
    })
    if (result.success) setDone(true)
    setLoading(false)
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', animation: 'fadeIn 0.25s ease both' }} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201, background: 'white', borderRadius: '28px 28px 0 0', paddingBottom: 'env(safe-area-inset-bottom, 24px)', maxHeight: '90vh', overflowY: 'auto', animation: 'slideUp 0.45s cubic-bezier(0.16,1,0.3,1) both', boxShadow: '0 -20px 80px rgba(0,0,0,0.25)' }}>
        <div style={{ width: '36px', height: '4px', background: '#E5E7EB', borderRadius: '2px', margin: '14px auto 0' }} />
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={16} color="#6B7280" />
        </button>
        <div style={{ padding: '20px 24px 32px' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(91,191,191,0.12)', border: '2px solid #5BBFBF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Check size={28} color="#5BBFBF" />
              </div>
              <h3 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 400, color: '#0D0F0F', marginBottom: '8px' }}>You&apos;re on our list! 🌙</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 300, color: '#6B7280', lineHeight: 1.6 }}>Monica will text you within 2 hours to confirm your date and walk you through the deposit.</p>
            </div>
          ) : (
            <>
              {/* Clean white package header */}
              <div style={{ borderRadius: '16px', border: '1.5px solid #E5E7EB', overflow: 'hidden', marginBottom: '24px' }}>
                <div style={{ position: 'relative', height: '120px' }}>
                  <Image src={pkg.image} alt={pkg.name} fill style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,15,15,0.5)' }} />
                  <div style={{ position: 'absolute', inset: 0, padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 700, color: '#5BBFBF', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>{pkg.name} Package</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.8rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>from {pkg.price}</p>
                  </div>
                </div>
                <div style={{ background: '#FAFAFA', padding: '12px 20px', borderTop: '1px solid #E5E7EB' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 400, color: '#6B7280' }}>50% deposit · Monica confirms within 2 hrs · Balance due 1 week before</p>
                </div>
              </div>

              <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: '#0D0F0F', marginBottom: '4px' }}>Reserve Your Date</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 300, color: '#6B7280', marginBottom: '20px' }}>Takes 30 seconds. Monica will reach out personally.</p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div><label className="input-label"><User size={11} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />Your Name</label><input className="input-field" placeholder="Maria Hernandez" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                <div><label className="input-label"><Phone size={11} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />Phone Number</label><input className="input-field" type="tel" placeholder="(520) 555-0100" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div><label className="input-label"><Mail size={11} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />Email Address</label><input className="input-field" type="email" placeholder="maria@email.com" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div><label className="input-label"><Calendar size={11} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />Event Date</label><input className="input-field" type="date" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} /></div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', background: loading ? '#9CA3AF' : '#5BBFBF', color: '#0D0F0F', border: 'none', borderRadius: '14px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: loading ? 'none' : '0 4px 20px rgba(91,191,191,0.4)', marginTop: '4px' }}>
                  {loading ? 'Sending...' : <><span>Request {pkg.name} Package</span><ArrowRight size={16} /></>}
                </button>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#9CA3AF', textAlign: 'center', lineHeight: 1.5 }}>No commitment yet — Monica confirms availability and next steps.</p>
              </form>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </>
  )
}

export default function Packages() {
  const [selectedPkg, setSelectedPkg] = useState<{ name: string; price: string; image: string } | null>(null)

  return (
    <section id="packages" style={{ padding: 'clamp(64px,10vw,120px) 0', background: '#FDFCFA' }}>
      <div className="container">
        <div style={{ marginBottom: '52px' }} className="reveal">
          <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Transparent Pricing</span></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, color: '#0D0F0F', lineHeight: 1.1 }}>
              Choose Your <em style={{ fontStyle: 'italic', color: '#3A8F8F' }}>Experience</em>
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 300, color: '#6B7280', maxWidth: '420px', lineHeight: 1.7 }}>
              Every package includes professional installation. Not sure which fits? We build custom — just reach out.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,300px),1fr))', gap: '20px' }}>
          {PACKAGES.map((pkg, i) => (
            <div key={pkg.name} className={`card reveal reveal-delay-${i+1}`} style={{ overflow: 'hidden', cursor: 'pointer', border: pkg.color === 'teal' ? '1.5px solid #5BBFBF' : '1px solid #E5E7EB', boxShadow: pkg.color === 'teal' ? '0 8px 40px rgba(91,191,191,0.18)' : undefined }} onClick={() => setSelectedPkg(pkg)}>
              <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                <Image src={pkg.image} alt={pkg.name} fill style={{ objectFit: 'cover', transition: 'transform 0.5s' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(13,15,15,0.6) 100%)' }} />
                {pkg.badge && <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#5BBFBF', color: '#0D0F0F', fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '999px' }}>{pkg.badge}</div>}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: pkg.color === 'teal' ? 'linear-gradient(90deg,#5BBFBF,#8DD4D4)' : pkg.color === 'gold' ? 'linear-gradient(90deg,#C9A96E,#E8CCA0)' : 'linear-gradient(90deg,#E5E7EB,#D1D5DB)' }} />
              </div>
              <div style={{ padding: '24px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>Tier {pkg.tier}</p>
                <h3 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 400, color: '#0D0F0F', marginBottom: '3px' }}>{pkg.name}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 300, color: '#6B7280', marginBottom: '18px', lineHeight: 1.5 }}>{pkg.tagline}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '18px', paddingBottom: '18px', borderBottom: '1px solid #F3F4F6' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#9CA3AF' }}>from</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.2rem', fontWeight: 700, color: '#0D0F0F', lineHeight: 1, letterSpacing: '-0.02em' }}>{pkg.price}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#9CA3AF', paddingBottom: '4px' }}>installed</span>
                </div>
                <ul style={{ listStyle: 'none', marginBottom: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pkg.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                      <Check size={14} color={pkg.color === 'gold' ? '#C9A96E' : '#5BBFBF'} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.84rem', fontWeight: 300, color: '#374151', lineHeight: 1.4 }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => setSelectedPkg(pkg)} style={{ width: '100%', padding: '13px', background: pkg.color === 'teal' ? '#5BBFBF' : pkg.color === 'gold' ? 'linear-gradient(135deg,#C9A96E,#E8CCA0)' : 'transparent', color: '#0D0F0F', border: pkg.color === 'gray' ? '1.5px solid #E5E7EB' : 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: pkg.color === 'teal' ? '0 4px 16px rgba(91,191,191,0.3)' : undefined, transition: 'all 0.2s' }}>
                  {pkg.cta} <ArrowRight size={14} />
                </button>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#9CA3AF', textAlign: 'center', marginTop: '10px' }}>50% deposit · Balance due 1 week before</p>
              </div>
            </div>
          ))}
        </div>

        <p className="reveal" style={{ fontFamily: 'Inter, sans-serif', textAlign: 'center', marginTop: '28px', fontSize: '0.85rem', fontWeight: 300, color: '#6B7280' }}>
          Need something custom? <a href="/get-a-quote" style={{ color: '#3A8F8F', borderBottom: '1px solid #3A8F8F' }}>Tell us your vision</a> and we&apos;ll build it. <strong style={{ color: '#0D0F0F', fontWeight: 500 }}>Zelle · Check · Cash accepted.</strong>
        </p>
      </div>
      {selectedPkg && <BookingSheet pkg={selectedPkg} onClose={() => setSelectedPkg(null)} />}
    </section>
  )
}
