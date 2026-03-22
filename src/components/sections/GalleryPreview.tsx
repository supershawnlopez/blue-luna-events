'use client'
import Image from 'next/image'
import Link from 'next/link'

const photos = [
  { src:'/images/gal-1.jpg', alt:'Balloon castle installation Blue Luna Events', label:'Custom Installation', tall:true },
  { src:'/images/gal-2.jpg', alt:'Rose gold balloon arch Tucson', label:'Rose Gold Arch' },
  { src:'/images/gal-3.jpg', alt:'Baby shower balloon backdrop', label:'Baby Shower' },
  { src:'/images/gal-4.jpg', alt:'Birthday balloon welcome sign', label:'Birthday Celebration' },
  { src:'/images/gal-5.jpg', alt:'Outdoor balloon arch Tucson', label:'Outdoor Event' },
]

export default function GalleryPreview() {
  return (
    <section id="gallery" style={{padding:'clamp(64px,10vw,120px) 0', background:'#F7F5F2'}}>
      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 24px'}}>

        {/* Header */}
        <div className="reveal" style={{display:'flex',flexWrap:'wrap',alignItems:'flex-end',justifyContent:'space-between',gap:'16px',marginBottom:'32px'}}>
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
              <div style={{width:'24px',height:'1px',background:'#5BBFBF'}} />
              <span style={{fontFamily:'DM Mono,monospace',fontSize:'11px',color:'#5BBFBF',letterSpacing:'0.18em',textTransform:'uppercase'}}>Our Work</span>
            </div>
            <h2 style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:'clamp(2rem,4.5vw,3.2rem)',fontWeight:300,lineHeight:1.1,color:'#0D0F0F'}}>
              Recent <em style={{fontStyle:'italic',color:'#3A8F8F'}}>Creations</em>
            </h2>
          </div>
          <Link href="/gallery" style={{
            fontSize:'13px',fontWeight:500,color:'#3A8F8F',
            border:'1.5px solid #3A8F8F',borderRadius:'999px',
            padding:'10px 20px',whiteSpace:'nowrap',
            transition:'all 0.2s',minHeight:'unset',
          }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(58,143,143,0.06)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}
          >
            View Full Gallery →
          </Link>
        </div>

        {/* Grid — responsive */}
        <div className="reveal" style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,200px),1fr))',
          gridAutoRows:'220px',
          gap:'10px',
        }}>
          {photos.map((p,i) => (
            <div key={i} style={{
              position:'relative',borderRadius:'14px',overflow:'hidden',
              gridRow: p.tall ? 'span 2' : 'auto',
              cursor:'pointer',
            }}
            className="gallery-item"
            >
              <Image src={p.src} alt={p.alt} fill style={{objectFit:'cover',transition:'transform 0.5s cubic-bezier(0.16,1,0.3,1)'}} />
              <div className="gallery-overlay" style={{
                position:'absolute',inset:0,
                background:'rgba(13,15,15,0)',
                display:'flex',alignItems:'flex-end',
                padding:'16px',
                transition:'background 0.3s',
              }}>
                <span style={{
                  fontFamily:'Cormorant Garamond,serif',
                  fontSize:'1rem',fontStyle:'italic',
                  color:'white',fontWeight:300,
                  opacity:0,transition:'opacity 0.3s',
                }} className="gallery-label">
                  {p.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          .gallery-item:hover img { transform: scale(1.05); }
          .gallery-item:hover .gallery-overlay { background: rgba(13,15,15,0.55) !important; }
          .gallery-item:hover .gallery-label { opacity: 1 !important; }
        `}</style>
      </div>
    </section>
  )
}
