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
}

export const PACKAGES = [
  {
    tier: 'Tier 01',
    name: 'Essential',
    tagline: 'Perfect for birthdays, baby showers & intimate celebrations',
    price: '$350',
    priceNote: 'installed',
    color: 'gray',
    features: [
      'Up to 12 ft balloon garland',
      'Custom color palette',
      'Standard delivery & setup',
      'Up to 2 centerpieces',
    ],
    cta: 'Inquire About Essential',
    ctaStyle: 'outline',
  },
  {
    tier: 'Tier 02',
    name: 'Signature',
    tagline: "Our most-loved setup for quinceañeras, weddings & milestone events",
    price: '$900',
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
    cta: 'Book Signature Package',
    ctaStyle: 'solid',
  },
  {
    tier: 'Tier 03',
    name: 'Luxury',
    tagline: 'Full event transformation — balloons, photo booth, audio & MC',
    price: '$1,800',
    priceNote: 'full service',
    color: 'gold',
    features: [
      'Everything in Signature',
      'Photo booth rental (4 hrs)',
      'Professional audio setup',
      'MC services included',
      "Tucson's only all-in-one studio",
    ],
    cta: 'Get Luxury Quote',
    ctaStyle: 'gold',
  },
]

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

export const NAV_LINKS = [
  { label: 'Packages', href: '/#packages' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/#about' },
  { label: 'Quinceañeras', href: '/quinceaneras', highlight: 'teal' },
  { label: 'Graduations ✨', href: '/graduations', highlight: 'gold' },
]
