import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { sendPush } from '@/lib/push'
import { westinProposal } from '@/lib/proposals/westinLaPalomaLaborDay'

export const dynamic = 'force-dynamic'

// Public on purpose — same trust model as /api/track and the /q/[token]
// activity beacon. Gated only by being on the proposal page.
const ALLOWED = new Set([
  'view',
  'heartbeat',
  'scroll',
  'package_click',
  'package_selected',
  'package_dwell',
  'adjust_opened',
  'quantity_adjusted',
  'notes_entered',
  'pdf_print',
  'terms_acknowledged',
  'submit_click',
  'submitted',
])

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }

  const type = typeof body.type === 'string' ? body.type : ''
  if (!ALLOWED.has(type)) return NextResponse.json({ ok: true })

  // Backstop against internal Studio previews slipping through.
  const referer = req.headers.get('referer') ?? ''
  if (referer.includes('/studio')) return NextResponse.json({ ok: true })

  const sessionId = typeof body.session_id === 'string' ? body.session_id.slice(0, 100) : null
  const metadata =
    body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
      ? body.metadata
      : {}

  const db = serverClient()

  // First event we've ever seen from this browser session → tell Monica
  // someone just opened the proposal. A reopen after the tab session
  // expired counts as a fresh open, which is the intended behavior.
  let notifyOpen = false
  if (sessionId && type === 'view') {
    const { count } = await db
      .from('proposal_events')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId)
    notifyOpen = (count ?? 0) === 0
  }

  const { error } = await db.from('proposal_events').insert([
    {
      proposal_slug: westinProposal.slug,
      session_id: sessionId,
      type,
      metadata,
    },
  ])
  if (error && error.code !== '42P01' && error.code !== 'PGRST205') {
    console.error('proposal_events insert failed:', error)
  }

  if (notifyOpen) {
    const when = new Date().toLocaleString('en-US', {
      timeZone: 'America/Phoenix',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
    try {
      await sendPush(
        '👀 Westin proposal opened',
        `Someone just opened the Labor Day proposal — ${when}`,
        '/studio/proposals',
      )
    } catch (err) {
      console.error('proposal open push failed:', err)
    }
  }

  return NextResponse.json({ ok: true })
}
