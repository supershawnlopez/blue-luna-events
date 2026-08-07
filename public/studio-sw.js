// Minimal service worker — exists only to satisfy PWA installability
// criteria (Chrome/Android requires a registered SW with a fetch handler
// before it'll offer the real "Install App" prompt). Deliberately does NOT
// cache anything: Studio always needs live data (today's leads, real
// balances, real payment status) — the one thing worse than no PWA here
// would be one that quietly shows Monica yesterday's numbers.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {
  // No respondWith() call — the browser handles every request exactly as
  // if this service worker didn't exist. Presence alone is what counts.
})

self.addEventListener('push', (event) => {
  let data = {}
  try { data = event.data ? event.data.json() : {} } catch { /* ignore malformed payloads */ }
  const title = data.title || 'Blue Luna Studio'
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url || '/studio' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/studio'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/studio') && 'focus' in client) return client.focus()
      }
      return self.clients.openWindow(url)
    })
  )
})
