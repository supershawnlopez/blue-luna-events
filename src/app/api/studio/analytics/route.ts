import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

const DAY_MS = 24 * 60 * 60 * 1000

function channelFor(referrer: string | null): string {
  if (!referrer) return 'Direct'
  let host = ''
  try {
    host = new URL(referrer).hostname.replace(/^www\.|^l\.|^lm\./, '')
  } catch {
    return 'Other'
  }
  if (host.includes('instagram.com')) return 'Instagram'
  if (host.includes('facebook.com')) return 'Facebook'
  if (host.includes('google.')) return 'Google'
  if (host.includes('bluelunaevents.com')) return 'Direct'
  return 'Other'
}

export async function GET() {
  const db = serverClient()
  const since = new Date(Date.now() - 30 * DAY_MS).toISOString()

  const { data: visits } = await db
    .from('site_visits')
    .select('path, referrer, created_at')
    .gte('created_at', since)

  const rows = visits ?? []
  const weekCutoff = Date.now() - 7 * DAY_MS
  const prevWeekCutoff = Date.now() - 14 * DAY_MS

  const thisWeek = rows.filter(r => new Date(r.created_at).getTime() >= weekCutoff)
  const prevWeek = rows.filter(r => {
    const t = new Date(r.created_at).getTime()
    return t >= prevWeekCutoff && t < weekCutoff
  })

  const channelCounts: Record<string, number> = {}
  for (const r of thisWeek) {
    const ch = channelFor(r.referrer)
    channelCounts[ch] = (channelCounts[ch] ?? 0) + 1
  }
  const channels = Object.entries(channelCounts)
    .map(([channel, count]) => ({ channel, count }))
    .sort((a, b) => b.count - a.count)

  const pageCounts: Record<string, number> = {}
  for (const r of thisWeek) {
    pageCounts[r.path] = (pageCounts[r.path] ?? 0) + 1
  }
  const topPages = Object.entries(pageCounts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  return NextResponse.json({
    visitsThisWeek: thisWeek.length,
    visitsPrevWeek: prevWeek.length,
    channels,
    topPages,
  })
}
