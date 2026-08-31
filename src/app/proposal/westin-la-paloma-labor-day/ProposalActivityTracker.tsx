'use client'

import { useEffect, useRef } from 'react'
import { isStudioPreview, trackProposalEvent } from '@/lib/proposalActivity'

// Measures how engaged the proposal recipient is: fires one `view` on open,
// then `heartbeat` events every 15s carrying accumulated *active* seconds
// (time the tab was actually visible, not just open in the background),
// plus a final beacon when they leave. Also marks when they scroll far
// enough to reach the design/weather notes and the package form.
export default function ProposalActivityTracker() {
  const started = useRef(false)
  const activeMsRef = useRef(0)
  const lastTickRef = useRef(Date.now())

  useEffect(() => {
    if (started.current || isStudioPreview()) return
    started.current = true

    trackProposalEvent('view', {
      referrer: document.referrer || null,
      screen_w: window.screen?.width ?? null,
      screen_h: window.screen?.height ?? null,
      viewport_w: window.innerWidth,
      language: navigator.language,
      user_agent: navigator.userAgent.slice(0, 300),
    })

    lastTickRef.current = Date.now()

    const accumulate = () => {
      const now = Date.now()
      if (document.visibilityState === 'visible') {
        activeMsRef.current += now - lastTickRef.current
      }
      lastTickRef.current = now
    }
    const activeSeconds = () => Math.round(activeMsRef.current / 1000)

    const heartbeat = window.setInterval(() => {
      accumulate()
      if (document.visibilityState === 'visible') {
        trackProposalEvent('heartbeat', { active_seconds: activeSeconds() })
      }
    }, 15000)

    const onVisibility = () => {
      accumulate()
      if (document.visibilityState === 'hidden') {
        trackProposalEvent('heartbeat', { active_seconds: activeSeconds(), left: true }, { beacon: true })
      } else {
        lastTickRef.current = Date.now()
      }
    }
    const onPageHide = () => {
      accumulate()
      trackProposalEvent('heartbeat', { active_seconds: activeSeconds(), left: true }, { beacon: true })
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onPageHide)

    const marks: Array<[string, string]> = [
      ['#design-weather-notes', 'viewed_weather_notes'],
      ['#request-package', 'reached_package_form'],
    ]
    const observers: IntersectionObserver[] = []
    for (const [selector, mark] of marks) {
      const el = document.querySelector(selector)
      if (!el) continue
      let fired = false
      const io = new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (entry.isIntersecting && !fired) {
              fired = true
              trackProposalEvent('scroll', { mark })
              io.disconnect()
            }
          }
        },
        { threshold: 0.4 },
      )
      io.observe(el)
      observers.push(io)
    }

    return () => {
      window.clearInterval(heartbeat)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onPageHide)
      observers.forEach(o => o.disconnect())
    }
  }, [])

  return null
}
