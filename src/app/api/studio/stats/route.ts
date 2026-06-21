import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export async function GET() {
  const db = serverClient()

  const [
    { count: totalPhotos },
    { count: onWebsite },
    { count: galleries },
    { count: estimates },
  ] = await Promise.all([
    db.from('gallery_media').select('*', { count: 'exact', head: true }),
    db.from('gallery_media').select('*', { count: 'exact', head: true }).eq('show_on_website', true),
    db.from('client_galleries').select('*', { count: 'exact', head: true }).eq('is_active', true),
    db.from('estimates').select('*', { count: 'exact', head: true }).in('status', ['draft', 'sent', 'deposit_paid']),
  ])

  return NextResponse.json({
    totalPhotos: totalPhotos ?? 0,
    onWebsite: onWebsite ?? 0,
    galleries: galleries ?? 0,
    estimates: estimates ?? 0,
  })
}
