import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { recordEstimatePaymentFromCheckoutSession } from '@/lib/stripeEstimatePayments'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const leadId = session.metadata?.lead_id

    const supabase = serverClient()

    if (leadId) {
      await supabase
        .from('leads')
        .update({
          deposit_paid: true,
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq('id', leadId)
    }

    if (session.metadata?.estimate_id) {
      const host = req.headers.get('host') ?? 'bluelunaevents.com'
      const result = await recordEstimatePaymentFromCheckoutSession(session, {
        host,
        eventId: event.id,
        eventType: event.type,
        eventCreated: event.created,
        livemode: event.livemode,
        payload: event,
      })

      if (!result.ok) {
        console.error('Stripe estimate payment recording failed:', result)
        return NextResponse.json({ error: result.error ?? 'Payment recording failed' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
