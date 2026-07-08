import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function GET() {
  const supabase = adminClient()
  const [{ data, error }, { data: payments }] = await Promise.all([
    supabase.from('estimates').select('*').order('created_at', { ascending: false }),
    supabase.from('estimate_payments').select('estimate_id, amount'),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const paidByEstimate: Record<string, number> = {}
  for (const p of payments ?? []) {
    paidByEstimate[p.estimate_id] = (paidByEstimate[p.estimate_id] ?? 0) + Number(p.amount)
  }

  const withPaid = (data ?? []).map(est => ({ ...est, total_paid: paidByEstimate[est.id] ?? 0 }))
  return NextResponse.json(withPaid)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = adminClient()

  const { data, error } = await supabase
    .from('estimates')
    .insert([{
      client_name: body.client_name,
      client_email: body.client_email,
      client_phone: body.client_phone ?? null,
      event_type: body.event_type ?? null,
      event_date: body.event_date ?? null,
      venue: body.venue ?? null,
      package_id: body.package_id ?? null,
      package_name: body.package_name ?? null,
      add_ons: body.add_ons ?? null,
      quoted_total: body.quoted_total ?? 0,
      deposit_amount: body.deposit_amount ?? 0,
      balance_amount: body.balance_amount ?? 0,
      notes: body.notes ?? null,
      status: body.status ?? 'draft',
    }])
    .select('id, share_token')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
