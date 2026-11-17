'use client'

import { useRef, useState, type ReactNode } from 'react'

const ACTION_WIDTH = 88

// iPhone-style swipe-left-to-reveal row (Shawn, 2026-11-17: replaces the
// trash can that sat on every estimate row). Swipe left to show the action,
// swipe right or tap the row to close it. Only one row is open at a time —
// the parent passes `open` / `onOpenChange`.
export default function SwipeRow({
  children,
  actionLabel,
  actionBusyLabel,
  busy,
  onAction,
  open,
  onOpenChange,
}: {
  children: ReactNode
  actionLabel: string
  actionBusyLabel?: string
  busy?: boolean
  onAction: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const start = useRef<{ x: number; y: number; base: number } | null>(null)
  const horizontal = useRef<boolean | null>(null)
  const moved = useRef(false)
  const [drag, setDrag] = useState<number | null>(null)

  const offset = drag ?? (open ? -ACTION_WIDTH : 0)

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0]
    start.current = { x: t.clientX, y: t.clientY, base: open ? -ACTION_WIDTH : 0 }
    horizontal.current = null
    moved.current = false
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!start.current) return
    const t = e.touches[0]
    const dx = t.clientX - start.current.x
    const dy = t.clientY - start.current.y
    if (horizontal.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      horizontal.current = Math.abs(dx) > Math.abs(dy)
    }
    if (!horizontal.current) return
    moved.current = true
    setDrag(Math.max(-ACTION_WIDTH - 24, Math.min(0, start.current.base + dx)))
  }

  function onTouchEnd() {
    if (drag !== null) onOpenChange(drag < -ACTION_WIDTH / 2)
    setDrag(null)
    start.current = null
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <button
        type="button"
        onClick={onAction}
        disabled={busy}
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: ACTION_WIDTH,
          background: '#E5484D', color: 'white', border: 'none',
          fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
        }}
      >
        {busy ? actionBusyLabel ?? actionLabel : actionLabel}
      </button>
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClickCapture={e => {
          // A swipe, or a tap while open, should never also open the estimate.
          if (moved.current || open) {
            e.preventDefault()
            e.stopPropagation()
            if (open && !moved.current) onOpenChange(false)
          }
          moved.current = false
        }}
        style={{
          position: 'relative', background: '#0D0F0F', touchAction: 'pan-y',
          transform: `translateX(${offset}px)`,
          transition: drag === null ? 'transform 0.22s ease' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}
