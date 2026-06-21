import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { path, filename, type, event_type, file_size, file_fingerprint, thumbnail_path } = await req.json()

  const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)
  const thumbnail_url = thumbnail_path
    ? supabase.storage.from('media').getPublicUrl(thumbnail_path).data.publicUrl
    : null

  const { data, error } = await supabase
    .from('gallery_media')
    .insert([{
      file_name: filename,
      storage_path: path,
      url: publicUrl,
      type,
      event_type: event_type ?? null,
      show_on_website: false,
      social_export: false,
      file_size: file_size ?? null,
      file_fingerprint: file_fingerprint ?? null,
      thumbnail_url,
    }])
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
