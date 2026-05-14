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

  const { data: inserted, error } = await supabase
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
      custom_build: data.custom_build ?? null,
      custom_request: data.custom_request ?? null,
    }])
    .select('id')
    .single()

  if (error) {
    console.error('Lead submission error:', error)
    return { success: false, error: error.message }
  }

  // Both fire-and-forget — neither blocks lead submission
  sendMonicaNotification(data, vision).catch(err => console.error('Monica notification error:', err))
  sendClientConfirmation(data).catch(err => console.error('Client confirmation error:', err))

  return { success: true, leadId: inserted.id as string }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function firstName(name: string) {
  return name.trim().split(' ')[0]
}

function fmt(n: number) {
  return `$${n.toLocaleString()}`
}

function parseAddOns(raw?: string): string[] {
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

function eventLabel(eventType: string): string {
  const t = eventType.toLowerCase()
  if (t.includes('quincea')) return 'quinceañera'
  if (t.includes('graduation')) return 'graduation'
  if (t.includes('wedding')) return 'wedding'
  if (t.includes('birthday')) return 'birthday'
  if (t.includes('baby shower')) return 'baby shower'
  if (t.includes('bridal')) return 'bridal shower'
  if (t.includes('corporate')) return 'corporate event'
  return eventType.toLowerCase()
}

// ─── Monica's notification email ───────────────────────────────────────────────

async function sendMonicaNotification(data: Lead, vision: string) {
  if (!process.env.RESEND_API_KEY) return

  const resend = new Resend(process.env.RESEND_API_KEY)
  const isConsultation = data.is_consultation ?? false
  const total = data.quoted_total ? fmt(data.quoted_total) : null
  const deposit = data.deposit_amount ? fmt(data.deposit_amount) : null
  const addOns = parseAddOns(data.add_ons)
  const first = firstName(data.name)
  const label = eventLabel(data.event_type)

  const subject = isConsultation
    ? `✨ Consultation — ${data.name} · ${data.event_type}`
    : `🎈 New Booking — ${data.name} · ${total ?? data.event_type} · ${data.event_type}`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3F4F6;padding:32px 16px">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">

  <!-- Header -->
  <tr><td style="background:#0D0F0F;border-radius:16px 16px 0 0;padding:28px 32px">
    <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#5BBFBF">Blue Luna Events</p>
    <h1 style="margin:0 0 14px;font-size:22px;font-weight:700;color:#FFFFFF;line-height:1.2">
      ${isConsultation ? '✨ New Consultation Request' : '🎈 New Booking Request'}
    </h1>
    <table cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:${isConsultation ? 'rgba(201,169,110,0.2)' : 'rgba(91,191,191,0.2)'};border:1px solid ${isConsultation ? '#C9A96E' : '#5BBFBF'};border-radius:999px;padding:5px 14px">
          <span style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${isConsultation ? '#C9A96E' : '#5BBFBF'}">${isConsultation ? 'Custom Quote' : `Booking · ${total ?? ''}`}</span>
        </td>
        ${!isConsultation && deposit ? `
        <td width="10"></td>
        <td style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:999px;padding:5px 14px">
          <span style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.6)">Deposit: ${deposit}</span>
        </td>` : ''}
      </tr>
    </table>
  </td></tr>

  <!-- Contact card -->
  <tr><td style="background:#FFFFFF;padding:28px 32px 0">
    <p style="margin:0 0 16px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#9CA3AF">Contact</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding-bottom:20px">
          <p style="margin:0 0 2px;font-size:22px;font-weight:700;color:#0D0F0F;line-height:1">${data.name}</p>
          <p style="margin:0;font-size:13px;color:#6B7280">${label}</p>
        </td>
        <td align="right" style="padding-bottom:20px;vertical-align:top">
          <a href="tel:${data.phone.replace(/\D/g,'')}" style="display:inline-block;background:#5BBFBF;color:#0D0F0F;font-size:13px;font-weight:700;padding:10px 20px;border-radius:999px;text-decoration:none;white-space:nowrap">
            📞 Call ${first}
          </a>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #F3F4F6">
      <tr>
        <td style="padding:12px 0;width:50%;border-right:1px solid #F3F4F6">
          <p style="margin:0 0 2px;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#9CA3AF">Phone</p>
          <a href="tel:${data.phone.replace(/\D/g,'')}" style="font-size:15px;font-weight:600;color:#5BBFBF;text-decoration:none">${data.phone}</a>
        </td>
        <td style="padding:12px 0 12px 20px;width:50%">
          <p style="margin:0 0 2px;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#9CA3AF">Email</p>
          <a href="mailto:${data.email}" style="font-size:14px;font-weight:500;color:#374151;text-decoration:none;word-break:break-all">${data.email}</a>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Event details -->
  <tr><td style="background:#FFFFFF;padding:20px 32px 0">
    <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#9CA3AF">Event Details</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #F3F4F6;border-radius:12px;overflow:hidden">
      <tr style="background:#F9FAFB">
        <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#9CA3AF;width:110px;border-bottom:1px solid #F3F4F6">Event</td>
        <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#0D0F0F;border-bottom:1px solid #F3F4F6">${data.event_type}</td>
      </tr>
      ${data.event_date ? `<tr><td style="padding:10px 16px;font-size:12px;font-weight:600;color:#9CA3AF;border-bottom:1px solid #F3F4F6">Date</td><td style="padding:10px 16px;font-size:13px;font-weight:600;color:#0D0F0F;border-bottom:1px solid #F3F4F6">${data.event_date}</td></tr>` : ''}
      ${data.venue ? `<tr><td style="padding:10px 16px;font-size:12px;font-weight:600;color:#9CA3AF;border-bottom:1px solid #F3F4F6">Venue</td><td style="padding:10px 16px;font-size:13px;font-weight:600;color:#0D0F0F;border-bottom:1px solid #F3F4F6">${data.venue}</td></tr>` : ''}
      ${data.package_name ? `<tr><td style="padding:10px 16px;font-size:12px;font-weight:600;color:#9CA3AF;border-bottom:1px solid #F3F4F6">Package</td><td style="padding:10px 16px;font-size:13px;font-weight:600;color:#0D0F0F;border-bottom:1px solid #F3F4F6">${data.package_name}</td></tr>` : ''}
      ${addOns.length > 0 ? `<tr><td style="padding:10px 16px;font-size:12px;font-weight:600;color:#9CA3AF;border-bottom:1px solid #F3F4F6">Add-Ons</td><td style="padding:10px 16px;font-size:13px;color:#374151;border-bottom:1px solid #F3F4F6">${addOns.join(', ')}</td></tr>` : ''}
      ${total ? `<tr style="background:#F9FAFB"><td style="padding:12px 16px;font-size:12px;font-weight:700;color:#0D0F0F">Total</td><td style="padding:12px 16px;font-size:17px;font-weight:700;color:#0D0F0F">${total}</td></tr>` : ''}
    </table>
  </td></tr>

  ${vision ? `
  <!-- Notes -->
  <tr><td style="background:#FFFFFF;padding:20px 32px 0">
    <p style="margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#9CA3AF">Notes from ${first}</p>
    <div style="background:#F9FAFB;border-left:3px solid #5BBFBF;border-radius:0 8px 8px 0;padding:14px 16px">
      <p style="margin:0;font-size:13px;color:#374151;line-height:1.6">${vision}</p>
    </div>
  </td></tr>` : ''}

  <!-- Action -->
  <tr><td style="background:#FFFFFF;padding:24px 32px 28px">
    <div style="background:${isConsultation ? 'rgba(201,169,110,0.08)' : 'rgba(91,191,191,0.08)'};border:1px solid ${isConsultation ? 'rgba(201,169,110,0.25)' : 'rgba(91,191,191,0.25)'};border-radius:12px;padding:20px;text-align:center">
      <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#0D0F0F">
        ${isConsultation ? `Custom event — reach out to finalize pricing` : `Confirm the date to lock in this booking`}
      </p>
      <p style="margin:0 0 16px;font-size:13px;color:#6B7280">
        ${isConsultation ? `${first} is expecting your call within 2 hours.` : `${first} is ready to pay the ${deposit} deposit.`}
      </p>
      <table cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td style="padding-right:8px">
            <a href="tel:${data.phone.replace(/\D/g,'')}" style="display:inline-block;background:#0D0F0F;color:#FFFFFF;font-size:13px;font-weight:700;padding:12px 24px;border-radius:999px;text-decoration:none">
              📞 Call ${first}
            </a>
          </td>
          <td>
            <a href="sms:${data.phone.replace(/\D/g,'')}" style="display:inline-block;background:white;border:1.5px solid #E5E7EB;color:#374151;font-size:13px;font-weight:600;padding:11px 24px;border-radius:999px;text-decoration:none">
              💬 Text ${first}
            </a>
          </td>
        </tr>
      </table>
    </div>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#F9FAFB;border-top:1px solid #E5E7EB;border-radius:0 0 16px 16px;padding:16px 32px;text-align:center">
    <p style="margin:0;font-size:11px;color:#9CA3AF">${SITE_CONFIG.name} · ${SITE_CONFIG.location} · <a href="mailto:${SITE_CONFIG.email}" style="color:#9CA3AF;text-decoration:none">${SITE_CONFIG.email}</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

  await resend.emails.send({
    from: `Blue Luna Events <notifications@bluelunaevents.com>`,
    replyTo: data.email,
    to: [SITE_CONFIG.email],
    subject,
    html,
  })
}

// ─── Client confirmation email ─────────────────────────────────────────────────

async function sendClientConfirmation(data: Lead) {
  if (!process.env.RESEND_API_KEY) return

  const resend = new Resend(process.env.RESEND_API_KEY)
  const isConsultation = data.is_consultation ?? false
  const total = data.quoted_total ? fmt(data.quoted_total) : null
  const deposit = data.deposit_amount ? fmt(data.deposit_amount) : null
  const addOns = parseAddOns(data.add_ons)
  const first = firstName(data.name)
  const label = eventLabel(data.event_type)

  const subjectMap: Record<string, string> = {
    quinceañera: `Your quinceañera is going to be unforgettable, ${first} ✨`,
    graduation: `Your graduation setup is in good hands, ${first} 🎓`,
    wedding: `Your wedding décor is locked in, ${first} 💍`,
    birthday: `Your birthday bash is going to be amazing, ${first} 🎈`,
    'baby shower': `Everything is set for the baby shower, ${first} 🤍`,
    'bridal shower': `Your bridal shower is going to be stunning, ${first} ✨`,
    'corporate event': `Your event details are confirmed, ${first} ✅`,
  }

  const subject = subjectMap[label]
    ?? (isConsultation
      ? `Monica got your request, ${first} — she'll be in touch soon ✨`
      : `You're all set, ${first} — we got your request 🎈`)

  const previewText = isConsultation
    ? `Monica will reach out within 2 hours to walk through your vision.`
    : `Monica will confirm your date and send you a deposit link.`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;-webkit-font-smoothing:antialiased">

<!-- Preview text (hidden) -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${previewText}&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3F4F6;padding:32px 16px">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">

  <!-- Header -->
  <tr><td style="background:#0D0F0F;border-radius:16px 16px 0 0;padding:36px 32px;text-align:center">
    <p style="margin:0 0 12px;font-size:36px;line-height:1">${isConsultation ? '✨' : '🎈'}</p>
    <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#5BBFBF">Blue Luna Events</p>
    <h1 style="margin:0;font-size:24px;font-weight:700;color:#FFFFFF;line-height:1.3">
      ${isConsultation ? `We got your request,<br>${first}!` : `You're all set,<br>${first}!`}
    </h1>
  </td></tr>

  <!-- Status message -->
  <tr><td style="background:#5BBFBF;padding:16px 32px;text-align:center">
    <p style="margin:0;font-size:14px;font-weight:600;color:#0D0F0F;line-height:1.5">
      ${isConsultation
        ? `Monica will reach out <strong>within 2 hours</strong> to walk through your vision and finalize pricing.`
        : `Monica will text you <strong>within 2 hours</strong> to confirm your date and send your deposit link.`}
    </p>
  </td></tr>

  <!-- Order summary -->
  <tr><td style="background:#FFFFFF;padding:28px 32px 0">
    <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#9CA3AF">Your Selection</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #F3F4F6;border-radius:12px;overflow:hidden">
      <tr style="background:#F9FAFB">
        <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#9CA3AF;width:110px;border-bottom:1px solid #F3F4F6">Event</td>
        <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#0D0F0F;border-bottom:1px solid #F3F4F6">${data.event_type}</td>
      </tr>
      ${data.event_date ? `<tr><td style="padding:10px 16px;font-size:12px;font-weight:600;color:#9CA3AF;border-bottom:1px solid #F3F4F6">Date</td><td style="padding:10px 16px;font-size:13px;font-weight:600;color:#0D0F0F;border-bottom:1px solid #F3F4F6">${data.event_date}</td></tr>` : ''}
      ${data.venue ? `<tr><td style="padding:10px 16px;font-size:12px;font-weight:600;color:#9CA3AF;border-bottom:1px solid #F3F4F6">Venue</td><td style="padding:10px 16px;font-size:13px;font-weight:600;color:#0D0F0F;border-bottom:1px solid #F3F4F6">${data.venue}</td></tr>` : ''}
      ${data.package_name ? `<tr><td style="padding:10px 16px;font-size:12px;font-weight:600;color:#9CA3AF;border-bottom:1px solid #F3F4F6">Package</td><td style="padding:10px 16px;font-size:13px;font-weight:600;color:#0D0F0F;border-bottom:1px solid #F3F4F6">${data.package_name}</td></tr>` : ''}
      ${addOns.length > 0 ? `<tr><td style="padding:10px 16px;font-size:12px;font-weight:600;color:#9CA3AF;border-bottom:1px solid #F3F4F6">Add-Ons</td><td style="padding:10px 16px;font-size:13px;color:#374151;border-bottom:1px solid #F3F4F6">${addOns.join(', ')}</td></tr>` : ''}
      ${total ? `
      <tr style="background:#F9FAFB">
        <td style="padding:14px 16px;font-size:12px;font-weight:700;color:#0D0F0F;border-bottom:${!isConsultation && deposit ? '1px solid #F3F4F6' : '0'}">Total</td>
        <td style="padding:14px 16px;font-size:18px;font-weight:700;color:#0D0F0F;border-bottom:${!isConsultation && deposit ? '1px solid #F3F4F6' : '0'}">${total}</td>
      </tr>` : ''}
      ${!isConsultation && deposit ? `
      <tr>
        <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#9CA3AF">Deposit</td>
        <td style="padding:10px 16px;font-size:14px;font-weight:700;color:#5BBFBF">${deposit} <span style="font-size:11px;font-weight:400;color:#9CA3AF">to secure your date</span></td>
      </tr>` : ''}
    </table>
  </td></tr>

  <!-- Next steps -->
  <tr><td style="background:#FFFFFF;padding:28px 32px 0">
    <p style="margin:0 0 16px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#9CA3AF">What Happens Next</p>
    ${isConsultation ? `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${[
        ['1', 'Monica reviews your event vision', 'She\'ll look over your request and think through the best approach for your ' + label + '.'],
        ['2', 'She reaches out personally', 'Expect a call or text within 2 hours — she\'ll walk through options and finalize pricing with you.'],
        ['3', 'You get a custom quote', 'Monica sends a full breakdown so you know exactly what you\'re getting.'],
        ['4', 'Blue Luna brings your vision to life', 'Once you\'re ready, a deposit locks in your date and the magic begins.'],
      ].map(([n, title, desc]) => `
      <tr>
        <td style="padding-bottom:16px;vertical-align:top;width:36px">
          <div style="width:28px;height:28px;border-radius:50%;background:rgba(91,191,191,0.12);border:1.5px solid #5BBFBF;text-align:center;line-height:28px;font-size:12px;font-weight:700;color:#5BBFBF">${n}</div>
        </td>
        <td style="padding-bottom:16px;padding-left:12px;vertical-align:top">
          <p style="margin:0 0 3px;font-size:14px;font-weight:600;color:#0D0F0F">${title}</p>
          <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.5">${desc}</p>
        </td>
      </tr>`).join('')}
    </table>` : `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${[
        ['1', 'Monica texts you to confirm', 'She\'ll reach out within 2 hours to confirm your event date and any last details.'],
        ['2', `Pay your ${deposit ?? '50%'} deposit`, 'Monica sends a secure payment link. Your deposit locks in your date — no one else can book it.'],
        ['3', 'Receive your contract', 'You\'ll get a full breakdown of your package, timeline, and balance due date.'],
        ['4', 'We handle everything on the day', 'Blue Luna arrives early to set up. You walk in and it\'s already magical.'],
      ].map(([n, title, desc]) => `
      <tr>
        <td style="padding-bottom:16px;vertical-align:top;width:36px">
          <div style="width:28px;height:28px;border-radius:50%;background:rgba(91,191,191,0.12);border:1.5px solid #5BBFBF;text-align:center;line-height:28px;font-size:12px;font-weight:700;color:#5BBFBF">${n}</div>
        </td>
        <td style="padding-bottom:16px;padding-left:12px;vertical-align:top">
          <p style="margin:0 0 3px;font-size:14px;font-weight:600;color:#0D0F0F">${title}</p>
          <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.5">${desc}</p>
        </td>
      </tr>`).join('')}
    </table>`}
  </td></tr>

  <!-- Monica contact -->
  <tr><td style="background:#FFFFFF;padding:24px 32px 28px">
    <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:14px;padding:20px;text-align:center">
      <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#0D0F0F">Questions? Monica is here.</p>
      <p style="margin:0 0 16px;font-size:13px;color:#6B7280">She personally handles every event — text or call anytime.</p>
      <table cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td style="padding-right:8px">
            <a href="tel:${SITE_CONFIG.phoneRaw}" style="display:inline-block;background:#0D0F0F;color:#FFFFFF;font-size:13px;font-weight:700;padding:11px 22px;border-radius:999px;text-decoration:none">
              📞 ${SITE_CONFIG.phone}
            </a>
          </td>
          <td>
            <a href="sms:${SITE_CONFIG.phoneRaw}" style="display:inline-block;background:white;border:1.5px solid #E5E7EB;color:#374151;font-size:13px;font-weight:600;padding:10px 22px;border-radius:999px;text-decoration:none">
              💬 Send a Text
            </a>
          </td>
        </tr>
      </table>
    </div>
  </td></tr>

  <!-- Social proof -->
  <tr><td style="background:#FDFCFA;border-top:1px solid #E5E7EB;padding:20px 32px;text-align:center">
    <p style="margin:0 0 6px;font-size:13px;color:#6B7280">Trusted by hundreds of Tucson families since 2018.</p>
    <a href="${SITE_CONFIG.instagram}" style="font-size:12px;font-weight:600;color:#5BBFBF;text-decoration:none">${SITE_CONFIG.instagramHandle}</a>
    <span style="font-size:12px;color:#D1D5DB"> · </span>
    <a href="https://${SITE_CONFIG.website}" style="font-size:12px;color:#9CA3AF;text-decoration:none">${SITE_CONFIG.website}</a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#F3F4F6;border-top:1px solid #E5E7EB;border-radius:0 0 16px 16px;padding:16px 32px;text-align:center">
    <p style="margin:0;font-size:11px;color:#9CA3AF">${SITE_CONFIG.name} · ${SITE_CONFIG.location} · <a href="mailto:${SITE_CONFIG.email}" style="color:#9CA3AF;text-decoration:none">${SITE_CONFIG.email}</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

  await resend.emails.send({
    from: `Monica at Blue Luna Events <monica@bluelunaevents.com>`,
    replyTo: SITE_CONFIG.email,
    to: [data.email],
    subject,
    html,
  })
}
