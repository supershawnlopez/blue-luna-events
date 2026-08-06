import type { SupabaseClient } from '@supabase/supabase-js'

// Status and temperature both only ever move FORWARD here — this never
// overrides a stage Monica has already manually pushed past (e.g. if she's
// already marked someone "booked" by hand, a lower-ranked estimate event
// should never pull that back down to "quoted").
const STATUS_RANK = { new: 0, contacted: 1, quoted: 2, booked: 3, completed: 4 } as const
const TEMP_RANK = { cold: 0, warm: 1, hot: 2 } as const

type LeadStatus = keyof typeof STATUS_RANK
type Temperature = keyof typeof TEMP_RANK

async function bumpLead(db: SupabaseClient, leadId: string, minStatus: LeadStatus, minTemp: Temperature) {
  const { data: lead } = await db.from('leads').select('status, temperature').eq('id', leadId).single()
  if (!lead) return

  const update: Record<string, string> = {}
  const currentStatusRank = STATUS_RANK[(lead.status as LeadStatus) ?? 'new'] ?? 0
  if (STATUS_RANK[minStatus] > currentStatusRank) update.status = minStatus

  const currentTempRank = lead.temperature ? TEMP_RANK[lead.temperature as Temperature] ?? -1 : -1
  if (TEMP_RANK[minTemp] > currentTempRank) update.temperature = minTemp

  if (Object.keys(update).length > 0) {
    await db.from('leads').update(update).eq('id', leadId)
  }
}

// Call after creating a real estimate for a lead — a quote now exists, so
// the lead is at least "quoted" and worth Monica's real attention ("warm").
export async function syncLeadOnEstimateCreated(db: SupabaseClient, leadId: string | null | undefined) {
  if (!leadId) return
  await bumpLead(db, leadId, 'quoted', 'warm')
}

// Call after a client accepts their estimate — per this app's own Accept
// flow, that's the moment a date gets locked in, i.e. genuinely "booked."
export async function syncLeadOnEstimateAccepted(db: SupabaseClient, leadId: string | null | undefined) {
  if (!leadId) return
  await bumpLead(db, leadId, 'booked', 'hot')
}
