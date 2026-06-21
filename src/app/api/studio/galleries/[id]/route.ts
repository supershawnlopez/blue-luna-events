import { NextRequest, NextResponse } from 'next/server'
import { serverClient, toSlug, uniqueSlug } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = serverClient()

  const { data: gallery, error } = await db
    .from('client_galleries')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  const { data: assignments } = await db
    .from('gallery_assignments')
    .select('id, added_at, gallery_media(id, url, thumbnail_url, type, file_name, event_type)')
    .eq('gallery_id', params.id)
    .order('added_at', { ascending: true })

  return NextResponse.json({
    ...gallery,
    media: (assignments ?? []).map((a: any) => ({ assignment_id: a.id, added_at: a.added_at, ...a.gallery_media })),
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const db = serverClient()
  const body = await req.json()
  const allowed = ['display_name', 'is_active', 'expires_at']
  const update: Record<string, unknown> = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  )

  if (update.display_name) {
    const slug = await uniqueSlug(db, toSlug(update.display_name as string))
    update.slug = slug
  }

  const { data, error } = await db
    .from('client_galleries')
    .update(update)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = serverClient()
  const { error } = await db.from('client_galleries').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
