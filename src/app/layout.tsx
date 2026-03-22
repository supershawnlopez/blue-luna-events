import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Blue Luna Events | Balloon Décor & Event Styling — Tucson, AZ',
  description: "Tucson's premier balloon décor and event styling studio. Quinceañeras, weddings, graduations, birthdays, and corporate events. Professional installation, same-day takedown.",
  keywords: 'balloon decorator Tucson, quinceañera balloon decor Tucson AZ, balloon garland Tucson, event styling Tucson, balloon arch Tucson',
  openGraph: {
    title: 'Blue Luna Events | Balloon Décor & Event Styling — Tucson, AZ',
    description: "Tucson's premier balloon décor and event styling studio.",
    url: 'https://bluelunaevents.com',
    siteName: 'Blue Luna Events',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
