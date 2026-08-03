import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { SITE_CONFIG } from '@/lib/config'

export const dynamic = 'force-dynamic'

function page(message: string) {
  return new NextResponse(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed</title></head>
    <body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;background:#F9FAFB;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px">
      <div style="max-width:420px;text-align:center">
        <p style="font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#5BBFBF;margin:0 0 16px">${SITE_CONFIG.name}</p>
        <p style="font-size:16px;color:#0D0F0F;line-height:1.6">${message}</p>
      </div>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return page("That unsubscribe link doesn't look right.")

  const db = serverClient()
  const { data, error } = await db
    .from('contacts')
    .update({ unsubscribed: true })
    .eq('unsubscribe_token', token)
    .select('id')
    .maybeSingle()

  if (error || !data) return page("That unsubscribe link doesn't look right.")
  return page("You've been unsubscribed and won't receive further emails from us.")
}
