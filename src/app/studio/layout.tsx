import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blue Luna Studio',
  robots: { index: false, follow: false },
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D0F0F',
      color: 'white',
      fontFamily: 'Inter, -apple-system, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      overflowX: 'hidden',
    }}>
      {children}
    </div>
  )
}
