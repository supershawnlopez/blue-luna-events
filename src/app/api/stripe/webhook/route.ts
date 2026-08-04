import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { sendReceiptEmail } from '@/lib/receiptEmail'

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

      // Non-blocking: a failed receipt email should never fail the webhook
      // itself (Stripe retries on non-200, which would re-insert the payment).
      try {
        const host = req.headers.get('host') ?? 'bluelunaevents.com'
        await sendReceiptEmail(estimateId, Number(estimateAmount), host)
      } catch (err) {
        console.error('Receipt email failed:', err)
      }
    }
  }

  return NextResponse.json({ received: true })
}
