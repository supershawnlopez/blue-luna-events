'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ background: '#0D0F0F', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,200px),1fr))', gap: '48px', padding: 'clamp(48px,8vw,80px) 0 48px' }}>
          <div>
            <Image
              src="/images/logo-white.png"
              alt="Blue Luna Events"
              width={240} height={76}
              style={{ height: '60px', width: 'auto', objectFit: 'contain', marginBottom: '20px', display: 'block', filter: 'brightness(0) invert(1)', opacity: 0.9 }}
            />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.84rem', fontWeight: 300, color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, marginBottom: '24px' }}>
              Tucson&apos;s premier balloon décor and event styling studio.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { href: 'https://instagram.com/bluelunamagic', icon: Instagram, label: 'Instagram' },
                { href: 'https://facebook.com/bluelunamagic', icon: Facebook, label: 'Facebook' },
              ].map(s => (
                <Link key={s.href} href={s.href} target="_blank" aria-label={s.label} style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.45)', transition: 'all 0.2s' }} className="footer-social">
                  <s.icon size={20} />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '18px' }}>Services</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Balloon Décor','Backdrops & Frames','Photo Booth Rental','Audio & MC','All Packages'].map(s => (
                <Link key={s} href="/#packages" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 300, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.2s' }} className="footer-link">{s}</Link>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '18px' }}>Events</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[{l:'Quinceañeras',h:'/quinceaneras'},{l:'Weddings',h:'/#packages'},{l:'Graduations',h:'/graduations'},{l:'Birthdays',h:'/#packages'},{l:'Corporate',h:'/#packages'}].map(e => (
                <Link key={e.l} href={e.h} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 300, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.2s' }} className="footer-link">{e.l}</Link>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '18px' }}>Contact</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[{icon:Phone,label:'(520) 222-6142',href:'tel:5202226142'},{icon:Mail,label:'monica@bluelunaevents.com',href:'mailto:monica@bluelunaevents.com'},{icon:MapPin,label:'Tucson, AZ',href:undefined}].map((c,i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <c.icon size={15} color="rgba(91,191,191,0.6)" style={{ flexShrink: 0 }} />
                  {c.href ? <Link href={c.href} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.84rem', fontWeight: 300, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.2s' }} className="footer-link">{c.label}</Link> : <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.84rem', fontWeight: 300, color: 'rgba(255,255,255,0.5)' }}>{c.label}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 300, color: 'rgba(255,255,255,0.2)' }}>© 2026 Blue Luna Events · Monica Denogean · Tucson, AZ</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 500, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>BLUELUNAEVENTS.COM</span>
        </div>
      </div>
      <style>{`.footer-social:hover{border-color:#5BBFBF!important;color:#5BBFBF!important;background:rgba(91,191,191,0.1)!important}.footer-link:hover{color:#5BBFBF!important}`}</style>
    </footer>
  )
}
