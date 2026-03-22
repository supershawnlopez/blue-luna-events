'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { NAV_LINKS } from '@/lib/config'
import { Menu, X } from 'lucide-react'

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
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-20 transition-all duration-300 ${
        scrolled ? 'bg-ink/93 backdrop-blur-xl border-b border-teal/15' : ''
      }`}>
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo-white.png"
            alt="Blue Luna Events"
            width={180}
            height={58}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-xs font-normal tracking-widest uppercase transition-colors duration-200 ${
                  link.highlight === 'teal'
                    ? 'text-teal hover:text-teal-light'
                    : link.highlight === 'gold'
                    ? 'text-gold-light hover:text-gold'
                    : 'text-white/70 hover:text-teal'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/get-a-quote"
              className="bg-teal text-ink text-xs font-medium tracking-wide uppercase px-6 py-3 rounded-pill transition-all duration-200 hover:bg-teal-light hover:-translate-y-0.5 shadow-lg shadow-teal/30"
            >
              Get a Quote
            </Link>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed top-20 left-0 right-0 z-40 bg-ink/97 backdrop-blur-xl border-b border-teal/15 flex flex-col px-6 py-6 gap-0">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`text-sm tracking-widest uppercase py-4 border-b border-white/6 transition-colors ${
                link.highlight === 'teal' ? 'text-teal' :
                link.highlight === 'gold' ? 'text-gold-light' :
                'text-white/70 hover:text-teal'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/get-a-quote"
            onClick={() => setMobileOpen(false)}
            className="mt-5 bg-teal text-ink text-sm font-medium tracking-wide uppercase py-4 rounded-pill text-center"
          >
            Get a Quote
          </Link>
        </div>
      )}
    </>
  )
}
