// Client lifecycle — ONE place that decides where every person stands
// (Shawn + team, 2026-11-17; DECISIONS.md "CLIENT LIFECYCLE").
//
//   new           inquiry in, no estimate sent yet
//   estimate_sent estimate out (sent/accepted), nothing paid yet
//   client        paid a deposit, event still ahead
//   past_client   paid, event has happened
//   not_now       declined, gave a reason, went quiet 21 days, or their
//                 event date passed without booking
//
// Stages are COMPUTED from real records every time (never stored), so they
// can't drift out of sync. Paying always wins: a "not now" lead who later
// pays is a client again automatically.

export const QUIET_DAYS = 21

export const LOST_REASONS = [
  { id: 'price', label: 'Price' },
  { id: 'timing', label: 'Timing' },
  { id: 'cheaper', label: 'Found someone cheaper' },
  { id: 'other_vendor', label: 'Went with someone else' },
  { id: 'style', label: 'Quality or style' },
  { id: 'event_changed', label: 'Event changed or cancelled' },
  { id: 'just_looking', label: 'Just looking' },
  { id: 'other', label: 'Other' },
] as const

export type LostReasonId = typeof LOST_REASONS[number]['id']

export function lostReasonLabel(id?: string | null): string {
  if (!id) return ''
  return LOST_REASONS.find(r => r.id === id)?.label ?? id
}

export type Stage = 'new' | 'estimate_sent' | 'client' | 'past_client' | 'not_now'

export const STAGE_LABELS: Record<Stage, string> = {
  new: 'New',
  estimate_sent: 'Estimate Sent',
  client: 'Client',
  past_client: 'Past Client',
  not_now: 'Not Now',
}

export type LifecycleEstimate = {
  id: string
  lead_id?: string | null
  client_email?: string | null
  event_date?: string | null
  status: string
  accepted_at?: string | null
  created_at: string
  declined_reason?: string | null
  declined_at?: string | null
}

export type StageResult = {
  stage: Stage
  // Plain-English "why", shown under the name in Studio.
  note: string
  lastActivity: string
  // The reason someone is "not now", if one was recorded (client or Monica).
  reason: string | null
}

// Today in Arizona (no daylight saving), as YYYY-MM-DD.
export function todayAZ(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Phoenix' }).format(now)
}

function daysBetween(fromIso: string, now: Date): number {
  return Math.floor((now.getTime() - new Date(fromIso).getTime()) / 86400000)
}

const latest = (dates: (string | null | undefined)[]) =>
  dates.filter(Boolean).sort().pop() as string

export function computeStage(input: {
  createdAt: string
  eventDate?: string | null
  lostReason?: string | null
  estimates: LifecycleEstimate[]
  paidByEstimate: Record<string, number>
  // Latest client-side or sent activity per estimate (emailed, viewed, clicked pay…).
  activityByEstimate?: Record<string, string>
  now?: Date
}): StageResult {
  const now = input.now ?? new Date()
  const today = todayAZ(now)
  const ests = input.estimates
  const activity = input.activityByEstimate ?? {}

  // 1. Paying always wins.
  const paid = ests.filter(e => (input.paidByEstimate[e.id] ?? 0) > 0)
  if (paid.length) {
    const upcoming = paid.filter(e => !e.event_date || e.event_date >= today)
    const lastActivity = latest(paid.map(e => e.created_at))
    if (upcoming.length) return { stage: 'client', note: 'Deposit paid', lastActivity, reason: null }
    return { stage: 'past_client', note: 'Event done', lastActivity, reason: null }
  }

  const sent = ests.filter(e => e.status === 'sent' || e.status === 'declined' || e.accepted_at)
  const lastActivity = latest([
    input.createdAt,
    ...ests.map(e => e.created_at),
    ...ests.map(e => e.accepted_at),
    ...ests.map(e => activity[e.id]),
  ])

  // 2. A recorded reason — from the client's decline or from Monica.
  const declined = sent.find(e => e.status === 'declined' && e.declined_reason)
  const reason = input.lostReason || declined?.declined_reason || null
  if (reason) return { stage: 'not_now', note: lostReasonLabel(reason), lastActivity, reason }
  if (sent.length && sent.every(e => e.status === 'declined')) {
    return { stage: 'not_now', note: 'Declined', lastActivity, reason: null }
  }

  // 3. Their date came and went without booking.
  const eventDate = latest([input.eventDate, ...sent.map(e => e.event_date)])
  if (eventDate && eventDate < today) {
    return { stage: 'not_now', note: 'Event date passed', lastActivity, reason: null }
  }

  // 4. Gone quiet.
  if (daysBetween(lastActivity, now) >= QUIET_DAYS) {
    return { stage: 'not_now', note: `Quiet ${daysBetween(lastActivity, now)} days`, lastActivity, reason: null }
  }

  if (sent.length) {
    const accepted = sent.some(e => e.accepted_at)
    return { stage: 'estimate_sent', note: accepted ? 'Accepted · waiting on deposit' : 'Estimate sent', lastActivity, reason: null }
  }
  return { stage: 'new', note: 'Needs an estimate', lastActivity, reason: null }
}

// Which estimates belong to a lead: linked by lead_id first, then by email
// (the U of A estimate is linked to lead "Jessica Ross" — the person, not
// the company — so the link matters more than the name).
export function estimatesForLead<T extends LifecycleEstimate>(
  lead: { id: string; email?: string | null },
  all: T[],
): T[] {
  const email = (lead.email ?? '').trim().toLowerCase()
  return all.filter(e =>
    e.lead_id === lead.id ||
    (!e.lead_id && !!email && (e.client_email ?? '').trim().toLowerCase() === email),
  )
}
