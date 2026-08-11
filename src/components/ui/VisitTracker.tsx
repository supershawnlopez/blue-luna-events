'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// A visitor who lands from Instagram and clicks around 5 pages should count
// as one Instagram visit, not 1 Instagram + 4 "Direct" (internal nav has
// bluelunaevents.com as document.referrer on every page after the first).
// So the entry channel is captured once per tab session and reused for
// every subsequent pageview in that session, instead of re-reading
// document.referrer fresh each time.
function getSessionId(): string {
  const KEY = 'bl_session_id'
  let id = sessionStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(KEY, id)
  }
  return id
}

function getEntryReferrer(): string | null {
  const KEY = 'bl_entry_referrer'
  const stored = sessionStorage.getItem(KEY)
  if (stored !== null) return stored || null
  const referrer = document.referrer || ''
  sessionStorage.setItem(KEY, referrer)
  return referrer || null
}

export default function VisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, referrer: getEntryReferrer(), session_id: getSessionId() }),
      keepalive: true,
    }).catch(() => {})
  }, [pathname])

  return null
}
