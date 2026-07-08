import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { SITE_CONFIG } from '@/lib/config'
import { computeBalance } from '@/lib/estimateBalance'

function fmt(n: number) {
  return `$${Math.round(n).toLocaleString()}`
}

function fmtDate(raw: string) {
  const d = new Date(`${raw}T00:00:00`)
  if (isNaN(d.getTime())) return raw
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const today = now.toISOString().slice(0, 10)
  const twoWeeksOut = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const [
    { data: newLeads, error: leadsError },
    { data: newEstimates },
    { data: recentPayments },
    { data: sentEstimates },
    { data: allPayments },
    { data: upcoming },
  ] = await Promise.all([
    supabase.from('leads').select('id, name').gte('created_at', sevenDaysAgo),
    supabase.from('estimates').select('id, quoted_total').gte('created_at', sevenDaysAgo),
    supabase.from('estimate_payments').select('amount').gte('created_at', sevenDaysAgo),
    supabase.from('estimates').select('id, quoted_total, discount_type, discount_value').eq('status', 'sent'),
    supabase.from('estimate_payments').select('estimate_id, amount'),
    supabase.from('estimates').select('client_name, event_type, event_date, quoted_total').gte('event_date', today).lte('event_date', twoWeeksOut).order('event_date', { ascending: true }),
  ])

  if (leadsError) {
    return NextResponse.json({ ok: false, error: leadsError.message }, { status: 500 })
  }

  const newLeadCount = newLeads?.length ?? 0
  const newEstimateCount = newEstimates?.length ?? 0
  const newEstimateValue = (newEstimates ?? []).reduce((sum, e) => sum + (Number(e.quoted_total) || 0), 0)
  const moneyIn = (recentPayments ?? []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const paymentsByEstimate: Record<string, number> = {}
  for (const p of allPayments ?? []) {
    paymentsByEstimate[p.estimate_id] = (paymentsByEstimate[p.estimate_id] ?? 0) + Number(p.amount)
  }
  const outstandingTotal = (sentEstimates ?? []).reduce((sum, e) => {
    const paidSoFar = paymentsByEstimate[e.id] ?? 0
    const balance = computeBalance(e, [{ id: '', method: '', created_at: '', amount: paidSoFar }])
    return sum + balance.amountOwed
  }, 0)
  const upcomingEvents = upcoming ?? []

  const recipient = process.env.WEEKLY_SUMMARY_EMAIL

  if (recipient && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Blue Luna — Weekly Business Update</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3F4F6;padding:32px 16px">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">

  <!-- Header -->
  <tr><td style="background:#0D0F0F;border-radius:16px 16px 0 0;padding:28px 32px">
    <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#5BBFBF">Blue Luna Events</p>
    <h1 style="margin:0;font-size:22px;font-weight:700;color:#FFFFFF;line-height:1.2">Weekly Business Update</h1>
    <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.4)">Last 7 days</p>
  </td></tr>

  <!-- Stat grid -->
  <tr><td style="background:#FFFFFF;padding:24px 32px 0">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td width="50%" style="padding:16px;background:#F9FAFB;border-radius:12px 0 0 12px;border-right:1px solid #F3F4F6">
          <p style="margin:0 0 2px;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9CA3AF">New Leads</p>
          <p style="margin:0;font-size:26px;font-weight:700;color:#0D0F0F">${newLeadCount}</p>
        </td>
        <td width="50%" style="padding:16px;background:#F9FAFB;border-radius:0 12px 12px 0">
          <p style="margin:0 0 2px;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9CA3AF">New Estimates</p>
          <p style="margin:0;font-size:26px;font-weight:700;color:#0D0F0F">${newEstimateCount}<span style="font-size:13px;font-weight:500;color:#9CA3AF"> · ${fmt(newEstimateValue)}</span></p>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Money -->
  <tr><td style="background:#FFFFFF;padding:20px 32px 0">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #F3F4F6;border-radius:12px;overflow:hidden">
      <tr style="background:rgba(91,191,191,0.06)">
        <td style="padding:14px 16px;font-size:13px;font-weight:600;color:#0D0F0F;border-bottom:1px solid #F3F4F6">Money in this week</td>
        <td align="right" style="padding:14px 16px;font-size:16px;font-weight:700;color:#5BBFBF;border-bottom:1px solid #F3F4F6">${fmt(moneyIn)}</td>
      </tr>
      <tr>
        <td style="padding:14px 16px;font-size:13px;font-weight:600;color:#0D0F0F">Outstanding (sent, unpaid)</td>
        <td align="right" style="padding:14px 16px;font-size:16px;font-weight:700;color:${outstandingTotal > 0 ? '#C9A96E' : '#0D0F0F'}">${fmt(outstandingTotal)}</td>
      </tr>
    </table>
  </td></tr>

  <!-- Upcoming events -->
  <tr><td style="background:#FFFFFF;padding:24px 32px 0">
    <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#9CA3AF">Next 14 Days</p>
    ${upcomingEvents.length === 0
      ? `<p style="margin:0;font-size:13px;color:#9CA3AF">Nothing on the books yet.</p>`
      : `<table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${upcomingEvents.map((e, i) => `
        <tr>
          <td style="padding:10px 0;border-bottom:${i < upcomingEvents.length - 1 ? '1px solid #F3F4F6' : 'none'}">
            <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#0D0F0F">${e.client_name}${e.event_type ? ` · ${e.event_type}` : ''}</p>
            <p style="margin:0;font-size:12px;color:#9CA3AF">${fmtDate(e.event_date)}${e.quoted_total ? ` · ${fmt(Number(e.quoted_total))}` : ''}</p>
          </td>
        </tr>`).join('')}
      </table>`}
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#FFFFFF;padding:28px 32px 28px">
    <a href="https://bluelunaevents.com/studio" style="display:block;text-align:center;background:#5BBFBF;color:#0D0F0F;font-size:13px;font-weight:700;padding:14px;border-radius:999px;text-decoration:none">
      Open Monica's Studio
    </a>
  </td></tr>
  <tr><td style="background:#F9FAFB;border-top:1px solid #E5E7EB;border-radius:0 0 16px 16px;padding:16px 32px;text-align:center">
    <p style="margin:0;font-size:11px;color:#9CA3AF">${SITE_CONFIG.name} · automated weekly update</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

    const { data: sendData, error: sendError } = await resend.emails.send({
      from: `Blue Luna Events <notifications@bluelunaevents.com>`,
      to: [recipient],
      subject: `Blue Luna Weekly Update — ${newLeadCount} new lead${newLeadCount === 1 ? '' : 's'}, ${fmt(moneyIn)} in`,
      html,
    })

    if (sendError) {
      console.error('Weekly summary email failed to send:', sendError)
      return NextResponse.json({
        ok: true,
        sent: new Date().toISOString(),
        emailed: false,
        emailError: sendError.message,
        newLeadCount,
        newEstimateCount,
        moneyIn,
        outstandingTotal,
        upcomingCount: upcomingEvents.length,
      })
    }

    return NextResponse.json({
      ok: true,
      sent: new Date().toISOString(),
      emailed: true,
      resendId: sendData?.id,
      newLeadCount,
      newEstimateCount,
      moneyIn,
      outstandingTotal,
      upcomingCount: upcomingEvents.length,
    })
  }

  return NextResponse.json({
    ok: true,
    sent: new Date().toISOString(),
    emailed: false,
    emailError: 'RESEND_API_KEY or WEEKLY_SUMMARY_EMAIL not configured',
    newLeadCount,
    newEstimateCount,
    moneyIn,
    outstandingTotal,
    upcomingCount: upcomingEvents.length,
  })
}
