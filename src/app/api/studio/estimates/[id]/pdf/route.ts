import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { serverClient } from '@/lib/supabase'
import { SITE_CONFIG } from '@/lib/config'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#0D0F0F' },
  brand: { fontSize: 9, fontWeight: 700, letterSpacing: 2, color: '#5BBFBF', marginBottom: 2, textTransform: 'uppercase' },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#6B7280', marginBottom: 20 },
  sectionLabel: { fontSize: 8, fontWeight: 700, letterSpacing: 1, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8, marginTop: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rowLabel: { fontSize: 10, color: '#374151' },
  rowValue: { fontSize: 10, color: '#0D0F0F', fontWeight: 500 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#0D0F0F', marginTop: 4 },
  totalLabel: { fontSize: 12, fontWeight: 700 },
  totalValue: { fontSize: 12, fontWeight: 700 },
  paidBadge: { fontSize: 8, fontWeight: 700, color: '#22c55e' },
  footer: { position: 'absolute', bottom: 40, left: 40, right: 40, fontSize: 8, color: '#9CA3AF', textAlign: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
})

type EstimateRow = {
  id: string
  client_name: string
  client_email: string
  client_phone?: string | null
  event_type?: string | null
  event_date?: string | null
  venue?: string | null
  package_name?: string | null
  add_ons?: string | null
  quoted_total: number
  deposit_amount: number
  balance_amount: number
  deposit_paid: boolean
  balance_paid: boolean
  created_at: string
}

function fmt(n: number) {
  return `$${n.toLocaleString()}`
}

function parseAddOns(raw?: string | null): string[] {
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

function buildDoc(est: EstimateRow) {
  const addOns = parseAddOns(est.add_ons)
  const detailRows: [string, string][] = [
    ['Client', est.client_name],
    ['Email', est.client_email],
    ...(est.client_phone ? [['Phone', est.client_phone] as [string, string]] : []),
    ...(est.event_type ? [['Event', est.event_type] as [string, string]] : []),
    ...(est.event_date ? [['Date', est.event_date] as [string, string]] : []),
    ...(est.venue ? [['Venue', est.venue] as [string, string]] : []),
  ]

  return React.createElement(Document, {},
    React.createElement(Page, { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.brand }, 'Blue Luna Events'),
      React.createElement(Text, { style: styles.title }, 'Event Estimate'),
      React.createElement(Text, { style: styles.subtitle }, `Issued ${new Date(est.created_at).toLocaleDateString()}`),

      React.createElement(Text, { style: styles.sectionLabel }, 'Event Details'),
      ...detailRows.map(([label, value], i) =>
        React.createElement(View, { key: `d${i}`, style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, label),
          React.createElement(Text, { style: styles.rowValue }, value)
        )
      ),

      React.createElement(Text, { style: styles.sectionLabel }, 'Selection'),
      ...(est.package_name ? [
        React.createElement(View, { key: 'pkg', style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, `${est.package_name} Package`),
          React.createElement(Text, { style: styles.rowValue }, 'Base')
        )
      ] : []),
      ...addOns.map((a, i) =>
        React.createElement(View, { key: `a${i}`, style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, a),
          React.createElement(Text, { style: styles.rowValue }, 'Add-on')
        )
      ),

      React.createElement(Text, { style: styles.sectionLabel }, 'Payment'),
      React.createElement(View, { style: styles.row },
        React.createElement(Text, { style: styles.rowLabel }, 'Deposit (50%)'),
        React.createElement(View, { style: { flexDirection: 'row', gap: 6 } },
          React.createElement(Text, { style: styles.rowValue }, fmt(est.deposit_amount)),
          est.deposit_paid ? React.createElement(Text, { style: styles.paidBadge }, 'PAID') : null
        )
      ),
      React.createElement(View, { style: styles.row },
        React.createElement(Text, { style: styles.rowLabel }, 'Balance'),
        React.createElement(View, { style: { flexDirection: 'row', gap: 6 } },
          React.createElement(Text, { style: styles.rowValue }, fmt(est.balance_amount)),
          est.balance_paid ? React.createElement(Text, { style: styles.paidBadge }, 'PAID') : null
        )
      ),
      React.createElement(View, { style: styles.totalRow },
        React.createElement(Text, { style: styles.totalLabel }, 'Total'),
        React.createElement(Text, { style: styles.totalValue }, fmt(est.quoted_total))
      ),

      React.createElement(Text, { style: styles.footer },
        `${SITE_CONFIG.name} · ${SITE_CONFIG.phone} · ${SITE_CONFIG.email} · ${SITE_CONFIG.website}`
      )
    )
  )
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = serverClient()
  const { data: est, error } = await supabase
    .from('estimates')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !est) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const buffer = await renderToBuffer(buildDoc(est as EstimateRow))
  const filename = `blue-luna-estimate-${(est.client_name as string).replace(/\s+/g, '-').toLowerCase()}.pdf`

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
    },
  })
}
