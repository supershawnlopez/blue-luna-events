import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = serverClient()
  const { data, error } = await db
    .from('contacts')
    .select('*')
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name required' }, { status: 400 })
  }
  const db = serverClient()
  const { data, error } = await db
    .from('contacts')
    .insert([{
      name: body.name.trim(),
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      notes: body.notes?.trim() || null,
      source: 'manual',
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
