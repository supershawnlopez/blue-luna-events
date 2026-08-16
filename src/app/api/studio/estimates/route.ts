import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { syncLeadOnEstimateCreated } from '@/lib/leadSync'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = serverClient()
  const trash = req.nextUrl.searchParams.get('trash') === '1'
  const estimatesQuery = trash
    ? supabase.from('estimates').select('*').not('deleted_at', 'is', null).order('deleted_at', { ascending: false })
    : supabase.from('estimates').select('*').is('deleted_at', null).order('created_at', { ascending: false })
  const [{ data, error }, { data: payments }] = await Promise.all([
    estimatesQuery,
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
  const supabase = serverClient()

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
      custom_items: body.custom_items ?? [],
      quoted_total: body.quoted_total ?? 0,
      deposit_amount: body.deposit_amount ?? 0,
      balance_amount: body.balance_amount ?? 0,
      notes: body.notes ?? null,
      status: body.status ?? 'draft',
      lead_id: body.lead_id ?? null,
    }])
    .select('id, share_token, lead_id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    await syncLeadOnEstimateCreated(supabase, data.lead_id)
  } catch (err) {
    console.error('Lead status sync failed:', err)
  }

  return NextResponse.json(data)
}
