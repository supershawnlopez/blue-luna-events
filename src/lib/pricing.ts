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
  const isConsultation = total >= PRICING_RULES.consultationThreshold || addOnIds.length >= 4
  const deposit = isConsultation ? 0 : Math.round(total * (PRICING_RULES.depositPercent / 100))

  return { packagePrice, addOnsTotal, subtotal, rushFee, total, deposit, isConsultation }
}

// ─── Custom Build Pricing ──────────────────────────────────────────────────────

export type CustomBuild = {
  garlandTier: 'basic' | 'full' | 'luxury' | null
  garlandFt: number
  backdrop: 'shimmer' | 'hoop' | 'rect' | null
  columnSize: '6ft' | '7ft' | '8ft' | null
  columnQty: number
  columnToppers: boolean
  marqueeSize: 'large' | 'small' | null
  marqueeQty: number
  centerpieceType: 'basic' | 'premium' | null
  centerpieceQty: number
  bouquetSmall: boolean
  bouquetLarge: boolean
  delivery: 'standard' | 'premium' | 'setup_only' | null
}

export const emptyCustomBuild: CustomBuild = {
  garlandTier: null,
  garlandFt: 10,
  backdrop: null,
  columnSize: null,
  columnQty: 2,
  columnToppers: false,
  marqueeSize: null,
  marqueeQty: 2,
  centerpieceType: null,
  centerpieceQty: 3,
  bouquetSmall: false,
  bouquetLarge: false,
  delivery: 'standard',
}

export const GARLAND_RATES = { basic: 25, full: 35, luxury: 45 }
export const BACKDROP_PRICES = { shimmer: 115, hoop: 45, rect: 70 }
export const COLUMN_PRICES = { '6ft': 150, '7ft': 175, '8ft': 200 }
export const MARQUEE_PRICES = { large: 150, small: 75 }
export const CENTERPIECE_PRICES = { basic: 25, premium: 45 }
export const DELIVERY_PRICES = { standard: 100, premium: 130, setup_only: 50 }

export function computeCustomTotal(build: CustomBuild): number {
  let total = 0
  if (build.garlandTier && build.garlandFt > 0)
    total += GARLAND_RATES[build.garlandTier] * build.garlandFt
  if (build.backdrop)
    total += BACKDROP_PRICES[build.backdrop]
  if (build.columnSize && build.columnQty > 0) {
    total += COLUMN_PRICES[build.columnSize] * build.columnQty
    if (build.columnToppers) total += 25 * build.columnQty
  }
  if (build.marqueeSize && build.marqueeQty > 0)
    total += MARQUEE_PRICES[build.marqueeSize] * build.marqueeQty
  if (build.centerpieceType && build.centerpieceQty > 0)
    total += CENTERPIECE_PRICES[build.centerpieceType] * build.centerpieceQty
  if (build.bouquetSmall) total += 35
  if (build.bouquetLarge) total += 50
  if (build.delivery) total += DELIVERY_PRICES[build.delivery]
  return total
}

export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString()}`
}
