import { NextRequest, NextResponse } from 'next/server'
import { serverClient, toSlug, uniqueSlug } from '@/lib/supabase'

export async function GET() {
  const db = serverClient()

  const { data: galleries, error } = await db
    .from('client_galleries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!galleries?.length) return NextResponse.json([])

  const enriched = await Promise.all(galleries.map(async g => {
    const { count } = await db
      .from('gallery_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('gallery_id', g.id)

    const { data: first } = await db
      .from('gallery_assignments')
      .select('gallery_media(thumbnail_url, url, type)')
      .eq('gallery_id', g.id)
      .order('added_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    return {
      ...g,
      media_count: count ?? 0,
      cover: (first as any)?.gallery_media ?? null,
    }
  }))

  return NextResponse.json(enriched)
}

export async function POST(req: NextRequest) {
  const db = serverClient()
  const { display_name } = await req.json()
  if (!display_name?.trim()) {
    return NextResponse.json({ error: 'display_name required' }, { status: 400 })
  }

  const slug = await uniqueSlug(db, toSlug(display_name.trim()))

  const { data, error } = await db
    .from('client_galleries')
    .insert({ display_name: display_name.trim(), slug })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
