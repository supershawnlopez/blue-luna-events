import { PACKAGE_CATALOG, ADD_ONS, PRICING_RULES } from './config'

export type PricingResult = {
  packagePrice: number
  addOnsTotal: number
  subtotal: number
  rushFee: number
  total: number
  deposit: number
  isConsultation: boolean
}

export function computeTotal(
  packageId: string,
  addOnIds: string[],
  opts?: { rush?: boolean }
): PricingResult {
  const pkg = PACKAGE_CATALOG.find(p => p.id === packageId)
  if (!pkg) throw new Error(`Unknown package: ${packageId}`)

  const packagePrice = pkg.price
  const addOnsTotal = addOnIds.reduce((sum, id) => {
    const addOn = ADD_ONS.find(a => a.id === id)
    return sum + (addOn?.price ?? 0)
  }, 0)

  const subtotal = packagePrice + addOnsTotal
  const rushFee = opts?.rush ? PRICING_RULES.rushFee : 0
  const total = subtotal + rushFee

  // Consultation path: total at or above threshold, OR 4+ add-ons (high-complexity booking)
  const isConsultation = total >= PRICING_RULES.consultationThreshold || addOnIds.length >= 4

  const deposit = isConsultation ? 0 : Math.round(total * (PRICING_RULES.depositPercent / 100))

  return { packagePrice, addOnsTotal, subtotal, rushFee, total, deposit, isConsultation }
}

export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString()}`
}
