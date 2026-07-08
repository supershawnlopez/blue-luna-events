import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { renderEstimatePdf, type EstimateRow } from '@/lib/estimatePdf'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = serverClient()
  const [{ data: est, error }, { data: payments }] = await Promise.all([
    supabase.from('estimates').select('*').eq('id', params.id).single(),
    supabase.from('estimate_payments').select('*').eq('estimate_id', params.id).order('created_at', { ascending: true }),
  ])

  if (error || !est) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const buffer = await renderEstimatePdf(est as EstimateRow, payments ?? [])
  const filename = `blue-luna-estimate-${(est.client_name as string).replace(/\s+/g, '-').toLowerCase()}.pdf`

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
    },
  })
}
