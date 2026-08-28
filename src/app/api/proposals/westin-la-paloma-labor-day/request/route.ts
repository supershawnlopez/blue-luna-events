import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { SITE_CONFIG } from '@/lib/config'
import { serverClient } from '@/lib/supabase'
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

  const notes = clean(body.notes)
  const acceptedDisclosures = body.acceptedDisclosures === true

  if (!acceptedDisclosures) {
    return NextResponse.json({ error: 'Please review the decor notes before requesting a package.' }, { status: 400 })
  }

  const db = serverClient()
  const { data: selection, error: selectionError } = await db
    .from('proposal_selections')
    .insert([{
      proposal_slug: westinProposal.slug,
      proposal_title: westinProposal.title,
      venue: westinProposal.venue,
      client_name: westinProposal.clientName,
      event_type: westinProposal.eventTypeId,
      event_date: westinProposal.eventDate,
      package_id: selectedPackage.id,
      package_name: selectedPackage.name,
      standard_price: selectedPackage.standardPrice,
      partner_price: selectedPackage.partnerPrice,
      included_items: selectedPackage.includes,
      notes: notes || null,
      accepted_disclosures: acceptedDisclosures,
    }])
    .select('id')
    .single()

  if (selectionError || !selection) {
    if (selectionError?.code !== '42P01') {
      console.error('Westin proposal selection save failed:', selectionError)
      return NextResponse.json({ error: 'Could not save package selection.' }, { status: 500 })
    }
    console.error('Westin proposal selection save failed:', selectionError)
  }

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: 'Blue Luna Events <notifications@bluelunaevents.com>',
      to: [SITE_CONFIG.email],
      subject: `Westin proposal package selected — ${selectedPackage.name}`,
      html: buildSelectionEmail(selectedPackage, notes, selection?.id ?? null),
    })

    if (error) {
      console.error('Westin proposal selection email failed:', error)
      if (selection?.id) {
        return NextResponse.json({ ok: true, selectionId: selection.id, emailWarning: true })
      }
      return NextResponse.json({ error: 'Could not send package selection.' }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true, selectionId: selection?.id ?? null })
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim().slice(0, 1200) : ''
}

function buildSelectionEmail(
  selectedPackage: (typeof westinProposal.packages)[number],
  notes: string,
  selectionId: string | null,
) {
  const includes = selectedPackage.includes
    .map(item => `<li><strong>${escapeHtml(item.title)}</strong>${item.detail ? `<br><span>${escapeHtml(item.detail)}</span>` : ''}</li>`)
    .join('')
  const studioUrl = selectionId
    ? `https://${SITE_CONFIG.website}/studio/proposals?open=${encodeURIComponent(selectionId)}`
    : `https://${SITE_CONFIG.website}/studio/proposals`

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0d0f0f">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:28px 16px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:18px;overflow:hidden">
          <tr>
            <td style="background:#0d0f0f;padding:30px">
              <p style="margin:0 0 8px;color:#5bbfbf;text-transform:uppercase;letter-spacing:.16em;font-size:11px;font-weight:800">Westin La Paloma Proposal</p>
              <h1 style="margin:0;color:#fff;font-family:Georgia,serif;font-size:28px;line-height:1.1">Package direction selected</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 30px">
              <p style="margin:0 0 8px;color:#667085;font-size:12px;text-transform:uppercase;letter-spacing:.12em;font-weight:800">Selected Package</p>
              <h2 style="margin:0 0 8px;font-size:22px;line-height:1.2">${escapeHtml(selectedPackage.name)}</h2>
              <p style="margin:0 0 22px;color:#667085;font-size:15px;line-height:1.6">
                Westin Partner Price: <strong style="color:#0d0f0f">$${selectedPackage.partnerPrice.toLocaleString()}</strong><br>
                Standard Price: $${selectedPackage.standardPrice.toLocaleString()}
              </p>
              <ul style="margin:0 0 22px;padding-left:20px;color:#374151;font-size:14px;line-height:1.6">${includes}</ul>
              ${notes ? `<div style="border-left:3px solid #5bbfbf;background:#f9fafb;padding:14px 16px;border-radius:0 10px 10px 0"><p style="margin:0;color:#374151;font-size:14px;line-height:1.6">${escapeHtml(notes)}</p></div>` : ''}
              <p style="margin:22px 0 0;color:#667085;font-size:13px;line-height:1.6">The client acknowledged the design/weather notes before submitting this package direction.</p>
              <a href="${studioUrl}" style="display:inline-block;margin-top:22px;background:#5bbfbf;color:#0d0f0f;border-radius:999px;padding:13px 20px;font-size:14px;font-weight:800;text-decoration:none">${selectionId ? 'Review in Studio' : 'Open Studio Proposals'}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
