'use client'
import { Sparkles, Camera, Music, CheckCircle } from 'lucide-react'

const pillars = [
  { Icon: Sparkles, title: 'Custom Balloon Artistry', text: 'Every garland, arch, and installation built for your event — your colors, your vision, your moment.' },
  { Icon: Camera, title: 'Photo Booth Rentals', text: 'Open-air iPad stations and full booth setups that keep guests entertained all night long.' },
  { Icon: Music, title: 'Professional Audio & MC', text: 'Sound equipment and MC services to keep your event flowing beautifully from start to finish.' },
  { Icon: CheckCircle, title: 'Stress-Free Setup & Takedown', text: 'We arrive, set up, take down. You walk in to a transformed space and walk out without lifting a finger.' },
]

const stats = [
  { n: '5+', l: 'Years in Tucson' },
  { n: '4-in-1', l: 'Services Combined' },
  { n: 'OV · SAH', l: 'Oro Valley & beyond' },
  { n: '50%', l: 'Deposit holds your date' },
]

export default function Why() {
  return (
    <section id="about" style={{padding:'clamp(64px,10vw,120px) 0', background:'#0D0F0F', position:'relative', overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 55% 45% at 80% 50%, rgba(91,191,191,0.07) 0%, transparent 60%)',pointerEvents:'none'}} />
      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 24px',position:'relative',zIndex:1}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,480px),1fr))',gap:'56px',alignItems:'center'}}>

          {/* Left */}
          <div className="reveal">
            <div style={{display:'inline-flex',alignItems:'center',gap:'10px',marginBottom:'14px'}}>
              <div style={{width:'24px',height:'1px',background:'rgba(91,191,191,0.6)'}} />
              <span style={{fontFamily:'DM Mono,monospace',fontSize:'11px',color:'rgba(91,191,191,0.7)',letterSpacing:'0.18em',textTransform:'uppercase'}}>Why Blue Luna</span>
            </div>
            <h2 style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:'clamp(2rem,4.5vw,3.2rem)',fontWeight:300,lineHeight:1.1,color:'white',marginBottom:'16px'}}>
              Tucson&apos;s Only <em style={{fontStyle:'italic',color:'#5BBFBF'}}>Full-Service</em> Studio
            </h2>
            <p style={{fontSize:'15px',fontWeight:300,lineHeight:1.75,color:'rgba(255,255,255,0.5)',marginBottom:'36px'}}>
              We&apos;re not just a balloon company. Blue Luna Events is the only studio in the Tucson area combining balloon décor, photo booth, professional audio, and MC services — one team, one seamless experience.
            </p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'16px',overflow:'hidden'}}>
              {stats.map(s => (
                <div key={s.n} style={{background:'#141818',padding:'20px 18px'}}>
                  <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(1.6rem,3vw,2.2rem)',fontWeight:600,color:'white',lineHeight:1,marginBottom:'4px'}}>
                    <span style={{color:'#5BBFBF'}}></span>{s.n}
                  </div>
                  <div style={{fontSize:'12px',color:'rgba(255,255,255,0.38)',fontWeight:300}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="reveal rd2" style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            {pillars.map(({Icon, title, text}) => (
              <div key={title} style={{
                background:'#141818',border:'1px solid rgba(255,255,255,0.06)',
                borderRadius:'16px',padding:'20px 22px',
                display:'flex',gap:'16px',alignItems:'flex-start',
                transition:'background 0.2s,border-color 0.2s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.background='#1C2222';e.currentTarget.style.borderColor='rgba(91,191,191,0.2)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='#141818';e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}}
              >
                <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'rgba(91,191,191,0.12)',border:'1px solid rgba(91,191,191,0.18)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Icon size={18} color="#5BBFBF" />
                </div>
                <div>
                  <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.05rem',fontWeight:400,color:'white',marginBottom:'4px'}}>{title}</p>
                  <p style={{fontSize:'13px',fontWeight:300,color:'rgba(255,255,255,0.42)',lineHeight:1.6}}>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
