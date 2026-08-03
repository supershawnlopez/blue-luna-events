import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export async function POST() {
  const db = serverClient()

  const [{ data: estimates }, { data: existing }] = await Promise.all([
    db.from('estimates').select('client_name, client_email, client_phone, status').not('status', 'eq', 'declined'),
    db.from('contacts').select('email, phone'),
  ])

  const knownEmails = new Set((existing ?? []).map(c => c.email?.toLowerCase()).filter(Boolean))
  const knownPhones = new Set((existing ?? []).map(c => c.phone).filter(Boolean))

  const seen = new Set<string>()
  const toInsert: { name: string; email: string | null; phone: string | null; source: string }[] = []

  for (const e of estimates ?? []) {
    if (!e.client_name) continue
    const emailKey = e.client_email?.toLowerCase() || null
    const phoneKey = e.client_phone || null
    if (!emailKey && !phoneKey) continue
    if (emailKey && (knownEmails.has(emailKey) || seen.has(`e:${emailKey}`))) continue
    if (!emailKey && phoneKey && (knownPhones.has(phoneKey) || seen.has(`p:${phoneKey}`))) continue

    if (emailKey) seen.add(`e:${emailKey}`)
    if (phoneKey) seen.add(`p:${phoneKey}`)
    toInsert.push({ name: e.client_name, email: e.client_email || null, phone: e.client_phone || null, source: 'estimate' })
  }

  if (toInsert.length === 0) return NextResponse.json({ added: 0 })

  const { error } = await db.from('contacts').insert(toInsert)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ added: toInsert.length })
}
