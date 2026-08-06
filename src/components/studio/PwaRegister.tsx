'use client'

import { useEffect } from 'react'

export default function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/studio-sw.js', { scope: '/studio' }).catch(() => {})
    }
  }, [])
  return null
}
