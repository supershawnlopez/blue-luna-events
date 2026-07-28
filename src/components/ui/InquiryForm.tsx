'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ArrowRight, Phone, Mail, User, Calendar, MapPin, Clock, Users, Image as ImageIcon, X, Loader2 } from 'lucide-react'
import { INQUIRY_EVENT_TYPES, LOOKING_FOR_CATEGORIES, BUDGET_RANGES } from '@/lib/config'
import { submitLead } from '@/lib/actions'

const TEAL = '#5BBFBF'
const DARK = '#0D0F0F'
const MUTED = '#6B7280'
const BORDER = '#E5E7EB'
const WARM = '#F9FAFB'

type FormState = {
  name: string
  phone: string
  email: string
  eventType: string
  eventDate: string
  venue: string
  setupTime: string
  guestCount: string
  lookingFor: string[]
  vibe: string
  colors: string
  budget: string
  delivery: 'Yes' | 'No' | ''
}

const initialState: FormState = {
  name: '', phone: '', email: '',
  eventType: '', eventDate: '', venue: '', setupTime: '', guestCount: '',
  lookingFor: [], vibe: '', colors: '', budget: '', delivery: '',
}

function chip(active: boolean) {
  return {
    background: active ? TEAL : 'white',
    color: active ? DARK : MUTED,
    border: active ? `1.5px solid ${TEAL}` : `1.5px solid ${BORDER}`,
    borderRadius: '999px',
    padding: '9px 16px',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.85rem',
    fontWeight: active ? 700 : 400,
    transition: 'all 0.15s',
    whiteSpace: 'normal',
    textAlign: 'center',
    maxWidth: '100%',
  } as React.CSSProperties
}

