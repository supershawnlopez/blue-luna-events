import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { computeBalance } from '@/lib/estimateBalance'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { estimateId, mode } = await req.json()

  if (!estimateId || (mode !== 'deposit' && mode !== 'balance')) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const supabase = serverClient()
  const { data: est, error } = await supabase
    .from('estimates')
    .select('id, client_name, client_email, event_type, package_name, quoted_total, discount_type, discount_value, share_token')
    .eq('id', estimateId)
    .single()

  if (error || !est) {
    return NextResponse.json({ error: 'Estimate not found' }, { status: 404 })
  }

  const { data: paymentRows } = await supabase
    .from('estimate_payments')
    .select('amount')
    .eq('estimate_id', estimateId)

  const balance = computeBalance(est, (paymentRows ?? []).map(p => ({ id: '', method: '', created_at: '', amount: p.amount })))

  if (balance.isPaidInFull) {
    return NextResponse.json({ error: 'Already paid in full' }, { status: 400 })
  }

  const amount = mode === 'deposit' && balance.totalPaid === 0 ? balance.suggestedDeposit : balance.amountOwed
  const label = mode === 'deposit' && balance.totalPaid === 0 ? 'Deposit' : 'Remaining Balance'

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
          name: `Blue Luna Events — ${est.package_name ?? 'Custom Build'} ${label}`,
          description: `${label} for ${est.event_type ?? 'your'} event.`,
        },
        unit_amount: Math.round(amount * 100),
      },
      quantity: 1,
    }],
    metadata: { estimate_id: est.id, amount: String(amount) },
    success_url: `${returnUrl}?paid=1`,
    cancel_url: returnUrl,
  })

  return NextResponse.json({ url: session.url })
}
