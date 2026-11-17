import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'
import { loadClients } from '@/lib/lifecycleData'

export const dynamic = 'force-dynamic'

// Clients = anyone who has paid (src/lib/lifecycleData.ts). Computed live,
// so nobody has to "import" or sort anyone by hand.
export async function GET() {
  try {
    return NextResponse.json(await loadClients(serverClient()))
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not load clients' }, { status: 500 })
  }
}
