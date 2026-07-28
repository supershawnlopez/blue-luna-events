import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const MAX_FILES = 6
const MAX_SIZE = 8 * 1024 * 1024 // 8MB

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const form = await req.formData()
  const files = form.getAll('files').filter((f): f is File => f instanceof File).slice(0, MAX_FILES)
  if (files.length === 0) return NextResponse.json({ error: 'No files' }, { status: 400 })

  const urls: string[] = []

  for (const file of files) {
    if (!file.type.startsWith('image/')) continue
    if (file.size > MAX_SIZE) continue

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `lead-inspo/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (uploadError) continue

    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)
    urls.push(publicUrl)
  }

  return NextResponse.json({ urls })
}
