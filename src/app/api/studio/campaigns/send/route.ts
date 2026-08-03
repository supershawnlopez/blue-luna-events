import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { serverClient } from '@/lib/supabase'
import { fillTemplate, renderCampaignEmail } from '@/lib/campaignEmail'

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email is not configured' }, { status: 500 })
  }

  const { template_id, contact_ids } = await req.json()
  if (!template_id || !Array.isArray(contact_ids) || contact_ids.length === 0) {
    return NextResponse.json({ error: 'template_id and contact_ids are required' }, { status: 400 })
  }

  const db = serverClient()
  const [{ data: template }, { data: contacts }] = await Promise.all([
    db.from('email_templates').select('*').eq('id', template_id).single(),
    db.from('contacts').select('id, name, email, unsubscribed, unsubscribe_token').in('id', contact_ids),
  ])

  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })

  const host = req.headers.get('host') ?? 'bluelunaevents.com'
  const protocol = host.includes('localhost') ? 'http' : 'https'

  const recipients = (contacts ?? []).filter(c => c.email && !c.unsubscribed)
  const skipped = (contacts ?? []).length - recipients.length

  const resend = new Resend(process.env.RESEND_API_KEY)
  let sent = 0
  let failed = 0

  for (const contact of recipients) {
    const subject = fillTemplate(template.subject, contact.name)
    const body = fillTemplate(template.body, contact.name)
    const unsubscribeUrl = `${protocol}://${host}/api/unsubscribe?token=${contact.unsubscribe_token}`
    const html = renderCampaignEmail(subject, body, unsubscribeUrl)

    try {
      const { error } = await resend.emails.send({
        from: 'Monica at Blue Luna Events <monica@bluelunaevents.com>',
        replyTo: 'monica@bluelunaevents.com',
        to: [contact.email as string],
        subject,
        html,
      })
      if (error) throw new Error(error.message)
      sent++
      await db.from('campaign_sends').insert([{ template_id, contact_id: contact.id, email: contact.email, success: true }])
    } catch (err) {
      failed++
      await db.from('campaign_sends').insert([{
        template_id, contact_id: contact.id, email: contact.email, success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }])
    }
  }

  return NextResponse.json({ sent, failed, skipped })
}
