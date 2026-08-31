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
  quantity_adjusted: 'Changed package quantities',
  notes_entered: 'Wrote a note',
  pdf_print: 'Printed / saved the choices',
  terms_acknowledged: 'Acknowledged the design/weather notes',
  submit_click: 'Tried to send package details',
  submitted: 'Sent package details',
}

// Ordered furthest-reached funnel. Later = further down the proposal.
const FUNNEL: Array<{ mark: string; label: string }> = [
  { mark: 'saw_packages', label: 'Package options' },
  { mark: 'saw_unit_pricing', label: 'Unit pricing' },
  { mark: 'viewed_weather_notes', label: 'Design / weather notes' },
  { mark: 'reached_package_form', label: 'Package form' },
]

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

  const ordered = Array.from(bySession.entries()).sort(
    (a, b) => new Date(a[1][0].created_at).getTime() - new Date(b[1][0].created_at).getTime(),
  )
  const totalOpens = ordered.length

  const sessions = ordered
    .map(([sessionId, events], index) => {
      let activeSeconds = 0
      let device: string | null = null
      let furthest: { mark: string; label: string } | null = null
      let dwell: Record<string, number> = {}
      let latestNote: string | null = null
      let latestAdjustment: { changes: unknown[]; adjustedPartnerPrice?: number } | null = null

      const actions: { type: string; label: string; at: string; detail?: string }[] = []
      const seen = new Set<string>()

      for (const e of events) {
        const meta = e.metadata ?? {}

        if (e.type === 'heartbeat') {
          const s = Number(meta.active_seconds)
          if (Number.isFinite(s)) activeSeconds = Math.max(activeSeconds, s)
          continue
        }
        if (e.type === 'view') {
          if (typeof meta.device === 'string') device = meta.device
          if (!device && typeof meta.viewport_w === 'number') device = meta.viewport_w < 768 ? 'Phone' : 'Desktop'
        }
        if (e.type === 'scroll') {
          const m = typeof meta.mark === 'string' ? meta.mark : ''
          const hit = FUNNEL.find(f => f.mark === m)
          if (hit && (!furthest || FUNNEL.indexOf(hit) > FUNNEL.findIndex(f => f.mark === furthest!.mark))) {
            furthest = hit
          }
          continue
        }
        if (e.type === 'package_dwell') {
          const s = meta.seconds
          if (s && typeof s === 'object') dwell = s as Record<string, number>
          continue
        }
        if (e.type === 'notes_entered') {
          if (typeof meta.text === 'string') latestNote = meta.text
        }
        if (e.type === 'quantity_adjusted') {
          if (Array.isArray(meta.changes)) {
            latestAdjustment = {
              changes: meta.changes,
              adjustedPartnerPrice: typeof meta.adjustedPartnerPrice === 'number' ? meta.adjustedPartnerPrice : undefined,
            }
          }
        }

        let detail: string | undefined
        let dedupeKey = e.type
        if (e.type === 'package_click' || e.type === 'package_selected') {
          detail = packageName(meta.packageId)
          dedupeKey = `${e.type}:${String(meta.packageId ?? '')}`
        }
        if (seen.has(dedupeKey)) continue
        seen.add(dedupeKey)
        actions.push({ type: e.type, label: ACTION_LABELS[e.type] ?? e.type, at: e.created_at, detail })
      }

      if (events.some(e => e.type === 'submitted')) {
        furthest = { mark: 'submitted', label: 'Sent package details' }
      }

      // Which package did they weigh longest?
      const dwellRanked = Object.entries(dwell)
        .filter(([, s]) => Number(s) >= 2)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .map(([id, s]) => ({ packageId: id, name: packageName(id) ?? id, seconds: Number(s) }))

      return {
        sessionId,
        visitNumber: index + 1,
        device,
        firstSeen: events[0].created_at,
        lastSeen: events[events.length - 1].created_at,
        activeSeconds,
        furthest,
        dwell: dwellRanked,
        latestNote,
        latestAdjustment,
        submitted: events.some(e => e.type === 'submitted'),
        actions,
      }
    })
    .reverse() // newest visit first for display

  return NextResponse.json({
    sessions,
    totalOpens,
    lastOpen: sessions[0]?.firstSeen ?? null,
  })
}
