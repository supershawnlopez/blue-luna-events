export default function ProcessStrip() {
  const steps = [
    { n: '01', title: 'Build Your Package', body: 'Choose your event type, base package, and any add-ons. See your price in real time — no waiting, no guessing.' },
    { n: '02', title: 'Monica Confirms Your Date', body: 'She reviews your request and reaches out personally within a few hours to lock in your date.' },
    { n: '03', title: 'We Handle Everything', body: 'We arrive, we set up, we take down. You walk into a transformed space and focus on the moment.' },
  ]

  return (
    <section style={{ padding: 'clamp(80px,12vw,140px) 0', background: '#FDFCFA' }}>
      <div className="container">

        <div style={{ textAlign: 'center', marginBottom: '56px' }} className="reveal">
          <div className="eyebrow" style={{ justifyContent: 'center' }}>
            <div className="eyebrow-line" /><span className="eyebrow-text">How It Works</span><div className="eyebrow-line" />
          </div>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 300, color: '#0D0F0F', marginTop: '8px' }}>
            Three steps to <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>your perfect event</em>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: '2px', background: '#E5E7EB', borderRadius: '20px', overflow: 'hidden' }} className="reveal">
          {steps.map((s, i) => (
            <div key={i} style={{ background: 'white', padding: 'clamp(32px,5vw,48px) clamp(24px,4vw,40px)' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', fontWeight: 700, color: '#5BBFBF', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '16px' }}>
                Step {s.n}
              </p>
              <h3 className="font-display" style={{ fontSize: 'clamp(1.3rem,2vw,1.7rem)', fontWeight: 300, color: '#0D0F0F', lineHeight: 1.2, marginBottom: '12px' }}>
                {s.title}
              </h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 300, color: '#6B7280', lineHeight: 1.7 }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
