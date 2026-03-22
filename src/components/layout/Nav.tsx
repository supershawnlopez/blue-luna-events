'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

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

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: '68px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        background: scrolled ? 'rgba(13,15,15,0.96)' : 'rgba(13,15,15,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(91,191,191,0.18)' : 'rgba(255,255,255,0.06)'}`,
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        {/* Logo — always visible, always white */}
        <Link href="/" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Image
            src="/images/logo-white.png"
            alt="Blue Luna Events"
            width={200}
            height={64}
            style={{
              height: '48px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
            priority
          />
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '28px',
        }} className="hidden-mobile">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.78rem', fontWeight: 500,
              color: l.color || 'rgba(255,255,255,0.78)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              textDecoration: 'none', whiteSpace: 'nowrap',
              transition: 'color 0.2s',
            }}>
              {l.label}
            </Link>
          ))}
          <Link href="/get-a-quote" style={{
            fontFamily: 'Inter, sans-serif',
            background: '#5BBFBF', color: '#0D0F0F',
            fontSize: '0.78rem', fontWeight: 600,
            letterSpacing: '0.04em',
            padding: '10px 22px', borderRadius: '999px',
            textDecoration: 'none', whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(91,191,191,0.35)',
            transition: 'all 0.2s',
          }}>
            Get a Quote
          </Link>
        </div>

        {/* Mobile hamburger — hidden on desktop */}
        <button
          onClick={() => setOpen(!open)}
          className="show-mobile"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '10px',
            color: 'white', cursor: 'pointer',
            width: '42px', height: '42px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.2s',
          }}
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 98,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transition: 'opacity 0.3s',
        }}
      />

      {/* Mobile menu sheet */}
      <div style={{
        position: 'fixed', top: '68px', left: '12px', right: '12px',
        zIndex: 99,
        background: 'rgba(13,15,15,0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '20px',
        border: '1px solid rgba(91,191,191,0.2)',
        padding: '8px',
        transform: open ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.97)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'all' : 'none',
        transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.25s',
      }} className="show-mobile">
        {LINKS.map((l, i) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            style={{
              display: 'flex', alignItems: 'center',
              padding: '14px 16px',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem', fontWeight: 500,
              color: l.color || 'rgba(255,255,255,0.85)',
              textDecoration: 'none',
              transition: 'background 0.15s',
              borderBottom: i < LINKS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            {l.label}
          </Link>
        ))}
        <div style={{ padding: '8px 8px 4px' }}>
          <Link
            href="/get-a-quote"
            onClick={() => setOpen(false)}
            style={{
              display: 'block', textAlign: 'center',
              background: '#5BBFBF', color: '#0D0F0F',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9rem', fontWeight: 600,
              padding: '14px', borderRadius: '14px',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(91,191,191,0.4)',
            }}
          >
            Get a Quote
          </Link>
        </div>
      </div>

      {/* CSS for show/hide classes */}
      <style>{`
        .hidden-mobile { display: flex !important; }
        .show-mobile { display: none !important; }
        @media (max-width: 1023px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </>
  )
}
