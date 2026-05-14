import Link from 'next/link'

export default function BookingConfirmed() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#FDFCFA' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(91,191,191,0.12)', border: '2px solid #5BBFBF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#5BBFBF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5BBFBF', marginBottom: 12 }}>
          Deposit Received
        </p>

        <h1 className="font-display" style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 300, color: '#0D0F0F', marginBottom: 16, lineHeight: 1.2 }}>
          Your date is <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>reserved.</em>
        </h1>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 300, color: '#6B7280', lineHeight: 1.7, marginBottom: 32 }}>
          Monica received your deposit and will text you shortly to confirm the details. Your remaining balance is due one week before your event.
        </p>

        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 16, padding: '20px 24px', marginBottom: 32, textAlign: 'left' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>What happens next</p>
          {[
            { n: '1', text: 'Monica texts you to confirm your event date and venue' },
            { n: '2', text: 'She sends a full contract with your package details' },
            { n: '3', text: 'Your remaining balance is due 7 days before your event' },
            { n: '4', text: 'Blue Luna arrives early to set everything up perfectly' },
          ].map(step => (
            <div key={step.n} style={{ display: 'flex', gap: 14, marginBottom: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(91,191,191,0.12)', border: '1.5px solid #5BBFBF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: '#5BBFBF' }}>{step.n}</span>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: '#374151', lineHeight: 1.5, margin: 0 }}>{step.text}</p>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#9CA3AF', marginBottom: 8 }}>
          Questions? Text or call Monica directly.
        </p>
        <a
          href="tel:5202226142"
          style={{ display: 'inline-block', background: '#5BBFBF', color: '#0D0F0F', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 700, padding: '13px 32px', borderRadius: 999, textDecoration: 'none', marginBottom: 20 }}
        >
          (520) 222-6142
        </a>

        <div>
          <Link href="/" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#9CA3AF', textDecoration: 'none' }}>
            ← Back to Blue Luna Events
          </Link>
        </div>
      </div>
    </main>
  )
}
