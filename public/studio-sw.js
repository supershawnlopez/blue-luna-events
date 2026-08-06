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
