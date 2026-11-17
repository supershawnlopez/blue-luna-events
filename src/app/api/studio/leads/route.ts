import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { loadLeadsWithStages } from '@/lib/lifecycleData'

export const dynamic = 'force-dynamic'

// Every lead, with its lifecycle stage computed live (src/lib/lifecycle.ts).
export async function GET() {
  try {
    return NextResponse.json(await loadLeadsWithStages(serverClient()))
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not load leads' }, { status: 500 })
  }
}
