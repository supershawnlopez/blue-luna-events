import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { estimateId, type } = await req.json()

  if (!estimateId || (type !== 'deposit' && type !== 'balance')) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const supabase = serverClient()
  const { data: est, error } = await supabase
    .from('estimates')
    .select('id, client_name, client_email, event_type, package_name, deposit_amount, balance_amount, deposit_paid, balance_paid, share_token')
    .eq('id', estimateId)
    .single()

  if (error || !est) {
    return NextResponse.json({ error: 'Estimate not found' }, { status: 404 })
  }

  if (type === 'deposit' && est.deposit_paid) {
    return NextResponse.json({ error: 'Deposit already paid' }, { status: 400 })
  }
  if (type === 'balance' && (!est.deposit_paid || est.balance_paid)) {
    return NextResponse.json({ error: 'Balance not payable yet' }, { status: 400 })
  }

  const amount = type === 'deposit' ? est.deposit_amount : est.balance_amount
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Nothing due' }, { status: 400 })
  }

  const host = req.headers.get('host') ?? 'bluelunaevents.com'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`
  const returnUrl = `${baseUrl}/q/${est.share_token}`

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: est.client_email,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Blue Luna Events — ${est.package_name ?? 'Custom Build'} ${type === 'deposit' ? 'Deposit' : 'Balance'}`,
          description: type === 'deposit'
            ? `50% deposit for ${est.event_type ?? 'your'} event.`
            : `Remaining balance for ${est.event_type ?? 'your'} event.`,
        },
        unit_amount: Math.round(amount * 100),
      },
      quantity: 1,
    }],
    metadata: { estimate_id: est.id, type },
    success_url: `${returnUrl}?paid=${type}`,
    cancel_url: returnUrl,
  })

  return NextResponse.json({ url: session.url })
}
