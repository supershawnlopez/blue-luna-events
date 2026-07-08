import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { serverClient } from '@/lib/supabase'
import { SITE_CONFIG } from '@/lib/config'
import { computeBalance } from '@/lib/estimateBalance'
import { renderEstimatePdf, type EstimateRow } from '@/lib/estimatePdf'

function firstName(name: string) {
  return name.trim().split(' ')[0]
}

function fmt(n: number) {
  return `$${n.toLocaleString()}`
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email is not configured' }, { status: 500 })
  }

  const body = await req.json().catch(() => ({}))
  const supabase = serverClient()

  const [{ data: est, error }, { data: payments }] = await Promise.all([
    supabase.from('estimates').select('*').eq('id', params.id).single(),
    supabase.from('estimate_payments').select('*').eq('estimate_id', params.id).order('created_at', { ascending: true }),
  ])

  if (error || !est) {
    return NextResponse.json({ error: 'Estimate not found' }, { status: 404 })
  }

  const recipient = (body.to as string) || est.client_email
  if (!recipient) {
    return NextResponse.json({ error: 'No recipient email' }, { status: 400 })
  }

  const balance = computeBalance(est, payments ?? [])
  const pdfBuffer = await renderEstimatePdf(est as EstimateRow, payments ?? [])

  const host = req.headers.get('host') ?? 'bluelunaevents.com'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const shareUrl = `${protocol}://${host}/q/${est.share_token}`
  const first = firstName(est.client_name)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Blue Luna Events Estimate</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3F4F6;padding:32px 16px">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">

  <tr><td style="background:#0D0F0F;border-radius:16px 16px 0 0;padding:36px 32px;text-align:center">
    <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#5BBFBF">Blue Luna Events</p>
    <h1 style="margin:0;font-size:24px;font-weight:700;color:#FFFFFF">Hi ${first}, here's your estimate ✨</h1>
  </td></tr>

  <tr><td style="background:#FFFFFF;padding:28px 32px 0">
    <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.6">
      We've attached a PDF copy for your records, and you can also view and pay online anytime using the link below.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #F3F4F6;border-radius:12px;overflow:hidden;margin-bottom:20px">
      <tr style="background:#F9FAFB">
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#0D0F0F">Total</td>
        <td align="right" style="padding:12px 16px;font-size:15px;font-weight:700;color:#0D0F0F">${fmt(balance.finalTotal)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#0D0F0F">${balance.isPaidInFull ? 'Status' : 'Amount Due'}</td>
        <td align="right" style="padding:12px 16px;font-size:15px;font-weight:700;color:${balance.isPaidInFull ? '#22c55e' : '#5BBFBF'}">${balance.isPaidInFull ? 'Paid in Full' : fmt(balance.amountOwed)}</td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="background:#FFFFFF;padding:0 32px 28px">
    <a href="${shareUrl}" style="display:block;text-align:center;background:#5BBFBF;color:#0D0F0F;font-size:14px;font-weight:700;padding:16px;border-radius:999px;text-decoration:none">
      View &amp; Pay Online
    </a>
  </td></tr>

  <tr><td style="background:#F9FAFB;border-top:1px solid #E5E7EB;border-radius:0 0 16px 16px;padding:16px 32px;text-align:center">
    <p style="margin:0;font-size:11px;color:#9CA3AF">${SITE_CONFIG.name} · ${SITE_CONFIG.location} · <a href="mailto:${SITE_CONFIG.email}" style="color:#9CA3AF;text-decoration:none">${SITE_CONFIG.email}</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error: sendError } = await resend.emails.send({
    from: `Monica at Blue Luna Events <monica@bluelunaevents.com>`,
    replyTo: SITE_CONFIG.email,
    to: [recipient],
    subject: `Your Blue Luna Events Estimate — ${fmt(balance.finalTotal)}`,
    html,
    attachments: [{
      filename: `blue-luna-estimate-${est.client_name.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      content: pdfBuffer.toString('base64'),
    }],
  })

  if (sendError) {
    console.error('Estimate email failed to send:', sendError)
    return NextResponse.json({ error: sendError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, sentTo: recipient, resendId: data?.id })
}
