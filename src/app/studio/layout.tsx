import type { Metadata, Viewport } from 'next'
import PwaRegister from '@/components/studio/PwaRegister'

// Scoped to this layout on purpose — everything here only applies under
// /studio, so installing "Blue Luna Studio" to a home screen never touches
// or shows up as an option on the public marketing site.
export const metadata: Metadata = {
  title: 'Blue Luna Studio',
  robots: { index: false, follow: false },
  manifest: '/studio-manifest.json',
  appleWebApp: {
    capable: true,
    title: 'BL Studio',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
    icon: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0D0F0F',
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="studio-root" style={{
      minHeight: '100vh',
      background: '#0D0F0F',
      color: 'white',
      fontFamily: 'Inter, -apple-system, sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }}>
      <PwaRegister />
      {children}
    </div>
  )
}
