'use server'

import { createClient } from '@supabase/supabase-js'
import { Lead } from './supabase'

export async function submitLead(data: Lead) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await supabase
    .from('leads')
    .insert([{
      ...data,
      status: 'new',
      created_at: new Date().toISOString(),
    }])

  if (error) {
    console.error('Lead submission error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
