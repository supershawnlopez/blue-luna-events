import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { recordEstimatePaymentFromCheckoutSession } from '@/lib/stripeEstimatePayments'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { sessionId, token } = await req.json()
  if (!sessionId || typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
    return NextResponse.json({ error: 'Missing checkout session' }, { status: 400 })
  }
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Missing invoice token' }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId)
  const estimateId = session.metadata?.estimate_id
  if (!estimateId) {
    return NextResponse.json({ status: 'unmatched', error: 'Checkout session is not linked to this invoice' }, { status: 404 })
  }

  const supabase = serverClient()
  const { data: est, error: estError } = await supabase
    .from('estimates')
    .select('id, share_token')
    .eq('id', estimateId)
    .single()

  if (estError || !est || est.share_token !== token) {
    return NextResponse.json({ status: 'unmatched', error: 'Checkout session does not match this invoice' }, { status: 404 })
  }

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ status: 'processing', paymentStatus: session.payment_status })
  }

  const host = req.headers.get('host') ?? 'bluelunaevents.com'
  const result = await recordEstimatePaymentFromCheckoutSession(session, { host })
  if (!result.ok) {
    return NextResponse.json({ status: result.status, error: result.error ?? 'Payment could not be recorded' }, { status: 500 })
  }

  return NextResponse.json({
    status: result.status,
    amount: result.amount,
    estimateId: result.estimateId,
    receiptSent: !result.receiptError,
    receiptError: result.receiptError ?? null,
    pushError: result.pushError ?? null,
  })
}
