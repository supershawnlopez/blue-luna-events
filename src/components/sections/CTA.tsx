'use client'
import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'

export default function CTA() {
  return (
    <section id="contact" style={{padding:'clamp(64px,10vw,120px) 0', background:'#FDFCFA', textAlign:'center'}}>
      <div style={{maxWidth:'640px', margin:'0 auto', padding:'0 24px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',marginBottom:'16px'}}>
          <div style={{width:'24px',height:'1px',background:'#5BBFBF'}} />
          <span style={{fontFamily:'DM Mono,monospace',fontSize:'11px',color:'#5BBFBF',letterSpacing:'0.18em',textTransform:'uppercase'}}>Ready to Book?</span>
          <div style={{width:'24px',height:'1px',background:'#5BBFBF'}} />
        </div>
        <h2 className="reveal" style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:'clamp(2.4rem,5.5vw,4rem)',fontWeight:300,lineHeight:1.1,color:'#0D0F0F',marginBottom:'16px'}}>
          Let&apos;s Make Your Event <em style={{fontStyle:'italic',color:'#3A8F8F'}}>Unforgettable</em>
        </h2>
        <p className="reveal rd1" style={{fontSize:'15px',fontWeight:300,lineHeight:1.75,color:'#4A5050',marginBottom:'36px'}}>
          Tell us about your event and we&apos;ll send a custom estimate within 24 hours. A 50% deposit holds your date — availability is limited.
        </p>
        <div className="reveal rd2" style={{display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'center',gap:'12px',marginBottom:'20px'}}>
          <Link href="/get-a-quote" style={{
            display:'inline-flex',alignItems:'center',gap:'8px',
            background:'#0D0F0F',color:'white',
            fontSize:'14px',fontWeight:600,
            padding:'15px 32px',borderRadius:'999px',
            boxShadow:'0 4px 20px rgba(0,0,0,0.2)',
            transition:'all 0.2s',minHeight:'unset',
          }}
          onMouseEnter={e=>{e.currentTarget.style.background='#5BBFBF';e.currentTarget.style.color='#0D0F0F';e.currentTarget.style.transform='translateY(-2px)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='#0D0F0F';e.currentTarget.style.color='white';e.currentTarget.style.transform='translateY(0)';}}
          >
            Get Your Custom Estimate <ArrowRight size={15} />
          </Link>
          <Link href="tel:5202226142" style={{
            display:'inline-flex',alignItems:'center',gap:'8px',
            border:'1.5px solid #D4D8D8',color:'#0D0F0F',
            fontSize:'14px',fontWeight:400,
            padding:'14px 28px',borderRadius:'999px',
            transition:'all 0.2s',minHeight:'unset',
            background:'white',
          }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='#5BBFBF';e.currentTarget.style.color='#3A8F8F';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='#D4D8D8';e.currentTarget.style.color='#0D0F0F';}}
          >
            <Phone size={15} /> Call or Text Monica
          </Link>
        </div>
        <p className="reveal rd3" style={{fontSize:'13px',fontWeight:300,color:'#8A8F8F'}}>
          We respond within <strong style={{color:'#3A8F8F',fontWeight:500}}>a few hours</strong>. Zelle · Check · Cash accepted.
        </p>
      </div>
    </section>
  )
}
