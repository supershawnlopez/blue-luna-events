'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Check } from 'lucide-react'

const packages = [
  {
    tier: '01',
    name: 'Essential',
    tagline: 'Perfect for birthdays, baby showers & intimate celebrations',
    price: '$350',
    note: 'installed',
    photo: '/images/gal-4.jpg',
    photoAlt: 'Birthday balloon setup Tucson',
    color: 'gray',
    features: ['Up to 12 ft balloon garland', 'Custom color palette', 'Standard delivery & setup', 'Up to 2 centerpieces'],
    cta: 'Book Essential',
    ctaHint: 'from $350 · 50% deposit holds your date',
  },
  {
    tier: '02',
    name: 'Signature',
    tagline: 'Our most-loved setup for quinceañeras, weddings & milestone events',
    price: '$900',
    note: 'installed',
    photo: '/images/gal-2.jpg',
    photoAlt: 'Quinceañera balloon decor Tucson',
    color: 'teal',
    badge: 'Most Popular',
    features: ['Up to 20 ft luxury garland', 'Shimmer backdrop + frame', '2 balloon columns with toppers', '3 premium centerpieces', 'Premium delivery, setup & takedown'],
    cta: 'Book Signature',
    ctaHint: 'from $900 · 50% deposit holds your date',
  },
  {
    tier: '03',
    name: 'Luxury',
    tagline: 'Full event transformation — balloons, photo booth, audio & MC',
    price: '$1,800',
    note: 'full service',
    photo: '/images/hero-main.jpg',
    photoAlt: 'Full service luxury event Tucson',
    color: 'gold',
    features: ['Everything in Signature', 'Photo booth rental (4 hrs)', 'Professional audio setup', 'MC services included', "Tucson's only all-in-one studio"],
    cta: 'Get Luxury Quote',
    ctaHint: 'from $1,800 · custom quote included',
  },
]

