import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /studio routes (not /studio/login)
  if (pathname.startsWith('/studio') && pathname !== '/studio/login') {
    const session = request.cookies.get('studio_session')
    if (!session?.value || session.value !== process.env.STUDIO_SESSION_TOKEN) {
      return NextResponse.redirect(new URL('/studio/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/studio/:path*'],
}
