import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

// Lets Monica offer a client a different package/item mix without losing the
// original estimate — e.g. a "more" or "less" version of what she already
// sent. Carries over client + event info and every line item; deliberately
// resets status/discount/deposit/payments since it's a fresh offer, not an
// edit of the original.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = serverClient()
  const { data: source, error: fetchError } = await supabase
    .from('estimates')
    .select('*')
    .eq('id', params.id)
    .single()

  if (fetchError || !source) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('estimates')
    .insert([{
      client_name: source.client_name,
      client_email: source.client_email,
      client_phone: source.client_phone,
      event_type: source.event_type,
      event_date: source.event_date,
      venue: source.venue,
      package_id: source.package_id,
      package_name: source.package_name,
      add_ons: source.add_ons,
      custom_items: source.custom_items ?? [],
      quoted_total: source.quoted_total,
      deposit_amount: 0,
      balance_amount: 0,
      notes: source.notes,
      status: 'draft',
      lead_id: source.lead_id,
    }])
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
