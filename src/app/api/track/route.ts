import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({ path: null }))
  const { path, referrer, session_id } = body
  if (!path || typeof path !== 'string') {
    return NextResponse.json({ error: 'path required' }, { status: 400 })
  }
  // Never track Studio itself — this is public-site traffic only, not Monica's own usage
  if (path.startsWith('/studio')) {
    return NextResponse.json({ ok: true })
  }

  const db = serverClient()
  const baseVisit = {
    path: path.slice(0, 500),
    referrer: typeof referrer === 'string' ? referrer.slice(0, 500) : null,
    session_id: typeof session_id === 'string' ? session_id.slice(0, 100) : null,
  }
  const richVisit = {
    ...baseVisit,
    landing_path: typeof body.landing_path === 'string' ? body.landing_path.slice(0, 500) : null,
    utm_source: typeof body.utm_source === 'string' ? body.utm_source.slice(0, 120) : null,
    utm_medium: typeof body.utm_medium === 'string' ? body.utm_medium.slice(0, 120) : null,
    utm_campaign: typeof body.utm_campaign === 'string' ? body.utm_campaign.slice(0, 120) : null,
    utm_content: typeof body.utm_content === 'string' ? body.utm_content.slice(0, 120) : null,
    utm_term: typeof body.utm_term === 'string' ? body.utm_term.slice(0, 120) : null,
  }

  const { error } = await db.from('site_visits').insert([richVisit])
  if (error) {
    const missingColumn = error.code === '42703' || error.code === 'PGRST204'
    if (missingColumn) await db.from('site_visits').insert([baseVisit])
    else console.error('Site visit tracking failed:', error)
  }

  return NextResponse.json({ ok: true })
}
