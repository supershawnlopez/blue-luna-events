import { NextResponse } from 'next/server'
import { submitLead } from '@/lib/actions'
import { westinProposal } from '@/lib/proposals/westinLaPalomaLaborDay'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const packageId = typeof body.packageId === 'string' ? body.packageId : ''
  const selectedPackage = westinProposal.packages.find(pkg => pkg.id === packageId)
  if (!selectedPackage) {
    return NextResponse.json({ error: 'Please select a valid package.' }, { status: 400 })
  }

  const name = clean(body.name)
  const email = clean(body.email)
  const phone = clean(body.phone)
  const notes = clean(body.notes)
  const acceptedDisclosures = body.acceptedDisclosures === true

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
  }
  if (!acceptedDisclosures) {
    return NextResponse.json({ error: 'Please review the decor notes before requesting a package.' }, { status: 400 })
  }

  const vision = [
    `Westin proposal package requested: ${selectedPackage.name}.`,
    `Westin Partner Price: $${selectedPackage.partnerPrice.toLocaleString()}.`,
    `Standard Price: $${selectedPackage.standardPrice.toLocaleString()}.`,
    'Client reviewed the design/weather notes before submitting.',
    notes ? `Client notes: ${notes}` : '',
  ].filter(Boolean).join(' ')

  const result = await submitLead({
    name,
    email,
    phone: phone || 'Not provided',
    event_type: 'Corporate / Resort Event',
    event_date: 'Labor Day 2026',
    venue: 'Westin La Paloma',
    vision,
    budget_range: `$${selectedPackage.partnerPrice.toLocaleString()} Westin Partner Price`,
    referral_source: 'Westin proposal page',
    status: 'new',
    source: 'inquiry',
    package_id: selectedPackage.id,
    package_name: selectedPackage.name,
    quoted_total: selectedPackage.partnerPrice,
    is_consultation: true,
    looking_for: ['Resort decor proposal', selectedPackage.name],
    custom_request: notes || undefined,
    referrer_raw: req.headers.get('referer') ?? undefined,
  })

  if (!result.success) {
    return NextResponse.json({ error: result.error ?? 'Could not save request.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, leadId: result.leadId })
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim().slice(0, 1200) : ''
}
