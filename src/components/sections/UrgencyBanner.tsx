'use client'

import Link from 'next/link'

export default function UrgencyBanner() {
  return (
    <div className="bg-teal px-6 py-3.5 flex items-center justify-center gap-4 flex-wrap text-center">
      <span className="text-sm font-medium text-[#0D0F0F] tracking-wide">
        🎓 <strong>Graduation season is filling fast.</strong> May &amp; June dates going quickly —
      </span>
      <Link
        href="/get-a-quote"
        className="text-xs font-semibold text-[#0D0F0F] border border-[#0D0F0F]/35 rounded-full px-4 py-1.5 whitespace-nowrap hover:bg-[#0D0F0F]/10 transition-all"
      >
        Reserve Your Date →
      </Link>
    </div>
  )
}
