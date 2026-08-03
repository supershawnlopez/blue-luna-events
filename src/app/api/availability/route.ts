import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { getUnavailableDateStrings } from '@/lib/availability'

export const dynamic = 'force-dynamic'

// Public — powers the real-availability calendar on /event-questionnaire.
// Only ever returns bare dates, never client names or estimate detail.
export async function GET() {
  const db = serverClient()
  const unavailable = await getUnavailableDateStrings(db)
  return NextResponse.json({ unavailable })
}
