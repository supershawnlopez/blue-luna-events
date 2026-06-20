'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Moon } from 'lucide-react'

export default function StudioLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/studio/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/studio')
    } else {
      setError('Wrong password. Try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: '#0D0F0F',
      position: 'relative',
    }}>
      {/* Ambient */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translateX(-50%)',
        width: '400px', height: '300px',
        background: 'radial-gradient(circle, rgba(91,191,191,0.08) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '360px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '18px',
            background: 'rgba(91,191,191,0.12)',
            border: '1.5px solid rgba(91,191,191,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Moon size={24} color="#5BBFBF" />
          </div>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', color: '#5BBFBF', textTransform: 'uppercase', marginBottom: '6px' }}>
            Blue Luna Events
          </p>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 600, color: 'white', letterSpacing: '-0.02em' }}>
            Studio
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
            Monica&apos;s private workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type={show ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: error ? '1.5px solid rgba(239,68,68,0.6)' : '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                padding: '16px 50px 16px 18px',
                fontSize: '1rem',
                color: 'white',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { if (!error) e.target.style.borderColor = 'rgba(91,191,191,0.5)' }}
              onBlur={e => { if (!error) e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              style={{
                position: 'absolute', right: '16px', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.4)', padding: '4px',
                display: 'flex', alignItems: 'center',
              }}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p style={{ fontSize: '0.8rem', color: 'rgba(239,68,68,0.8)', textAlign: 'center', margin: '0' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%', padding: '16px',
              background: loading || !password ? 'rgba(91,191,191,0.3)' : '#5BBFBF',
              color: loading || !password ? 'rgba(255,255,255,0.4)' : '#0D0F0F',
              border: 'none', borderRadius: '14px', cursor: loading || !password ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem', fontWeight: 700,
              transition: 'all 0.2s',
              boxShadow: loading || !password ? 'none' : '0 4px 20px rgba(91,191,191,0.3)',
            }}
          >
            {loading ? 'Signing in…' : 'Enter Studio'}
          </button>
        </form>
      </div>
    </div>
  )
}
