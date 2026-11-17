import type { SupabaseClient } from '@supabase/supabase-js'
import { computeStage, estimatesForLead, todayAZ, type LifecycleEstimate, type StageResult } from './lifecycle'

type EstimateRow = LifecycleEstimate & {
  client_name: string
  client_phone?: string | null
  event_type?: string | null
  quoted_total: number
  deleted_at?: string | null
}

// Everything the lifecycle needs, loaded once. Trash never counts.
async function loadBase(db: SupabaseClient) {
  const [{ data: estimates }, { data: payments }, { data: activity }] = await Promise.all([
    db.from('estimates').select('*').is('deleted_at', null),
    db.from('estimate_payments').select('estimate_id, amount'),
    db.from('estimate_activity').select('estimate_id, created_at'),
  ])
  const paidByEstimate: Record<string, number> = {}
  for (const p of payments ?? []) paidByEstimate[p.estimate_id] = (paidByEstimate[p.estimate_id] ?? 0) + Number(p.amount)
  const activityByEstimate: Record<string, string> = {}
  for (const a of activity ?? []) {
    if (!activityByEstimate[a.estimate_id] || a.created_at > activityByEstimate[a.estimate_id]) activityByEstimate[a.estimate_id] = a.created_at
  }
  return { estimates: (estimates ?? []) as EstimateRow[], paidByEstimate, activityByEstimate }
}

export async function loadLeadsWithStages(db: SupabaseClient) {
  const [{ data: leads, error }, base] = await Promise.all([
    db.from('leads').select('*').order('created_at', { ascending: false }),
    loadBase(db),
  ])
  if (error) throw new Error(error.message)
  return (leads ?? []).map(lead => {
    const ests = estimatesForLead(lead, base.estimates)
    const result: StageResult = computeStage({
      createdAt: lead.created_at,
      eventDate: lead.event_date,
      lostReason: lead.lost_reason ?? null,
      estimates: ests,
      paidByEstimate: base.paidByEstimate,
      activityByEstimate: base.activityByEstimate,
    })
    // Inquiry form said "Other"/blank but Monica's estimate knows better
    // (e.g. Sedra: form "Other", estimate "Wedding").
    const generic = !lead.event_type || /^other$/i.test(String(lead.event_type).trim())
    const fromEstimate = ests.find(e => e.event_type)?.event_type
    return { ...lead, event_type: generic && fromEstimate ? fromEstimate : lead.event_type, stage: result.stage, stage_note: result.note, stage_reason: result.reason, last_activity: result.lastActivity, estimate_ids: ests.map(e => e.id) }
  })
}

export type ClientEvent = { estimateId: string; date: string | null; eventType: string | null; paid: number; total: number }
export type Client = {
  key: string
  name: string
  email: string | null
  phone: string | null
  stage: 'client' | 'past_client'
  totalPaid: number
  events: ClientEvent[]
}

// A client = anyone with a payment on a (non-trashed) estimate. Grouped by
// email so a repeat client (U of A, Dunkin') is one person with 2 events.
export async function loadClients(db: SupabaseClient): Promise<Client[]> {
  const { estimates, paidByEstimate } = await loadBase(db)
  const today = todayAZ()
  const byKey = new Map<string, Client>()
  for (const e of estimates) {
    const paid = paidByEstimate[e.id] ?? 0
    if (paid <= 0) continue
    const email = (e.client_email ?? '').trim().toLowerCase() || null
    const key = email ?? e.client_name.trim().toLowerCase()
    // "Sedra Alwan (Luxury Package)" → "Sedra Alwan"
    const name = e.client_name.replace(/\s*\(.*\)\s*$/, '').trim()
    const c = byKey.get(key) ?? { key, name, email, phone: e.client_phone ?? null, stage: 'past_client' as const, totalPaid: 0, events: [] }
    c.totalPaid += paid
    c.phone = c.phone ?? e.client_phone ?? null
    c.events.push({ estimateId: e.id, date: e.event_date ?? null, eventType: e.event_type ?? null, paid, total: Number(e.quoted_total) })
    if (!e.event_date || e.event_date >= today) c.stage = 'client'
    byKey.set(key, c)
  }
  return Array.from(byKey.values())
    .map(c => ({ ...c, events: c.events.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')) }))
    .sort((a, b) => {
      if (a.stage !== b.stage) return a.stage === 'client' ? -1 : 1
      // Upcoming: soonest first. Past: most recent first.
      const da = a.events[0]?.date ?? '', dbb = b.events[0]?.date ?? ''
      return a.stage === 'client' ? da.localeCompare(dbb) : dbb.localeCompare(da)
    })
}
