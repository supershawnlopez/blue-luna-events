import type { Metadata } from 'next'
import InquiryForm from '@/components/ui/InquiryForm'

export const metadata: Metadata = {
  title: 'Get a Quote | Blue Luna Events — Tucson Balloon Décor',
  description: 'Tell us about your event and Monica will personally reach out with a custom quote. Blue Luna Events — quinceañeras, graduations, weddings, birthdays, and more in Tucson, AZ.',
}

export default function GetAQuote() {
  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingTop: '96px', paddingBottom: '80px' }}>
      <div style={{ textAlign: 'center', padding: '0 24px 48px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center', marginBottom: '16px' }}>
          <div className="eyebrow-line" /><span className="eyebrow-text">Let&apos;s Plan Something Beautiful</span><div className="eyebrow-line" />
        </div>
        <h1 className="font-display" style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 300, color: '#0D0F0F', lineHeight: 1.1, marginBottom: '12px' }}>
          Tell Us About Your <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>Event</em>
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 300, color: '#6B7280', maxWidth: '440px', margin: '0 auto', lineHeight: 1.7 }}>
          Share your vision and Monica will personally reach out with a custom quote made just for you. No payment, no obligation — just a real conversation.
        </p>
      </div>
      <InquiryForm />
    </div>
  )
}
