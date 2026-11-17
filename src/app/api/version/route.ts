import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// The live server's build number. Studio compares it to the build baked into
// the phone's copy of the app — see StayCurrent.tsx.
export function GET() {
  return NextResponse.json(
    { build: process.env.NEXT_PUBLIC_BUILD_ID, date: process.env.NEXT_PUBLIC_BUILD_DATE },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  )
}
