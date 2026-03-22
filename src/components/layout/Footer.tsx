'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{background:'#0D0F0F',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 24px'}}>

        {/* Main */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,200px),1fr))',
          gap:'40px',
          padding:'64px 0 48px',
        }}>
          {/* Brand */}
          <div style={{gridColumn:'span 1'}}>
            <Image
              src="/images/logo-color.png"
              alt="Blue Luna Events"
              width={200}
              height={64}
              style={{height:'56px',width:'auto',objectFit:'contain',marginBottom:'18px',filter:'brightness(0) invert(1)',opacity:0.88}}
            />
            <p style={{fontSize:'13px',fontWeight:300,lineHeight:1.75,color:'rgba(255,255,255,0.38)',marginBottom:'20px'}}>
              Tucson&apos;s premier balloon décor and event styling studio. Quinceañeras, weddings, graduations, birthdays — and everything in between.
            </p>
            <div style={{display:'flex',gap:'10px'}}>
              {[
                { href:'https://instagram.com/bluelunamagic', Icon: Instagram, label:'Instagram' },
                { href:'https://facebook.com/bluelunamagic', Icon: Facebook, label:'Facebook' },
              ].map(({href,Icon,label}) => (
                <Link key={label} href={href} target="_blank" aria-label={label} style={{
                  width:'44px',height:'44px',borderRadius:'50%',
                  border:'1px solid rgba(255,255,255,0.14)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  color:'rgba(255,255,255,0.45)',
                  transition:'all 0.2s',minHeight:'unset',
                }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#5BBFBF';e.currentTarget.style.color='#5BBFBF';e.currentTarget.style.background='rgba(91,191,191,0.1)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.14)';e.currentTarget.style.color='rgba(255,255,255,0.45)';e.currentTarget.style.background='transparent';}}
                >
                  <Icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <p style={{fontFamily:'DM Mono,monospace',fontSize:'10px',color:'rgba(255,255,255,0.25)',letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:'18px'}}>Services</p>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {['Balloon Décor','Backdrops & Frames','Photo Booth Rental','Audio & MC','View All Packages'].map(s => (
                <Link key={s} href="/#packages" style={{fontSize:'14px',fontWeight:300,color:'rgba(255,255,255,0.45)',transition:'color 0.2s',minHeight:'unset'}}
                  onMouseEnter={e=>(e.currentTarget.style.color='#5BBFBF')}
                  onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.45)')}
                >{s}</Link>
              ))}
            </div>
          </div>

          {/* Events */}
          <div>
            <p style={{fontFamily:'DM Mono,monospace',fontSize:'10px',color:'rgba(255,255,255,0.25)',letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:'18px'}}>Events</p>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {[
                {l:'Quinceañeras',h:'/quinceaneras'},
                {l:'Weddings',h:'/#packages'},
                {l:'Graduations',h:'/graduations'},
                {l:'Birthdays',h:'/#packages'},
                {l:'Corporate',h:'/#packages'},
              ].map(({l,h}) => (
                <Link key={l} href={h} style={{fontSize:'14px',fontWeight:300,color:'rgba(255,255,255,0.45)',transition:'color 0.2s',minHeight:'unset'}}
                  onMouseEnter={e=>(e.currentTarget.style.color='#5BBFBF')}
                  onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.45)')}
                >{l}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p style={{fontFamily:'DM Mono,monospace',fontSize:'10px',color:'rgba(255,255,255,0.25)',letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:'18px'}}>Contact</p>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              {[
                {label:'Phone / Text',value:'(520) 222-6142',href:'tel:5202226142'},
                {label:'Email',value:'monica@bluelunaevents.com',href:'mailto:monica@bluelunaevents.com'},
                {label:'Location',value:'Tucson, AZ',href:undefined},
                {label:'Social',value:'@BlueLunaMagic',href:'https://instagram.com/bluelunamagic'},
              ].map(({label,value,href}) => (
                <div key={label}>
                  <p style={{fontFamily:'DM Mono,monospace',fontSize:'9px',color:'rgba(255,255,255,0.2)',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:'2px'}}>{label}</p>
                  {href ? (
                    <Link href={href} style={{fontSize:'13px',fontWeight:300,color:'rgba(255,255,255,0.52)',transition:'color 0.2s',minHeight:'unset'}}
                      onMouseEnter={e=>(e.currentTarget.style.color='#5BBFBF')}
                      onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.52)')}
                    >{value}</Link>
                  ) : (
                    <span style={{fontSize:'13px',fontWeight:300,color:'rgba(255,255,255,0.52)'}}>{value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'18px 0',display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:'8px'}}>
          <span style={{fontSize:'12px',fontWeight:300,color:'rgba(255,255,255,0.18)'}}>© 2025 Blue Luna Events · Monica Denogean · Tucson, AZ · All rights reserved.</span>
          <span style={{fontFamily:'DM Mono,monospace',fontSize:'10px',color:'rgba(255,255,255,0.14)',letterSpacing:'0.1em'}}>BLUELUNAEVENTS.COM</span>
        </div>
      </div>
    </footer>
  )
}
