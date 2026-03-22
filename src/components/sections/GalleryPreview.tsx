'use client'

import Image from 'next/image'
import Link from 'next/link'

const photos = [
  { src: '/images/gal-1.jpg', alt: 'Balloon castle installation — Blue Luna Events', label: 'Custom Installation', span: 'tall' },
  { src: '/images/gal-2.jpg', alt: 'Rose gold balloon arch — Blue Luna Events', label: 'Rose Gold Arch' },
  { src: '/images/gal-3.jpg', alt: 'Baby shower balloon backdrop — Blue Luna Events', label: 'Baby Shower' },
  { src: '/images/gal-4.jpg', alt: 'Birthday balloon welcome sign — Blue Luna Events', label: 'Birthday Celebration' },
  { src: '/images/gal-5.jpg', alt: 'Outdoor balloon arch Tucson — Blue Luna Events', label: 'Outdoor Event' },
]

export default function GalleryPreview() {
  return (
    <section id="gallery" className="py-28 bg-[#F7F5F2]">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">

        {/* Header */}
        <div className="flex items-end justify-between mb-12 reveal">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-6 h-px bg-teal" />
              <span className="font-mono text-[11px] text-teal tracking-[0.2em] uppercase">Our Work</span>
            </div>
            <h2 className="font-display text-5xl font-light leading-[1.1] text-[#0D0F0F]">
              Recent <em className="italic text-[#3A8F8F]">Creations</em>
            </h2>
          </div>
          <Link
            href="/gallery"
            className="text-sm text-[#3A8F8F] tracking-wide uppercase border border-[#3A8F8F] rounded-full px-5 py-2.5 hover:text-teal hover:border-teal hover:bg-teal/6 transition-all whitespace-nowrap"
          >
            View Full Gallery →
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 reveal">
          {/* Tall first item */}
          <div className="row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer"
            style={{minHeight: '520px'}}>
            <Image
              src={photos[0].src}
              alt={photos[0].alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[#0D0F0F]/0 group-hover:bg-[#0D0F0F]/55 transition-all duration-300 flex items-end p-5">
              <span className="font-display text-lg italic text-white font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {photos[0].label}
              </span>
            </div>
          </div>

          {/* Remaining 4 */}
          {photos.slice(1).map((photo) => (
            <div key={photo.src} className="relative rounded-2xl overflow-hidden group cursor-pointer"
              style={{height: '252px'}}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[#0D0F0F]/0 group-hover:bg-[#0D0F0F]/55 transition-all duration-300 flex items-end p-4">
                <span className="font-display text-base italic text-white font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {photo.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
