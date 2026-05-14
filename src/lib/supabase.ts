import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Lead = {
  id?: string
  created_at?: string
  name: string
  phone: string
  email: string
  event_type: string
  event_date?: string
  venue?: string
  vision?: string
  budget_range?: string
  status?: 'new' | 'contacted' | 'quoted' | 'booked' | 'completed'
  // Configurator fields — all optional for backwards compat with BookingSheet
  package_id?: string
  package_name?: string
  add_ons?: string        // JSON stringified string[]
  quoted_total?: number
  is_consultation?: boolean
  deposit_paid?: boolean
  deposit_amount?: number
  stripe_payment_intent_id?: string
  source?: 'configurator' | 'direct'
  custom_build?: Record<string, unknown>
  custom_request?: string
}

export type GalleryPhoto = {
  id?: string
  created_at?: string
  url: string
  alt: string
  event_type: string
  featured: boolean
  sort_order: number
}
