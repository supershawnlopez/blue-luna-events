export type ProposalPackage = {
  id: string
  name: string
  badge?: string
  standardPrice: number
  partnerPrice: number
  includes: { title: string; detail?: string }[]
}

export type ProposalRefinementItem = {
  id: string
  title: string
  description: string
  unitLabel: string
  standard: string
  partner: string
  standardUnitPrice: number
  partnerUnitPrice: number
  packageQuantities: Record<string, number>
}

export const westinProposal = {
  slug: 'westin-la-paloma-labor-day',
  title: 'Labor Day at Westin La Paloma',
  kicker: 'Decor Packages + Westin Partner Pricing',
  venue: 'Westin La Paloma',
  clientName: 'Westin La Paloma',
  eventDate: '2026-09-07',
  eventTypeId: 'corporate',
  pdfPath: '/proposals/westin-la-paloma-labor-day-westin-partner-pricing.pdf',
  intro:
    'A polished Labor Day decor plan designed around guest arrival, the flag photo moment, and key hospitality areas throughout the resort.',
  pricingNote:
    "Standard pricing is shown alongside Westin Partner Pricing for this first installation. Westin Partner Pricing reflects Blue Luna Events' interest in building an ongoing seasonal decor relationship with Westin La Paloma.",
  packages: [
    {
      id: 'package-a',
      name: 'A - Arrival Statement',
      standardPrice: 1935,
      partnerPrice: 1365,
      includes: [
        { title: 'Main Entry Arrival Columns', detail: '4 columns at $125 each' },
        { title: 'Flag Photo Wall Feature', detail: '5-column build at $125 per column' },
        { title: 'Bar Seating Centerpieces', detail: '8 centerpieces at $30 each' },
      ],
    },
    {
      id: 'package-b',
      name: 'B - Resort Presence',
      badge: 'Recommended',
      standardPrice: 2250,
      partnerPrice: 1630,
      includes: [
        { title: 'Everything in Package A' },
        { title: 'Pool Staircase Pearl Treatment', detail: '1 staircase treatment at $125' },
        { title: 'Stair Railing Balloon Clusters', detail: '14 railing clusters at $10 each' },
      ],
    },
    {
      id: 'package-b-plus',
      name: 'B+ - Elevated Resort Presence',
      badge: 'Best Visual Value',
      standardPrice: 2950,
      partnerPrice: 2130,
      includes: [
        { title: 'Everything in Package B' },
        { title: 'Bar-Level Arch Columns', detail: '4 columns at $125 each' },
      ],
    },
    {
      id: 'package-c',
      name: 'C - Full Resort Experience',
      standardPrice: 3345,
      partnerPrice: 2425,
      includes: [
        { title: 'Everything in Package B+' },
        { title: 'Architectural Arch Balloon Clusters', detail: '7 arch clusters at $10 each' },
        { title: 'Check-In Desk Pearl Strands', detail: '2 desks at $50 each' },
        { title: 'Coffee Shop Pearl + Balloon Cluster', detail: '1 accent zone at $125' },
      ],
    },
  ] satisfies ProposalPackage[],
  unitPricing: [
    { item: '7-ft balloon column with topper/icon', standard: '$175 each', partner: '$125 each' },
    { item: 'Premium centerpiece with dove', standard: '$45 each', partner: '$30 each' },
    { item: 'Railing balloon cluster', standard: '$10 each', partner: '$10 each' },
    { item: 'Pool Staircase Pearl Treatment', standard: '$175', partner: '$125' },
    { item: 'Check-in desk pearl strands', standard: '$75 per desk', partner: '$50 per desk' },
    { item: 'Coffee shop pearl + balloon cluster', standard: '$175', partner: '$125' },
  ],
  refinementItems: [
    {
      id: 'main-entry-columns',
      title: 'Main Entry Arrival Columns',
      description: '7-ft columns with topper/icon',
      unitLabel: 'columns',
      standard: '$175 each',
      partner: '$125 each',
      standardUnitPrice: 175,
      partnerUnitPrice: 125,
      packageQuantities: { 'package-a': 4, 'package-b': 4, 'package-b-plus': 4, 'package-c': 4 },
    },
    {
      id: 'flag-columns',
      title: 'Flag Photo Wall Columns',
      description: '7-ft columns framing the flag photo moment',
      unitLabel: 'columns',
      standard: '$175 each',
      partner: '$125 each',
      standardUnitPrice: 175,
      partnerUnitPrice: 125,
      packageQuantities: { 'package-a': 5, 'package-b': 5, 'package-b-plus': 5, 'package-c': 5 },
    },
    {
      id: 'bar-centerpieces',
      title: 'Bar Seating Centerpieces',
      description: 'Premium centerpieces with dove',
      unitLabel: 'centerpieces',
      standard: '$45 each',
      partner: '$30 each',
      standardUnitPrice: 45,
      partnerUnitPrice: 30,
      packageQuantities: { 'package-a': 8, 'package-b': 8, 'package-b-plus': 8, 'package-c': 8 },
    },
    {
      id: 'pool-staircase',
      title: 'Pool Staircase Pearl Treatment',
      description: 'Pearl treatment for the pool-facing staircase',
      unitLabel: 'treatments',
      standard: '$175 each',
      partner: '$125 each',
      standardUnitPrice: 175,
      partnerUnitPrice: 125,
      packageQuantities: { 'package-a': 0, 'package-b': 1, 'package-b-plus': 1, 'package-c': 1 },
    },
    {
      id: 'stair-railing-clusters',
      title: 'Stair Railing Balloon Clusters',
      description: 'Balloon clusters for stair railings',
      unitLabel: 'clusters',
      standard: '$10 each',
      partner: '$10 each',
      standardUnitPrice: 10,
      partnerUnitPrice: 10,
      packageQuantities: { 'package-a': 0, 'package-b': 14, 'package-b-plus': 14, 'package-c': 14 },
    },
    {
      id: 'bar-level-arch-columns',
      title: 'Bar-Level Arch Columns',
      description: '7-ft columns for the bar-level architectural arches',
      unitLabel: 'columns',
      standard: '$175 each',
      partner: '$125 each',
      standardUnitPrice: 175,
      partnerUnitPrice: 125,
      packageQuantities: { 'package-a': 0, 'package-b': 0, 'package-b-plus': 4, 'package-c': 4 },
    },
    {
      id: 'arch-clusters',
      title: 'Architectural Arch Balloon Clusters',
      description: 'Balloon clusters for the architectural wall arches',
      unitLabel: 'clusters',
      standard: '$10 each',
      partner: '$10 each',
      standardUnitPrice: 10,
      partnerUnitPrice: 10,
      packageQuantities: { 'package-a': 0, 'package-b': 0, 'package-b-plus': 0, 'package-c': 7 },
    },
    {
      id: 'check-in-pearls',
      title: 'Check-In Desk Pearl Strands',
      description: 'Pearl strands for the hotel check-in desks',
      unitLabel: 'desks',
      standard: '$75 each',
      partner: '$50 each',
      standardUnitPrice: 75,
      partnerUnitPrice: 50,
      packageQuantities: { 'package-a': 0, 'package-b': 0, 'package-b-plus': 0, 'package-c': 2 },
    },
    {
      id: 'coffee-shop',
      title: 'Coffee Shop Pearl + Balloon Cluster',
      description: 'Pearl and balloon cluster treatment for the coffee shop',
      unitLabel: 'zones',
      standard: '$175 each',
      partner: '$125 each',
      standardUnitPrice: 175,
      partnerUnitPrice: 125,
      packageQuantities: { 'package-a': 0, 'package-b': 0, 'package-b-plus': 0, 'package-c': 1 },
    },
  ] satisfies ProposalRefinementItem[],
  notes: [
    'Outdoor or exposed balloon decor may be affected by heat, wind, sun, rain, humidity, venue conditions, and guest interaction.',
    'Final placement is subject to venue access, approved attachment methods, setup timing, and safe installation conditions.',
  ],
} as const

export function formatMoney(value: number) {
  return `$${value.toLocaleString()}`
}
