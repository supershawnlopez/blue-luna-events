'use server'

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { Lead } from './supabase'
import { SITE_CONFIG } from './config'

export async function submitLead(data: Lead) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  let vision = data.vision ?? ''
  if (data.package_name && !vision.includes('Package:')) {
    vision = `Package: ${data.package_name}.${data.vision ? ' ' + data.vision : ''}`
  }

  const { error } = await supabase
    .from('leads')
    .insert([{
      name: data.name,
      phone: data.phone,
      email: data.email,
      event_type: data.event_type,
      event_date: data.event_date,
      venue: data.venue,
      vision,
      budget_range: data.budget_range,
      status: 'new',
      created_at: new Date().toISOString(),
      package_id: data.package_id,
      package_name: data.package_name,
      add_ons: data.add_ons,
      quoted_total: data.quoted_total,
      is_consultation: data.is_consultation ?? false,
      deposit_paid: data.deposit_paid ?? false,
      deposit_amount: data.deposit_amount,
      stripe_payment_intent_id: data.stripe_payment_intent_id,
      source: data.source ?? 'direct',
    }])

  if (error) {
    console.error('Lead submission error:', error)
    return { success: false, error: error.message }
  }

  // Fire-and-forget — won't fail the lead submission if Resend isn't configured yet
  sendLeadNotification(data, vision).catch(err => console.error('Notification error:', err))

  return { success: true }
}

async function sendLeadNotification(data: Lead, vision: string) {
  if (!process.env.RESEND_API_KEY) return   // no-op until Resend is configured

  const resend = new Resend(process.env.RESEND_API_KEY)
  const isConsultation = data.is_consultation ?? false
  const total = data.quoted_total ? `$${data.quoted_total.toLocaleString()}` : null
  const deposit = data.deposit_amount ? `$${data.deposit_amount.toLocaleString()}` : null
  const addOnsParsed: string[] = data.add_ons ? JSON.parse(data.add_ons) : []

  const subject = isConsultation
    ? `🌙 New Consultation Request — ${data.name} (${data.event_type})`
    : `🎈 New Booking Request — ${data.name}${total ? ` · ${total}` : ''}`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Inter,sans-serif;background:#F9FAFB;margin:0;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;border:1px solid #E5E7EB">
    <div style="background:#0D0F0F;padding:24px 28px">
      <p style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#5BBFBF;margin:0 0 6px">Blue Luna Events</p>
      <h1 style="font-size:1.3rem;font-weight:700;color:white;margin:0">${isConsultation ? '✨ New Consultation Request' : '🎈 New Booking Request'}</h1>
    </div>
    <div style="padding:28px">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280;width:120px">Name</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#0D0F0F">${data.name}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Phone</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#0D0F0F"><a href="tel:${data.phone}" style="color:#5BBFBF;text-decoration:none">${data.phone}</a></td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Email</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#0D0F0F"><a href="mailto:${data.email}" style="color:#5BBFBF;text-decoration:none">${data.email}</a></td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Event</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#0D0F0F">${data.event_type}</td></tr>
        ${data.event_date ? `<tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Date</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#0D0F0F">${data.event_date}</td></tr>` : ''}
        ${data.venue ? `<tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Venue</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#0D0F0F">${data.venue}</td></tr>` : ''}
        ${data.package_name ? `<tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Package</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#0D0F0F">${data.package_name}</td></tr>` : ''}
        ${addOnsParsed.length > 0 ? `<tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Add-Ons</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#374151">${addOnsParsed.join(', ')}</td></tr>` : ''}
        ${total ? `<tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Total</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:15px;font-weight:700;color:#0D0F0F">${total}</td></tr>` : ''}
        ${deposit && !isConsultation ? `<tr><td style="padding:8px 0;font-size:13px;color:#6B7280">Deposit</td><td style="padding:8px 0;font-size:13px;font-weight:600;color:#5BBFBF">${deposit}</td></tr>` : ''}
      </table>
      ${vision ? `<div style="background:#F9FAFB;border-radius:10px;padding:14px;margin-top:20px"><p style="font-size:12px;font-weight:600;color:#9CA3AF;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 6px">Notes</p><p style="font-size:13px;color:#374151;margin:0;line-height:1.6">${vision}</p></div>` : ''}
      <div style="background:rgba(91,191,191,0.08);border:1px solid rgba(91,191,191,0.25);border-radius:12px;padding:16px;margin-top:20px;text-align:center">
        <p style="font-size:13px;font-weight:600;color:#3A8F8F;margin:0 0 12px">${isConsultation ? 'Custom event — reach out personally to finalize.' : 'Confirm the date and send a deposit link.'}</p>
        <a href="tel:${data.phone}" style="display:inline-block;background:#5BBFBF;color:#0D0F0F;font-size:13px;font-weight:700;padding:10px 24px;border-radius:999px;text-decoration:none">Call / Text ${data.name.split(' ')[0]}</a>
      </div>
    </div>
    <div style="padding:16px 28px;border-top:1px solid #F3F4F6;text-align:center">
      <p style="font-size:11px;color:#9CA3AF;margin:0">${SITE_CONFIG.name} · ${SITE_CONFIG.location} · <a href="mailto:${SITE_CONFIG.email}" style="color:#9CA3AF">${SITE_CONFIG.email}</a></p>
    </div>
  </div>
</body>
</html>`

  await resend.emails.send({
    from: `Blue Luna Events <notifications@bluelunaevents.com>`,
    to: [SITE_CONFIG.email],
    subject,
    html,
  })
}
