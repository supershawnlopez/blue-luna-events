import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')
  const name = searchParams.get('name') ?? 'blue-luna-photo.jpg'

  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

  // Only proxy Supabase storage URLs
  const allowed = process.env.NEXT_PUBLIC_SUPABASE_URL!
  if (!url.startsWith(allowed)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const res = await fetch(url)
  if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const contentType = res.headers.get('content-type') ?? 'application/octet-stream'

  return new NextResponse(res.body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
