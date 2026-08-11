import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { channelFor } from '@/lib/channel'

export const dynamic = 'force-dynamic'

// Tucson, AZ is fixed UTC-7 year-round (no DST) — same anchoring already
// used by /api/studio/lead-sources, kept local here rather than shared
// since it's a single small helper, not shared logic.
const AZ_OFFSET_MS = 7 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

function startOfMonthArizona(monthsAgo: number): Date {
  const nowAz = new Date(Date.now() - AZ_OFFSET_MS)
  const monthStartAz = Date.UTC(nowAz.getUTCFullYear(), nowAz.getUTCMonth() - monthsAgo, 1)
  return new Date(monthStartAz + AZ_OFFSET_MS)
}

type Window = 'month' | '3months' | 'all'

function windowBounds(window: Window): { since: Date | null; prevSince: Date | null; prevUntil: Date | null } {
  if (window === 'month') {
    return { since: startOfMonthArizona(0), prevSince: startOfMonthArizona(1), prevUntil: startOfMonthArizona(0) }
  }
  if (window === '3months') {
    const since = new Date(Date.now() - 90 * DAY_MS)
    return { since, prevSince: new Date(Date.now() - 180 * DAY_MS), prevUntil: since }
  }
  return { since: null, prevSince: null, prevUntil: null }
}

// A lead's own answer to "where did you hear about us" beats a guessed
// referrer — in-app browsers (Instagram/Facebook) strip referrers
// constantly, exactly the traffic this business is most likely to get.
// Same fallback /api/studio/lead-sources already uses.
function leadChannel(referral_source: string | null, referrer_channel: string | null): string {
  return referral_source || referrer_channel || 'Direct/Unknown'
}

function countByChannel(rows: { channel: string }[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const r of rows) counts[r.channel] = (counts[r.channel] ?? 0) + 1
  return counts
}

export async function GET(req: NextRequest) {
  const window = (req.nextUrl.searchParams.get('window') as Window) || 'month'
  const { since, prevSince, prevUntil } = windowBounds(window)
  const db = serverClient()

  // ── Leads by channel — the primary, trustworthy signal (real business,
  // not just traffic) ─────────────────────────────────────────────────────
  let leadsQuery = db.from('leads').select('referral_source, referrer_channel, created_at')
  if (since) leadsQuery = leadsQuery.gte('created_at', since.toISOString())
  const { data: leadRows } = await leadsQuery
  const leads = (leadRows ?? []).map(r => ({ channel: leadChannel(r.referral_source, r.referrer_channel) }))
  const leadCounts = countByChannel(leads)

  let prevLeadCounts: Record<string, number> = {}
  if (prevSince && prevUntil) {
    const { data: prevLeadRows } = await db
      .from('leads')
      .select('referral_source, referrer_channel, created_at')
      .gte('created_at', prevSince.toISOString())
      .lt('created_at', prevUntil.toISOString())
    prevLeadCounts = countByChannel((prevLeadRows ?? []).map(r => ({ channel: leadChannel(r.referral_source, r.referrer_channel) })))
  }

  const leadsByChannel = Object.entries(leadCounts)
    .map(([channel, count]) => {
      const prevCount = prevSince ? (prevLeadCounts[channel] ?? 0) : null
      const trend: 'up' | 'down' | 'flat' | null = prevCount === null ? null : count > prevCount ? 'up' : count < prevCount ? 'down' : 'flat'
      return { channel, count, prevCount, trend }
    })
    .sort((a, b) => b.count - a.count)

  // ── Site visits by channel — secondary context. Deduped by session_id
  // (one channel vote per visit, not per pageview) where available; rows
  // from before session tracking shipped (2026-08-10) have no session_id
  // and are each counted as their own visit, same as before. ────────────
  let visitsQuery = db.from('site_visits').select('path, referrer, session_id, created_at').order('created_at', { ascending: true })
  if (since) visitsQuery = visitsQuery.gte('created_at', since.toISOString())
  const { data: visitRows } = await visitsQuery
  const visits = visitRows ?? []

  const seenSessions = new Map<string, string | null>() // session_id -> entry referrer
  const dedupedVisitChannels: string[] = []
  for (const v of visits) {
    if (v.session_id) {
      if (!seenSessions.has(v.session_id)) {
        seenSessions.set(v.session_id, v.referrer)
        dedupedVisitChannels.push(channelFor(v.referrer))
      }
    } else {
      dedupedVisitChannels.push(channelFor(v.referrer))
    }
  }
  const visitCounts: Record<string, number> = {}
  for (const ch of dedupedVisitChannels) visitCounts[ch] = (visitCounts[ch] ?? 0) + 1
  const visitsByChannel = Object.entries(visitCounts)
    .map(([channel, count]) => ({ channel, count }))
    .sort((a, b) => b.count - a.count)

  // ── Top pages — raw pageview counts (content interest, not visitor
  // counting, so no dedup needed here). ───────────────────────────────────
  const pageCounts: Record<string, number> = {}
  for (const v of visits) pageCounts[v.path] = (pageCounts[v.path] ?? 0) + 1
  const topPages = Object.entries(pageCounts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  return NextResponse.json({
    window,
    totalLeads: leads.length,
    totalVisits: dedupedVisitChannels.length,
    leadsByChannel,
    visitsByChannel,
    topPages,
  })
}
