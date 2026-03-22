import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
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
