'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, X, Ban } from 'lucide-react'
import StudioNav from '@/components/studio/StudioNav'

type Booked = { date: string; clientName: string; eventType: string | null; estimateId: string }
type Blocked = { id: string; startDate: string; endDate: string; reason: string | null }

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const WEEKDAY_LABELS = ['S','M','T','W','T','F','S']

function toDateOnly(d: Date) { return d.toISOString().slice(0, 10) }
function isPast(dateStr: string, todayStr: string) { return dateStr < todayStr }

export default function StudioSchedule() {
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [booked, setBooked] = useState<Booked[]>([])
  const [blocked, setBlocked] = useState<Blocked[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [blockReason, setBlockReason] = useState('')
  const [blockEndDate, setBlockEndDate] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)

  const todayStr = toDateOnly(new Date())

  function load() {
    setLoading(true)
    fetch('/api/studio/availability')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setBooked(d.booked); setBlocked(d.blocked) } })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const bookedByDate = useMemo(() => {
    const m = new Map<string, Booked>()
    booked.forEach(b => m.set(b.date, b))
    return m
  }, [booked])

  const blockedDateSet = useMemo(() => {
    const set = new Map<string, Blocked>()
    blocked.forEach(b => {
      const cur = new Date(b.startDate + 'T00:00:00')
      const end = new Date(b.endDate + 'T00:00:00')
      while (cur.getTime() <= end.getTime()) {
        set.set(toDateOnly(cur), b)
        cur.setDate(cur.getDate() + 1)
      }
    })
    return set
  }, [blocked])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toDateOnly(new Date(year, month, i + 1))),
  ]

  async function submitBlock() {
    if (!selectedDate) return
    setSaving(true)
    const res = await fetch('/api/studio/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start_date: selectedDate, end_date: blockEndDate || selectedDate, reason: blockReason.trim() || null }),
    })
    setSaving(false)
    if (res.ok) {
      setSelectedDate(null); setBlockReason(''); setBlockEndDate(null)
      load()
    }
  }

  async function removeBlock(id: string) {
    setConfirmRemoveId(null)
    setBlocked(prev => prev.filter(b => b.id !== id))
    await fetch(`/api/studio/availability/${id}`, { method: 'DELETE' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F0F', paddingBottom: '120px' }}>

      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 24px) 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.22em', color: '#5BBFBF', textTransform: 'uppercase', margin: '0 0 4px' }}>Blue Luna Studio</p>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', margin: 0, letterSpacing: '-0.01em' }}>Schedule</h1>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 20px 0' }}>

        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={16} color="white" />
          </button>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'white', margin: 0 }}>{MONTH_NAMES[month]} {year}</p>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronRight size={16} color="white" />
          </button>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
          {[{ color: '#5BBFBF', label: 'Booked' }, { color: '#F59E0B', label: 'Blocked' }].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color }} />
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Weekday header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '4px' }}>
          {WEEKDAY_LABELS.map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.25)', padding: '4px 0' }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '28px' }}>
          {cells.map((dateStr, i) => {
            if (!dateStr) return <div key={i} />
            const day = Number(dateStr.slice(-2))
            const bookedItem = bookedByDate.get(dateStr)
            const blockedItem = blockedDateSet.get(dateStr)
            const past = isPast(dateStr, todayStr)
            const isToday = dateStr === todayStr
            const bg = bookedItem ? 'rgba(91,191,191,0.16)' : blockedItem ? 'rgba(245,158,11,0.14)' : 'rgba(255,255,255,0.03)'
            const border = isToday ? '1.5px solid #5BBFBF' : bookedItem ? '1px solid rgba(91,191,191,0.35)' : blockedItem ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.05)'

            const content = (
              <div style={{ aspectRatio: '1/1', borderRadius: '10px', background: bg, border, opacity: past ? 0.3 : 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: past ? 'default' : 'pointer' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: isToday ? 800 : 600, color: 'white' }}>{day}</span>
              </div>
            )

            if (past) return <div key={dateStr}>{content}</div>

            if (bookedItem) {
              return <Link key={dateStr} href={`/studio/estimates/${bookedItem.estimateId}`} style={{ display: 'block' }}>{content}</Link>
            }
            if (blockedItem) {
              return <button key={dateStr} onClick={() => setConfirmRemoveId(blockedItem.id)} style={{ background: 'none', border: 'none', padding: 0, width: '100%' }}>{content}</button>
            }
            return <button key={dateStr} onClick={() => setSelectedDate(dateStr)} style={{ background: 'none', border: 'none', padding: 0, width: '100%' }}>{content}</button>
          })}
        </div>

        {/* Upcoming blocks list */}
        {!loading && blocked.length > 0 && (
          <>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: '0 0 14px' }}>Blocked Dates</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {blocked.map(b => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px 16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Ban size={16} color="#F59E0B" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.86rem', fontWeight: 600, color: 'white', margin: '0 0 2px' }}>
                      {b.startDate === b.endDate ? b.startDate : `${b.startDate} → ${b.endDate}`}
                    </p>
                    <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{b.reason || 'Unavailable'}</p>
                  </div>
                  <button onClick={() => setConfirmRemoveId(b.id)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex' }}>
                    <X size={14} color="rgba(255,255,255,0.5)" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Block-a-date sheet */}
      {selectedDate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} onClick={() => { setSelectedDate(null); setBlockReason(''); setBlockEndDate(null) }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#161616', borderRadius: '24px 24px 0 0', padding: '20px 20px env(safe-area-inset-bottom, 32px)' }}>
            <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px', margin: '0 auto 20px' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 6px' }}>Block this date?</p>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', margin: '0 0 20px' }}>{selectedDate}</p>

            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
              Through (optional, for a multi-day block)
            </label>
            <input
              type="date"
              min={selectedDate}
              value={blockEndDate ?? ''}
              onChange={e => setBlockEndDate(e.target.value || null)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 14px', color: 'white', fontSize: '0.85rem', marginBottom: '14px', colorScheme: 'dark' }}
            />

            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
              Reason (optional)
            </label>
            <input
              placeholder="e.g. Personal day, already booked elsewhere"
              value={blockReason}
              onChange={e => setBlockReason(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 14px', color: 'white', fontSize: '0.85rem', marginBottom: '20px' }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setSelectedDate(null); setBlockReason(''); setBlockEndDate(null) }} style={{ flex: 1, padding: '15px 0', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={submitBlock} disabled={saving} style={{ flex: 1, padding: '15px 0', borderRadius: '12px', border: 'none', background: '#5BBFBF', color: '#0D0F0F', fontSize: '0.9rem', fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving…' : 'Block Date'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove-block confirm */}
      {confirmRemoveId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} onClick={() => setConfirmRemoveId(null)} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#161616', borderRadius: '24px 24px 0 0', padding: '28px 24px env(safe-area-inset-bottom, 32px)' }}>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 24px' }}>Remove this block? The date opens back up.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setConfirmRemoveId(null)} style={{ flex: 1, padding: '15px 0', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => removeBlock(confirmRemoveId)} style={{ flex: 1, padding: '15px 0', borderRadius: '12px', border: 'none', background: '#F59E0B', color: '#0D0F0F', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      <StudioNav />
    </div>
  )
}
