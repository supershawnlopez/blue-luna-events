'use client'

// Client-side helper for logging recipient activity on a public proposal
// page. Mirrors the trust model of VisitTracker / the estimate activity
// beacons: no auth, gated only by being on the page, and internal Studio
// previews are suppressed so the Studio activity view stays honest.

const SLUG = 'westin-la-paloma-labor-day'

export function getProposalSessionId(): string {
  try {
    // Reuse the same tab-session id VisitTracker sets, so a proposal_events
    // row can be lined up against the matching site_visits row if needed.
    const KEY = 'bl_session_id'
    let id = sessionStorage.getItem(KEY)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(KEY, id)
    }
    return id
  } catch {
    return 'no-session'
  }
}

export function isStudioPreview(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('preview') === 'studio') return true
    if (document.referrer.includes('/studio')) return true
  } catch {
    /* ignore */
  }
  return false
}

export function trackProposalEvent(
  type: string,
  metadata: Record<string, unknown> = {},
  opts: { beacon?: boolean } = {},
) {
  if (typeof window === 'undefined' || isStudioPreview()) return

  const url = `/api/proposals/${SLUG}/activity`
  const payload = JSON.stringify({ session_id: getProposalSessionId(), type, metadata })

  try {
    if (opts.beacon && navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }))
      return
    }
  } catch {
    /* fall through to fetch */
  }

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {})
}
