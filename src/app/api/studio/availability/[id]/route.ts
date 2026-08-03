import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const db = serverClient()
  const { error } = await db.from('availability_blocks').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
