import webpush from 'web-push'
import { serverClient } from './supabase'

let configured = false
function ensureConfigured() {
  if (configured) return
  webpush.setVapidDetails(
    'mailto:monica@bluelunaevents.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
  configured = true
}

// Single-tenant on purpose — this is Monica's own app, not a multi-user
// product, so every stored subscription (her phone, maybe a second device)
// gets every notification. No per-user targeting needed.
export async function sendPush(title: string, body: string, url = '/studio') {
  if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return
  ensureConfigured()

  const db = serverClient()
  const { data: subs } = await db.from('push_subscriptions').select('*')
  if (!subs || subs.length === 0) return

  const payload = JSON.stringify({ title, body, url })

  await Promise.all(subs.map(async (sub) => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
    } catch (err) {
      const statusCode = (err as { statusCode?: number })?.statusCode
      // 404/410 = the browser or OS has already dropped this subscription
      // (uninstalled, permission revoked) — clean it up rather than retry.
      if (statusCode === 404 || statusCode === 410) {
        await db.from('push_subscriptions').delete().eq('id', sub.id)
      } else {
        console.error('Push send failed:', err)
      }
    }
  }))
}
