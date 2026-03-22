'use client'

const EVENTS = ['Quinceañeras','Weddings','Graduations','Birthdays','Baby Showers','Bridal Showers','Corporate Events','Sweet 16s','School Events','Holiday Parties']

export default function Marquee() {
  const doubled = [...EVENTS, ...EVENTS]
  return (
    <div style={{ padding: '56px 0', background: '#0D0F0F', overflow: 'hidden' }}>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.25em', textTransform: 'uppercase', textAlign: 'center', marginBottom: '28px' }}>
        Events We Style
      </p>
      <div
        style={{ display: 'flex', width: 'max-content', animation: 'scrollLeft 32s linear infinite' }}
        onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
        onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
      >
        {doubled.map((name, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '0 32px', borderRight: '1px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap' }}>
            <span className="font-display" style={{ fontSize: '1.35rem', fontWeight: 300, fontStyle: 'italic', color: 'rgba(255,255,255,0.5)', transition: 'color 0.3s', cursor: 'default' }}>
              {name}
            </span>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#5BBFBF', opacity: 0.5 }} />
          </div>
        ))}
      </div>
      <style>{`@keyframes scrollLeft { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }`}</style>
    </div>
  )
}
