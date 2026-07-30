import type { Metadata } from 'next'
import GalleryPageView from './GalleryPageView'

export const metadata: Metadata = {
  title: 'Our Gallery — Real Balloon Décor & Event Styling in Tucson, AZ',
  description: 'Browse real balloon garlands, backdrops, and event styling by Blue Luna Events — quinceañeras, graduations, weddings, birthdays, baby showers, and corporate events across Tucson, AZ.',
  openGraph: {
    title: 'Our Gallery — Real Balloon Décor & Event Styling in Tucson, AZ',
    description: 'Browse real balloon garlands, backdrops, and event styling by Blue Luna Events, Tucson, AZ.',
    url: 'https://bluelunaevents.com/gallery',
    images: [{ url: 'https://bluelunaevents.com/images/gal-2.jpg', width: 1200, height: 630, alt: 'Real balloon décor by Blue Luna Events, Tucson AZ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Gallery — Blue Luna Events',
    description: 'Browse real balloon garlands, backdrops, and event styling by Blue Luna Events, Tucson, AZ.',
    images: ['https://bluelunaevents.com/images/gal-2.jpg'],
  },
  alternates: { canonical: 'https://bluelunaevents.com/gallery' },
}

export default function Gallery() {
  return <GalleryPageView />
}
