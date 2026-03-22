'use client'

import { EVENT_TYPES } from '@/lib/config'

export default function Marquee() {
  const doubled = [...EVENT_TYPES, ...EVENT_TYPES]

  return (
    <div className="py-16 bg-[#0D0F0F] overflow-hidden">
      <p className="font-mono text-[10px] text-white/30 tracking-[0.25em] uppercase text-center mb-9">
        Events We Style
      </p>
      <div
        className="flex w-max"
        style={{animation: 'scrollLeft 30s linear infinite'}}
        onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
        onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
      >
        {doubled.map((name, i) => (
          <div key={i} className="flex items-center gap-6 px-9 border-r border-white/7">
            <span className="font-display text-2xl font-light italic text-white/50 whitespace-nowrap hover:text-teal transition-colors duration-300 cursor-default">
              {name}
            </span>
            <div className="w-1 h-1 rounded-full bg-teal opacity-40" />
          </div>
        ))}
      </div>
    </div>
  )
}
