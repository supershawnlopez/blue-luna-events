import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { sendPush } from '@/lib/push'
import { LOST_REASONS, lostReasonLabel } from '@/lib/lifecycle'

const REASON_IDS: string[] = LOST_REASONS.map(r => r.id)

// The client taps "Not right now" on their estimate and picks why (Shawn,
// 2026-11-17). Public, gated by the share token like /accept. Never allowed
// once anything has been paid.
export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const body = await req.json().catch(() => ({}))
  const reason = String(body.reason ?? '')
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : ''
  if (!REASON_IDS.includes(reason)) return NextResponse.json({ error: 'Please pick a reason.' }, { status: 400 })

  const db = serverClient()
  const { data: est } = await db
    .from('estimates')
    .select('id, lead_id, client_name, deleted_at')
    .eq('share_token', params.token)
    .single()
  if (!est || est.deleted_at) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: payments } = await db.from('estimate_payments').select('amount').eq('estimate_id', est.id)
  if ((payments ?? []).some(p => Number(p.amount) > 0)) {
    return NextResponse.json({ error: 'This estimate already has a payment. Please contact Monica.' }, { status: 409 })
  }

  const now = new Date().toISOString()
  const { error } = await db
    .from('estimates')
    .update({ status: 'declined', declined_reason: reason, declined_note: note || null, declined_at: now })
    .eq('id', est.id)
  if (error) return NextResponse.json({ error: 'Could not save. Please try again.' }, { status: 500 })

  if (est.lead_id) {
    await db.from('leads').update({ lost_reason: reason, lost_note: note || null, lost_at: now, lost_by: 'client' }).eq('id', est.lead_id)
  }

  try {
    await sendPush('Estimate declined', `${est.client_name}: ${lostReasonLabel(reason)}${note ? ` — "${note}"` : ''}`, `/studio/estimates/${est.id}`)
  } catch (err) {
    console.error('Push notification error:', err)
  }

  return NextResponse.json({ ok: true })
}
