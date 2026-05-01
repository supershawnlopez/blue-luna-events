// ─── Business Info ────────────────────────────────────────────────────────────

export const SITE_CONFIG = {
  name: 'Blue Luna Events',
  tagline: 'Balloon Décor & Event Styling — Tucson, AZ',
  description: "Tucson's premier balloon décor and event styling studio. Quinceañeras, weddings, graduations, birthdays, and corporate events. Professional installation, same-day takedown.",
  phone: '(520) 222-6142',
  phoneRaw: '5202226142',
  email: 'monica@bluelunaevents.com',
  website: 'www.bluelunaevents.com',
  location: 'Tucson, AZ',
  instagram: 'https://instagram.com/bluelunamagic',
  facebook: 'https://facebook.com/bluelunamagic',
  instagramHandle: '@BlueLunaMagic',
  founder: 'Monica Denogean',
  zelle: 'monica@bluelunaevents.com',
  paymentMethods: ['Zelle', 'Check', 'Cash'],
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

export const NAV_LINKS = [
  { label: 'Packages', href: '/#packages' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/#about' },
  { label: 'Quinceañeras', href: '/quinceaneras', highlight: 'teal' },
  { label: 'Graduations ✨', href: '/graduations', highlight: 'gold' },
]

// ─── Event Types ──────────────────────────────────────────────────────────────

export const EVENT_TYPES = [
  'Quinceañeras',
  'Weddings',
  'Graduations',
  'Birthdays',
  'Baby Showers',
  'Bridal Showers',
  'Corporate Events',
  'Sweet 16s',
  'School Events',
  'Holiday Parties',
]

// ─── Configurator Event Types (step 1 of builder) ────────────────────────────

export const CONFIGURATOR_EVENT_TYPES = [
  { id: 'quinceanera', label: 'Quinceañera', emoji: '👑', description: 'Her magical XV años celebration' },
  { id: 'graduation',  label: 'Graduation',  emoji: '🎓', description: 'Class of 2025 — celebrate the milestone' },
  { id: 'wedding',     label: 'Wedding',     emoji: '💍', description: 'Your perfect day, beautifully styled' },
  { id: 'birthday',    label: 'Birthday',    emoji: '🎈', description: 'Birthdays, Sweet 16s & milestone parties' },
  { id: 'baby',        label: 'Baby Shower', emoji: '🌸', description: 'Baby showers & gender reveals' },
  { id: 'corporate',   label: 'Corporate',   emoji: '✨', description: 'Brand events, grand openings & more' },
] as const

export type EventTypeId = typeof CONFIGURATOR_EVENT_TYPES[number]['id']

// ─── Base Package Catalog ─────────────────────────────────────────────────────
// Canonical source of truth. All pages import from here — never duplicate.

export type Package = {
  id: string
  tier: string
  name: string
  tagline: string
  price: number          // in dollars
  priceNote: string
  badge?: string
  color: 'gray' | 'teal' | 'gold' | 'rose'
  features: string[]
  cta: string
  image: string
  eventTypes: EventTypeId[] | 'all'  // which event type screens show this package
}

export const PACKAGE_CATALOG: Package[] = [
  // ── General / Birthday / Baby / Corporate / Wedding ──
  {
    id: 'essential',
    tier: 'Tier 01',
    name: 'Essential',
    tagline: 'The sweetest setup for your most intimate moments.',
    price: 350,
    priceNote: 'installed',
    color: 'gray',
    features: [
      'Up to 12 ft balloon garland',
      'Custom color palette',
      'Standard delivery & setup',
      'Up to 2 centerpieces',
    ],
    cta: 'Choose Essential',
    image: '/images/gal-4.jpg',
    eventTypes: 'all',
  },
  {
    id: 'signature',
    tier: 'Tier 02',
    name: 'Signature',
    tagline: "The one most Tucson families choose — and talk about for years.",
    price: 900,
    priceNote: 'installed',
    color: 'teal',
    badge: 'Most Loved',
    features: [
      'Up to 20 ft luxury garland',
      'Shimmer backdrop + frame',
      '2 balloon columns with toppers',
      '3 premium centerpieces',
      'Premium delivery, setup & takedown',
    ],
    cta: 'Choose Signature',
    image: '/images/gal-2.jpg',
    eventTypes: 'all',
  },
  {
    id: 'luxury',
    tier: 'Tier 03',
    name: 'Luxury',
    tagline: 'Your entire event, in one team\'s hands. Show up. Celebrate. We handle the rest.',
    price: 1800,
    priceNote: 'full service',
    color: 'gold',
    features: [
      'Everything in Signature',
      'Photo booth rental (4 hrs)',
      'Professional audio setup',
      'MC services included',
      "Tucson's only all-in-one studio",
    ],
    cta: 'Choose Luxury',
    image: '/images/hero-main.jpg',
    eventTypes: 'all',
  },

  // ── Quinceañera-specific ──
  {
    id: 'quin-starter',
    tier: 'Tier 01',
    name: 'Starter',
    tagline: 'Beautiful and budget-friendly for intimate quinceañeras',
    price: 450,
    priceNote: 'installed',
    color: 'gray',
    features: [
      'Up to 10 ft luxury garland',
      'Custom color palette',
      '1 shimmer backdrop',
      'Standard delivery & setup',
    ],
    cta: 'Choose Starter',
    image: '/images/gal-3.jpg',
    eventTypes: ['quinceanera'],
  },
  {
    id: 'quin-classic',
    tier: 'Tier 02',
    name: 'Classic',
    tagline: 'The full quinceañera experience Tucson families love',
    price: 950,
    priceNote: 'installed',
    color: 'teal',
    badge: 'Most Popular',
    features: [
      'Up to 20 ft luxury garland',
      'Shimmer backdrop + frame',
      '2 balloon columns with toppers',
      '3 premium centerpieces',
      'Premium delivery, setup & takedown',
    ],
    cta: 'Choose Classic',
    image: '/images/gal-2.jpg',
    eventTypes: ['quinceanera'],
  },
  {
    id: 'quin-signature',
    tier: 'Tier 03',
    name: 'Signature',
    tagline: 'Elevated elegance for a truly unforgettable quinceañera',
    price: 1600,
    priceNote: 'installed',
    color: 'rose',
    features: [
      'Up to 30 ft luxury garland',
      'Dual shimmer backdrops',
      '4 balloon columns with custom toppers',
      '6 premium centerpieces',
      'Marquee letters',
      'Premium delivery, setup & takedown',
    ],
    cta: 'Choose Signature',
    image: '/images/hero-sec.jpg',
    eventTypes: ['quinceanera'],
  },
  {
    id: 'quin-grand',
    tier: 'Tier 04',
    name: 'Grand Experience',
    tagline: 'The ultimate quinceañera — photo booth, audio & MC included',
    price: 2800,
    priceNote: 'full service',
    color: 'gold',
    features: [
      'Everything in Signature',
      'Photo booth rental (4 hrs)',
      'Professional audio setup',
      'MC services for full event',
      "Tucson's only all-in-one studio",
    ],
    cta: 'Choose Grand Experience',
    image: '/images/hero-main.jpg',
    eventTypes: ['quinceanera'],
  },

  // ── Graduation-specific ──
  {
    id: 'grad-celebrate',
    tier: 'Tier 01',
    name: 'Celebrate',
    tagline: 'Backyard parties and budget-conscious grads',
    price: 299,
    priceNote: 'installed',
    color: 'gray',
    features: [
      'Up to 8 ft balloon garland',
      'Custom school colors',
      'Standard delivery & setup',
      '1 centerpiece',
    ],
    cta: 'Choose Celebrate',
    image: '/images/gal-5.jpg',
    eventTypes: ['graduation'],
  },
  {
    id: 'grad-classic',
    tier: 'Tier 02',
    name: 'Classic',
    tagline: 'The perfect grad party setup — festive and memorable',
    price: 550,
    priceNote: 'installed',
    color: 'teal',
    badge: 'Most Popular',
    features: [
      'Up to 15 ft balloon garland',
      'Shimmer backdrop',
      '2 balloon columns',
      '2 centerpieces',
      'Standard delivery & setup',
    ],
    cta: 'Choose Classic',
    image: '/images/gal-4.jpg',
    eventTypes: ['graduation'],
  },
  {
    id: 'grad-grand',
    tier: 'Tier 03',
    name: 'Grand',
    tagline: 'Full wow factor — the grad party of the year',
    price: 950,
    priceNote: 'installed',
    color: 'gold',
    features: [
      'Up to 20 ft luxury garland',
      'Shimmer backdrop + frame',
      '2 balloon columns with toppers',
      '3 premium centerpieces',
      'Photo booth rental (2 hrs)',
      'Premium delivery, setup & takedown',
    ],
    cta: 'Choose Grand',
    image: '/images/hero-main.jpg',
    eventTypes: ['graduation'],
  },
]

// Helper: get packages for a given event type
export function getPackagesForEvent(eventTypeId: EventTypeId | null): Package[] {
  if (!eventTypeId) return PACKAGE_CATALOG.filter(p => p.eventTypes === 'all')
  return PACKAGE_CATALOG.filter(
    p => p.eventTypes === 'all' || (Array.isArray(p.eventTypes) && p.eventTypes.includes(eventTypeId))
  )
}

// ─── Add-Ons ──────────────────────────────────────────────────────────────────
// Items a customer can add on top of any base package.
// Photo booth & audio/MC prices are TBD — hidden from configurator until set.

export type AddOn = {
  id: string
  label: string
  description: string
  price: number
  image?: string
  eventTypes: EventTypeId[] | 'all'
  socialProof?: string   // e.g. "Most quinceañera bookings include this"
}

export const ADD_ONS: AddOn[] = [
  {
    id: 'shimmer_backdrop',
    label: 'Shimmer Backdrop + Frame',
    description: 'Stunning shimmer wall — white, silver, or gold. Every photo will look incredible.',
    price: 115,
    eventTypes: 'all',
    socialProof: 'In almost every quinceañera and wedding booking',
  },
  {
    id: 'column_pair_6ft',
    label: 'Balloon Column Pair (6 ft)',
    description: 'Two 6 ft balloon columns — perfect flanking an entrance or backdrop.',
    price: 300,   // 2 × $150
    eventTypes: 'all',
  },
  {
    id: 'column_pair_8ft',
    label: 'Balloon Column Pair (8 ft)',
    description: 'Two dramatic 8 ft columns with a grand, full look.',
    price: 400,   // 2 × $200
    eventTypes: 'all',
  },
  {
    id: 'column_topper',
    label: 'Custom Toppers (per pair)',
    description: 'Add a custom balloon topper to each column for extra personality.',
    price: 50,    // 2 × $25
    eventTypes: 'all',
  },
  {
    id: 'cp_premium_3pack',
    label: '3 Premium Centerpieces',
    description: 'Three premium balloon centerpieces for your tables.',
    price: 135,   // 3 × $45
    eventTypes: 'all',
    socialProof: 'Moms always say these were their favorite touch',
  },
  {
    id: 'marquee_large',
    label: 'Marquee Letter or Number (Large)',
    description: 'A large marquee letter or number — great for "15", a name initial, or the grad year.',
    price: 150,
    eventTypes: ['quinceanera', 'graduation', 'birthday'],
  },
  {
    id: 'marquee_small',
    label: 'Marquee Letter or Number (Small)',
    description: 'A smaller marquee accent piece.',
    price: 75,
    eventTypes: ['quinceanera', 'graduation', 'birthday'],
  },
  {
    id: 'bouquet_large',
    label: 'Balloon Bouquet (10–12 balloons)',
    description: 'A full, lush balloon bouquet — great as a standalone accent.',
    price: 50,
    eventTypes: 'all',
  },
  {
    id: 'garland_extra_10ft_luxury',
    label: 'Extra 10 ft Luxury Garland',
    description: 'Need more coverage? Add 10 additional feet of luxury garland.',
    price: 450,   // 10 × $45
    eventTypes: 'all',
  },
  {
    id: 'delivery_premium',
    label: 'Upgrade to Premium Service',
    description: 'Includes same-day takedown so you never have to worry about cleanup.',
    price: 30,    // upgrade delta: $130 - $100
    eventTypes: 'all',
  },
]

// ─── Pricing Rules ─────────────────────────────────────────────────────────────

export const PRICING_RULES = {
  consultationThreshold: 1200,   // total above this → consultation path
  rushFee: 75,                   // booking under 48hrs before event
  distanceFreeWithinMiles: 20,
  distanceRatePerMileOver: 1.50,
  depositPercent: 50,
  depositDueBeforeEvent: 14,     // days
  balanceDueBeforeEvent: 7,      // days
  depositNonRefundableAfter: 7,  // days from booking
}

// ─── Homepage display packages (for Packages section) ─────────────────────────
// Uses the 3 general packages — pulled from PACKAGE_CATALOG

export const HOMEPAGE_PACKAGES = PACKAGE_CATALOG.filter(
  p => ['essential', 'signature', 'luxury'].includes(p.id)
)
