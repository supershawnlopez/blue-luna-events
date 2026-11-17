'use client'

import { useEffect } from 'react'

export default function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    // updateViaCache: 'none' — always fetch the worker script fresh, never
    // from the HTTP cache, so a new worker is picked up on the next check.
    navigator.serviceWorker
      .register('/studio-sw.js', { scope: '/studio', updateViaCache: 'none' })
      .then(reg => {
        const check = () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}) }
        document.addEventListener('visibilitychange', check)
      })
      .catch(() => {})
  }, [])
  return null
}
