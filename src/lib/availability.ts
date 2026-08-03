import type { SupabaseClient } from '@supabase/supabase-js'

export type BookedDate = { date: string; clientName: string; eventType: string | null; estimateId: string }
export type BlockedDate = { id: string; startDate: string; endDate: string; reason: string | null }

const DAY_MS = 24 * 60 * 60 * 1000
const NOT_OCCUPYING_STATUSES = ['declined', 'cancelled']

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function expandRange(start: string, end: string): string[] {
  const dates: string[] = []
  const cur = new Date(start + 'T00:00:00')
  const last = new Date(end + 'T00:00:00')
  while (cur.getTime() <= last.getTime()) {
    dates.push(toDateOnly(cur))
    cur.setTime(cur.getTime() + DAY_MS)
  }
  return dates
}

export async function getBookedDates(db: SupabaseClient, monthsAhead = 8): Promise<BookedDate[]> {
  const today = toDateOnly(new Date())
  const horizon = new Date()
  horizon.setMonth(horizon.getMonth() + monthsAhead)

  const { data } = await db
    .from('estimates')
    .select('id, client_name, event_type, event_date, status')
    .not('event_date', 'is', null)
    .gte('event_date', today)
    .lte('event_date', toDateOnly(horizon))

  return (data ?? [])
    .filter(e => !NOT_OCCUPYING_STATUSES.includes(e.status))
    .map(e => ({ date: e.event_date, clientName: e.client_name, eventType: e.event_type, estimateId: e.id }))
}

export async function getBlockedDates(db: SupabaseClient): Promise<BlockedDate[]> {
  const today = toDateOnly(new Date())
  const { data } = await db
    .from('availability_blocks')
    .select('id, start_date, end_date, reason')
    .gte('end_date', today)
    .order('start_date', { ascending: true })

  return (data ?? []).map(b => ({ id: b.id, startDate: b.start_date, endDate: b.end_date, reason: b.reason }))
}

// Flat list of ISO date strings ("YYYY-MM-DD") that are unavailable, for the
// public calendar — never includes client names or any other identifying detail.
export async function getUnavailableDateStrings(db: SupabaseClient, monthsAhead = 8): Promise<string[]> {
  const [booked, blocked] = await Promise.all([getBookedDates(db, monthsAhead), getBlockedDates(db)])
  const set = new Set<string>()
  booked.forEach(b => set.add(b.date))
  blocked.forEach(b => expandRange(b.startDate, b.endDate).forEach(d => set.add(d)))
  return Array.from(set).sort()
}
