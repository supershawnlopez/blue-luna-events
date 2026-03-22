'use client'

import { Sparkles, Camera, Music, CheckCircle } from 'lucide-react'

const PILLARS = [
  { icon: Sparkles, title: 'Custom Balloon Artistry', text: 'Every garland, arch, and installation built for your event — your colors, your vision, your moment.' },
  { icon: Camera, title: 'Photo Booth Rentals', text: 'Open-air iPad stations and full booth setups that keep guests entertained all night long.' },
  { icon: Music, title: 'Professional Audio & MC', text: 'Sound equipment and MC services to keep your event flowing beautifully from start to finish.' },
  { icon: CheckCircle, title: 'Stress-Free Setup & Takedown', text: "We arrive, set up, take down. You walk in to a transformed space and walk out without lifting a finger." },
]

const STATS = [
  { n: '5+', l: 'Years in Tucson' },
  { n: '4-in-1', l: 'Services Combined' },
  { n: 'OV · SAH', l: 'Oro Valley & beyond' },
  { n: '50%', l: 'Deposit holds your date' },
]

export default function Why() {
  return (
    <section id="about" style={{ padding: 'clamp(64px,10vw,120px) 0', background: '#0D0F0F', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 50% at 80% 50%, rgba(91,191,191,0.08) 0%, transparent 60%)' }} />
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,400px),1fr))', gap: '64px', alignItems: 'center' }}>
          <div className="reveal">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text" style={{ color: 'rgba(91,191,191,0.8)' }}>Why Blue Luna</span></div>
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem,3.5vw,3rem)', fontWeight: 300, color: 'white', lineHeight: 1.1, marginBottom: '16px' }}>
              Tucson&apos;s Only <em style={{ fontStyle: 'italic', color: '#5BBFBF' }}>Full-Service</em> Studio
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 300, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: '32px' }}>
              We&apos;re not just a balloon company. Blue Luna Events is the only studio in the Tucson area combining balloon décor, photo booth, professional audio, and MC services — one team, one seamless experience.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
              {STATS.map(s => (
                <div key={s.n} style={{ background: '#141818', padding: '22px 18px' }}>
                  <p className="font-display" style={{ fontSize: '2rem', fontWeight: 600, color: 'white', lineHeight: 1, marginBottom: '5px' }}>
                    {s.n}
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 300, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} className="reveal reveal-delay-2">
            {PILLARS.map((p, i) => (
              <div key={i} className="card-dark" style={{ padding: '22px', display: 'flex', gap: '16px', alignItems: 'flex-start', transition: 'all 0.2s' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(91,191,191,0.12)', border: '1px solid rgba(91,191,191,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <p.icon size={18} color="#5BBFBF" />
                </div>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: 'white', marginBottom: '4px' }}>{p.title}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 300, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
