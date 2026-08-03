import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

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
    .select('referrer_channel')
    .gte('created_at', monthStart)

  const rows = data ?? []
  const counts: Record<string, number> = {}
  for (const r of rows) {
    const ch = r.referrer_channel || 'Direct'
    counts[ch] = (counts[ch] ?? 0) + 1
  }
  const channels = Object.entries(counts)
    .map(([channel, count]) => ({ channel, count }))
    .sort((a, b) => b.count - a.count)

  return NextResponse.json({ total: rows.length, channels })
}