function SectionLabel({ icon, children, optional }: { icon: React.ReactNode; children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
      {icon}{children}
      {optional && <span style={{ color: '#9CA3AF', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> (optional)</span>}
    </label>
  )
}

export default function InquiryForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [photos, setPhotos] = useState<{ url: string; uploading: boolean }[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(false)
  const [validationMsg, setValidationMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (done) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [done])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggleLookingFor(option: string) {
    setForm(prev => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(option)
        ? prev.lookingFor.filter(o => o !== option)
        : [...prev.lookingFor, option],
    }))
  }

  async function uploadOne(file: File): Promise<string | null> {
    try {
      const signRes = await fetch('/api/leads/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      })
      if (!signRes.ok) return null
      const { signedUrl, publicUrl } = await signRes.json()

      const ok = await new Promise<boolean>(resolve => {
        const xhr = new XMLHttpRequest()
        xhr.onload = () => resolve(xhr.status < 300)
        xhr.onerror = () => resolve(false)
        xhr.open('PUT', signedUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })
      return ok ? publicUrl : null
    } catch {
      return null
    }
  }

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter(f => f.type.startsWith('image/')).slice(0, 6 - photos.length)
    if (files.length === 0) return
    e.target.value = ''

    const placeholders = files.map(f => ({ url: URL.createObjectURL(f), uploading: true }))
    setPhotos(prev => [...prev, ...placeholders].slice(0, 6))

    // Each file uploads directly to Supabase Storage via its own signed URL —
    // avoids Vercel's serverless request-body size limit, which silently
    // dropped photos when several full-size phone photos went in one request.
    await Promise.all(placeholders.map(async (placeholder, i) => {
      const publicUrl = await uploadOne(files[i])
      setPhotos(prev => prev
        .map(p => p === placeholder ? (publicUrl ? { url: publicUrl, uploading: false } : null) : p)
        .filter((p): p is { url: string; uploading: boolean } => p !== null))
    }))
  }

  function removePhoto(url: string) {
    setPhotos(prev => prev.filter(p => p.url !== url))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const missing =
      !form.name.trim() ? 'your full name' :
      !form.phone.trim() ? 'your phone number' :
      !form.email.trim() ? 'your email' :
      !form.eventType ? "what you're celebrating, above" :
      !form.vibe.trim() ? 'the vibe or theme' :
      !form.budget ? 'a budget range, below' :
      null

    if (missing) {
      setValidationMsg(`Please fill in ${missing} before sending.`)
      return
    }
    setValidationMsg(null)

    setLoading(true)
    setError(false)

    const eventTypeLabel = INQUIRY_EVENT_TYPES.find(t => t.id === form.eventType)?.label ?? form.eventType
    const visionParts = [form.vibe.trim(), form.colors.trim() ? `Colors/inspo: ${form.colors.trim()}` : ''].filter(Boolean)

    const result = await submitLead({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      event_type: eventTypeLabel,
      event_date: form.eventDate || undefined,
      venue: form.venue.trim() || undefined,
      vision: visionParts.join(' — '),
      budget_range: form.budget,
      guest_count: form.guestCount.trim() || undefined,
      setup_time: form.setupTime.trim() || undefined,
      looking_for: form.lookingFor.length ? form.lookingFor : undefined,
      inspo_photos: photos.filter(p => !p.uploading).map(p => p.url),
      source: 'inquiry',
    })

    setLoading(false)
    if (!result.success) { setError(true); return }
    setDone(true)
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(91,191,191,0.12)', border: `2px solid ${TEAL}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Check size={32} color={TEAL} />
        </div>
        <h2 className="font-display" style={{ fontSize: '2.2rem', fontWeight: 300, color: DARK, marginBottom: 12 }}>
          You&apos;re on Monica&apos;s radar! 🌙
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 300, color: MUTED, lineHeight: 1.7 }}>
          Thank you for sharing your vision. Monica personally reviews every request and will reach out as soon as possible to talk pricing and next steps. Check your email — a confirmation is on its way.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 40 }}>

      {/* Contact Info */}
      <div>
        <p className="eyebrow-text" style={{ marginBottom: 16 }}>Your Information</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <SectionLabel icon={<User size={12} />}>Full Name</SectionLabel>
            <input className="input-field" placeholder="Your full name" required value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <SectionLabel icon={<Phone size={12} />}>Cell Phone</SectionLabel>
              <input className="input-field" type="tel" placeholder="(520) 555-0100" required value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <SectionLabel icon={<Mail size={12} />}>Email</SectionLabel>
              <input className="input-field" type="email" placeholder="you@email.com" required value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Event Type */}
      <div>
        <p className="eyebrow-text" style={{ marginBottom: 16 }}>What are you celebrating?</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {INQUIRY_EVENT_TYPES.map(t => (
            <button key={t.id} type="button" onClick={() => set('eventType', t.id)} style={chip(form.eventType === t.id)}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date + Venue */}
      <div>
        <p className="eyebrow-text" style={{ marginBottom: 16 }}>When & Where</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <SectionLabel icon={<Calendar size={12} />}>Event Date</SectionLabel>
            <input className="input-field" type="date" value={form.eventDate} onChange={e => set('eventDate', e.target.value)} />
          </div>
          <div>
            <SectionLabel icon={<MapPin size={12} />} optional>Venue Name or Address</SectionLabel>
            <input className="input-field" placeholder="Venue name or address" value={form.venue} onChange={e => set('venue', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <SectionLabel icon={<Clock size={12} />} optional>Setup Time</SectionLabel>
              <input className="input-field" placeholder="e.g. Anytime after 2 PM" value={form.setupTime} onChange={e => set('setupTime', e.target.value)} />
            </div>
            <div>
              <SectionLabel icon={<Users size={12} />} optional>Guest Count</SectionLabel>
              <input className="input-field" type="number" inputMode="numeric" min={1} placeholder="70" value={form.guestCount} onChange={e => set('guestCount', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Looking For */}
      <div>
        <p className="eyebrow-text" style={{ marginBottom: 4 }}>What Are You Looking For?</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: MUTED, marginBottom: 18 }}>Tap anything that catches your eye — not sure what something is? Skip it, Monica will explain.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {LOOKING_FOR_CATEGORIES.map(cat => (
            <div key={cat.label}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: DARK, marginBottom: 10 }}>{cat.emoji} {cat.label}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {cat.options.map(opt => (
                  <button key={opt} type="button" onClick={() => toggleLookingFor(opt)} style={chip(form.lookingFor.includes(opt))}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vibe & Colors */}
      <div>
        <p className="eyebrow-text" style={{ marginBottom: 16 }}>Your Vision</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <SectionLabel icon={<span>✨</span>}>Describe the Vibe or Theme</SectionLabel>
            <textarea
              className="input-field"
              style={{ resize: 'vertical', lineHeight: 1.5 }}
              rows={3}
              placeholder="e.g. Soft and dreamy, bold and colorful, elegant white & gold..."
              required
              value={form.vibe}
              onChange={e => set('vibe', e.target.value)}
            />
          </div>
          <div>
            <SectionLabel icon={<span>🎨</span>} optional>Colors, Pinterest Inspo, or Mood</SectionLabel>
            <textarea
              className="input-field"
              style={{ resize: 'vertical', lineHeight: 1.5 }}
              rows={2}
              placeholder="Rose gold, peach, maroon..."
              value={form.colors}
              onChange={e => set('colors', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Photo upload */}
      <div>
        <SectionLabel icon={<ImageIcon size={12} />} optional>Upload Any Photos or Inspiration</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {photos.map(p => (
            <div key={p.url} style={{ position: 'relative', width: 84, height: 84, borderRadius: 12, overflow: 'hidden', border: `1.5px solid ${BORDER}` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: p.uploading ? 0.5 : 1 }} />
              {p.uploading && <Loader2 size={18} color={TEAL} className="animate-spin" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />}
              {!p.uploading && (
                <button type="button" onClick={() => removePhoto(p.url)} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(13,15,15,0.7)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={11} color="white" />
                </button>
              )}
            </div>
          ))}
          {photos.length < 6 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{ width: 84, height: 84, borderRadius: 12, border: `1.5px dashed ${BORDER}`, background: WARM, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}
            >
              <ImageIcon size={18} color={MUTED} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: MUTED }}>Add photo</span>
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handlePhotoSelect} />
      </div>

      {/* Budget */}
      <div>
        <p className="eyebrow-text" style={{ marginBottom: 4 }}>Do You Have a Budget in Mind?</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: MUTED, marginBottom: 14 }}>This just helps Monica tailor your quote — no payment happens here.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {BUDGET_RANGES.map(b => (
            <button key={b} type="button" onClick={() => set('budget', b)} style={chip(form.budget === b)}>{b}</button>
          ))}
        </div>
      </div>

      {/* Delivery */}
      <div>
        <p className="eyebrow-text" style={{ marginBottom: 14 }}>
          Will You Need Delivery & Setup?
          <span style={{ color: '#9CA3AF', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> (optional)</span>
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['Yes', 'No'] as const).map(v => (
            <button key={v} type="button" onClick={() => set('delivery', v)} style={chip(form.delivery === v)}>{v}</button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 17, background: loading ? '#9CA3AF' : TEAL, color: DARK, border: 'none', borderRadius: 14, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: loading ? 'none' : '0 4px 20px rgba(91,191,191,0.4)', transition: 'all 0.2s' }}
        >
          {loading ? 'Sending...' : <><span>Send My Info to Monica</span><ArrowRight size={16} /></>}
        </button>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#9CA3AF', textAlign: 'center', lineHeight: 1.5, marginTop: 10 }}>
          No payment now. Monica reviews every request personally and reaches out to talk pricing.
        </p>
        {validationMsg && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#B45309', textAlign: 'center', marginTop: 10 }}>
            {validationMsg}
          </p>
        )}
        {error && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#EF4444', textAlign: 'center', marginTop: 10 }}>
            Something went wrong — please try again or call Monica at (520) 222-6142.
          </p>
        )}
      </div>
    </form>
  )
}
