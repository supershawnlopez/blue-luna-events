'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Packages', href: '/#packages' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/#about' },
  { label: 'Quinceañeras', href: '/quinceaneras', highlight: 'teal' },
  { label: 'Graduations ✨', href: '/graduations', highlight: 'gold' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: '72px',
        background: scrolled ? 'rgba(13,15,15,0.95)' : 'rgba(13,15,15,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(91,191,191,0.15)' : '1px solid rgba(255,255,255,0.05)',
        transition: 'all 0.3s ease',
      }}>
        <Link href="/">
          <Image
            src="/images/logo-white.png"
            alt="Blue Luna Events"
            width={180}
            height={52}
            style={{height: '44px', width: 'auto', objectFit: 'contain'}}
            priority
          />
        </Link>

        {/* Desktop */}
        <ul style={{display: 'flex', alignItems: 'center', gap: '32px', listStyle: 'none', margin: 0, padding: 0}} className="hidden lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} style={{
                fontSize: '0.75rem', fontWeight: 400,
                color: link.highlight === 'teal' ? '#5BBFBF' : link.highlight === 'gold' ? '#E8CCA0' : 'rgba(255,255,255,0.8)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                textDecoration: 'none', whiteSpace: 'nowrap',
                transition: 'color 0.2s',
              }}>
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/get-a-quote" style={{
              background: '#5BBFBF', color: '#0D0F0F',
              fontSize: '0.75rem', fontWeight: 500,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '10px 24px', borderRadius: '999px',
              textDecoration: 'none', whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}>
              Get a Quote
            </Link>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px'}}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: '72px', left: 0, right: 0, zIndex: 99,
          background: 'rgba(13,15,15,0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(91,191,191,0.15)',
          padding: '16px 24px 32px',
          display: 'flex', flexDirection: 'column',
        }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '14px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                textDecoration: 'none',
                color: link.highlight === 'teal' ? '#5BBFBF' : link.highlight === 'gold' ? '#E8CCA0' : 'rgba(255,255,255,0.8)',
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/get-a-quote"
            onClick={() => setMobileOpen(false)}
            style={{
              marginTop: '16px', background: '#5BBFBF', color: '#0D0F0F',
              fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.08em',
              textTransform: 'uppercase', padding: '14px 24px',
              borderRadius: '999px', textAlign: 'center', textDecoration: 'none',
            }}
          >
            Get a Quote
          </Link>
        </div>
      )}
    </>
  )
}
