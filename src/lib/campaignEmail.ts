import { SITE_CONFIG } from './config'

function firstName(name: string) {
  return name.trim().split(' ')[0] || name
}

export function fillTemplate(text: string, contactName: string) {
  return text.replace(/\{\{\s*name\s*\}\}/gi, firstName(contactName))
}

export function renderCampaignEmail(subject: string, body: string, unsubscribeUrl: string) {
  const paragraphs = body
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => `<p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7">${line}</p>`)
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3F4F6;padding:32px 16px">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">

  <tr><td style="background:#0D0F0F;border-radius:16px 16px 0 0;padding:36px 32px;text-align:center">
    <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#5BBFBF">${SITE_CONFIG.name}</p>
  </td></tr>

  <tr><td style="background:#FFFFFF;padding:32px 32px 8px">
    ${paragraphs}
  </td></tr>

  <tr><td style="background:#FFFFFF;padding:0 32px 28px">
    <a href="tel:${SITE_CONFIG.phoneRaw}" style="display:block;text-align:center;background:#5BBFBF;color:#0D0F0F;font-size:14px;font-weight:700;padding:16px;border-radius:999px;text-decoration:none">
      Call ${SITE_CONFIG.founder.split(' ')[0]} — ${SITE_CONFIG.phone}
    </a>
  </td></tr>

  <tr><td style="background:#F9FAFB;border-top:1px solid #E5E7EB;border-radius:0 0 16px 16px;padding:16px 32px;text-align:center">
    <p style="margin:0 0 6px;font-size:11px;color:#9CA3AF">${SITE_CONFIG.name} · ${SITE_CONFIG.location} · <a href="mailto:${SITE_CONFIG.email}" style="color:#9CA3AF;text-decoration:none">${SITE_CONFIG.email}</a></p>
    <p style="margin:0;font-size:11px;color:#9CA3AF">You're receiving this because you're a client of ${SITE_CONFIG.name}. <a href="${unsubscribeUrl}" style="color:#9CA3AF;text-decoration:underline">Unsubscribe</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}
