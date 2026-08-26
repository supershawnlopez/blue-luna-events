import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { logEstimateActivity } from '@/lib/estimateActivity'

const ALLOWED_TYPES = new Set(['invoice_viewed', 'payment_button_clicked', 'checkout_started'])

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const body = await req.json().catch(() => ({}))
  const type = typeof body.type === 'string' ? body.type : ''
  if (!ALLOWED_TYPES.has(type)) {
    return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 })
  }

  const supabase = serverClient()
  const { data: est, error } = await supabase
    .from('estimates')
    .select('id')
    .eq('share_token', params.token)
    .single()

  if (error || !est) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  const sessionId = typeof body.session_id === 'string' ? body.session_id.slice(0, 80) : null
  const checkoutSessionId = typeof body.checkout_session_id === 'string' ? body.checkout_session_id.slice(0, 120) : null
  const today = new Date().toISOString().slice(0, 10)
  const dedupeKey = type === 'invoice_viewed' && sessionId
    ? `invoice_viewed:${est.id}:${sessionId}:${today}`
    : checkoutSessionId
      ? `${type}:${est.id}:${checkoutSessionId}`
      : undefined

  const result = await logEstimateActivity({
    estimateId: est.id,
    type,
    actorType: 'client',
    dedupeKey,
    metadata: {
      session_id: sessionId,
      checkout_session_id: checkoutSessionId,
      page: `/q/${params.token}`,
      referrer: req.headers.get('referer'),
      user_agent: req.headers.get('user-agent'),
      amount: typeof body.amount === 'number' ? body.amount : null,
      ui_mode: typeof body.ui_mode === 'string' ? body.ui_mode : null,
    },
  })

  if (!result.ok) return NextResponse.json({ error: result.error ?? 'Could not log activity' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
