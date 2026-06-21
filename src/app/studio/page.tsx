'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Camera, Upload, Images, FolderOpen, FileText, LogOut, Download } from 'lucide-react'
import StudioNav from '@/components/studio/StudioNav'

type Stats = { totalPhotos: number; onWebsite: number; galleries: number; estimates: number }

export default function StudioHome() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/studio/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setStats(d))
  }, [])

  async function handleLogout() {
    await fetch('/api/studio/auth', { method: 'DELETE' })
    router.push('/studio/login')
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '120px' }}>

      {/* Header */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 24px) 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.22em', color: '#5BBFBF', textTransform: 'uppercase', margin: '0 0 4px' }}>
              Blue Luna Studio
            </p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', margin: 0 }}>
              {greeting}, Monica
            </h1>
          </div>
          <button onClick={handleLogout}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', cursor: 'pointer', display: 'flex', color: 'rgba(255,255,255,0.4)' }}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '28px 24px 0' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px', marginBottom: '36px' }}>
          {[
            { label: 'Photos in Library', value: stats?.totalPhotos, sub: 'total uploaded', href: '/studio/media' },
            { label: 'On Website',        value: stats?.onWebsite,   sub: 'hearted for site', href: '/studio/media?filter=website' },
            { label: 'Live Galleries',    value: stats?.galleries,   sub: 'shared with clients', href: '/studio/galleries' },
            { label: 'Open Estimates',    value: stats?.estimates,   sub: 'pending or sent', href: '/studio/estimates' },
          ].map(({ label, value, sub, href }) => (
            <Link key={label} href={href} style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px 18px', display: 'block', transition: 'border-color 0.15s' }}>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: 'white', margin: '0 0 2px', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {value === undefined || value === null ? <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '1.4rem' }}>—</span> : value}
              </p>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: '0 0 2px' }}>{label}</p>
              <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', margin: 0 }}>{sub}</p>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: '0 0 14px' }}>
          Quick Actions
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { href: '/studio/media',         Icon: Camera,     label: 'Upload Photos',      sub: 'Add new work to your library' },
            { href: '/studio/galleries',      Icon: FolderOpen, label: 'New Client Gallery', sub: 'Share an event with your client' },
            { href: '/studio/estimates/new',  Icon: FileText,   label: 'New Estimate',       sub: 'Build a quote for an event' },
            { href: '/studio/exports',        Icon: Download,   label: 'Export for Social',  sub: 'Download starred photos for Instagram' },
          ].map(({ href, Icon, label, sub }) => (
            <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px 18px', textDecoration: 'none' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'rgba(91,191,191,0.1)', border: '1px solid rgba(91,191,191,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color="#5BBFBF" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', margin: '0 0 2px' }}>{label}</p>
                <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{sub}</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </Link>
          ))}
        </div>
      </div>

      <StudioNav />
    </div>
  )
}
