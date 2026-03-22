'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Graduations() {
  return (
    <div className="min-h-screen bg-[#FDFCFA]">
      {/* Hero */}
      <div className="bg-[#0D0F0F] pt-20 relative overflow-hidden">
        <div className="absolute inset-0" style={{background: 'radial-gradient(ellipse 60% 50% at 40% 50%, rgba(201,169,110,0.1) 0%, transparent 60%)' }} />
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-20 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-6 h-px bg-[#C9A96E]" />
              <span style={{fontFamily:'DM Mono,monospace'}} className="text-[11px] text-[#C9A96E] tracking-[0.2em] uppercase">Class of 2025</span>
            </div>
            <h1 style={{fontFamily:'Cormorant Garamond,Georgia,serif'}} className="text-5xl md:text-6xl font-light leading-[1.05] text-white mb-5">
              Graduation Party<br/>
              <em className="italic text-[#C9A96E]">Balloon Décor</em>
            </h1>
            <p className="text-base font-light leading-[1.75] text-white/60 max-w-md mb-4">
              They worked hard for this moment — celebrate it right. Blue Luna Events creates stunning graduation party setups across Tucson that your grad and every guest will remember.
            </p>
            <p className="text-sm font-light text-[#C9A96E] mb-8">🎓 May & June dates filling fast — book now to secure yours.</p>
            <Link href="/get-a-quote"
              className="inline-flex items-center gap-3 text-sm font-medium tracking-wide uppercase px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-0.5"
              style={{background: 'linear-gradient(135deg, #C9A96E, #E8CCA0)', color: '#0D0F0F'}}>
              Reserve Your Date
            </Link>
          </div>
          <div className="relative h-80 lg:h-[460px] rounded-2xl overflow-hidden">
            <Image src="/images/gal-4.jpg" alt="Graduation party balloon décor Tucson AZ — Blue Luna Events" fill className="object-cover" />
          </div>
        </div>
      </div>

      {/* Urgency strip */}
      <div className="py-4 px-6 text-center" style={{background: 'linear-gradient(135deg, #C9A96E, #E8CCA0)'}}>
        <p className="text-sm font-medium text-[#0D0F0F]">
          🎓 <strong>Graduation season is here.</strong> Limited May & June dates remaining —{' '}
          <Link href="/get-a-quote" className="underline font-semibold">book today before your date is gone.</Link>
        </p>
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: '🎓', title: 'School Color Palettes', text: 'We match your grad\'s school colors perfectly — garlands, backdrops, and centerpieces all coordinated.' },
            { icon: '📸', title: 'Photo-Ready Setups', text: 'Every setup is designed to look incredible in photos. Instagram-worthy guaranteed.' },
            { icon: '⚡', title: 'Fast Turnaround', text: 'Need it quick? We can accommodate rush bookings for an additional fee. Call us today.' },
          ].map(item => (
            <div key={item.title} className="bg-white border border-[#D4D8D8] rounded-2xl p-8 text-center hover:border-[#C9A96E] hover:shadow-xl transition-all duration-300">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 style={{fontFamily:'Cormorant Garamond,Georgia,serif'}} className="text-xl font-light text-[#0D0F0F] mb-3">{item.title}</h3>
              <p className="text-sm font-light text-[#4A5050] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Packages for grads */}
        <div className="bg-[#F7F5F2] rounded-3xl p-10 mb-20">
          <h2 style={{fontFamily:'Cormorant Garamond,Georgia,serif'}} className="text-3xl font-light text-[#0D0F0F] text-center mb-10">
            Graduation <em className="italic text-[#3A8F8F]">Packages</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Essential', price: '$350', desc: 'Up to 12 ft garland, custom colors, standard delivery & setup. Perfect for backyard celebrations.' },
              { name: 'Signature', price: '$900', desc: 'Luxury garland, shimmer backdrop, columns, centerpieces & premium service. The full experience.', featured: true },
              { name: 'Luxury', price: '$1,800', desc: 'Everything in Signature plus photo booth, professional audio & MC. Party of the year.' },
            ].map(pkg => (
              <div key={pkg.name} className={`bg-white rounded-2xl p-6 border ${pkg.featured ? 'border-[#5BBFBF] shadow-lg shadow-[#5BBFBF]/15' : 'border-[#D4D8D8]'}`}>
                {pkg.featured && <span className="inline-block bg-[#5BBFBF] text-[#0D0F0F] text-[9px] font-mono tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-3">Most Popular</span>}
                <h3 style={{fontFamily:'Cormorant Garamond,Georgia,serif'}} className="text-2xl font-light text-[#0D0F0F] mb-1">{pkg.name}</h3>
                <p style={{fontFamily:'Cormorant Garamond,Georgia,serif'}} className="text-3xl font-semibold text-[#0D0F0F] mb-3">from {pkg.price}</p>
                <p className="text-sm font-light text-[#4A5050] leading-relaxed mb-5">{pkg.desc}</p>
                <Link href="/get-a-quote" className={`block text-center py-3 rounded-full text-xs font-medium tracking-wide uppercase transition-all ${pkg.featured ? 'bg-[#5BBFBF] text-[#0D0F0F] hover:bg-[#3A8F8F] hover:text-white' : 'border border-[#D4D8D8] text-[#0D0F0F] hover:border-[#5BBFBF] hover:text-[#5BBFBF]'}`}>
                  Book This Package
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-20">
          <h2 style={{fontFamily:'Cormorant Garamond,Georgia,serif'}} className="text-3xl font-light text-[#0D0F0F] text-center mb-10">
            Graduation Party <em className="italic text-[#3A8F8F]">FAQ</em>
          </h2>
          {[
            { q: 'How much does a graduation party balloon setup cost in Tucson?', a: 'Graduation setups start from $350 for our Essential package. Most graduation parties choose our Signature package starting at $900, which includes a full garland, backdrop, columns, and centerpieces.' },
            { q: 'Can you match my grad\'s school colors?', a: 'Absolutely! We can match any school color palette. Just let us know the colors and we\'ll create a custom setup that celebrates your grad\'s achievement perfectly.' },
            { q: 'How quickly can you set up a graduation party?', a: 'We typically need 2-4 hours for setup depending on the package. For rush bookings under 48 hours, a $75 rush fee applies. We recommend booking at least 2 weeks in advance.' },
            { q: 'Do you do outdoor graduation parties?', a: 'Yes! We do both indoor and outdoor setups. For outdoor events we use weighted bases and wind-resistant techniques to keep everything looking perfect.' },
          ].map((faq, i) => (
            <div key={i} className="border-b border-[#D4D8D8] py-6">
              <h3 className="text-base font-medium text-[#0D0F0F] mb-2">{faq.q}</h3>
              <p className="text-sm font-light text-[#4A5050] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-[#0D0F0F] rounded-3xl p-12 text-center">
          <h2 style={{fontFamily:'Cormorant Garamond,Georgia,serif'}} className="text-4xl font-light text-white mb-4">
            Celebrate the <em className="italic text-[#C9A96E]">Class of 2025</em>
          </h2>
          <p className="text-base font-light text-white/50 mb-3 max-w-md mx-auto">
            Dates are filling fast. Reserve yours today with a 50% deposit.
          </p>
          <p className="text-sm text-[#C9A96E] mb-8">🎓 May & June availability is limited</p>
          <Link href="/get-a-quote"
            className="inline-flex items-center gap-3 text-sm font-medium tracking-wide uppercase px-10 py-4 rounded-full transition-all duration-300 hover:-translate-y-0.5"
            style={{background: 'linear-gradient(135deg, #C9A96E, #E8CCA0)', color: '#0D0F0F'}}>
            Reserve Your Graduation Date
          </Link>
        </div>
      </div>
    </div>
  )
}
