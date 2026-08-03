import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import ClientEstimateView from './ClientEstimateView'

type Props = { params: { token: string } }

// Server-only: uses the service role key since this runs in a Server Component
// (never sent to the browser) and estimates are no longer publicly readable via
// the anon key/RLS — access here is gated entirely by knowing the share_token.
async function getEstimate(token: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
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

  // Only pass the fields the client view actually needs — never forward
  // Monica's private notes, the client's own contact info, or internal
  // Stripe/payment-tracking columns into the page's client-rendered payload.
  return {
    id: data.id,
    client_name: data.client_name,
    event_date: data.event_date,
    event_type: data.event_type,
    venue: data.venue,
    package_name: data.package_name,
    add_ons: data.add_ons,
    quoted_total: data.quoted_total,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    discount_note: data.discount_note,
    payments: payments ?? [],
  }
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
