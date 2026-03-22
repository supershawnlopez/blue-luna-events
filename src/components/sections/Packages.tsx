'use client'

import Link from 'next/link'
import { PACKAGES } from '@/lib/config'
import { Check } from 'lucide-react'

export default function Packages() {
  return (
    <section id="packages" className="py-28 bg-[#FDFCFA]">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-16 reveal">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-6 h-px bg-teal" />
              <span className="font-mono text-[11px] text-teal tracking-[0.2em] uppercase">Transparent Pricing</span>
            </div>
            <h2 className="font-display text-5xl font-light leading-[1.1] text-[#0D0F0F]">
              Choose Your <em className="italic text-[#3A8F8F]">Experience</em>
            </h2>
          </div>
          <p className="text-base font-light leading-[1.75] text-[#4A5050] max-w-lg">
            Every package includes professional installation and on-site styling. Not sure which fits? We build custom — just reach out.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PACKAGES.map((pkg, i) => (
            <div
              key={pkg.name}
              className={`bg-white rounded-[20px] overflow-hidden border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer reveal rd${i + 1} ${
                pkg.color === 'teal'
                  ? 'border-teal shadow-[0_8px_40px_rgba(91,191,191,0.18)]'
                  : 'border-[#D4D8D8] hover:border-teal'
              }`}
            >
              {/* Color bar */}
              <div className={`h-1 w-full ${
                pkg.color === 'teal' ? 'bg-gradient-to-r from-teal to-[#8DD4D4]' :
                pkg.color === 'gold' ? 'bg-gradient-to-r from-[#C9A96E] to-[#E8CCA0]' :
                'bg-gradient-to-r from-[#D4D8D8] to-[#C8D0D0]'
              }`} />

              <div className="p-8">
                {pkg.badge && (
                  <span className="inline-block bg-teal text-[#0D0F0F] font-mono text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-full mb-3">
                    {pkg.badge}
                  </span>
                )}

                <p className="font-mono text-[10px] text-[#8A8F8F] tracking-[0.18em] uppercase mb-1.5">{pkg.tier}</p>
                <h3 className="font-display text-3xl font-light text-[#0D0F0F] mb-1">{pkg.name}</h3>
                <p className="text-sm font-light text-[#8A8F8F] leading-snug mb-6">{pkg.tagline}</p>

                <div className="flex items-baseline gap-1.5 mb-6 pb-5 border-b border-[#D4D8D8]">
                  <span className="text-xs text-[#8A8F8F]">from</span>
                  <span className="font-display text-5xl font-semibold text-[#0D0F0F] leading-none">{pkg.price}</span>
                  <span className="text-xs text-[#8A8F8F] self-end pb-1">{pkg.priceNote}</span>
                </div>

                <ul className="space-y-0 mb-8">
                  {pkg.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 py-2 border-b border-black/5 last:border-0">
                      <Check
                        size={15}
                        className={`mt-0.5 flex-shrink-0 ${pkg.color === 'gold' ? 'text-[#C9A96E]' : 'text-teal'}`}
                      />
                      <span className="text-sm font-light text-[#3A4040] leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/get-a-quote"
                  className={`block text-center py-3.5 rounded-full text-sm font-medium tracking-wide uppercase transition-all duration-200 ${
                    pkg.ctaStyle === 'solid'
                      ? 'bg-teal text-[#0D0F0F] hover:bg-[#3A8F8F] hover:text-white hover:-translate-y-0.5 shadow-lg shadow-teal/25'
                      : pkg.ctaStyle === 'gold'
                      ? 'bg-gradient-to-r from-[#C9A96E] to-[#E8CCA0] text-[#0D0F0F] hover:-translate-y-0.5 shadow-lg shadow-[#C9A96E]/25'
                      : 'border border-[#D4D8D8] text-[#0D0F0F] hover:border-teal hover:text-teal'
                  }`}
                >
                  {pkg.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center mt-8 text-sm font-light text-[#8A8F8F] reveal">
          All packages include a custom estimate —{' '}
          <Link href="/get-a-quote" className="text-[#3A8F8F] border-b border-transparent hover:border-[#3A8F8F] transition-colors">
            contact us
          </Link>{' '}
          for exact pricing based on your event, venue &amp; vision.{' '}
          <strong className="text-[#0D0F0F] font-medium">Zelle · Check · Cash accepted.</strong>
        </p>
      </div>
    </section>
  )
}
