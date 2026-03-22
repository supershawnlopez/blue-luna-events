'use client'

import Link from 'next/link'
import { GraduationCap, ArrowRight } from 'lucide-react'

export default function UrgencyBanner() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0D0F0F 0%, #1C2222 100%)',
      borderTop: '1px solid rgba(91,191,191,0.2)',
      borderBottom: '1px solid rgba(91,191,191,0.2)',
      padding: '14px 20px',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '12px', flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(91,191,191,0.12)',
          border: '1px solid rgba(91,191,191,0.25)',
          borderRadius: '999px', padding: '5px 12px',
        }}>
          <GraduationCap size={14} color="#5BBFBF" />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#5BBFBF', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            Graduation 2026
          </span>
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 400, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
          <strong style={{ fontWeight: 600, color: 'white' }}>May & June dates filling fast</strong> — don&apos;t miss your window
        </p>
        <Link href="/get-a-quote" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#5BBFBF', color: '#0D0F0F',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.78rem', fontWeight: 700,
          padding: '8px 18px', borderRadius: '999px',
          textDecoration: 'none', whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(91,191,191,0.4)',
          animation: 'pulse-teal 2.5s ease-in-out infinite',
        }}>
          Reserve Your Date <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  )
}
