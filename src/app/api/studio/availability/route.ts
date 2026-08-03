import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { getBookedDates, getBlockedDates } from '@/lib/availability'

export async function GET() {
  const db = serverClient()
  const [booked, blocked] = await Promise.all([getBookedDates(db, 12), getBlockedDates(db)])
  return NextResponse.json({ booked, blocked })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { start_date, end_date, reason } = body
  if (!start_date || !end_date) {
    return NextResponse.json({ error: 'start_date and end_date required' }, { status: 400 })
  }
  const db = serverClient()
  const { data, error } = await db
    .from('availability_blocks')
    .insert([{ start_date, end_date, reason: reason || null }])
    .select('id, start_date, end_date, reason')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
