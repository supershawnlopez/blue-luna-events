import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const includeInactive = searchParams.get('all') === 'true'

  const supabase = serverClient()
  let query = supabase.from('catalog_items').select('*').order('label', { ascending: true })
  if (!includeInactive) query = query.eq('active', true)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const label = String(body.label ?? '').trim()
  const pricingType = body.pricing_type === 'per_unit' ? 'per_unit' : 'flat'
  const price = Number(body.price)

  if (!label) return NextResponse.json({ error: 'Label is required' }, { status: 400 })
  if (!price || price <= 0) return NextResponse.json({ error: 'Price must be greater than zero' }, { status: 400 })
  if (pricingType === 'per_unit' && !body.unit) return NextResponse.json({ error: 'Unit is required for per-unit pricing' }, { status: 400 })

  const supabase = serverClient()
  const { data, error } = await supabase
    .from('catalog_items')
    .insert([{
      label,
      description: body.description || null,
      pricing_type: pricingType,
      price,
      unit: pricingType === 'per_unit' ? body.unit : null,
    }])
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
