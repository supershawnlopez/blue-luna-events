import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const estimateId = session.metadata?.estimate_id
    const estimateAmount = session.metadata?.amount

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    if (leadId) {
      await supabase
        .from('leads')
        .update({
          deposit_paid: true,
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq('id', leadId)
    }

    if (estimateId && estimateAmount) {
      await supabase
        .from('estimate_payments')
        .insert([{
          estimate_id: estimateId,
          amount: Number(estimateAmount),
          method: 'stripe',
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
        }])
    }
  }

  return NextResponse.json({ received: true })
}
