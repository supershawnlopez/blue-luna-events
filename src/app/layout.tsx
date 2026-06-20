import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: {
    default: 'Blue Luna Events | Balloon Décor & Event Styling — Tucson, AZ',
    template: '%s | Blue Luna Events',
  },
  description: "Tucson's premier balloon décor and event styling studio. Quinceañeras, weddings, graduations, birthdays, and corporate events. Professional installation, same-day takedown. Serving all of Southern Arizona.",
  keywords: [
    'balloon decorator Tucson AZ',
    'quinceañera balloon decor Tucson',
    'balloon garland Tucson Arizona',
    'event styling Tucson',
    'balloon arch Tucson',
    'graduation party decorations Tucson',
    'shimmer backdrop Tucson',
    'balloon columns Tucson',
    'Blue Luna Events',
    'Monica Denogean',
    'Marana balloon decor',
    'Oro Valley event styling',
    'Sahuarita balloon decorator',
  ],
  openGraph: {
    title: 'Blue Luna Events | Balloon Décor & Event Styling — Tucson, AZ',
    description: "Tucson's premier balloon décor studio. Quinceañeras, graduations, weddings, birthdays. Professional installation by Monica Denogean.",
    url: 'https://bluelunaevents.com',
    siteName: 'Blue Luna Events',
    type: 'website',
    images: [
      {
        url: 'https://bluelunaevents.com/images/hero-main.jpg',
        width: 1200,
        height: 630,
        alt: 'Blue Luna Events — Balloon Décor & Event Styling Tucson AZ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blue Luna Events | Balloon Décor Tucson AZ',
    description: "Tucson's premier balloon décor studio. Quinceañeras, graduations, weddings, birthdays.",
    images: ['https://bluelunaevents.com/images/hero-main.jpg'],
  },
  alternates: {
    canonical: 'https://bluelunaevents.com',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const LOCAL_BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'EventVenueDecorService',
  name: 'Blue Luna Events',
  description: "Tucson's premier balloon décor and event styling studio. Quinceañeras, weddings, graduations, birthdays, and corporate events.",
  url: 'https://bluelunaevents.com',
  telephone: '+15202226142',
  email: 'monica@bluelunaevents.com',
  founder: {
    '@type': 'Person',
    name: 'Monica Denogean',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Tucson',
    addressRegion: 'AZ',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 32.2226,
    longitude: -110.9747,
  },
  areaServed: [
    { '@type': 'City', name: 'Tucson' },
    { '@type': 'City', name: 'Marana' },
    { '@type': 'City', name: 'Oro Valley' },
    { '@type': 'City', name: 'Sahuarita' },
    { '@type': 'City', name: 'Green Valley' },
    { '@type': 'AdministrativeArea', name: 'Southern Arizona' },
  ],
  sameAs: [
    'https://instagram.com/bluelunamagic',
    'https://facebook.com/bluelunamagic',
  ],
  openingHours: 'Mo-Su 08:00-20:00',
  priceRange: '$$',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '50',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_SCHEMA) }}
        />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
