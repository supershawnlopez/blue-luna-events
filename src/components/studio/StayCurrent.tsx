'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const MY_BUILD = process.env.NEXT_PUBLIC_BUILD_ID
const CHECK_EVERY_MS = 5 * 60 * 1000

// Monica minimizes Studio instead of closing it, so without this a phone
// could keep running an old version for days. (Shawn, 2026-11-17 — same
// approach as Spa Mambo.) Whenever Studio comes back on screen, on every
// screen change, and every 5 minutes, we ask the server for its build
// number. If it's newer, Studio refreshes itself on the same screen — but
// never while a sheet is open or she's typing; then it waits for the next
// natural break (closing the sheet, switching tabs, leaving and coming back).
function isBusy(): boolean {
  const el = document.activeElement as HTMLElement | null
  if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) return true
  // Studio's bottom sheets and confirm dialogs are full-screen fixed overlays.
  return !!document.querySelector('#studio-root [style*="position: fixed"][style*="inset: 0"]')
}

// Safety net: reload at most once per live version. If a reload somehow
// doesn't bring the new build (CDN lag, etc.), we stop instead of looping.
let serverBuild: string | null = null
function applyUpdate() {
  const key = `studio-reloaded-for-${serverBuild}`
  try {
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
  } catch { return }
  window.location.reload()
}

export default function StayCurrent() {
  const pathname = usePathname()
  const updateReady = useRef(false)
  const lastPath = useRef(pathname)

  useEffect(() => {
    let stopped = false

    async function check() {
      if (stopped || !MY_BUILD || MY_BUILD === 'dev' || document.visibilityState !== 'visible') return
      if (!updateReady.current) {
        try {
          const res = await fetch('/api/version', { cache: 'no-store' })
          if (!res.ok) return
          const { build } = await res.json()
          if (build && build !== MY_BUILD) { serverBuild = build; updateReady.current = true }
        } catch { return }
      }
      if (updateReady.current && !isBusy()) applyUpdate()
    }

    const onVisible = () => { if (document.visibilityState === 'visible') check() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', check)
    // Sheet closed / field blurred → good moment to apply a waiting update.
    const onRelease = () => { if (updateReady.current) setTimeout(check, 400) }
    document.addEventListener('focusout', onRelease)
    document.addEventListener('click', onRelease)
    const timer = setInterval(check, CHECK_EVERY_MS)
    check()

    return () => {
      stopped = true
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', check)
      document.removeEventListener('focusout', onRelease)
      document.removeEventListener('click', onRelease)
      clearInterval(timer)
    }
  }, [])

  // Moving to another screen is the most natural break of all: if an update
  // is waiting, load the new screen fresh from the server instead.
  useEffect(() => {
    if (pathname === lastPath.current) return
    lastPath.current = pathname
    if (updateReady.current) applyUpdate()
  }, [pathname])

  return null
}
