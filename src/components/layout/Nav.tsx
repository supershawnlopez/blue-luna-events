'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { X, Menu, Instagram, Facebook, ArrowRight } from 'lucide-react'

const LINKS = [
  { label: 'Packages', href: '/#packages' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Quinceañeras', href: '/quinceaneras', color: '#5BBFBF' },
  { label: 'Graduations', href: '/graduations', color: '#E8CCA0' },
]

export default function Nav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  if (pathname?.startsWith('/studio') || pathname?.startsWith('/gallery/')) return null

  // Homepage hero is full-bleed video — let it show through the nav until scrolled past it.
  const overHero = pathname === '/' && !scrolled
  // Every other state (scrolled on homepage, or any other page) now uses the light nav to match the White/Twilight redesign.
  const light = !overHero

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
        background: overHero ? 'transparent' : light ? (scrolled ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.85)') : 'rgba(13,15,15,0.88)',
        backdropFilter: overHero ? 'none' : 'blur(24px)', WebkitBackdropFilter: overHero ? 'none' : 'blur(24px)',
        borderBottom: overHero ? '1px solid transparent' : `1px solid ${light ? '#E5E7EB' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: light && !overHero ? '0 1px 24px rgba(13,15,15,0.04)' : undefined,
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
              src={light ? '/images/logo-color.png' : '/images/logo-white.png'}
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
                color: l.color || (light ? '#374151' : 'rgba(255,255,255,0.78)'),
                letterSpacing: '0.06em', textTransform: 'uppercase',
                textDecoration: 'none', whiteSpace: 'nowrap', transition: 'color 0.2s',
              }}>
                {l.label}
              </Link>
            ))}
            <Link href="/event-questionnaire" style={{
              fontFamily: 'Inter, sans-serif',
              background: '#5BBFBF', color: '#0D0F0F',
              fontSize: '0.78rem', fontWeight: 700,
              letterSpacing: '0.04em',
              padding: '11px 24px', borderRadius: '999px',
              textDecoration: 'none', whiteSpace: 'nowrap',
              boxShadow: '0 4px 20px rgba(91,191,191,0.4)',
              transition: 'all 0.2s',
            }}>
              Event Questionnaire
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="nav-mobile-btn"
            style={{
              background: 'none', border: 'none',
              color: open ? '#0D0F0F' : (light ? '#0D0F0F' : 'white'),
              cursor: 'pointer',
              padding: '8px', display: 'none',
            }}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* FULL SCREEN MOBILE NAV — Calm/Warm variant, per DESIGN_DECISIONS.md */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 99,
        background: 'white',
        borderLeft: '2px solid #5BBFBF',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.45s cubic-bezier(0.16,1,0.3,1)',
        display: 'flex', flexDirection: 'column',
        padding: '0 32px',
        overflow: 'hidden',
      }} className="nav-fullscreen">

        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '20px', paddingBottom: '32px',
          borderBottom: '1px solid #f5f5f5',
        }}>
          <Image
            src="/images/logo-color.png"
            alt="Blue Luna Events"
            width={200} height={64}
            style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
          />
          <button
            onClick={() => setOpen(false)}
            style={{
              background: '#FDFCFA',
              border: '1px solid #E5E7EB',
              borderRadius: '50%', width: '44px', height: '44px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0D0F0F', cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px', overflowY: 'auto' }}>
          {LINKS.map((l, i) => {
            const active = pathname === l.href || (l.href.startsWith('/#') && pathname === '/')
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '18px 0',
                  borderBottom: '1px solid #f5f5f5',
                  textDecoration: 'none',
                  transform: open ? 'translateX(0)' : 'translateX(20px)',
                  opacity: open ? 1 : 0,
                  transition: `transform 0.45s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.05}s, opacity 0.35s ease ${0.08 + i * 0.05}s`,
                }}
              >
                <span className="font-display" style={{
                  fontStyle: 'italic',
                  fontSize: '2rem', fontWeight: 400,
                  color: active ? '#5BBFBF' : (l.color || '#333333'),
                  letterSpacing: '0.01em',
                }}>
                  {l.label}
                </span>
                <ArrowRight size={18} color={l.color || (active ? '#5BBFBF' : '#9CA3AF')} />
              </Link>
            )
          })}
        </div>

        {/* Bottom — phone + CTA, anchored per DESIGN_DECISIONS.md */}
        <div style={{
          paddingBottom: '36px', paddingTop: '24px',
          borderTop: '1px solid #f5f5f5',
          display: 'flex', flexDirection: 'column', gap: '14px',
          transform: open ? 'translateY(0)' : 'translateY(20px)',
          opacity: open ? 1 : 0,
          transition: 'transform 0.45s cubic-bezier(0.16,1,0.3,1) 0.35s, opacity 0.35s ease 0.3s',
        }}>
          <Link
            href="/event-questionnaire"
            onClick={() => setOpen(false)}
            className="btn-primary"
            style={{ justifyContent: 'center', fontSize: '0.9rem', padding: '16px' }}
          >
            Start the Event Questionnaire <ArrowRight size={16} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="tel:5202226142" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 500,
              color: '#374151', textDecoration: 'none',
            }}>
              (520) 222-6142
            </Link>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link href="https://instagram.com/bluelunamagic" target="_blank" aria-label="Instagram" style={{
                width: '40px', height: '40px', borderRadius: '50%',
                border: '1px solid #E5E7EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#374151',
              }}>
                <Instagram size={17} />
              </Link>
              <Link href="https://facebook.com/bluelunamagic" target="_blank" aria-label="Facebook" style={{
                width: '40px', height: '40px', borderRadius: '50%',
                border: '1px solid #E5E7EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#374151',
              }}>
                <Facebook size={17} />
              </Link>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}
