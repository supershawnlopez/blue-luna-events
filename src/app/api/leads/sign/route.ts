import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = serverClient()

  const { filename, contentType } = await req.json()
  if (!contentType || !String(contentType).startsWith('image/')) {
    return NextResponse.json({ error: 'Only images allowed' }, { status: 400 })
  }

  const ext = (filename?.split('.').pop() || 'jpg').toLowerCase()
  const path = `lead-inspo/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await supabase.storage.from('media').createSignedUploadUrl(path)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)
  return NextResponse.json({ signedUrl: data.signedUrl, path, publicUrl })
}
