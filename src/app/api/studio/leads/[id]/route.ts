import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

const ALLOWED = ['status', 'temperature']

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const update = Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED.includes(k)))
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const db = serverClient()
  const { data, error } = await db
    .from('leads')
    .update(update)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// A real delete, not a soft one — a mistaken test submission or a clearly
// non-lead entry has no downstream record depending on it (unlike an
// estimate, which has payments/PDFs/emails tied to it), so there's nothing
// worth preserving by hiding it instead of removing it.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const db = serverClient()
  const { error } = await db.from('leads').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
