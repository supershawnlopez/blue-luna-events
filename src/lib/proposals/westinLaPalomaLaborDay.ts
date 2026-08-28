export type ProposalPackage = {
  id: string
  name: string
  badge?: string
  standardPrice: number
  partnerPrice: number
  includes: { title: string; detail?: string }[]
}

export type ProposalAddOn = {
  id: string
  item: string
  title: string
  detail: string
  standard: string
  partner: string
  standardPrice: number
  partnerPrice: number
  includedIn: string[]
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
      name: 'A - Essential Wow Package',
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
      name: 'B - Recommended Resort Accent',
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
      name: 'B+ - Expanded Resort Accent',
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
      name: 'C - Full Labor Day Resort Look',
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
    { item: '7-ft balloon column with topper/icon', standard: '$175 each', partner: '$125 each', addOnId: 'additional-column' },
    { item: 'Premium centerpiece with dove', standard: '$45 each', partner: '$30 each', addOnId: 'additional-centerpiece' },
    { item: 'Railing balloon cluster', standard: '$10 each', partner: '$10 each', addOnId: 'additional-railing-cluster' },
    { item: 'Pool Staircase Pearl Treatment', standard: '$175', partner: '$125', addOnId: 'pool-staircase' },
    { item: 'Check-in desk pearl strands', standard: '$75 per desk', partner: '$50 per desk', addOnId: 'check-in-pearls' },
    { item: 'Coffee shop pearl + balloon cluster', standard: '$175', partner: '$125', addOnId: 'coffee-shop' },
  ],
  addOns: [
    {
      id: 'additional-column',
      item: '7-ft balloon column with topper/icon',
      title: 'Additional Balloon Column',
      detail: '1 additional 7-ft column with topper/icon',
      standard: '$175 each',
      partner: '$125 each',
      standardPrice: 175,
      partnerPrice: 125,
      includedIn: [],
    },
    {
      id: 'additional-centerpiece',
      item: 'Premium centerpiece with dove',
      title: 'Additional Premium Centerpiece',
      detail: '1 additional centerpiece with dove',
      standard: '$45 each',
      partner: '$30 each',
      standardPrice: 45,
      partnerPrice: 30,
      includedIn: [],
    },
    {
      id: 'additional-railing-cluster',
      item: 'Railing balloon cluster',
      title: 'Additional Railing Balloon Cluster',
      detail: '1 additional railing cluster',
      standard: '$10 each',
      partner: '$10 each',
      standardPrice: 10,
      partnerPrice: 10,
      includedIn: [],
    },
    {
      id: 'pool-staircase',
      item: 'Pool Staircase Pearl Treatment',
      title: 'Pool Staircase Pearl Treatment',
      detail: '1 staircase treatment',
      standard: '$175',
      partner: '$125',
      standardPrice: 175,
      partnerPrice: 125,
      includedIn: ['package-b', 'package-b-plus', 'package-c'],
    },
    {
      id: 'check-in-pearls',
      item: 'Check-in desk pearl strands',
      title: 'Check-In Desk Pearl Strands',
      detail: '2 desk pearl strand zones',
      standard: '$150',
      partner: '$100',
      standardPrice: 150,
      partnerPrice: 100,
      includedIn: ['package-c'],
    },
    {
      id: 'coffee-shop',
      item: 'Coffee shop pearl + balloon cluster',
      title: 'Coffee Shop Pearl + Balloon Cluster',
      detail: '1 coffee shop feature zone',
      standard: '$175',
      partner: '$125',
      standardPrice: 175,
      partnerPrice: 125,
      includedIn: ['package-c'],
    },
  ] satisfies ProposalAddOn[],
  notes: [
    'Outdoor or exposed balloon decor may be affected by heat, wind, sun, rain, humidity, venue conditions, and guest interaction.',
    'Final placement is subject to venue access, approved attachment methods, setup timing, and safe installation conditions.',
  ],
} as const

export function formatMoney(value: number) {
  return `$${value.toLocaleString()}`
}
