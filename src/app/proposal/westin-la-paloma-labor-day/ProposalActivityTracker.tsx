'use client'

import { useEffect, useRef } from 'react'
import { isStudioPreview, trackProposalEvent } from '@/lib/proposalActivity'

// Measures how engaged the proposal recipient is:
//  - one `view` on open (with device info)
//  - `heartbeat` every 15s carrying accumulated *active* seconds (tab visible)
//  - a final beacon when they leave
//  - `scroll` funnel milestones (which section they reached)
//  - `package_dwell` — how long each package card was on screen, so Studio
//    can show which option they actually spent time weighing
const SCROLL_MARKS: Array<[string, string]> = [
  ['.packages-section', 'saw_packages'],
  ['.unit-section', 'saw_unit_pricing'],
  ['#design-weather-notes', 'viewed_weather_notes'],
  ['#request-package', 'reached_package_form'],
]

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
      device: window.innerWidth < 768 ? 'Phone' : 'Desktop',
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

    // ── Per-package dwell time ────────────────────────────────────────────
    const dwellMs: Record<string, number> = {}
    const enteredAt: Record<string, number> = {}
    const flushDwell = (send: boolean) => {
      const now = Date.now()
      for (const id of Object.keys(enteredAt)) {
        dwellMs[id] = (dwellMs[id] ?? 0) + (now - enteredAt[id])
        enteredAt[id] = now
      }
      if (send) {
        const seconds = Object.fromEntries(
          Object.entries(dwellMs).map(([id, ms]) => [id, Math.round(ms / 1000)]),
        )
        if (Object.values(seconds).some(s => s >= 1)) {
          trackProposalEvent('package_dwell', { seconds }, { beacon: document.visibilityState === 'hidden' })
        }
      }
    }

    const packageObserver = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.packageId
          if (!id) continue
          if (entry.isIntersecting) {
            enteredAt[id] = Date.now()
          } else if (enteredAt[id]) {
            dwellMs[id] = (dwellMs[id] ?? 0) + (Date.now() - enteredAt[id])
            delete enteredAt[id]
          }
        }
      },
      { threshold: 0.6 },
    )
    document
      .querySelectorAll<HTMLElement>('.package-card[data-package-id]')
      .forEach(el => packageObserver.observe(el))

    // ── Heartbeat + dwell flush ──────────────────────────────────────────
    const heartbeat = window.setInterval(() => {
      accumulate()
      if (document.visibilityState === 'visible') {
        trackProposalEvent('heartbeat', { active_seconds: activeSeconds() })
        flushDwell(true)
      }
    }, 15000)

    const onVisibility = () => {
      accumulate()
      if (document.visibilityState === 'hidden') {
        flushDwell(true)
        trackProposalEvent('heartbeat', { active_seconds: activeSeconds(), left: true }, { beacon: true })
      } else {
        lastTickRef.current = Date.now()
      }
    }
    const onPageHide = () => {
      accumulate()
      flushDwell(true)
      trackProposalEvent('heartbeat', { active_seconds: activeSeconds(), left: true }, { beacon: true })
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onPageHide)

    // ── Scroll funnel ────────────────────────────────────────────────────
    const observers: IntersectionObserver[] = []
    for (const [selector, mark] of SCROLL_MARKS) {
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
      packageObserver.disconnect()
      observers.forEach(o => o.disconnect())
    }
  }, [])

  return null
}
