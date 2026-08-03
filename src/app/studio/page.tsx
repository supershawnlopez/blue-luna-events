'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Camera, FolderOpen, FileText, LogOut, Download, Phone, CalendarClock, CircleDollarSign, Sparkles, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react'
import StudioNav from '@/components/studio/StudioNav'

type Stats = { totalPhotos: number; onWebsite: number; galleries: number; estimates: number }

type AnalyticsData = {
  visitsThisWeek: number
  visitsPrevWeek: number
  channels: { channel: string; count: number }[]
}

type TodayData = {
  leads: { count: number; items: { id: string; name: string; phone: string; eventType: string; daysWaiting: number }[] }
  eventsSoon: { id: string; clientName: string; eventType: string; eventDate: string; daysUntil: number; amountOwed: number }[]
  paymentsDue: { id: string; clientName: string; eventType: string; eventDate: string; daysUntil: number; amountOwed: number }[]
  social: { readyCount: number }
}

type TodayItem = {
  key: string
  tone: 'urgent' | 'attention' | 'neutral'
  icon: typeof Phone
  title: string
  sub: string
  href: string
  priority: number
}

function buildTodayItems(data: TodayData): TodayItem[] {
  const items: TodayItem[] = []
  const paymentIds = new Set(data.paymentsDue.map(p => p.id))

  for (const p of data.paymentsDue) {
    items.push({
      key: `pay-${p.id}`,
      tone: p.daysUntil <= 3 ? 'urgent' : 'attention',
      icon: CircleDollarSign,
      title: `Balance due — ${p.clientName}`,
      sub: `${p.eventType || 'Event'} in ${p.daysUntil === 0 ? 'today' : p.daysUntil === 1 ? '1 day' : `${p.daysUntil} days`} · $${p.amountOwed.toFixed(0)} owed`,
      href: `/studio/estimates/${p.id}`,
      priority: p.daysUntil <= 3 ? 0 : 2,
    })
  }

  for (const l of data.leads.items) {
    items.push({
      key: `lead-${l.id}`,
      tone: l.daysWaiting >= 2 ? 'attention' : 'neutral',
      icon: Phone,
      title: `New inquiry — ${l.name}`,
      sub: `${l.eventType || 'Event'} · waiting ${l.daysWaiting === 0 ? 'since today' : l.daysWaiting === 1 ? '1 day' : `${l.daysWaiting} days`}`,
      href: `tel:${l.phone}`,
      priority: l.daysWaiting >= 2 ? 1 : 4,
    })
  }

  for (const e of data.eventsSoon) {
    if (paymentIds.has(e.id)) continue
    items.push({
      key: `event-${e.id}`,
      tone: e.daysUntil <= 3 ? 'attention' : 'neutral',
      icon: CalendarClock,
      title: `Event coming up — ${e.clientName}`,
      sub: `${e.eventType || 'Event'} in ${e.daysUntil === 0 ? 'today' : e.daysUntil === 1 ? '1 day' : `${e.daysUntil} days`}`,
      href: `/studio/estimates/${e.id}`,
      priority: e.daysUntil <= 3 ? 1 : 3,
    })
  }

  if (data.social.readyCount > 0) {
    items.push({
      key: 'social',
      tone: 'neutral',
      icon: Sparkles,
      title: `${data.social.readyCount} photo${data.social.readyCount === 1 ? '' : 's'} ready to post`,
      sub: 'Starred for social — export and share when you have a minute',
      href: '/studio/exports',
      priority: 5,
    })
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 6)
}

const TONE_COLOR: Record<TodayItem['tone'], string> = {
  urgent: '#E8926B',
  attention: '#5BBFBF',
  neutral: 'rgba(255,255,255,0.5)',
}

export default function StudioHome() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [today, setToday] = useState<TodayData | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    fetch('/api/studio/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setStats(d))
    fetch('/api/studio/today')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setToday(d))
    fetch('/api/studio/analytics')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setAnalytics(d))
  }, [])

  const todayItems = today ? buildTodayItems(today) : []

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

        {/* Today */}
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: '0 0 14px' }}>
          Today
        </p>
        {today === null ? null : todayItems.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(91,191,191,0.06)', border: '1px solid rgba(91,191,191,0.16)', borderRadius: '14px', padding: '18px', marginBottom: '36px' }}>
            <CheckCircle2 size={20} color="#5BBFBF" />
            <p style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>You&apos;re all caught up — nothing needs your attention right now.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
            {todayItems.map(item => {
              const Icon = item.icon
              const color = TONE_COLOR[item.tone]
              return (
                <Link key={item.key} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${item.tone === 'urgent' ? 'rgba(232,146,107,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '14px', padding: '14px 16px', textDecoration: 'none' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.86rem', fontWeight: 600, color: 'white', margin: '0 0 2px' }}>{item.title}</p>
                    <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{item.sub}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* This Week — traffic */}
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: '0 0 14px' }}>
          This Week
        </p>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', marginBottom: '36px' }}>
          {analytics === null ? (
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Loading...</p>
          ) : analytics.visitsThisWeek === 0 && analytics.visitsPrevWeek === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Traffic tracking just turned on — check back in a few days to see who&apos;s visiting the site.</p>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
                <p style={{ fontSize: '2rem', fontWeight: 700, color: 'white', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {analytics.visitsThisWeek}
                </p>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>visits to the site this week</p>
              </div>
              {analytics.visitsPrevWeek > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                  {analytics.visitsThisWeek >= analytics.visitsPrevWeek
                    ? <TrendingUp size={14} color="#5BBFBF" />
                    : <TrendingDown size={14} color="rgba(255,255,255,0.4)" />}
                  <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                    {Math.abs(Math.round(((analytics.visitsThisWeek - analytics.visitsPrevWeek) / analytics.visitsPrevWeek) * 100))}% {analytics.visitsThisWeek >= analytics.visitsPrevWeek ? 'more' : 'fewer'} than last week
                  </p>
                </div>
              )}
              {analytics.channels.length > 0 && (
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                  {analytics.channels.slice(0, 3).map((c, i) => (
                    <span key={c.channel}>
                      {i > 0 && ' · '}
                      <span style={{ color: 'white', fontWeight: 600 }}>{c.channel}</span> {Math.round((c.count / analytics.visitsThisWeek) * 100)}%
                    </span>
                  ))}
                </p>
              )}
            </>
          )}
        </div>

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
