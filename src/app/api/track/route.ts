import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { path, referrer } = await req.json().catch(() => ({ path: null, referrer: null }))
  if (!path || typeof path !== 'string') {
    return NextResponse.json({ error: 'path required' }, { status: 400 })
  }
  // Never track Studio itself — this is public-site traffic only, not Monica's own usage
  if (path.startsWith('/studio')) {
    return NextResponse.json({ ok: true })
  }

  const db = serverClient()
  await db.from('site_visits').insert([{
    path: path.slice(0, 500),
    referrer: typeof referrer === 'string' ? referrer.slice(0, 500) : null,
  }])

  return NextResponse.json({ ok: true })
}
