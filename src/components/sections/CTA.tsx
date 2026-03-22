import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/config'

export default function CTA() {
  return (
    <section id="contact" className="py-32 bg-[#FDFCFA] text-center">
      <div className="max-w-2xl mx-auto px-6">
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="w-6 h-px bg-teal" />
          <span className="font-mono text-[11px] text-teal tracking-[0.2em] uppercase">Ready to Book?</span>
          <div className="w-6 h-px bg-teal" />
        </div>

        <h2 className="font-display text-5xl md:text-6xl font-light leading-[1.1] text-[#0D0F0F] mb-5 reveal">
          Let&apos;s Make Your Event <em className="italic text-[#3A8F8F]">Unforgettable</em>
        </h2>

        <p className="text-base font-light leading-[1.75] text-[#4A5050] mb-12 reveal rd1">
          Tell us about your event and we&apos;ll send a custom estimate within 24 hours.
          A 50% deposit holds your date — availability is limited.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 reveal rd2">
          <Link
            href="/get-a-quote"
            className="inline-flex items-center gap-3 bg-[#0D0F0F] text-white text-sm font-medium tracking-wide uppercase px-10 py-4 rounded-full transition-all duration-300 hover:bg-teal hover:text-[#0D0F0F] hover:-translate-y-0.5 shadow-lg shadow-black/20 w-full sm:w-auto justify-center"
          >
            Get Your Custom Estimate
            <ArrowRight size={14} />
          </Link>
          <Link
            href={`tel:${SITE_CONFIG.phoneRaw}`}
            className="inline-flex items-center gap-2 border border-[#D4D8D8] text-[#0D0F0F] text-sm font-light tracking-wide uppercase px-8 py-4 rounded-full transition-all duration-200 hover:border-teal hover:text-teal hover:bg-teal/4 w-full sm:w-auto justify-center"
          >
            📞 Call or Text Monica
          </Link>
        </div>

        <p className="text-sm font-light text-[#8A8F8F] reveal rd3">
          We respond within <strong className="text-[#3A8F8F] font-normal">a few hours</strong>. Zelle · Check · Cash accepted. Deposit secures your date.
        </p>
      </div>
    </section>
  )
}
