import type { Metadata } from 'next'
import QuoteForm from '@/components/ui/QuoteForm'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Get a Quote | Blue Luna Events — Tucson Balloon Décor',
  description: 'Request a custom estimate for balloon décor, backdrops, photo booth, and more. Blue Luna Events serves Tucson, Oro Valley, Sahuarita & beyond.',
}

export default function GetAQuote() {
  return (
    <div className="min-h-screen bg-[#FDFCFA] pt-24">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div className="lg:sticky lg:top-28">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-6 h-px bg-teal" />
              <span className="font-mono text-[11px] text-teal tracking-[0.2em] uppercase">Free Estimate</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-light leading-[1.05] text-[#0D0F0F] mb-6">
              Let&apos;s Plan Your <em className="italic text-[#3A8F8F]">Dream Event</em>
            </h1>
            <p className="text-base font-light leading-[1.75] text-[#4A5050] mb-10">
              Fill out the form and Monica will send your custom estimate within 24 hours. A 50% deposit secures your date.
            </p>
            <div className="space-y-4 mb-10">
              {[
                { icon: '🎈', title: 'Custom estimate in 24 hrs', sub: 'Tailored to your event, venue, and vision' },
                { icon: '📅', title: 'Deposit holds your date', sub: '50% now, 50% one week before' },
                { icon: '✓', title: 'Professional installation', sub: 'We deliver, set up, and take down' },
              ].map(item => (
                <div key={item.title} className="flex gap-4 items-start bg-white border border-[#D4D8D8] rounded-2xl p-5">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-medium text-sm text-[#0D0F0F]">{item.title}</p>
                    <p className="text-xs font-light text-[#8A8F8F] mt-0.5">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="relative rounded-2xl overflow-hidden h-56">
              <Image src="/images/gal-2.jpg" alt="Blue Luna Events setup" fill className="object-cover" />
            </div>
          </div>
          <div className="bg-white border border-[#D4D8D8] rounded-[24px] p-8 md:p-10 shadow-xl shadow-black/5">
            <h2 className="font-display text-2xl font-light text-[#0D0F0F] mb-1">Tell Us About Your Event</h2>
            <p className="text-sm font-light text-[#8A8F8F] mb-8">The more detail you share, the better we can tailor your estimate.</p>
            <QuoteForm />
          </div>
        </div>
      </div>
    </div>
  )
}
