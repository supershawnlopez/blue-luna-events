import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = serverClient()
  const body = await req.json()
  const allowed = ['show_on_website', 'social_export', 'event_type', 'caption', 'thumbnail_url']
  const update = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))

  const { data, error } = await supabase
    .from('gallery_media')
    .update(update)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = serverClient()
  const { data: item } = await supabase.from('gallery_media').select('storage_path').eq('id', params.id).single()
  if (item?.storage_path) {
    await supabase.storage.from('media').remove([item.storage_path])
  }
  const { error } = await supabase.from('gallery_media').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
