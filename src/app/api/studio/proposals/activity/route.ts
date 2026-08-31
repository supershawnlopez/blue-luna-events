import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { westinProposal } from '@/lib/proposals/westinLaPalomaLaborDay'

export const dynamic = 'force-dynamic'

function authorized(req: NextRequest) {
  const session = req.cookies.get('studio_session')
  return !!session?.value && session.value === process.env.STUDIO_SESSION_TOKEN
}

type EventRow = {
  session_id: string | null
  type: string
  metadata: Record<string, unknown> | null
  created_at: string
}

const ACTION_LABELS: Record<string, string> = {
  view: 'Opened the proposal',
  package_click: 'Looked at a package',
  package_selected: 'Selected a package',
  adjust_opened: 'Opened package adjustments',
  pdf_print: 'Printed / saved the choices',
  terms_acknowledged: 'Acknowledged the design/weather notes',
  submit_click: 'Tried to send package details',
  submitted: 'Sent package details',
}

function packageName(id: unknown): string | undefined {
  if (typeof id !== 'string') return undefined
  return westinProposal.packages.find(p => p.id === id)?.name
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = serverClient()
  const { data, error } = await db
    .from('proposal_events')
    .select('session_id, type, metadata, created_at')
    .eq('proposal_slug', westinProposal.slug)
    .order('created_at', { ascending: true })

  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST205') {
      return NextResponse.json({ sessions: [], totalOpens: 0, lastOpen: null })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (data ?? []) as EventRow[]
  const bySession = new Map<string, EventRow[]>()
  for (const row of rows) {
    const key = row.session_id ?? `anon-${row.created_at}`
    const arr = bySession.get(key) ?? []
    arr.push(row)
    bySession.set(key, arr)
  }

  const sessions = Array.from(bySession.entries())
    .map(([sessionId, events]) => {
      let activeSeconds = 0
      const actions: { type: string; label: string; at: string; detail?: string }[] = []
      const seen = new Set<string>()
      const marks = new Set<string>()

      for (const e of events) {
        if (e.type === 'heartbeat') {
          const s = Number(e.metadata?.active_seconds)
          if (Number.isFinite(s)) activeSeconds = Math.max(activeSeconds, s)
          continue
        }
        if (e.type === 'scroll') {
          const m = e.metadata?.mark
          if (typeof m === 'string') marks.add(m)
          continue
        }
        let detail: string | undefined
        let dedupeKey = e.type
        if (e.type === 'package_click' || e.type === 'package_selected') {
          detail = packageName(e.metadata?.packageId)
          dedupeKey = `${e.type}:${String(e.metadata?.packageId ?? '')}`
        }
        if (seen.has(dedupeKey)) continue
        seen.add(dedupeKey)
        actions.push({ type: e.type, label: ACTION_LABELS[e.type] ?? e.type, at: e.created_at, detail })
      }

      return {
        sessionId,
        firstSeen: events[0].created_at,
        lastSeen: events[events.length - 1].created_at,
        activeSeconds,
        reachedWeatherNotes: marks.has('viewed_weather_notes'),
        reachedForm: marks.has('reached_package_form'),
        submitted: events.some(e => e.type === 'submitted'),
        actions,
      }
    })
    .sort((a, b) => new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime())

  return NextResponse.json({
    sessions,
    totalOpens: sessions.length,
    lastOpen: sessions[0]?.firstSeen ?? null,
  })
}
