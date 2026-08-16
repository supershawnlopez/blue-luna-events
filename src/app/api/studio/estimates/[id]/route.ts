import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = serverClient()
  const { data, error } = await supabase
    .from('estimates')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const supabase = serverClient()

  const allowed = [
    'status', 'notes', 'discount_type', 'discount_value', 'discount_note',
    'client_name', 'client_email', 'client_phone',
    'event_type', 'event_date', 'venue',
    'package_id', 'package_name', 'add_ons', 'custom_items', 'quoted_total',
    'deposit_type', 'deposit_value', 'deleted_at',
  ]
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('estimates')
    .update(update)
    .eq('id', params.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Soft-delete only (2026-08-16, Shawn's ask: a real trash Monica can undo
// from) — "deleting" just sets deleted_at, hides it from the normal list,
// and it's recoverable from Trash. Nothing is ever hard-removed here.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = serverClient()

  // Never let a delete silently wipe out real recorded payments — protects
  // actual collected money from an accidental tap.
  const { count } = await supabase
    .from('estimate_payments')
    .select('id', { count: 'exact', head: true })
    .eq('estimate_id', params.id)
  if (count && count > 0) {
    return NextResponse.json(
      { error: 'This estimate has recorded payments and can’t be deleted. Remove the payment records first if you really need to delete it.' },
      { status: 409 }
    )
  }

  const { error } = await supabase.from('estimates').update({ deleted_at: new Date().toISOString() }).eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
