import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client — uses service role key, never call from client components
export function serverClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // strip accents: ñ→n, é→e
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export async function uniqueSlug(supabase: SupabaseClient, base: string): Promise<string> {
  let slug = base
  let n = 2
  for (let i = 0; i < 30; i++) {
    const { data } = await supabase
      .from('client_galleries')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (!data) return slug
    slug = `${base}-${n++}`
  }
  return `${base}-${Date.now()}`
}

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
