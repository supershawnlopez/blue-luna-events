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