export default function Packages() {
  return (
    <section id="packages" style={{padding: 'clamp(64px, 10vw, 120px) 0', background: '#FDFCFA'}}>
      <div style={{maxWidth:'1280px', margin:'0 auto', padding:'0 24px'}}>

        {/* Header */}
        <div className="reveal" style={{marginBottom:'48px'}}>
          <div style={{display:'inline-flex', alignItems:'center', gap:'10px', marginBottom:'14px'}}>
            <div style={{width:'24px', height:'1px', background:'#5BBFBF'}} />
            <span style={{fontFamily:'DM Mono,monospace', fontSize:'11px', color:'#5BBFBF', letterSpacing:'0.18em', textTransform:'uppercase'}}>Transparent Pricing</span>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr', gap:'16px'}} className="lg:grid-cols-2-auto">
            <h2 style={{fontFamily:'Cormorant Garamond,Georgia,serif', fontSize:'clamp(2.2rem,5vw,3.6rem)', fontWeight:300, lineHeight:1.1, color:'#0D0F0F'}}>
              Choose Your <em style={{fontStyle:'italic', color:'#3A8F8F'}}>Experience</em>
            </h2>
            <p style={{fontSize:'15px', fontWeight:300, lineHeight:1.75, color:'#4A5050', maxWidth:'520px'}}>
              Every package includes professional installation and on-site styling. Not sure which fits? We build something custom — just reach out.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '20px',
        }}>
          {packages.map((pkg, i) => (
            <div key={pkg.name} className={`reveal rd${i+1}`} style={{
              background: 'white',
              borderRadius: '20px',
              overflow: 'hidden',
              border: pkg.color === 'teal'
                ? '1.5px solid #5BBFBF'
                : '1.5px solid #E4E8E8',
              boxShadow: pkg.color === 'teal'
                ? '0 12px 48px rgba(91,191,191,0.18)'
                : '0 2px 16px rgba(0,0,0,0.04)',
              transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s',
              position: 'relative',
              display: 'flex', flexDirection: 'column',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = pkg.color === 'teal' ? '0 24px 60px rgba(91,191,191,0.25)' : '0 24px 60px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = pkg.color === 'teal' ? '0 12px 48px rgba(91,191,191,0.18)' : '0 2px 16px rgba(0,0,0,0.04)'; }}
            >
              {/* Photo */}
              <div style={{position:'relative', height:'200px', overflow:'hidden', flexShrink:0}}>
                <Image src={pkg.photo} alt={pkg.photoAlt} fill style={{objectFit:'cover'}} />
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom, rgba(13,15,15,0.1) 0%, rgba(13,15,15,0.4) 100%)'}} />
                {/* Price overlay */}
                <div style={{position:'absolute',bottom:'14px',left:'16px'}}>
                  <span style={{fontFamily:'Cormorant Garamond,serif', fontSize:'2.2rem', fontWeight:600, color:'white', lineHeight:1, textShadow:'0 2px 8px rgba(0,0,0,0.5)'}}>
                    {pkg.price}
                  </span>
                  <span style={{fontSize:'12px', color:'rgba(255,255,255,0.7)', marginLeft:'6px'}}>{pkg.note}</span>
                </div>
                {pkg.badge && (
                  <div style={{position:'absolute',top:'14px',right:'14px', background:'#5BBFBF', color:'#0D0F0F', fontSize:'10px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', padding:'4px 12px', borderRadius:'999px'}}>
                    {pkg.badge}
                  </div>
                )}
              </div>

              {/* Color bar */}
              <div style={{
                height: '3px',
                background: pkg.color === 'teal' ? 'linear-gradient(90deg, #5BBFBF, #8DD4D4)'
                  : pkg.color === 'gold' ? 'linear-gradient(90deg, #C9A96E, #E8CCA0)'
                  : 'linear-gradient(90deg, #D4D8D8, #C0C8C8)',
              }} />

              {/* Body */}
              <div style={{padding:'24px', display:'flex', flexDirection:'column', flex:1}}>
                <div style={{fontFamily:'DM Mono,monospace', fontSize:'10px', color:'#8A8F8F', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'6px'}}>Tier {pkg.tier}</div>
                <h3 style={{fontFamily:'Cormorant Garamond,serif', fontSize:'1.8rem', fontWeight:300, color:'#0D0F0F', marginBottom:'6px'}}>{pkg.name}</h3>
                <p style={{fontSize:'13px', fontWeight:300, color:'#8A8F8F', lineHeight:1.5, marginBottom:'20px'}}>{pkg.tagline}</p>

                {/* Features */}
                <ul style={{listStyle:'none', marginBottom:'24px', flex:1}}>
                  {pkg.features.map(f => (
                    <li key={f} style={{display:'flex', alignItems:'flex-start', gap:'10px', padding:'8px 0', borderBottom:'1px solid rgba(0,0,0,0.05)', fontSize:'14px', fontWeight:300, color:'#3A4040', lineHeight:1.4}}>
                      <Check size={15} style={{flexShrink:0, marginTop:'1px', color: pkg.color === 'gold' ? '#C9A96E' : '#5BBFBF'}} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href="/get-a-quote" style={{
                  display: 'block', textAlign: 'center',
                  padding: '15px 20px', borderRadius: '999px',
                  fontSize: '14px', fontWeight: 600,
                  letterSpacing: '0.02em',
                  marginBottom: '10px',
                  transition: 'all 0.2s',
                  minHeight: 'unset',
                  ...(pkg.color === 'teal'
                    ? {background:'#5BBFBF', color:'#0D0F0F', boxShadow:'0 4px 16px rgba(91,191,191,0.3)'}
                    : pkg.color === 'gold'
                    ? {background:'linear-gradient(135deg,#C9A96E,#E8CCA0)', color:'#0D0F0F', boxShadow:'0 4px 16px rgba(201,169,110,0.3)'}
                    : {border:'1.5px solid #D4D8D8', color:'#0D0F0F', background:'white'}),
                }}>
                  {pkg.cta}
                </Link>
                <p style={{fontSize:'11px', color:'#8A8F8F', textAlign:'center', fontWeight:300}}>{pkg.ctaHint}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="reveal" style={{textAlign:'center', marginTop:'28px', fontSize:'13px', color:'#8A8F8F', fontWeight:300}}>
          All packages include a custom estimate.{' '}
          <Link href="/get-a-quote" style={{color:'#3A8F8F', borderBottom:'1px solid rgba(58,143,143,0.3)', minHeight:'unset'}}>Contact us</Link>
          {' '}for exact pricing based on your event & vision.{' '}
          <strong style={{color:'#0D0F0F', fontWeight:500}}>Zelle · Check · Cash accepted.</strong>
        </p>
      </div>
    </section>
  )
}
