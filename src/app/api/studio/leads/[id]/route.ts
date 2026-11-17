import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { LOST_REASONS } from '@/lib/lifecycle'

const ALLOWED = ['status', 'temperature', 'lost_reason', 'lost_note', 'honoree_relation', 'honoree_name', 'honoree_milestone', 'honoree_date']
const REASON_IDS: string[] = LOST_REASONS.map(r => r.id)

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const update: Record<string, unknown> = Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED.includes(k)))
  // Monica recording why a lead isn't booking (or clearing it to move them
  // back to Active). Stamped server-side so who/when can't be faked.
  // Anything Monica saves about who it's for counts as confirmed (no longer
  // just our guess from their notes).
  if (['honoree_relation', 'honoree_name', 'honoree_milestone', 'honoree_date'].some(k => k in update)) {
    for (const k of ['honoree_relation', 'honoree_name', 'honoree_milestone', 'honoree_date']) {
      if (k in update && (update[k] === '' || update[k] === undefined)) update[k] = null
    }
    update.honoree_confirmed = true
  }
  if ('lost_reason' in update) {
    const reason = update.lost_reason
    if (reason !== null && !REASON_IDS.includes(String(reason))) {
      return NextResponse.json({ error: 'Unknown reason' }, { status: 400 })
    }
    update.lost_at = reason ? new Date().toISOString() : null
    update.lost_by = reason ? 'monica' : null
    if (!reason) update.lost_note = null
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const db = serverClient()
  const { data, error } = await db
    .from('leads')
    .update(update)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// A real delete, not a soft one — a mistaken test submission or a clearly
// non-lead entry has no downstream record depending on it (unlike an
// estimate, which has payments/PDFs/emails tied to it), so there's nothing
// worth preserving by hiding it instead of removing it.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const db = serverClient()
  const { error } = await db.from('leads').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
