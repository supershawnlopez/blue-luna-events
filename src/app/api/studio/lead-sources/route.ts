import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { channelForAttribution, channelForSource } from '@/lib/channel'

export const dynamic = 'force-dynamic'

// Tucson, AZ is fixed UTC-7 year-round (no DST) — "this month" has to mean
// Monica's actual calendar month, not the server's. Vercel's production
// runtime is UTC, not Arizona, so naively using the server's local timezone
// silently shifts the boundary by 7 hours and miscounts leads made late at
// night — confirmed directly: the same calculation using the server's own
// clock instead of a fixed AZ offset counted a real July 31 (Arizona time)
// lead as an August one.
const AZ_OFFSET_MS = 7 * 60 * 60 * 1000

function startOfMonthArizona(): string {
  const nowAz = new Date(Date.now() - AZ_OFFSET_MS)
  const monthStartAz = Date.UTC(nowAz.getUTCFullYear(), nowAz.getUTCMonth(), 1)
  return new Date(monthStartAz + AZ_OFFSET_MS).toISOString()
}

export async function GET() {
  const db = serverClient()
  const monthStart = startOfMonthArizona()

  const { data } = await db
    .from('leads')
    .select('*')
    .gte('created_at', monthStart)

  const rows = data ?? []
  const counts: Record<string, number> = {}
  for (const r of rows) {
    // The client's own answer to "where did you hear about us" beats a
    // guessed referrer every time — referrers get stripped constantly by
    // in-app browsers (Instagram/Facebook), which is exactly the traffic a
    // balloon-decor business is most likely to actually get.
    const raw = r as {
      referral_source?: string | null
      referrer_channel?: string | null
      referrer_raw?: string | null
      utm_source?: string | null
    }
    const fallback = raw.referrer_channel || channelForAttribution(raw.utm_source, raw.referrer_raw)
    const ch = channelForSource(raw.referral_source) || (fallback === 'Direct' ? 'Unknown / Direct / DMs' : fallback)
    counts[ch] = (counts[ch] ?? 0) + 1
  }
  const channels = Object.entries(counts)
    .map(([channel, count]) => ({ channel, count }))
    .sort((a, b) => b.count - a.count)

  // Rolling 7 days, same window the site-visits card already uses — a
  // calendar-week boundary would need the same Arizona-anchoring as above
  // for no real benefit here.
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const totalThisWeek = rows.filter(r => r.created_at >= weekAgo).length

  return NextResponse.json({ total: rows.length, totalThisWeek, channels })
}
