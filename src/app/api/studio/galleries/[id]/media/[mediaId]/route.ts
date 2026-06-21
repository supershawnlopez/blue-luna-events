import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; mediaId: string } }
) {
  const db = serverClient()
  const { error } = await db
    .from('gallery_assignments')
    .delete()
    .eq('gallery_id', params.id)
    .eq('media_id', params.mediaId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
