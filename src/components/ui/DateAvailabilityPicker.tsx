'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

const TEAL = '#5BBFBF'
const DARK = '#0D0F0F'
const MUTED = '#6B7280'
const BORDER = '#E5E7EB'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const WEEKDAY_LABELS = ['S','M','T','W','T','F','S']

function toDateOnly(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDisplay(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export default function DateAvailabilityPicker({ value, onChange }: { value: string; onChange: (date: string) => void }) {
  const [open, setOpen] = useState(false)
  const [unavailable, setUnavailable] = useState<Set<string> | null>(null)
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d })

  useEffect(() => {
    fetch('/api/availability')
      .then(r => r.ok ? r.json() : null)
      .then(d => setUnavailable(new Set(d?.unavailable ?? [])))
      .catch(() => setUnavailable(new Set()))
  }, [])

  const todayStr = toDateOnly(new Date())
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = useMemo(() => [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toDateOnly(new Date(year, month, i + 1))),
  ], [year, month, firstDayOfWeek, daysInMonth])

  const canGoBack = !(year === new Date().getFullYear() && month === new Date().getMonth())

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="input-field"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ color: value ? DARK : '#9CA3AF' }}>{value ? formatDisplay(value) : 'Select a date'}</span>
        <Calendar size={16} color={MUTED} />
      </button>

      {open && (
        <div style={{ marginTop: 10, border: `1.5px solid ${BORDER}`, borderRadius: 16, padding: 16, background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button type="button" disabled={!canGoBack} onClick={() => setCursor(new Date(year, month - 1, 1))}
              style={{ background: '#F9FAFB', border: `1px solid ${BORDER}`, borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canGoBack ? 'pointer' : 'default', opacity: canGoBack ? 1 : 0.3 }}>
              <ChevronLeft size={14} color={DARK} />
            </button>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: DARK, margin: 0 }}>{MONTH_NAMES[month]} {year}</p>
            <button type="button" onClick={() => setCursor(new Date(year, month + 1, 1))}
              style={{ background: '#F9FAFB', border: `1px solid ${BORDER}`, borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ChevronRight size={14} color={DARK} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 3 }}>
            {WEEKDAY_LABELS.map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: '0.62rem', fontWeight: 700, color: '#9CA3AF', padding: '2px 0' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
            {cells.map((dateStr, i) => {
              if (!dateStr) return <div key={i} />
              const day = Number(dateStr.slice(-2))
              const past = dateStr < todayStr
              const isUnavailable = unavailable?.has(dateStr) ?? false
              const disabled = past || isUnavailable || unavailable === null
              const selected = dateStr === value
              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={disabled}
                  onClick={() => { onChange(dateStr); setOpen(false) }}
                  style={{
                    aspectRatio: '1/1',
                    borderRadius: 8,
                    border: selected ? `1.5px solid ${TEAL}` : '1px solid transparent',
                    background: selected ? TEAL : disabled ? '#F3F4F6' : '#F9FAFB',
                    color: selected ? DARK : disabled ? '#D1D5DB' : DARK,
                    fontSize: '0.72rem',
                    fontWeight: selected ? 700 : 500,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    textDecoration: isUnavailable && !past ? 'line-through' : 'none',
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F3F4F6', border: '1px solid #D1D5DB' }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: MUTED }}>Already booked — pick another date</span>
          </div>
        </div>
      )}
    </div>
  )
}
