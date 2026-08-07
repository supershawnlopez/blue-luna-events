'use client'

import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i)
  return output
}

// iOS only supports Web Push for a PWA actually installed to the home
// screen (not a regular Safari tab), and only ever in response to a real
// tap — never requested automatically on page load. Hence a dismissible
// card, not a silent background subscribe.
export default function NotificationSetup() {
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const dismissed = localStorage.getItem('bl_notif_dismissed') === '1'
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    if (supported && !dismissed && Notification.permission === 'default') {
      setVisible(true)
    }
  }, [])

  async function enable() {
    setBusy(true)
    setError(null)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setError('Notifications were blocked — you can turn them on later in iPhone Settings → Notifications → Blue Luna Studio.')
        setBusy(false)
        return
      }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!) as BufferSource,
      })
      const json = sub.toJSON()
      await fetch('/api/studio/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      })
      setVisible(false)
    } catch {
      setError("Couldn't turn on notifications. If you're on iPhone, this only works once Studio is added to your Home Screen — Share → Add to Home Screen — then open it from there and try again.")
    }
    setBusy(false)
  }

  function dismiss() {
    localStorage.setItem('bl_notif_dismissed', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(91,191,191,0.06)', border: '1px solid rgba(91,191,191,0.2)', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(91,191,191,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Bell size={16} color="#5BBFBF" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.86rem', fontWeight: 600, color: 'white', margin: '0 0 4px' }}>Get notified the moment something happens</p>
        <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 10px', lineHeight: 1.5 }}>New leads, payments, and accepted estimates — right on your phone, no need to keep checking.</p>
        {error && <p style={{ fontSize: '0.72rem', color: '#f87171', margin: '0 0 10px' }}>{error}</p>}
        <button onClick={enable} disabled={busy} style={{ background: '#5BBFBF', border: 'none', borderRadius: '10px', padding: '9px 16px', color: '#0D0F0F', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
          {busy ? 'Turning on…' : 'Enable Notifications'}
        </button>
      </div>
      <button onClick={dismiss} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '4px', flexShrink: 0 }}>
        <X size={14} />
      </button>
    </div>
  )
}
