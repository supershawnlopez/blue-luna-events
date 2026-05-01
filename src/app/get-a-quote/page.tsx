import type { Metadata } from 'next'
import PackageConfigurator from '@/components/ui/PackageConfigurator'

export const metadata: Metadata = {
  title: 'Build Your Package | Blue Luna Events — Tucson Balloon Décor',
  description: 'Build your custom balloon décor package and see real-time pricing. Blue Luna Events — quinceañeras, graduations, weddings, birthdays, and more in Tucson, AZ.',
}

export default function GetAQuote() {
  return (
    <div style={{ minHeight: '100vh', background: '#FDFCFA', paddingTop: '96px', paddingBottom: '80px' }}>
      <div style={{ textAlign: 'center', padding: '0 24px 40px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center', marginBottom: '16px' }}>
          <div className="eyebrow-line" /><span className="eyebrow-text">Transparent Pricing</span><div className="eyebrow-line" />
        </div>
        <h1 className="font-display" style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 300, color: '#0D0F0F', lineHeight: 1.1, marginBottom: '12px' }}>
          Build Your <em style={{ fontStyle: 'italic', color: '#3A8F8F' }}>Package</em>
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 300, color: '#6B7280', maxWidth: '420px', margin: '0 auto', lineHeight: 1.7 }}>
          Pick your event, choose a base package, and add extras. See your price in real time — no waiting, no surprises.
        </p>
      </div>
      <PackageConfigurator />
    </div>
  )
}
