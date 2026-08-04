import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { sendReceiptEmail } from '@/lib/receiptEmail'

export async function POST(req: NextRequest, { params }: { params: { id: string; paymentId: string } }) {
  const supabase = serverClient()
  const { data: payment, error } = await supabase
    .from('estimate_payments')
    .select('amount')
    .eq('id', params.paymentId)
    .eq('estimate_id', params.id)
    .single()

  if (error || !payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

  const host = req.headers.get('host') ?? 'bluelunaevents.com'
  const result = await sendReceiptEmail(params.id, Number(payment.amount), host)

  if (!result.ok) return NextResponse.json({ error: result.error ?? 'Failed to send' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
