import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const supabase = serverClient()

  const allowed = ['label', 'description', 'pricing_type', 'price', 'unit', 'active']
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('catalog_items')
    .update(update)
    .eq('id', params.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Soft delete only — a catalog item is a template Monica reuses, not a
// live-linked record (picking one just copies its label/description/price
// onto that one estimate), but "remove but don't destroy" matches how the
// rest of this app treats anything Monica might want back later.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = serverClient()
  const { error } = await supabase
    .from('catalog_items')
    .update({ active: false })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
