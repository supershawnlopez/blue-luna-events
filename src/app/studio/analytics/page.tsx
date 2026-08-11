'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react'

type ChannelRow = { channel: string; count: number; prevCount: number | null; trend: 'up' | 'down' | 'flat' | null }
type PageRow = { path: string; count: number }

type Detail = {
  window: 'month' | '3months' | 'all'
  totalLeads: number
  totalVisits: number
  leadsByChannel: ChannelRow[]
  visitsByChannel: { channel: string; count: number }[]
  topPages: PageRow[]
}

const WINDOWS: { id: Detail['window']; label: string }[] = [
  { id: 'month', label: 'This Month' },
  { id: '3months', label: 'Last 3 Months' },
  { id: 'all', label: 'All Time' },
]

const PAGE_LABELS: Record<string, string> = {
  '/': 'Homepage',
  '/gallery': 'Gallery',
  '/event-questionnaire': 'Event Questionnaire',
  '/quinceaneras': 'Quinceañeras',
  '/graduations': 'Graduations',
  '/weddings': 'Weddings',
  '/birthdays': 'Birthdays',
  '/baby-showers': 'Baby Showers',
  '/corporate-events': 'Corporate Events',
}

function pageLabel(path: string): string {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path]
  if (path.startsWith('/gallery/')) return 'Gallery — Photo'
  return path
}

function channelLabel(channel: string): string {
  return channel === 'Direct' || channel === 'Direct/Unknown' ? 'Direct / Unknown' : channel
}

export default function StudioAnalytics() {
  const [window_, setWindow] = useState<Detail['window']>('month')
  const [data, setData] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/studio/analytics-detail?window=${window_}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [window_])

  const windowLabel = WINDOWS.find(w => w.id === window_)?.label ?? 'This Month'
  const topChannel = data?.leadsByChannel[0]

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '60px' }}>

      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 24px) 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Link href="/studio" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', display: 'flex', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              <ChevronLeft size={18} />
            </Link>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.22em', color: '#5BBFBF', textTransform: 'uppercase', margin: '0 0 2px' }}>Blue Luna Studio</p>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', margin: 0 }}>Traffic Report</h1>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {WINDOWS.map(w => (
              <button key={w.id} onClick={() => setWindow(w.id)}
                style={{ flex: 1, padding: '9px 0', borderRadius: '999px', border: window_ === w.id ? '1.5px solid #5BBFBF' : '1px solid rgba(255,255,255,0.1)', background: window_ === w.id ? 'rgba(91,191,191,0.12)' : 'transparent', color: window_ === w.id ? '#5BBFBF' : 'rgba(255,255,255,0.4)', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}>
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 20px 0' }}>

        {loading || !data ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '60px 0', fontSize: '0.9rem' }}>Loading…</p>
        ) : (
          <>
            {/* Plain-English summary */}
            <div style={{ background: 'rgba(91,191,191,0.06)', border: '1px solid rgba(91,191,191,0.2)', borderRadius: '16px', padding: '18px 20px', marginBottom: '28px' }}>
              {data.totalLeads === 0 ? (
                <p style={{ fontSize: '0.9rem', color: 'white', margin: 0, lineHeight: 1.6 }}>No leads yet {windowLabel.toLowerCase()} — check back once a few come in.</p>
              ) : (
                <p style={{ fontSize: '0.9rem', color: 'white', margin: 0, lineHeight: 1.6 }}>
                  <span style={{ fontWeight: 700 }}>{data.totalLeads} lead{data.totalLeads === 1 ? '' : 's'}</span> {windowLabel.toLowerCase()}.{' '}
                  {topChannel && (
                    <>
                      <span style={{ fontWeight: 700, color: '#5BBFBF' }}>{channelLabel(topChannel.channel)}</span> is bringing you the most — {topChannel.count} lead{topChannel.count === 1 ? '' : 's'}
                      {topChannel.trend === 'up' && topChannel.prevCount !== null ? `, up from ${topChannel.prevCount} last period.` : topChannel.trend === 'down' && topChannel.prevCount !== null ? `, down from ${topChannel.prevCount} last period.` : '.'}
                    </>
                  )}
                </p>
              )}
            </div>

            {/* Leads by channel — the real signal for where to spend focus */}
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: '0 0 12px' }}>
              Leads by Channel
            </p>
            {data.leadsByChannel.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', marginBottom: '28px' }}>Nothing yet.</p>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden', marginBottom: '28px' }}>
                {data.leadsByChannel.map((c, i) => (
                  <div key={c.channel} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.86rem', color: 'white', fontWeight: 600 }}>{channelLabel(c.channel)}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {c.trend && c.trend !== 'flat' && (
                        c.trend === 'up'
                          ? <TrendingUp size={13} color="#5BBFBF" />
                          : <TrendingDown size={13} color="rgba(255,255,255,0.3)" />
                      )}
                      {c.trend === 'flat' && <Minus size={13} color="rgba(255,255,255,0.2)" />}
                      <span style={{ fontSize: '0.9rem', color: '#5BBFBF', fontWeight: 700, minWidth: '20px', textAlign: 'right' }}>{c.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Top pages */}
            {data.topPages.length > 0 && (
              <>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: '0 0 12px' }}>
                  What They&apos;re Looking At
                </p>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden', marginBottom: '28px' }}>
                  {data.topPages.map((p, i) => (
                    <div key={p.path} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>{pageLabel(p.path)}</span>
                      <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{p.count} view{p.count === 1 ? '' : 's'}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Site visits — secondary, with an honest caveat */}
            {data.visitsByChannel.length > 0 && (
              <>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: '0 0 8px' }}>
                  Site Visits by Channel
                </p>
                <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5, margin: '0 0 12px' }}>
                  Less reliable than the leads above — Instagram and Facebook&apos;s in-app browsers often hide where a visitor actually came from, so real Instagram/Facebook visits can quietly show up here as &quot;Direct.&quot; Treat Leads by Channel as the number that should drive decisions.
                </p>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden', marginBottom: '20px' }}>
                  {data.visitsByChannel.map((c, i) => (
                    <div key={c.channel} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{channelLabel(c.channel)}</span>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{c.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
