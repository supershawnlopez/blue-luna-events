'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-[#0D0F0F] flex flex-col justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0"
        style={{background: 'radial-gradient(ellipse 80% 60% at 65% 40%, rgba(91,191,191,0.12) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 20% 70%, rgba(201,169,110,0.06) 0%, transparent 50%), linear-gradient(165deg, #0D0F0F 0%, #141A1A 50%, #0F1515 100%)'}} />

      {/* Orbs */}
      <div className="absolute w-[500px] h-[500px] -top-24 -right-20 rounded-full pointer-events-none"
        style={{background: 'radial-gradient(circle, rgba(91,191,191,0.14) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'orbFloat1 12s ease-in-out infinite'}} />
      <div className="absolute w-72 h-72 bottom-[10%] left-[5%] rounded-full pointer-events-none"
        style={{background: 'radial-gradient(circle, rgba(91,191,191,0.08) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'orbFloat2 16s ease-in-out infinite'}} />

      {/* Top rule */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{background: 'linear-gradient(90deg, transparent, #5BBFBF, transparent)', opacity: 0.5}} />

      {/* Content */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-6 md:px-12 pt-28 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left */}
        <div>
          <div className="flex items-center gap-3 mb-7" style={{opacity: 0, animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s forwards'}}>
            <div className="w-8 h-px bg-teal" />
            <span className="font-mono text-[11px] font-light text-teal tracking-[0.2em] uppercase">Tucson&apos;s Premier Event Styling Studio</span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light leading-[1.05] text-white mb-3"
            style={{opacity: 0, animation: 'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.35s forwards'}}>
            <em className="italic text-teal">Breathtaking</em>
            <strong className="font-semibold block">Balloon Décor</strong>
            for Every Event
          </h1>

          <p className="font-display text-xl md:text-2xl font-light italic text-[#E8CCA0] mb-7"
            style={{opacity: 0, animation: 'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.5s forwards'}}>
            Quinceañeras · Weddings · Graduations · Birthdays
          </p>

          <p className="text-base font-light leading-[1.75] text-white/60 max-w-md mb-11"
            style={{opacity: 0, animation: 'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.6s forwards'}}>
            Professional balloon installations, custom backdrops, and full event styling — delivered, installed, and picture-perfect before your guests arrive. Serving Tucson, Oro Valley, Sahuarita &amp; beyond.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{opacity: 0, animation: 'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.72s forwards'}}>
            <Link href="/#packages"
              className="inline-flex items-center gap-3 bg-teal text-[#0D0F0F] text-sm font-medium tracking-wide uppercase px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-teal/40 hover:bg-[#8DD4D4] w-full sm:w-auto justify-center">
              See Packages & Pricing
              <ArrowRight size={14} />
            </Link>
            <Link href="/gallery"
              className="inline-flex items-center gap-2 text-white/70 text-sm font-light tracking-wide uppercase border border-white/20 px-7 py-4 rounded-full transition-all duration-200 hover:text-teal hover:border-teal hover:bg-teal/6 w-full sm:w-auto justify-center">
              View Our Work →
            </Link>
          </div>
        </div>

        {/* Right — photo stack */}
        <div className="relative hidden lg:block" style={{opacity: 0, animation: 'fadeScale 1.1s cubic-bezier(0.16,1,0.3,1) 0.4s forwards'}}>
          <div className="relative h-[540px]">
            {/* Booking badge */}
            <div className="absolute top-8 -left-4 z-20 bg-[#0D0F0F]/92 backdrop-blur-xl border border-teal/30 rounded-xl px-5 py-3.5">
              <p className="font-mono text-[9px] text-teal tracking-[0.15em] uppercase mb-1">Summer 2025</p>
              <p className="font-display text-xl font-semibold text-white leading-none">Booking Now</p>
              <p className="text-[11px] text-white/50 mt-1">Limited dates available</p>
            </div>

            {/* Main photo */}
            <div className="absolute top-0 right-0 w-[85%] h-[460px] rounded-2xl overflow-hidden">
              <Image
                src="/images/hero-main.jpg"
                alt="Stunning balloon arch installation by Blue Luna Events"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0"
                style={{background: 'linear-gradient(135deg, rgba(91,191,191,0.1) 0%, transparent 60%)'}} />
            </div>

            {/* Secondary photo */}
            <div className="absolute bottom-0 left-0 w-[52%] h-[260px] rounded-xl overflow-hidden border-[3px] border-[#0D0F0F] shadow-2xl">
              <Image
                src="/images/hero-sec.jpg"
                alt="Elegant event backdrop by Blue Luna Events"
                fill
                className="object-cover opacity-90"
              />
            </div>

            {/* Teal accent corner */}
            <div className="absolute bottom-14 -right-2 w-20 h-20 border border-teal/25 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/6 bg-[#0D0F0F]/55 backdrop-blur-xl">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 flex">
          {[
            { n: '200+', l: 'Events Styled' },
            { n: '5★', l: 'Google Rating' },
            { n: '1-Stop', l: 'Balloons · Photo Booth · Audio · MC' },
            { n: '~24hr', l: 'Quote Turnaround' },
          ].map((stat, i) => (
            <div key={i} className={`flex-1 py-5 px-4 md:px-7 border-r border-white/7 last:border-r-0`}
              style={{opacity: 0, animation: `fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) ${0.9 + i * 0.1}s forwards`}}>
              <div className="font-display text-2xl font-semibold text-white leading-none mb-1">
                <span className="text-teal">{stat.n.includes('+') || stat.n.includes('★') || stat.n.includes('-') || stat.n.includes('~') ? '' : ''}</span>
                {stat.n}
              </div>
              <div className="text-[11px] font-light text-white/40 tracking-wide">{stat.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
