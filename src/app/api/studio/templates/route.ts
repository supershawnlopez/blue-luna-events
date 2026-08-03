import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = serverClient()
  const { data, error } = await db.from('email_templates').select('*').order('updated_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.name?.trim() || !body.subject?.trim() || !body.body?.trim()) {
    return NextResponse.json({ error: 'name, subject, and body are required' }, { status: 400 })
  }
  const db = serverClient()
  const { data, error } = await db
    .from('email_templates')
    .insert([{ name: body.name.trim(), subject: body.subject.trim(), body: body.body }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
