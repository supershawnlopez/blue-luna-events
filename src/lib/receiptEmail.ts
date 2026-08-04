import { Resend } from 'resend'
import { serverClient } from '@/lib/supabase'
import { SITE_CONFIG } from '@/lib/config'
import { computeBalance } from '@/lib/estimateBalance'

function fmt(n: number) {
  return `$${n.toLocaleString()}`
}

function firstName(name: string) {
  return name.trim().split(' ')[0] || name
}

// Shared by the Stripe webhook (automatic send on a real payment) and Studio's
// manual "Resend Receipt" button (a client loses the email, or asks for one
// months later) — one template, one code path, so they never drift apart.
export async function sendReceiptEmail(estimateId: string, amountPaid: number, host: string): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) return { ok: false, error: 'Email is not configured' }

  const supabase = serverClient()
  const [{ data: est }, { data: payments }] = await Promise.all([
    supabase.from('estimates').select('*').eq('id', estimateId).single(),
    supabase.from('estimate_payments').select('amount').eq('estimate_id', estimateId),
  ])
  if (!est || !est.client_email) return { ok: false, error: 'Estimate or client email not found' }

  const balance = computeBalance(est, (payments ?? []).map(p => ({ id: '', method: '', created_at: '', amount: p.amount })))

  const protocol = host.includes('localhost') ? 'http' : 'https'
  const shareUrl = `${protocol}://${host}/q/${est.share_token}`
  const first = firstName(est.client_name)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Blue Luna Events — Payment Receipt</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3F4F6;padding:32px 16px">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">

  <tr><td style="background:#0D0F0F;border-radius:16px 16px 0 0;padding:36px 32px;text-align:center">
    <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#5BBFBF">Blue Luna Events</p>
    <h1 style="margin:0;font-size:24px;font-weight:700;color:#FFFFFF">Thanks, ${first} — payment received! ✨</h1>
  </td></tr>

  <tr><td style="background:#FFFFFF;padding:28px 32px 0">
    <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.6">
      This confirms Monica received your payment. Keep this email as your receipt.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #F3F4F6;border-radius:12px;overflow:hidden;margin-bottom:20px">
      <tr style="background:#F9FAFB">
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#0D0F0F">Amount Paid</td>
        <td align="right" style="padding:12px 16px;font-size:15px;font-weight:700;color:#0D0F0F">${fmt(amountPaid)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#0D0F0F">Date</td>
        <td align="right" style="padding:12px 16px;font-size:13px;color:#374151">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
      </tr>
      <tr style="background:#F9FAFB">
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#0D0F0F">${balance.isPaidInFull ? 'Status' : 'Remaining Balance'}</td>
        <td align="right" style="padding:12px 16px;font-size:15px;font-weight:700;color:${balance.isPaidInFull ? '#22c55e' : '#5BBFBF'}">${balance.isPaidInFull ? 'Paid in Full' : fmt(balance.amountOwed)}</td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="background:#FFFFFF;padding:0 32px 28px">
    <a href="${shareUrl}" style="display:block;text-align:center;background:#5BBFBF;color:#0D0F0F;font-size:14px;font-weight:700;padding:16px;border-radius:999px;text-decoration:none">
      View Your Estimate
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
  const { error } = await resend.emails.send({
    from: `Monica at Blue Luna Events <monica@bluelunaevents.com>`,
    replyTo: SITE_CONFIG.email,
    to: [est.client_email],
    cc: [SITE_CONFIG.email],
    subject: `Payment Receipt — ${fmt(amountPaid)} — Blue Luna Events`,
    html,
  })
  if (error) {
    console.error('Receipt email failed to send:', error)
    return { ok: false, error: error.message }
  }

  // Non-blocking: a logging failure should never mask a successful send.
  try {
    await supabase.from('estimate_activity').insert([{ estimate_id: estimateId, type: 'receipt_sent', recipient: est.client_email }])
  } catch (err) {
    console.error('Failed to log receipt activity:', err)
  }

  return { ok: true }
}
