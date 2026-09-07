export type EstimatePayment = {
  id: string
  amount: number | string
  method: string
  note?: string | null
  created_at: string
}

// One line on an estimate. `price` is always the FINAL per-line amount the
// client pays (list price minus any per-line discount) — it's what sums into
// `quoted_total`, so every downstream reader (Stripe, balance math, PDF,
// receipts) keeps working without knowing line discounts exist.
//
// The extra fields are only present when Monica gave that line its own
// discount. An item with just {label, description, price} is a plain,
// undiscounted line — the shape every estimate used before line discounts.
export type CustomItem = {
  label: string
  description?: string
  price: number
  listPrice?: number | null            // full value before the per-line discount
  discountType?: 'percent' | 'flat' | null
  discountValue?: number | null
  discountNote?: string | null         // per-line reason, shown to the client
}

export type EstimateForBalance = {
  quoted_total: number | string
  discount_type?: string | null
  discount_value?: number | string | null
  deposit_type?: string | null
  deposit_value?: number | string | null
  custom_items?: CustomItem[] | null
}

// The net price of a single line = its list price minus its own discount.
export function computeLinePrice(item: {
  price: number | string
  listPrice?: number | null
  discountType?: string | null
  discountValue?: number | null
}): number {
  const list = Number(item.listPrice ?? item.price) || 0
  const value = Number(item.discountValue) || 0
  if (!item.discountType || value <= 0) return round2(list)
  if (item.discountType === 'percent') return round2(Math.max(0, list - list * (value / 100)))
  if (item.discountType === 'flat') return round2(Math.max(0, list - Math.min(value, list)))
  return round2(list)
}

// How much this one line saves the client.
export function lineItemSavings(item: {
  price: number | string
  listPrice?: number | null
  discountType?: string | null
  discountValue?: number | null
}): number {
  const list = Number(item.listPrice ?? item.price) || 0
  return round2(Math.max(0, list - computeLinePrice(item)))
}

// Net total across every line — the number that should be written to
// `quoted_total` whenever items change.
export function customItemsNetTotal(items: CustomItem[] | null | undefined): number {
  return round2((items ?? []).reduce((sum, it) => sum + computeLinePrice(it), 0))
}

export function computeDiscountAmount(est: EstimateForBalance): number {
  const total = Number(est.quoted_total) || 0
  const value = Number(est.discount_value) || 0
  if (!est.discount_type || !value) return 0
  if (est.discount_type === 'percent') return round2(total * (value / 100))
  if (est.discount_type === 'flat') return round2(Math.min(value, total))
  return 0
}

export type EstimateBalance = {
  grossSubtotal: number      // full value of every line, before any discount
  lineDiscountAmount: number // total taken off via per-line discounts
  subtotal: number           // net of line discounts (== quoted_total)
  discountAmount: number      // the one estimate-level discount, applied to subtotal
  totalSavings: number        // lineDiscountAmount + discountAmount
  finalTotal: number
  totalPaid: number
  amountOwed: number
  suggestedDeposit: number
  isPaidInFull: boolean
}

// Defaults to 50% of the final total unless Monica has set a different
// deposit on this specific estimate (percent or flat dollar amount).
export function computeSuggestedDeposit(est: EstimateForBalance, finalTotal: number): number {
  const type = est.deposit_type === 'flat' ? 'flat' : 'percent'
  const value = est.deposit_value != null && est.deposit_value !== '' ? Number(est.deposit_value) : 50
  if (type === 'flat') return round2(Math.min(value, finalTotal))
  return round2(finalTotal * (value / 100))
}

export function computeBalance(est: EstimateForBalance, payments: EstimatePayment[]): EstimateBalance {
  const subtotal = Number(est.quoted_total) || 0
  const lineDiscountAmount = round2(
    (est.custom_items ?? []).reduce((sum, it) => sum + lineItemSavings(it), 0)
  )
  const grossSubtotal = round2(subtotal + lineDiscountAmount)
  const discountAmount = computeDiscountAmount(est)
  const finalTotal = round2(Math.max(0, subtotal - discountAmount))
  const totalPaid = round2(payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0))
  const amountOwed = round2(Math.max(0, finalTotal - totalPaid))
  const suggestedDeposit = computeSuggestedDeposit(est, finalTotal)
  return {
    grossSubtotal,
    lineDiscountAmount,
    subtotal,
    discountAmount,
    totalSavings: round2(lineDiscountAmount + discountAmount),
    finalTotal,
    totalPaid,
    amountOwed,
    suggestedDeposit,
    isPaidInFull: finalTotal > 0 && amountOwed <= 0,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
