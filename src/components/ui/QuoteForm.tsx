'use client'

import { useState } from 'react'
import { submitLead } from '@/lib/actions'
import { ArrowRight, CheckCircle } from 'lucide-react'

const EVENT_TYPES = [
  'Quinceañera', 'Wedding', 'Birthday', 'Baby Shower',
  'Bridal Shower', 'Graduation', 'Corporate Event',
  'Sweet 16', 'School Event', 'Other'
]

const BUDGETS = [
  'Under $500', '$500 – $1,000', '$1,000 – $1,500',
  '$1,500 – $2,500', '$2,500+'
]

export default function QuoteForm() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      event_type: (form.elements.namedItem('event_type') as HTMLSelectElement).value,
      event_date: (form.elements.namedItem('event_date') as HTMLInputElement).value,
      venue: (form.elements.namedItem('venue') as HTMLInputElement).value,
      vision: (form.elements.namedItem('vision') as HTMLTextAreaElement).value,
      budget_range: (form.elements.namedItem('budget_range') as HTMLSelectElement).value,
    }

    const result = await submitLead(data)

    if (result.success) {
      setSubmitted(true)
    } else {
      setError('Something went wrong. Please text Monica directly at (520) 222-6142.')
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle className="text-teal mb-6" size={56} />
        <h3 className="font-display text-4xl font-light text-[#0D0F0F] mb-4">
          You&apos;re on our radar! 🌙
        </h3>
        <p className="text-base font-light text-[#4A5050] max-w-md">
          Monica will reach out within a few hours with your custom estimate.
          Keep an eye on your phone and email. Can&apos;t wait to make your event beautiful!
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="font-mono text-[10px] text-[#8A8F8F] tracking-[0.15em] uppercase block mb-2">Full Name *</label>
          <input name="name" required placeholder="Maria Hernandez"
            className="w-full bg-white border border-[#D4D8D8] rounded-xl px-4 py-3.5 text-sm font-light text-[#0D0F0F] placeholder-[#AAAAAA] focus:outline-none focus:border-teal transition-colors" />
        </div>
        <div>
          <label className="font-mono text-[10px] text-[#8A8F8F] tracking-[0.15em] uppercase block mb-2">Phone *</label>
          <input name="phone" required type="tel" placeholder="(520) 555-0100"
            className="w-full bg-white border border-[#D4D8D8] rounded-xl px-4 py-3.5 text-sm font-light text-[#0D0F0F] placeholder-[#AAAAAA] focus:outline-none focus:border-teal transition-colors" />
        </div>
      </div>

      <div>
        <label className="font-mono text-[10px] text-[#8A8F8F] tracking-[0.15em] uppercase block mb-2">Email *</label>
        <input name="email" required type="email" placeholder="maria@email.com"
          className="w-full bg-white border border-[#D4D8D8] rounded-xl px-4 py-3.5 text-sm font-light text-[#0D0F0F] placeholder-[#AAAAAA] focus:outline-none focus:border-teal transition-colors" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="font-mono text-[10px] text-[#8A8F8F] tracking-[0.15em] uppercase block mb-2">Event Type *</label>
          <select name="event_type" required
            className="w-full bg-white border border-[#D4D8D8] rounded-xl px-4 py-3.5 text-sm font-light text-[#0D0F0F] focus:outline-none focus:border-teal transition-colors appearance-none">
            <option value="">Select event type</option>
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="font-mono text-[10px] text-[#8A8F8F] tracking-[0.15em] uppercase block mb-2">Event Date</label>
          <input name="event_date" type="date"
            className="w-full bg-white border border-[#D4D8D8] rounded-xl px-4 py-3.5 text-sm font-light text-[#0D0F0F] focus:outline-none focus:border-teal transition-colors" />
        </div>
      </div>

      <div>
        <label className="font-mono text-[10px] text-[#8A8F8F] tracking-[0.15em] uppercase block mb-2">Venue / Location</label>
        <input name="venue" placeholder="Hacienda del Sol, Oro Valley..."
          className="w-full bg-white border border-[#D4D8D8] rounded-xl px-4 py-3.5 text-sm font-light text-[#0D0F0F] placeholder-[#AAAAAA] focus:outline-none focus:border-teal transition-colors" />
      </div>

      <div>
        <label className="font-mono text-[10px] text-[#8A8F8F] tracking-[0.15em] uppercase block mb-2">Budget Range</label>
        <select name="budget_range"
          className="w-full bg-white border border-[#D4D8D8] rounded-xl px-4 py-3.5 text-sm font-light text-[#0D0F0F] focus:outline-none focus:border-teal transition-colors appearance-none">
          <option value="">Select a range</option>
          {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div>
        <label className="font-mono text-[10px] text-[#8A8F8F] tracking-[0.15em] uppercase block mb-2">Tell Us Your Vision</label>
        <textarea name="vision" rows={4}
          placeholder="Colors, theme, vibe — the more you share, the better we can tailor your estimate..."
          className="w-full bg-white border border-[#D4D8D8] rounded-xl px-4 py-3.5 text-sm font-light text-[#0D0F0F] placeholder-[#AAAAAA] focus:outline-none focus:border-teal transition-colors resize-none" />
      </div>

      {error && (
        <p className="text-sm text-red-500 font-light">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-3 bg-[#0D0F0F] text-white text-sm font-medium tracking-wide uppercase py-4 rounded-full transition-all duration-300 hover:bg-teal hover:text-[#0D0F0F] hover:-translate-y-0.5 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending...' : 'Send My Quote Request'}
        {!loading && <ArrowRight size={14} />}
      </button>

      <p className="text-xs font-light text-[#8A8F8F] text-center">
        We respond within a few hours. Your info stays private — no spam, ever.
      </p>
    </form>
  )
}
