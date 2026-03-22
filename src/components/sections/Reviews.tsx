'use client'
import { Star } from 'lucide-react'

const reviews = [
  { text: "Blue Luna transformed our baby shower into something out of a Pinterest dream. The backdrop and balloons were beyond beautiful.", name: "Jessica R.", loc: "Tucson, AZ", init: "J", color: "#5BBFBF" },
  { text: "I was blown away by the creativity and detail. They made my daughter's quinceañera look like a magazine shoot.", name: "Maria V.", loc: "Oro Valley, AZ", init: "M", color: "#C9A96E" },
  { text: "Monica and her team are the definition of professional. We hired Blue Luna for everything — balloons, photo booth, sound system, and MC. Our quinceañera ran flawlessly. Every single guest asked who did our décor. Worth every penny.", name: "Ana & Carlos Mendoza", loc: "Sahuarita, AZ", init: "A", color: "#3A8F8F", wide: true },
]

function Stars() {
  return (
    <div style={{display:'flex',gap:'3px',marginBottom:'14px'}}>
      {[...Array(5)].map((_,i) => <Star key={i} size={13} fill="#C9A96E" color="#C9A96E" />)}
    </div>
  )
}

export default function Reviews() {
  return (
    <section id="reviews" style={{padding:'clamp(64px,10vw,120px) 0', background:'#FDFCFA'}}>
      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,280px),1fr))',gap:'48px',alignItems:'start'}}>

          {/* Left */}
          <div className="reveal">
            <div style={{display:'inline-flex',alignItems:'center',gap:'10px',marginBottom:'14px'}}>
              <div style={{width:'24px',height:'1px',background:'#5BBFBF'}} />
              <span style={{fontFamily:'DM Mono,monospace',fontSize:'11px',color:'#5BBFBF',letterSpacing:'0.18em',textTransform:'uppercase'}}>Client Love</span>
            </div>
            <h2 style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:'clamp(1.8rem,3.5vw,2.8rem)',fontWeight:300,lineHeight:1.1,color:'#0D0F0F',marginBottom:'14px'}}>
              Tucson Families <em style={{fontStyle:'italic',color:'#3A8F8F'}}>Trust</em> Blue Luna
            </h2>
            <p style={{fontSize:'15px',fontWeight:300,lineHeight:1.75,color:'#4A5050',marginBottom:'24px'}}>
              Real reviews from real families. See why we&apos;re the area&apos;s most-loved event styling studio.
            </p>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <div style={{display:'flex',gap:'2px'}}>
                {[...Array(5)].map((_,i) => <Star key={i} size={14} fill="#C9A96E" color="#C9A96E" />)}
              </div>
              <span style={{fontFamily:'DM Mono,monospace',fontSize:'11px',color:'#8A8F8F',letterSpacing:'0.08em'}}>5.0 on Google</span>
            </div>
          </div>

          {/* Reviews */}
          <div className="reveal rd2" style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,260px),1fr))',
            gap:'16px',
          }}>
            {reviews.map((r,i) => (
              <div key={i} style={{
                background:'white',
                border:'1px solid #E4E8E8',
                borderRadius:'16px',padding:'24px',
                gridColumn: r.wide ? '1 / -1' : 'auto',
                transition:'box-shadow 0.3s,border-color 0.3s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.08)';e.currentTarget.style.borderColor='rgba(91,191,191,0.3)';}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.borderColor='#E4E8E8';}}
              >
                <Stars />
                <p style={{fontFamily:'Cormorant Garamond,serif',fontSize: r.wide ? '1.05rem' : '0.98rem',fontWeight:300,fontStyle:'italic',color:'#0D0F0F',lineHeight:1.65,marginBottom:'16px'}}>
                  &ldquo;{r.text}&rdquo;
                </p>
                <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                  <div style={{width:'36px',height:'36px',borderRadius:'50%',background:r.color,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Cormorant Garamond,serif',fontSize:'1rem',color:'white',fontWeight:600,flexShrink:0}}>
                    {r.init}
                  </div>
                  <div>
                    <p style={{fontSize:'13px',fontWeight:500,color:'#0D0F0F',marginBottom:'1px'}}>{r.name}</p>
                    <p style={{fontSize:'12px',fontWeight:300,color:'#8A8F8F'}}>{r.loc} · Google Review</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
