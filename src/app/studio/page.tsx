'use client'

import Link from 'next/link'
import { Camera, FileText, Sparkles, LogOut, TrendingUp, Image, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

const QUICK_ACTIONS = [
  {
    href: '/studio/media',
    icon: Camera,
    label: 'Add Photos',
    sub: 'Upload or capture new work',
    color: '#5BBFBF',
  },
  {
    href: '/studio/estimates/new',
    icon: FileText,
    label: 'New Estimate',
    sub: 'Build a quote for a client',
    color: '#5BBFBF',
  },
  {
    href: '/studio/exports',
    icon: Sparkles,
    label: 'Social Export',
    sub: 'Download sized for Instagram',
    color: '#5BBFBF',
  },
]

const NAV_ITEMS = [
  { href: '/studio/media', icon: Camera, label: 'My Work' },
  { href: '/studio/estimates', icon: FileText, label: 'Estimates' },
  { href: '/studio/exports', icon: Sparkles, label: 'Export' },
]

export default function StudioHub() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/studio/auth', { method: 'DELETE' })
    router.push('/studio/login')
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{
        padding: '56px 24px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', color: '#5BBFBF', textTransform: 'uppercase', marginBottom: '4px' }}>
              Blue Luna Studio
            </p>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 600, color: 'white', letterSpacing: '-0.02em' }}>
              {greeting}, Monica 🌙
            </h1>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', padding: '10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px 0' }}>
        {/* Quick actions */}
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '16px' }}>
          Quick Actions
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
          {QUICK_ACTIONS.map(({ href, icon: Icon, label, sub }) => (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px', padding: '18px 20px',
              textDecoration: 'none', transition: 'all 0.2s',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'rgba(91,191,191,0.12)',
                border: '1px solid rgba(91,191,191,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={20} color="#5BBFBF" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white', marginBottom: '2px' }}>{label}</p>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{sub}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </Link>
          ))}
        </div>

        {/* Stats strip */}
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '16px' }}>
          Overview
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
          {[
            { icon: Image, label: 'In Library', value: '—' },
            { icon: TrendingUp, label: 'On Website', value: '—' },
            { icon: Clock, label: 'Estimates', value: '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px', padding: '18px 14px', textAlign: 'center',
            }}>
              <Icon size={18} color="rgba(255,255,255,0.25)" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white', lineHeight: 1, marginBottom: '4px' }}>{value}</p>
              <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '24px' }}>
          Stats load once Supabase is connected
        </p>
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(13,15,15,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '12px 0 env(safe-area-inset-bottom, 12px)',
        display: 'flex',
        zIndex: 100,
      }}>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            textDecoration: 'none', color: 'rgba(255,255,255,0.4)',
            fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            <Icon size={22} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
