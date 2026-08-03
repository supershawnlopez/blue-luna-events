import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { computeDiscountAmount } from '@/lib/estimateBalance'

export const dynamic = 'force-dynamic'

const DAY_MS = 24 * 60 * 60 * 1000
const LEAD_RESPONSE_WINDOW_DAYS = 14
const EVENT_LOOKAHEAD_DAYS = 14

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / DAY_MS)
}

export async function GET() {
  const db = serverClient()

  const [{ data: leads }, { data: estimates }, { data: payments }, { count: socialReady }] = await Promise.all([
    db.from('leads')
      .select('id, name, phone, email, event_type, created_at, status')
      .eq('status', 'new')
      .order('created_at', { ascending: true })
      .limit(20),
    db.from('estimates')
      .select('id, client_name, event_type, event_date, quoted_total, discount_type, discount_value, share_token, status')
      .not('event_date', 'is', null)
      .order('event_date', { ascending: true })
      .limit(50),
    db.from('estimate_payments').select('estimate_id, amount, method, created_at'),
    db.from('gallery_media').select('*', { count: 'exact', head: true }).eq('social_export', true),
  ])

  // Untouched leads — Monica hasn't moved them off "new" yet
  const untouchedLeads = (leads ?? [])
    .filter(l => l.created_at)
    .map(l => ({
      id: l.id,
      name: l.name,
      phone: l.phone,
      eventType: l.event_type,
      daysWaiting: Math.floor((Date.now() - new Date(l.created_at).getTime()) / DAY_MS),
    }))
    .filter(l => l.daysWaiting <= LEAD_RESPONSE_WINDOW_DAYS * 3) // drop truly stale/dead leads from the surface
    .slice(0, 5)

  const paidByEstimate: Record<string, number> = {}
  for (const p of (payments ?? [])) {
    paidByEstimate[p.estimate_id] = (paidByEstimate[p.estimate_id] ?? 0) + Number(p.amount)
  }

  const upcoming = (estimates ?? [])
    .filter(e => e.event_date && e.status !== 'cancelled')
    .map(e => {
      const finalTotal = Math.max(0, Number(e.quoted_total) - computeDiscountAmount(e))
      const amountOwed = Math.max(0, finalTotal - (paidByEstimate[e.id] ?? 0))
      return {
        id: e.id,
        clientName: e.client_name,
        eventType: e.event_type,
        eventDate: e.event_date,
        shareToken: e.share_token,
        daysUntil: daysUntil(e.event_date),
        amountOwed,
      }
    })
    .filter(e => e.daysUntil >= 0 && e.daysUntil <= EVENT_LOOKAHEAD_DAYS)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  const eventsSoon = upcoming.slice(0, 5)
  const paymentsDue = upcoming.filter(e => e.amountOwed > 0).slice(0, 5)

  return NextResponse.json({
    leads: { count: untouchedLeads.length, items: untouchedLeads },
    eventsSoon,
    paymentsDue,
    social: { readyCount: socialReady ?? 0 },
  })
}
