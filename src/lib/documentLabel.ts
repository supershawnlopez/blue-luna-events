import type { EstimateBalance } from './estimateBalance'

export type DocumentLabel = 'Estimate' | 'Invoice' | 'Receipt'

// A client hasn't necessarily clicked "Accept" on every estimate that exists —
// estimates from before this feature shipped only have a real signal in the
// form of a payment already landing. Either counts as accepted.
export function isAccepted(est: { accepted_at?: string | null }, totalPaid: number): boolean {
  return !!est.accepted_at || totalPaid > 0
}

// One name, driven by real state, shown everywhere a client or Monica sees
// this record — the client page, the PDF, and every email that links to it.
// Never a fixed label that can go stale relative to what actually happened.
export function getDocumentLabel(accepted: boolean, balance: Pick<EstimateBalance, 'isPaidInFull'>): DocumentLabel {
  if (balance.isPaidInFull) return 'Receipt'
  if (accepted) return 'Invoice'
  return 'Estimate'
}
