'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Quinceaneras() {
  return (
    <div className="min-h-screen bg-[#FDFCFA]">
      {/* Hero */}
      <div className="bg-[#0D0F0F] pt-20 pb-0 relative overflow-hidden">
        <div className="absolute inset-0" style={{background: 'radial-gradient(ellipse 60% 50% at 60% 50%, rgba(91,191,191,0.12) 0%, transparent 60%)'}} />
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-20 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-6 h-px bg-[#5BBFBF]" />
              <span style={{fontFamily:'DM Mono,monospace'}} className="text-[11px] text-[#5BBFBF] tracking-[0.2em] uppercase">Tucson, AZ</span>
            </div>
            <h1 style={{fontFamily:'Cormorant Garamond,Georgia,serif'}} className="text-5xl md:text-6xl font-light leading-[1.05] text-white mb-5">
              Quinceañera Balloon<br/>
              <em className="italic text-[#5BBFBF]">Décor in Tucson</em>
            </h1>
            <p className="text-base font-light leading-[1.75] text-white/60 max-w-md mb-8">
              Your daughter&apos;s quinceañera deserves more than just balloons — it deserves a moment she&apos;ll never forget. Blue Luna Events creates stunning, custom balloon installations for quinceañeras across Tucson, Oro Valley, Sahuarita, and beyond.
            </p>
            <Link href="/get-a-quote"
              className="inline-flex items-center gap-3 bg-[#5BBFBF] text-[#0D0F0F] text-sm font-medium tracking-wide uppercase px-8 py-4 rounded-full hover:bg-[#8DD4D4] hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-[#5BBFBF]/30">
              Get a Free Estimate
            </Link>
          </div>
          <div className="relative h-80 lg:h-[460px] rounded-2xl overflow-hidden">
            <Image src="/images/gal-2.jpg" alt="Quinceañera balloon décor Tucson AZ — Blue Luna Events" fill className="object-cover" />
          </div>
        </div>
      </div>

      {/* Why Blue Luna for Quinceañeras */}
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="w-6 h-px bg-[#5BBFBF]" />
            <span style={{fontFamily:'DM Mono,monospace'}} className="text-[11px] text-[#5BBFBF] tracking-[0.2em] uppercase">Why Choose Us</span>
            <div className="w-6 h-px bg-[#5BBFBF]" />
          </div>
          <h2 style={{fontFamily:'Cormorant Garamond,Georgia,serif'}} className="text-4xl md:text-5xl font-light text-[#0D0F0F]">
            Tucson&apos;s Quinceañera <em className="italic text-[#3A8F8F]">Specialists</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: '🎈', title: 'Custom Luxury Garlands', text: 'Floor-to-ceiling balloon garlands in your exact colors — rose gold, blush, champagne, or anything you envision.' },
            { icon: '✨', title: 'Shimmer Backdrops', text: 'Photo-ready shimmer backdrops that make every photo look like it came from a professional magazine shoot.' },
            { icon: '👑', title: 'Columns & Entrance Displays', text: 'Grand balloon columns flanking the entrance set the tone before guests even walk in the door.' },
          ].map(item => (
            <div key={item.title} className="bg-white border border-[#D4D8D8] rounded-2xl p-8 text-center hover:border-[#5BBFBF] hover:shadow-xl transition-all duration-300">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 style={{fontFamily:'Cormorant Garamond,Georgia,serif'}} className="text-xl font-light text-[#0D0F0F] mb-3">{item.title}</h3>
              <p className="text-sm font-light text-[#4A5050] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Gallery preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="relative rounded-2xl overflow-hidden" style={{height:'360px'}}>
            <Image src="/images/hero-main.jpg" alt="Quinceañera balloon arch Tucson" fill className="object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['/images/gal-3.jpg', '/images/gal-4.jpg', '/images/gal-5.jpg', '/images/hero-sec.jpg'].map((src, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden" style={{height:'168px'}}>
                <Image src={src} alt="Quinceañera balloon décor" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* FAQ — AEO optimized */}
        <div className="max-w-2xl mx-auto mb-20">
          <h2 style={{fontFamily:'Cormorant Garamond,Georgia,serif'}} className="text-3xl font-light text-[#0D0F0F] text-center mb-10">
            Frequently Asked <em className="italic text-[#3A8F8F]">Questions</em>
          </h2>
          {[
            { q: 'How much does quinceañera balloon décor cost in Tucson?', a: 'Our quinceañera packages start from $900 for a full Signature setup including luxury garland, shimmer backdrop, columns, and centerpieces. Full-service Luxury packages with photo booth, audio, and MC start from $1,800.' },
            { q: 'How far in advance should I book for a quinceañera?', a: 'We recommend booking at least 4-6 weeks in advance for quinceañeras. Peak season (spring and summer) fills quickly. A 50% deposit secures your date.' },
            { q: 'Do you serve Oro Valley, Sahuarita, and surrounding areas?', a: 'Yes! We serve all of Tucson and surrounding areas including Oro Valley, Sahuarita, Green Valley, Dove Mountain, and Marana. Distance fees apply for locations beyond 20 miles from Tucson.' },
            { q: 'What is included in a quinceañera balloon package?', a: 'Our Signature package includes a luxury balloon garland up to 20 ft, shimmer backdrop with frame, 2 balloon columns with custom toppers, 3 premium centerpieces, and professional delivery, setup, and same-day takedown.' },
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
            Let&apos;s Make Her Day <em className="italic text-[#5BBFBF]">Unforgettable</em>
          </h2>
          <p className="text-base font-light text-white/50 mb-8 max-w-md mx-auto">
            Tell us about your daughter&apos;s quinceañera and we&apos;ll send a custom estimate within 24 hours.
          </p>
          <Link href="/get-a-quote"
            className="inline-flex items-center gap-3 bg-[#5BBFBF] text-[#0D0F0F] text-sm font-medium tracking-wide uppercase px-10 py-4 rounded-full hover:bg-[#8DD4D4] transition-all duration-300">
            Get a Free Estimate
          </Link>
        </div>
      </div>
    </div>
  )
}
