'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Menu, Instagram, Facebook, ArrowRight } from 'lucide-react'

const LINKS = [
  { label: 'Packages', href: '/#packages' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/#about' },
  { label: 'Quinceañeras', href: '/quinceaneras', color: '#5BBFBF' },
  { label: 'Graduations', href: '/graduations', color: '#E8CCA0' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: '72px',
        background: scrolled ? 'rgba(13,15,15,0.97)' : 'rgba(13,15,15,0.88)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(91,191,191,0.2)' : 'rgba(255,255,255,0.06)'}`,
        transition: 'all 0.3s ease',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '0 32px', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link href="/" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Image
              src="/images/logo-white.png"
              alt="Blue Luna Events"
              width={220} height={70}
              style={{ height: '54px', width: 'auto', objectFit: 'contain', display: 'block' }}
              priority
            />
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="nav-desktop">
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 500,
                color: l.color || 'rgba(255,255,255,0.78)',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                textDecoration: 'none', whiteSpace: 'nowrap', transition: 'color 0.2s',
              }}>
                {l.label}
              </Link>
            ))}
            <Link href="/get-a-quote" style={{
              fontFamily: 'Inter, sans-serif',
              background: '#5BBFBF', color: '#0D0F0F',
              fontSize: '0.78rem', fontWeight: 700,
              letterSpacing: '0.04em',
              padding: '11px 24px', borderRadius: '999px',
              textDecoration: 'none', whiteSpace: 'nowrap',
              boxShadow: '0 4px 20px rgba(91,191,191,0.4)',
              transition: 'all 0.2s',
            }}>
              Get a Quote
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="nav-mobile-btn"
            style={{
              background: 'none', border: 'none',
              color: 'white', cursor: 'pointer',
              padding: '8px', display: 'none',
            }}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* FULL SCREEN MOBILE NAV */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 99,
        background: 'rgba(10,12,12,0.98)',
        backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
        transform: open ? 'translateY(0)' : 'translateY(-100%)',
        opacity: open ? 1 : 0,
        transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease',
        display: 'flex', flexDirection: 'column',
        padding: '0 32px',
        overflow: 'hidden',
      }} className="nav-fullscreen">
        {/* Teal glow */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(91,191,191,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '20px', paddingBottom: '40px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <Image
            src="/images/logo-white.png"
            alt="Blue Luna Events"
            width={200} height={64}
            style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
          />
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '50%', width: '44px', height: '44px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
          {LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '18px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                textDecoration: 'none',
                transform: open ? 'translateX(0)' : 'translateX(-20px)',
                opacity: open ? 1 : 0,
                transition: `transform 0.5s cubic-bezier(0.16,1,0.3,1) ${0.15 + i * 0.06}s, opacity 0.4s ease ${0.1 + i * 0.06}s`,
              }}
            >
              <span style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: '2.2rem', fontWeight: 300,
                color: l.color || 'white',
                letterSpacing: '0.02em',
              }}>
                {l.label}
              </span>
              <ArrowRight size={20} color={l.color || 'rgba(255,255,255,0.3)'} />
            </Link>
          ))}

          {/* CTA link */}
          <Link
            href="/get-a-quote"
            onClick={() => setOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 0',
              textDecoration: 'none',
              transform: open ? 'translateX(0)' : 'translateX(-20px)',
              opacity: open ? 1 : 0,
              transition: `transform 0.5s cubic-bezier(0.16,1,0.3,1) ${0.15 + LINKS.length * 0.06}s, opacity 0.4s ease ${0.1 + LINKS.length * 0.06}s`,
            }}
          >
            <span style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '2.2rem', fontWeight: 300, color: '#5BBFBF',
            }}>
              Get a Quote
            </span>
            <ArrowRight size={20} color="#5BBFBF" />
          </Link>
        </div>

        {/* Bottom — social + contact */}
        <div style={{
          paddingBottom: '40px', paddingTop: '32px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transform: open ? 'translateY(0)' : 'translateY(20px)',
          opacity: open ? 1 : 0,
          transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1) 0.5s, opacity 0.4s ease 0.45s',
        }}>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>
              Follow Us
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}>
              @BlueLunaMagic
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="https://instagram.com/bluelunamagic" target="_blank" style={{
              width: '48px', height: '48px', borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.6)',
            }}>
              <Instagram size={20} />
            </Link>
            <Link href="https://facebook.com/bluelunamagic" target="_blank" style={{
              width: '48px', height: '48px', borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.6)',
            }}>
              <Facebook size={20} />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-mobile-btn { display: none !important; }
        .nav-fullscreen { display: flex !important; }
        @media (max-width: 1023px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
        @media (min-width: 1024px) {
          .nav-fullscreen { display: none !important; }
        }
      `}</style>
    </>
  )
}
