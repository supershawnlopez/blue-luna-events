import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const db = serverClient()
  const { media_ids } = await req.json()

  if (!Array.isArray(media_ids) || media_ids.length === 0) {
    return NextResponse.json({ error: 'media_ids array required' }, { status: 400 })
  }

  const rows = media_ids.map((media_id: string) => ({
    gallery_id: params.id,
    media_id,
  }))

  // upsert — ignore duplicates silently
  const { data, error } = await db
    .from('gallery_assignments')
    .upsert(rows, { onConflict: 'gallery_id,media_id', ignoreDuplicates: true })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ added: data?.length ?? 0 }, { status: 201 })
}
