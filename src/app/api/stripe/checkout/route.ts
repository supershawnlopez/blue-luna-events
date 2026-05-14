import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { leadId, deposit, name, email, packageName, eventType } = await req.json()

  const host = req.headers.get('host') ?? 'bluelunaevents.com'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Blue Luna Events — ${packageName ?? 'Custom Build'} Deposit`,
          description: `50% deposit for ${eventType} event. Balance due 1 week before your event.`,
        },
        unit_amount: Math.round(deposit * 100),
      },
      quantity: 1,
    }],
    metadata: { lead_id: leadId, customer_name: name },
    success_url: `${baseUrl}/booking-confirmed?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/get-a-quote`,
  })

  return NextResponse.json({ url: session.url })
}
