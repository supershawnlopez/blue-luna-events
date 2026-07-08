import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import ClientEstimateView from './ClientEstimateView'

type Props = { params: { token: string } }

async function getEstimate(token: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('estimates')
    .select('*')
    .eq('share_token', token)
    .single()
  if (!data) return null

  const { data: payments } = await supabase
    .from('estimate_payments')
    .select('*')
    .eq('estimate_id', data.id)
    .order('created_at', { ascending: true })

  return { ...data, payments: payments ?? [] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const est = await getEstimate(params.token)
  if (!est) return { title: 'Estimate Not Found' }
  return {
    title: `Your Blue Luna Events Estimate — ${est.client_name}`,
    robots: { index: false, follow: false },
  }
}

export default async function EstimatePage({ params }: Props) {
  const est = await getEstimate(params.token)
  if (!est) notFound()
  return <ClientEstimateView estimate={est} />
}
