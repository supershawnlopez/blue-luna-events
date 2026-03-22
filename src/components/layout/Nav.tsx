'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const LINKS = [
  { label: 'Packages', href: '/#packages' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/#about' },
  { label: 'Quinceañeras', href: '/quinceaneras', teal: true },
  { label: 'Graduations', href: '/graduations', gold: true },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 1024) setOpen(false) }
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  return (
    <>
      {/* NAV BAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: '68px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(13,15,15,0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: scrolled ? '1px solid rgba(91,191,191,0.2)' : '1px solid rgba(255,255,255,0.06)',
        transition: 'border-color 0.3s',
      }}>
        {/* LOGO — big and proud */}
        <Link href="/" style={{display:'flex',alignItems:'center',minHeight:'44px'}}>
          <Image
            src="/images/logo-white.png"
            alt="Blue Luna Events"
            width={220}
            height={70}
            style={{
              height: '52px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
            priority
          />
        </Link>

        {/* DESKTOP LINKS */}
        <div style={{display:'flex',alignItems:'center',gap:'8px'}} className="hidden lg:flex">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{
              fontSize: '13px', fontWeight: 400,
              color: l.teal ? '#5BBFBF' : l.gold ? '#E8CCA0' : 'rgba(255,255,255,0.78)',
              letterSpacing: '0.04em',
              padding: '8px 14px',
              borderRadius: '8px',
              transition: 'background 0.15s, color 0.15s',
              whiteSpace: 'nowrap',
              minHeight: 'unset',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/get-a-quote" style={{
            marginLeft: '8px',
            background: '#5BBFBF', color: '#0D0F0F',
            fontSize: '13px', fontWeight: 600,
            letterSpacing: '0.02em',
            padding: '10px 22px',
            borderRadius: '999px',
            whiteSpace: 'nowrap',
            minHeight: 'unset',
            transition: 'background 0.2s, transform 0.2s',
            boxShadow: '0 4px 16px rgba(91,191,191,0.3)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#8DD4D4'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#5BBFBF'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Get a Quote
          </Link>
        </div>

        {/* HAMBURGER — always visible on mobile */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '44px', height: '44px',
            background: open ? 'rgba(91,191,191,0.15)' : 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '10px',
            color: 'white', cursor: 'pointer',
            transition: 'background 0.2s',
            minHeight: 'unset',
          }}
          className="lg:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* MOBILE MENU — full screen overlay */}
      {open && (
        <div style={{
          position: 'fixed', top: '68px', left: 0, right: 0, bottom: 0,
          zIndex: 199,
          background: 'rgba(13,15,15,0.98)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          display: 'flex', flexDirection: 'column',
          padding: '24px 24px 40px',
          overflowY: 'auto',
        }}>
          {LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                fontSize: '22px',
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontWeight: 300,
                fontStyle: 'italic',
                color: l.teal ? '#5BBFBF' : l.gold ? '#E8CCA0' : 'rgba(255,255,255,0.88)',
                padding: '18px 0',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                minHeight: 'unset',
                opacity: 0,
                animation: `fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s forwards`,
              }}
            >
              {l.label}
            </Link>
          ))}

          <Link
            href="/get-a-quote"
            onClick={() => setOpen(false)}
            style={{
              marginTop: '28px',
              background: '#5BBFBF', color: '#0D0F0F',
              fontSize: '15px', fontWeight: 600,
              letterSpacing: '0.04em',
              padding: '18px 24px',
              borderRadius: '999px',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(91,191,191,0.35)',
              minHeight: 'unset',
              opacity: 0,
              animation: 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.3s forwards',
            }}
          >
            Get a Quote →
          </Link>

          {/* Contact info in mobile menu */}
          <div style={{
            marginTop: 'auto', paddingTop: '32px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            opacity: 0,
            animation: 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.36s forwards',
          }}>
            <a href="tel:5202226142" style={{
              display: 'block', color: 'rgba(255,255,255,0.4)',
              fontSize: '14px', marginBottom: '8px', minHeight: 'unset',
            }}>
              (520) 222-6142
            </a>
            <a href="mailto:monica@bluelunaevents.com" style={{
              display: 'block', color: 'rgba(255,255,255,0.4)',
              fontSize: '14px', minHeight: 'unset',
            }}>
              monica@bluelunaevents.com
            </a>
          </div>
        </div>
      )}
    </>
  )
}
