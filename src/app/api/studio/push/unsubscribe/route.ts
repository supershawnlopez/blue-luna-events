import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { endpoint } = await req.json().catch(() => ({}))
  if (!endpoint) return NextResponse.json({ error: 'endpoint required' }, { status: 400 })

  const db = serverClient()
  await db.from('push_subscriptions').delete().eq('endpoint', endpoint)
  return NextResponse.json({ ok: true })
}
