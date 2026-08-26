import Stripe from 'stripe'
import { serverClient } from '@/lib/supabase'
import { sendReceiptEmail } from '@/lib/receiptEmail'
import { logEstimateActivity } from '@/lib/estimateActivity'
import { sendPush } from '@/lib/push'

type RecordOptions = {
  host: string
  eventId?: string
  eventType?: string
  eventCreated?: number
  livemode?: boolean
  payload?: unknown
}

type RecordResult = {
  ok: boolean
  status: 'recorded' | 'already_recorded' | 'unmatched' | 'failed'
  estimateId?: string
  paymentId?: string
  amount?: number
  error?: string
  receiptError?: string
  pushError?: string
}

export async function recordEstimatePaymentFromCheckoutSession(
  session: Stripe.Checkout.Session,
  options: RecordOptions
): Promise<RecordResult> {
  const supabase = serverClient()
  const estimateId = session.metadata?.estimate_id
  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id
  const amount = amountFromSession(session)

  await upsertWebhookAudit({
    ...options,
    status: 'received',
    estimateId,
    checkoutSessionId: session.id,
    paymentIntentId,
    amount,
    customerEmail: session.customer_email ?? undefined,
  })

  if (!estimateId || !amount || amount <= 0) {
    const error = `Missing estimate payment data: estimateId=${estimateId ?? 'none'}, amount=${amount ?? 'none'}`
    await updateWebhookAudit(options.eventId, { status: 'unmatched', error })
    return { ok: false, status: 'unmatched', error }
  }

  const existingFilters = [`stripe_session_id.eq.${session.id}`]
  if (paymentIntentId) existingFilters.push(`stripe_payment_intent_id.eq.${paymentIntentId}`)

  const { data: existingRows, error: existingError } = await supabase
    .from('estimate_payments')
    .select('id, estimate_id, amount')
    .or(existingFilters.join(','))
    .limit(1)

  if (existingError) {
    await updateWebhookAudit(options.eventId, { status: 'failed', error: existingError.message })
    return { ok: false, status: 'failed', estimateId, amount, error: existingError.message }
  }

  const existing = existingRows?.[0]
  if (existing) {
    await updateWebhookAudit(options.eventId, {
      status: 'already_recorded',
      estimateId: existing.estimate_id,
      amount: Number(existing.amount) || amount,
    })
    return {
      ok: true,
      status: 'already_recorded',
      estimateId: existing.estimate_id,
      paymentId: existing.id,
      amount: Number(existing.amount) || amount,
    }
  }

  const { data: payment, error: insertError } = await supabase
    .from('estimate_payments')
    .insert([{
      estimate_id: estimateId,
      amount,
      method: 'stripe',
      note: 'Card payment',
      stripe_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId ?? null,
    }])
    .select('id')
    .single()

  if (insertError || !payment) {
    const error = insertError?.message ?? 'Payment insert returned no row'
    await updateWebhookAudit(options.eventId, { status: 'failed', estimateId, amount, error })
    return { ok: false, status: 'failed', estimateId, amount, error }
  }

  let receiptError: string | undefined
  let pushError: string | undefined

  await logEstimateActivity({
    estimateId,
    type: 'payment_received',
    actorType: 'stripe',
    dedupeKey: `payment_received:${session.id}`,
    metadata: {
      amount,
      payment_id: payment.id,
      checkout_session_id: session.id,
      payment_intent_id: paymentIntentId ?? null,
      customer_email: session.customer_email ?? null,
    },
  })

  const receipt = await sendReceiptEmail(estimateId, amount, options.host)
  if (!receipt.ok) receiptError = receipt.error ?? 'Receipt email failed'

  try {
    const { data: est } = await supabase.from('estimates').select('client_name').eq('id', estimateId).single()
    await sendPush('💰 Payment Received', `$${amount.toLocaleString()} from ${est?.client_name ?? 'a client'}`, `/studio/estimates/${estimateId}`)
  } catch (err) {
    pushError = err instanceof Error ? err.message : 'Push notification failed'
  }

  const sideEffectError = [receiptError ? `receipt: ${receiptError}` : '', pushError ? `push: ${pushError}` : ''].filter(Boolean).join('; ')
  await updateWebhookAudit(options.eventId, {
    status: sideEffectError ? 'processed_with_warnings' : 'processed',
    estimateId,
    amount,
    error: sideEffectError || undefined,
  })

  return { ok: true, status: 'recorded', estimateId, paymentId: payment.id, amount, receiptError, pushError }
}

function amountFromSession(session: Stripe.Checkout.Session): number | null {
  if (typeof session.amount_total === 'number') return Math.round(session.amount_total) / 100
  const metadataAmount = Number(session.metadata?.amount)
  return Number.isFinite(metadataAmount) && metadataAmount > 0 ? metadataAmount : null
}

async function upsertWebhookAudit(row: {
  eventId?: string
  eventType?: string
  eventCreated?: number
  livemode?: boolean
  status: string
  estimateId?: string
  checkoutSessionId?: string
  paymentIntentId?: string
  amount?: number | null
  customerEmail?: string
  payload?: unknown
}) {
  if (!row.eventId) return
  const supabase = serverClient()
  const { error } = await supabase.from('stripe_webhook_events').upsert({
    id: row.eventId,
    type: row.eventType ?? 'checkout.session.completed',
    livemode: row.livemode ?? null,
    stripe_created: row.eventCreated ? new Date(row.eventCreated * 1000).toISOString() : null,
    status: row.status,
    estimate_id: row.estimateId ?? null,
    checkout_session_id: row.checkoutSessionId ?? null,
    payment_intent_id: row.paymentIntentId ?? null,
    amount: row.amount ?? null,
    customer_email: row.customerEmail ?? null,
    payload: row.payload ?? {},
  }, { onConflict: 'id' })
  if (error && error.code !== '42P01' && error.code !== 'PGRST205') {
    console.error('Stripe webhook audit insert failed:', error)
  }
}

async function updateWebhookAudit(
  eventId: string | undefined,
  patch: { status: string; estimateId?: string; amount?: number; error?: string }
) {
  if (!eventId) return
  const supabase = serverClient()
  const { error } = await supabase
    .from('stripe_webhook_events')
    .update({
      status: patch.status,
      processed_at: new Date().toISOString(),
      estimate_id: patch.estimateId ?? undefined,
      amount: patch.amount ?? undefined,
      error: patch.error ?? null,
    })
    .eq('id', eventId)
  if (error && error.code !== '42P01' && error.code !== 'PGRST205') {
    console.error('Stripe webhook audit update failed:', error)
  }
}
