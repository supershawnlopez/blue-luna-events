import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = serverClient()

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `media/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const type = file.type.startsWith('video') ? 'video' : 'photo'

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)

  const event_type = form.get('event_type') as string | null

  const { data, error } = await supabase
    .from('gallery_media')
    .insert([{
      file_name: file.name,
      storage_path: path,
      url: publicUrl,
      type,
      show_on_website: false,
      social_export: false,
      file_size: file.size,
      event_type: event_type ?? null,
    }])
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
