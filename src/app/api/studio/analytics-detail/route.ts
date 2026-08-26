import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { channelForAttribution, channelForSource } from '@/lib/channel'

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
type LeadAttributionRow = {
  id?: string
  created_at: string
  referral_source?: string | null
  referrer_channel?: string | null
  referrer_raw?: string | null
  session_id?: string | null
  landing_path?: string | null
  utm_source?: string | null
}

type VisitAttributionRow = {
  path: string
  referrer?: string | null
  session_id?: string | null
  created_at: string
  landing_path?: string | null
  utm_source?: string | null
}

function leadChannel(row: LeadAttributionRow): string {
  // referrer_channel is itself already a fallback (computed as channelFor(referrer_raw)
  // at submission time) — a blank/unrecognized referrer becomes the literal string
  // 'Direct' there, same practical meaning as no referrer_channel at all (a lead from
  // before this tracking existed). Both collapse into one honest bucket here instead
  // of showing as two separate "Direct/Unknown"-looking rows.
  const channel = channelForSource(row.referral_source) || row.referrer_channel || channelForAttribution(row.utm_source, row.referrer_raw)
  return !channel || channel === 'Direct' ? 'Unknown / Direct / DMs' : channel
}

function countByChannel(rows: { channel: string }[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const r of rows) counts[r.channel] = (counts[r.channel] ?? 0) + 1
  return counts
}

function isMarketingPath(path: string): boolean {
  return !path.startsWith('/q/') && !path.startsWith('/studio') && !path.startsWith('/api/') && path !== '/booking-confirmed'
}

function pageBucket(path: string): string {
  if (path.startsWith('/gallery/')) return '/gallery/*'
  return path
}

function compactPath(paths: string[]): string[] {
  const labels: string[] = []
  for (const path of paths) {
    const bucket = pageBucket(path)
    if (!isMarketingPath(bucket)) continue
    if (labels[labels.length - 1] !== bucket) labels.push(bucket)
  }
  return labels.slice(0, 5)
}

function leadPathFor(lead: LeadAttributionRow, visitsBySession: Map<string, VisitAttributionRow[]>): string[] {
  if (lead.session_id) {
    const visits = visitsBySession.get(lead.session_id) ?? []
    const createdAt = new Date(lead.created_at).getTime()
    const beforeLead = visits.filter(v => new Date(v.created_at).getTime() <= createdAt).map(v => v.path)
    const path = compactPath(beforeLead)
    if (path.length > 0) return path
  }
  if (lead.landing_path) return compactPath([lead.landing_path.split('?')[0]])
  return []
}

export async function GET(req: NextRequest) {
  const window = (req.nextUrl.searchParams.get('window') as Window) || 'month'
  const { since, prevSince, prevUntil } = windowBounds(window)
  const db = serverClient()

  // ── Leads by channel — the primary, trustworthy signal (real business,
  // not just traffic) ─────────────────────────────────────────────────────
  let leadsQuery = db.from('leads').select('*')
  if (since) leadsQuery = leadsQuery.gte('created_at', since.toISOString())
  const { data: leadRowsRaw } = await leadsQuery
  const leadRows = (leadRowsRaw ?? []) as LeadAttributionRow[]
  const leads = leadRows.map(r => ({ channel: leadChannel(r) }))
  const leadCounts = countByChannel(leads)

  let prevLeadCounts: Record<string, number> = {}
  if (prevSince && prevUntil) {
    const { data: prevLeadRows } = await db
      .from('leads')
      .select('*')
      .gte('created_at', prevSince.toISOString())
      .lt('created_at', prevUntil.toISOString())
    prevLeadCounts = countByChannel(((prevLeadRows ?? []) as LeadAttributionRow[]).map(r => ({ channel: leadChannel(r) })))
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
  let visitsQuery = db.from('site_visits').select('*').order('created_at', { ascending: true })
  if (since) visitsQuery = visitsQuery.gte('created_at', since.toISOString())
  const { data: visitRowsRaw } = await visitsQuery
  const visits = (visitRowsRaw ?? []) as VisitAttributionRow[]

  const seenSessions = new Map<string, string | null>() // session_id -> entry referrer
  const dedupedVisitChannels: string[] = []
  for (const v of visits) {
    if (v.session_id) {
      if (!seenSessions.has(v.session_id)) {
        seenSessions.set(v.session_id, v.referrer ?? null)
        dedupedVisitChannels.push(channelForAttribution(v.utm_source, v.referrer))
      }
    } else {
      dedupedVisitChannels.push(channelForAttribution(v.utm_source, v.referrer))
    }
  }
  const visitCounts: Record<string, number> = {}
  for (const ch of dedupedVisitChannels) visitCounts[ch] = (visitCounts[ch] ?? 0) + 1
  const visitsByChannel = Object.entries(visitCounts)
    .map(([channel, count]) => ({ channel, count }))
    .sort((a, b) => b.count - a.count)

  // ── Top marketing pages — raw pageview counts (content interest, not visitor
  // counting, so no dedup needed here). Dynamic per-client routes (each
  // gallery photo's own slug) are grouped; private estimate/payment pages
  // are excluded because they are operational, not marketing. ───────────
  const pageCounts: Record<string, number> = {}
  for (const v of visits) {
    const key = pageBucket(v.path)
    if (!isMarketingPath(key)) continue
    pageCounts[key] = (pageCounts[key] ?? 0) + 1
  }
  const topPages = Object.entries(pageCounts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  const visitsBySession = new Map<string, VisitAttributionRow[]>()
  for (const visit of visits) {
    if (!visit.session_id) continue
    const existing = visitsBySession.get(visit.session_id) ?? []
    existing.push(visit)
    visitsBySession.set(visit.session_id, existing)
  }
  const leadPathCounts: Record<string, { pages: string[]; count: number }> = {}
  const leadPageCounts: Record<string, number> = {}
  for (const lead of leadRows) {
    const pages = leadPathFor(lead, visitsBySession)
    if (pages.length === 0) continue
    for (const page of Array.from(new Set(pages))) leadPageCounts[page] = (leadPageCounts[page] ?? 0) + 1
    const key = pages.join(' > ')
    leadPathCounts[key] = { pages, count: (leadPathCounts[key]?.count ?? 0) + 1 }
  }
  const pagesThatLedToInquiries = Object.entries(leadPageCounts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
  const topLeadPaths = Object.values(leadPathCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return NextResponse.json({
    window,
    totalLeads: leads.length,
    totalVisits: dedupedVisitChannels.length,
    leadsByChannel,
    visitsByChannel,
    topPages,
    pagesThatLedToInquiries,
    topLeadPaths,
  })
}
