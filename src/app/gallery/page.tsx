'use client'

import Image from 'next/image'
import Link from 'next/link'

const photos = [
  { src: '/images/gal-1.jpg', alt: 'Custom balloon castle installation', label: 'Custom Installation', type: 'Special Event' },
  { src: '/images/gal-2.jpg', alt: 'Rose gold balloon arch', label: 'Rose Gold Arch', type: 'Birthday' },
  { src: '/images/gal-3.jpg', alt: 'Baby shower balloon backdrop', label: 'Baby Shower Setup', type: 'Baby Shower' },
  { src: '/images/gal-4.jpg', alt: 'Birthday balloon welcome sign', label: 'Birthday Celebration', type: 'Birthday' },
  { src: '/images/gal-5.jpg', alt: 'Outdoor balloon arch Tucson', label: 'Outdoor Event', type: 'Special Event' },
  { src: '/images/hero-main.jpg', alt: 'Blue silver balloon arch', label: 'Blue & Silver Arch', type: 'Birthday' },
  { src: '/images/hero-sec.jpg', alt: 'Gold white backdrop', label: 'Elegant Backdrop', type: 'Wedding' },
]

export default function Gallery() {
  return (
    <div className="min-h-screen bg-[#0D0F0F] pt-20">
      {/* Header */}
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-20">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-6 h-px bg-[#5BBFBF]" />
          <span style={{fontFamily:'DM Mono,monospace'}} className="text-[11px] text-[#5BBFBF] tracking-[0.2em] uppercase">Our Work</span>
        </div>
        <h1 style={{fontFamily:'Cormorant Garamond,Georgia,serif'}} className="text-5xl md:text-6xl font-light text-white mb-5">
          Our <em className="italic text-[#5BBFBF]">Creations</em>
        </h1>
        <p className="text-base font-light text-white/50 max-w-lg">
          Every setup is custom — your colors, your vision, your moment. Here&apos;s a look at what we&apos;ve built for Tucson families and businesses.
        </p>
      </div>

      {/* Gallery grid */}
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo, i) => (
            <div key={i} className="relative rounded-2xl overflow-hidden group cursor-pointer" style={{height: '320px'}}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[#0D0F0F]/0 group-hover:bg-[#0D0F0F]/60 transition-all duration-300 flex flex-col justify-end p-6">
                <span className="text-[10px] text-[#5BBFBF] tracking-[0.15em] uppercase font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-1">{photo.type}</span>
                <span style={{fontFamily:'Cormorant Garamond,Georgia,serif'}} className="text-xl italic text-white font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300">{photo.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <p style={{fontFamily:'Cormorant Garamond,Georgia,serif'}} className="text-3xl font-light text-white mb-3">
            Ready to create your <em className="italic text-[#5BBFBF]">moment?</em>
          </p>
          <p className="text-base font-light text-white/50 mb-8">Let&apos;s build something beautiful for your event.</p>
          <Link href="/get-a-quote"
            className="inline-flex items-center gap-3 bg-[#5BBFBF] text-[#0D0F0F] text-sm font-medium tracking-wide uppercase px-10 py-4 rounded-full hover:bg-[#8DD4D4] hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-[#5BBFBF]/30">
            Get a Free Estimate
          </Link>
        </div>
      </div>
    </div>
  )
}
