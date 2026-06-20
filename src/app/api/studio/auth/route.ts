import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (!password || password !== process.env.STUDIO_PASSWORD) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const token = process.env.STUDIO_SESSION_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Studio not configured' }, { status: 500 })
  }

  const cookieStore = cookies()
  cookieStore.set('studio_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  return NextResponse.json({ success: true })
}

export async function DELETE() {
  const cookieStore = cookies()
  cookieStore.delete('studio_session')
  return NextResponse.json({ success: true })
}
