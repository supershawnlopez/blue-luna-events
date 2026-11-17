import type { SupabaseClient } from '@supabase/supabase-js'

// A date's state on the calendar, strongest first (Shawn, 2026-11-17):
//   booked   — a deposit (any payment) has landed. The ONLY state that locks a date.
//   accepted — client accepted the estimate, deposit not paid yet.
//   sent     — estimate is out, client hasn't accepted yet.
// Drafts / in-progress estimates and anything in Trash never appear at all.
export type BookingState = 'booked' | 'accepted' | 'sent'

export type BookedDate = {
  date: string
  clientName: string
  eventType: string | null
  venue: string | null
  estimateId: string
  state: BookingState
  // How many estimates this one entry stands for — e.g. a client sent
  // several estimates for the same day shows once, "3 estimates".
  optionCount: number
}
export type BlockedDate = { id: string; startDate: string; endDate: string; reason: string | null }

const DAY_MS = 24 * 60 * 60 * 1000
const STATE_RANK: Record<BookingState, number> = { booked: 3, accepted: 2, sent: 1 }

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

function stateFor(e: { status: string; accepted_at: string | null }, paid: number): BookingState | null {
  if (paid > 0) return 'booked'
  if (e.accepted_at) return 'accepted'
  if (e.status === 'sent') return 'sent'
  return null // draft / in-progress / declined / cancelled — not on the calendar
}

export async function getBookedDates(db: SupabaseClient, monthsAhead = 8): Promise<BookedDate[]> {
  const today = toDateOnly(new Date())
  const horizon = new Date()
  horizon.setMonth(horizon.getMonth() + monthsAhead)

  const { data } = await db
    .from('estimates')
    .select('id, client_name, event_type, event_date, venue, status, accepted_at')
    .is('deleted_at', null)
    .not('event_date', 'is', null)
    .gte('event_date', today)
    .lte('event_date', toDateOnly(horizon))

  const rows = data ?? []
  if (rows.length === 0) return []

  const { data: payments } = await db
    .from('estimate_payments')
    .select('estimate_id, amount')
    .in('estimate_id', rows.map(r => r.id))

  const paid: Record<string, number> = {}
  for (const p of payments ?? []) paid[p.estimate_id] = (paid[p.estimate_id] ?? 0) + Number(p.amount)

  // One entry per client per day. Duplicates and package options collapse
  // into the strongest one (a paid option beats an unpaid one).
  const byKey = new Map<string, BookedDate>()
  for (const e of rows) {
    const state = stateFor(e, paid[e.id] ?? 0)
    if (!state) continue
    const key = `${e.event_date}|${(e.client_name ?? '').trim().toLowerCase()}`
    const entry: BookedDate = {
      date: e.event_date, clientName: e.client_name, eventType: e.event_type,
      venue: e.venue ?? null, estimateId: e.id, state, optionCount: 1,
    }
    const existing = byKey.get(key)
    if (!existing) { byKey.set(key, entry); continue }
    const count = existing.optionCount + 1
    byKey.set(key, STATE_RANK[state] > STATE_RANK[existing.state]
      ? { ...entry, optionCount: count }
      : { ...existing, optionCount: count })
  }

  return Array.from(byKey.values()).sort((a, b) => a.date.localeCompare(b.date) || STATE_RANK[b.state] - STATE_RANK[a.state])
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
// Only a paid deposit or a manual block takes a date off the public calendar:
// until the deposit lands, the date is still open to other clients.
export async function getUnavailableDateStrings(db: SupabaseClient, monthsAhead = 8): Promise<string[]> {
  const [booked, blocked] = await Promise.all([getBookedDates(db, monthsAhead), getBlockedDates(db)])
  const set = new Set<string>()
  booked.filter(b => b.state === 'booked').forEach(b => set.add(b.date))
  blocked.forEach(b => expandRange(b.startDate, b.endDate).forEach(d => set.add(d)))
  return Array.from(set).sort()
}
