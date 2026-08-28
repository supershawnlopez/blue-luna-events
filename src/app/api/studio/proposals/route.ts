import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function authorized(req: NextRequest) {
  const session = req.cookies.get('studio_session')
  return !!session?.value && session.value === process.env.STUDIO_SESSION_TOKEN
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = serverClient()
  const { data, error } = await db
    .from('proposal_selections')
    .select('id, created_at, proposal_slug, proposal_title, venue, client_name, event_type, event_date, package_id, package_name, standard_price, partner_price, included_items, notes, accepted_disclosures, status, estimate_id')
    .order('created_at', { ascending: false })

  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST205') return NextResponse.json([])
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
