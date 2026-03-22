'use client'

import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default function UrgencyBanner() {
  return (
    <div style={{
      background: '#5BBFBF',
      padding: '14px clamp(20px,5vw,48px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      flexWrap: 'wrap',
      textAlign: 'center',
    }}>
      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
        <GraduationCap size={16} color="#0D0F0F" />
        <span style={{fontFamily:'Inter,sans-serif',fontSize:'0.82rem',fontWeight:500,color:'#0D0F0F'}}>
          <strong>Graduation season is filling fast.</strong> May &amp; June dates going quickly —
        </span>
      </div>
      <Link href="/get-a-quote" style={{
        fontFamily:'Inter,sans-serif',
        fontSize:'0.75rem',fontWeight:600,color:'#0D0F0F',
        border:'1.5px solid rgba(13,15,15,0.35)',
        borderRadius:'999px',padding:'6px 16px',
        textDecoration:'none',whiteSpace:'nowrap',
        transition:'all 0.2s',
      }}>
        Reserve Your Date →
      </Link>
    </div>
  )
}
