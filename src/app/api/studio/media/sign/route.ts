import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = serverClient()
  const { filename, contentType, isThumb } = await req.json()
  const ext = (isThumb || contentType === 'image/webp') ? 'webp' : filename.split('.').pop() ?? 'bin'
  const folder = isThumb ? 'thumbnails' : 'media'
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await supabase.storage
    .from('media')
    .createSignedUploadUrl(path)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ signedUrl: data.signedUrl, token: data.token, path })
}
