import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = serverClient()
  const { data, error } = await db
    .from('leads')
    .select('id, created_at, name, phone, email, event_type, event_date, venue, vision, budget_range, status, temperature, source, referral_source, setup_time, guest_count, looking_for, inspo_photos')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
