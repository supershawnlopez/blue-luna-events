export type EstimatePayment = {
  id: string
  amount: number | string
  method: string
  note?: string | null
  created_at: string
}

export type EstimateForBalance = {
  quoted_total: number | string
  discount_type?: string | null
  discount_value?: number | string | null
  deposit_type?: string | null
  deposit_value?: number | string | null
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
  subtotal: number
  discountAmount: number
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
  const discountAmount = computeDiscountAmount(est)
  const finalTotal = round2(Math.max(0, subtotal - discountAmount))
  const totalPaid = round2(payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0))
  const amountOwed = round2(Math.max(0, finalTotal - totalPaid))
  const suggestedDeposit = computeSuggestedDeposit(est, finalTotal)
  return {
    subtotal,
    discountAmount,
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
