export type ProposalPackage = {
  id: string
  name: string
  badge?: string
  standardPrice: number
  partnerPrice: number
  includes: { title: string; detail?: string }[]
}

export const westinProposal = {
  slug: 'westin-la-paloma-labor-day',
  title: 'Labor Day at Westin La Paloma',
  kicker: 'Decor Packages + Westin Partner Pricing',
  venue: 'Westin La Paloma',
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
    { item: '7-ft balloon column with topper/icon', standard: '$175 each', partner: '$125 each' },
    { item: 'Premium centerpiece with dove', standard: '$45 each', partner: '$30 each' },
    { item: 'Railing balloon cluster', standard: '$10 each', partner: '$10 each' },
    { item: 'Pool Staircase Pearl Treatment', standard: '$175', partner: '$125' },
    { item: 'Check-in desk pearl strands', standard: '$75 per desk', partner: '$50 per desk' },
    { item: 'Coffee shop pearl + balloon cluster', standard: '$175', partner: '$125' },
  ],
  notes: [
    'Outdoor or exposed balloon decor may be affected by heat, wind, sun, rain, humidity, venue conditions, and guest interaction.',
    'Final placement is subject to venue access, approved attachment methods, setup timing, and safe installation conditions.',
  ],
} as const

export function formatMoney(value: number) {
  return `$${value.toLocaleString()}`
}
