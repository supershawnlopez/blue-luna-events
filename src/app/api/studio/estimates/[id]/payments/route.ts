import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { sendReceiptEmail } from '@/lib/receiptEmail'
import { sendPush } from '@/lib/push'

const METHOD_LABELS: Record<string, string> = {
  zelle: 'Zelle',
  cash: 'cash',
  check: 'check',
  other: 'other',
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = serverClient()
  const { data, error } = await supabase
    .from('estimate_payments')
    .select('*')
    .eq('estimate_id', params.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const amount = Number(body.amount)
  const method = String(body.method ?? '').trim()

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Amount must be greater than zero' }, { status: 400 })
  }
  if (!['zelle', 'cash', 'check', 'other'].includes(method)) {
    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
  }

  const supabase = serverClient()
  const { data, error } = await supabase
    .from('estimate_payments')
    .insert([{
      estimate_id: params.id,
      amount,
      method,
      note: body.note || null,
    }])
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Match Stripe payments: once a payment is recorded, the client gets a
  // receipt and Monica's installed Studio devices get a payment alert.
  try {
    const host = req.headers.get('host') ?? 'bluelunaevents.com'
    const result = await sendReceiptEmail(params.id, amount, host)
    if (!result.ok) console.error('Manual payment receipt email failed:', result.error)
  } catch (err) {
    console.error('Manual payment receipt email failed:', err)
  }

  try {
    const { data: est } = await supabase
      .from('estimates')
      .select('client_name')
      .eq('id', params.id)
      .single()
    await sendPush(
      '💰 Payment Recorded',
      `$${amount.toLocaleString()} ${METHOD_LABELS[method] ?? method} payment from ${est?.client_name ?? 'a client'}`,
      `/studio/estimates/${params.id}`
    )
  } catch (err) {
    console.error('Manual payment push notification failed:', err)
  }

  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url)
  const paymentId = searchParams.get('paymentId')
  if (!paymentId) return NextResponse.json({ error: 'paymentId required' }, { status: 400 })

  const supabase = serverClient()
  const { error } = await supabase
    .from('estimate_payments')
    .delete()
    .eq('id', paymentId)
    .eq('estimate_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
