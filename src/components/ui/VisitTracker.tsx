'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
type UtmKey = typeof UTM_KEYS[number]
type Attribution = Partial<Record<UtmKey, string>> & { landing_path?: string }

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

function getAttribution(pathname: string): Attribution {
  const existing: Attribution = {}
  for (const key of UTM_KEYS) {
    const stored = sessionStorage.getItem(`bl_${key}`)
    if (stored) existing[key] = stored
  }
  const storedLanding = sessionStorage.getItem('bl_landing_path')
  if (storedLanding) existing.landing_path = storedLanding

  const params = new URLSearchParams(window.location.search)
  let foundNewUtm = false
  for (const key of UTM_KEYS) {
    const value = params.get(key)
    if (value) {
      const clean = value.slice(0, 120)
      sessionStorage.setItem(`bl_${key}`, clean)
      existing[key] = clean
      foundNewUtm = true
    }
  }

  if (!existing.landing_path || foundNewUtm) {
    const landing = `${pathname}${window.location.search || ''}`.slice(0, 500)
    sessionStorage.setItem('bl_landing_path', landing)
    existing.landing_path = landing
  }

  return existing
}

export default function VisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const attribution = getAttribution(pathname)
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, referrer: getEntryReferrer(), session_id: getSessionId(), ...attribution }),
      keepalive: true,
    }).catch(() => {})
  }, [pathname])

  return null
}
