import React from 'react'
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { SITE_CONFIG, labelForAddOn, labelForEventType } from '@/lib/config'
import { computeBalance, type EstimateForBalance, type EstimatePayment } from '@/lib/estimateBalance'

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
  owedRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, marginTop: 8, backgroundColor: '#F9FAFB', paddingHorizontal: 12, borderRadius: 4 },
  owedLabel: { fontSize: 13, fontWeight: 700, color: '#0D0F0F' },
  owedValue: { fontSize: 13, fontWeight: 700 },
  footer: { position: 'absolute', bottom: 40, left: 40, right: 40, fontSize: 8, color: '#9CA3AF', textAlign: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
})

export type EstimateRow = EstimateForBalance & {
  id: string
  client_name: string
  client_email: string
  client_phone?: string | null
  event_type?: string | null
  event_date?: string | null
  venue?: string | null
  package_name?: string | null
  add_ons?: string | null
  discount_note?: string | null
  created_at: string
}

function fmt(n: number) {
  return `$${n.toLocaleString()}`
}

function parseAddOns(raw?: string | null): string[] {
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

function buildDoc(est: EstimateRow, payments: EstimatePayment[]) {
  const addOns = parseAddOns(est.add_ons)
  const balance = computeBalance(est, payments)
  const detailRows: [string, string][] = [
    ['Client', est.client_name],
    ['Email', est.client_email],
    ...(est.client_phone ? [['Phone', est.client_phone] as [string, string]] : []),
    ...(est.event_type ? [['Event', labelForEventType(est.event_type)] as [string, string]] : []),
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
          React.createElement(Text, { style: styles.rowLabel }, labelForAddOn(a)),
          React.createElement(Text, { style: styles.rowValue }, 'Add-on')
        )
      ),

      React.createElement(Text, { style: styles.sectionLabel }, 'Pricing'),
      React.createElement(View, { style: styles.row },
        React.createElement(Text, { style: styles.rowLabel }, 'Subtotal'),
        React.createElement(Text, { style: styles.rowValue }, fmt(balance.subtotal))
      ),
      ...(balance.discountAmount > 0 ? [
        React.createElement(View, { key: 'disc', style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, `Discount${est.discount_note ? ` (${est.discount_note})` : ''}`),
          React.createElement(Text, { style: { ...styles.rowValue, color: '#5BBFBF' } }, `-${fmt(balance.discountAmount)}`)
        )
      ] : []),
      React.createElement(View, { style: styles.totalRow },
        React.createElement(Text, { style: styles.totalLabel }, 'Total'),
        React.createElement(Text, { style: styles.totalValue }, fmt(balance.finalTotal))
      ),

      ...(payments.length > 0 ? [
        React.createElement(Text, { key: 'plabel', style: styles.sectionLabel }, 'Payments Received'),
        ...payments.map((p, i) =>
          React.createElement(View, { key: `p${i}`, style: styles.row },
            React.createElement(Text, { style: styles.rowLabel },
              `${new Date(p.created_at).toLocaleDateString()} · ${p.method}${p.note ? ` (${p.note})` : ''}`),
            React.createElement(Text, { style: styles.rowValue }, fmt(Number(p.amount)))
          )
        )
      ] : []),

      React.createElement(View, { style: styles.owedRow },
        React.createElement(Text, { style: styles.owedLabel }, balance.isPaidInFull ? 'Paid in Full' : 'Amount Owed'),
        React.createElement(Text, { style: { ...styles.owedValue, color: balance.isPaidInFull ? '#22c55e' : '#0D0F0F' } },
          balance.isPaidInFull ? '✓' : fmt(balance.amountOwed))
      ),

      React.createElement(Text, { style: styles.footer },
        `${SITE_CONFIG.name} · ${SITE_CONFIG.phone} · ${SITE_CONFIG.email} · ${SITE_CONFIG.website}`
      )
    )
  )
}

export async function renderEstimatePdf(est: EstimateRow, payments: EstimatePayment[]): Promise<Buffer> {
  return renderToBuffer(buildDoc(est, payments)) as unknown as Promise<Buffer>
}
