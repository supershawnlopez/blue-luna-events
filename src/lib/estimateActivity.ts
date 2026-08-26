import { serverClient } from '@/lib/supabase'

type ActivityInput = {
  estimateId: string
  type: string
  recipient?: string | null
  actorType?: string
  metadata?: Record<string, unknown>
  dedupeKey?: string
}

export async function logEstimateActivity(input: ActivityInput): Promise<{ ok: boolean; error?: string }> {
  const supabase = serverClient()
  const richRow = {
    estimate_id: input.estimateId,
    type: input.type,
    recipient: input.recipient ?? null,
    actor_type: input.actorType ?? 'system',
    metadata: input.metadata ?? {},
    dedupe_key: input.dedupeKey ?? null,
  }

  const richInsert = input.dedupeKey
    ? supabase.from('estimate_activity').upsert(richRow, { onConflict: 'dedupe_key', ignoreDuplicates: true })
    : supabase.from('estimate_activity').insert([richRow])

  const { error } = await richInsert
  if (!error) return { ok: true }
  if (error.code === '23505') return { ok: true }

  if (!isActivitySchemaMissing(error)) {
    console.error('Estimate activity insert failed:', error)
    return { ok: false, error: error.message }
  }

  const { error: fallbackError } = await supabase.from('estimate_activity').insert([{
    estimate_id: input.estimateId,
    type: input.type,
    recipient: input.recipient ?? null,
  }])

  if (fallbackError) {
    console.error('Estimate activity fallback insert failed:', fallbackError)
    return { ok: false, error: fallbackError.message }
  }

  return { ok: true }
}

function isActivitySchemaMissing(error: { code?: string; message?: string }): boolean {
  const message = error.message ?? ''
  return error.code === '42703' || error.code === 'PGRST204' || message.includes('dedupe_key') || message.includes('metadata') || message.includes('actor_type')
}
