import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function hasValidSession(request: NextRequest) {
  const session = request.cookies.get('studio_session')
  return !!session?.value && session.value === process.env.STUDIO_SESSION_TOKEN
}

// Two Studio API routes are intentionally reachable without Monica's session —
// both already gate access a different way (a public flag, or an unguessable ID
// from a private link), not by requiring login:
function isPublicStudioApi(pathname: string, searchParams: URLSearchParams) {
  if (pathname === '/api/studio/auth') return true // login/logout itself
  // Public gallery + homepage preview read only show_on_website=true photos
  if (pathname === '/api/studio/media' && searchParams.get('website') === 'true') return true
  // A client downloads their own PDF receipt from their private /q/[token] link,
  // gated by knowing the estimate's UUID, not by a Studio login
  if (/^\/api\/studio\/estimates\/[^/]+\/pdf$/.test(pathname)) return true
  return false
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // API routes: return 401 JSON, never an HTML redirect.
  if (pathname.startsWith('/api/studio')) {
    if (isPublicStudioApi(pathname, searchParams)) return NextResponse.next()
    if (!hasValidSession(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Page routes: redirect to login (not /studio/login itself)
  if (pathname.startsWith('/studio') && pathname !== '/studio/login') {
    if (!hasValidSession(request)) {
      return NextResponse.redirect(new URL('/studio/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/studio/:path*', '/api/studio/:path*'],
}
