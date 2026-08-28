import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function authorized(req: NextRequest) {
  const session = req.cookies.get('studio_session')
  return !!session?.value && session.value === process.env.STUDIO_SESSION_TOKEN
}

const selectionColumns = 'id, created_at, proposal_slug, proposal_title, venue, client_name, client_email, client_phone, event_type, event_date, package_id, package_name, standard_price, partner_price, included_items, notes, accepted_disclosures, status, estimate_id'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = serverClient()
  const { data, error } = await db
    .from('proposal_selections')
    .select(selectionColumns)
    .eq('id', params.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const update: Record<string, unknown> = {}
  if (typeof body.status === 'string') update.status = body.status
  if (typeof body.estimate_id === 'string') update.estimate_id = body.estimate_id

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const db = serverClient()
  const { data, error } = await db
    .from('proposal_selections')
    .update(update)
    .eq('id', params.id)
    .select(selectionColumns)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
