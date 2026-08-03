import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const websiteOnly = searchParams.get('website') === 'true'

  const supabase = serverClient()
  let query = supabase
    .from('gallery_media')
    .select('*')
    .order('created_at', { ascending: false })

  if (websiteOnly) query = query.eq('show_on_website', true)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
