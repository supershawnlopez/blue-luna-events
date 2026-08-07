import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { syncLeadOnEstimateAccepted } from '@/lib/leadSync'
import { sendPush } from '@/lib/push'

// Public on purpose, same trust model as the /q/[token] page itself — gated
// entirely by knowing the share_token, not a Studio login. Outside
// /api/studio, so middleware.ts never touches it.
export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const supabase = serverClient()
  const { data: est, error: findError } = await supabase
    .from('estimates')
    .select('id, accepted_at, lead_id, client_name')
    .eq('share_token', params.token)
    .single()

  if (findError || !est) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (est.accepted_at) return NextResponse.json({ accepted_at: est.accepted_at })

  const { data, error } = await supabase
    .from('estimates')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', est.id)
    .select('accepted_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    await syncLeadOnEstimateAccepted(supabase, est.lead_id)
  } catch (err) {
    console.error('Lead status sync failed:', err)
  }

  try {
    await sendPush('✨ Estimate Accepted', `${est.client_name} just accepted their estimate`, `/studio/estimates/${est.id}`)
  } catch (err) {
    console.error('Push notification error:', err)
  }

  return NextResponse.json(data)
}
