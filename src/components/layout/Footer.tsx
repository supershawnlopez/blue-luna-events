import Image from 'next/image'
import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/config'
import { Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0D0F0F] border-t border-white/6">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-16">
          {/* Brand */}
          <div>
            <Image
              src="/images/logo-color.png"
              alt="Blue Luna Events"
              width={160}
              height={52}
              className="h-12 w-auto object-contain mb-5 brightness-0 invert opacity-85"
            />
            <p className="text-sm font-light leading-relaxed text-white/38 mb-6">
              Tucson&apos;s premier balloon décor and event styling studio. Quinceañeras, weddings, graduations, birthdays — and everything in between.
            </p>
            <div className="flex gap-3">
              <Link href={SITE_CONFIG.instagram} target="_blank"
                className="w-9 h-9 rounded-full border border-white/12 flex items-center justify-center text-white/40 hover:border-teal hover:text-teal hover:bg-teal/10 transition-all">
                <Instagram size={14} />
              </Link>
              <Link href={SITE_CONFIG.facebook} target="_blank"
                className="w-9 h-9 rounded-full border border-white/12 flex items-center justify-center text-white/40 hover:border-teal hover:text-teal hover:bg-teal/10 transition-all">
                <Facebook size={14} />
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <p className="font-mono text-[10px] text-white/26 tracking-[0.2em] uppercase mb-5">Services</p>
            <ul className="flex flex-col gap-2.5">
              {['Balloon Décor', 'Backdrops & Frames', 'Photo Booth Rental', 'Audio & MC', 'View All Packages'].map((item) => (
                <li key={item}>
                  <Link href="/packages" className="text-sm font-light text-white/42 hover:text-teal transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Events */}
          <div>
            <p className="font-mono text-[10px] text-white/26 tracking-[0.2em] uppercase mb-5">Events</p>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: 'Quinceañeras', href: '/quinceaneras' },
                { label: 'Weddings', href: '/#packages' },
                { label: 'Graduations 🎓', href: '/graduations' },
                { label: 'Birthdays', href: '/#packages' },
                { label: 'Corporate', href: '/#packages' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm font-light text-white/42 hover:text-teal transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-mono text-[10px] text-white/26 tracking-[0.2em] uppercase mb-5">Contact</p>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Phone / Text', value: SITE_CONFIG.phone, href: `tel:${SITE_CONFIG.phoneRaw}` },
                { label: 'Email', value: SITE_CONFIG.email, href: `mailto:${SITE_CONFIG.email}` },
                { label: 'Location', value: SITE_CONFIG.location, href: undefined },
                { label: 'Social', value: SITE_CONFIG.instagramHandle, href: SITE_CONFIG.instagram },
              ].map((item) => (
                <div key={item.label}>
                  <p className="font-mono text-[9px] text-white/22 tracking-[0.15em] uppercase mb-0.5">{item.label}</p>
                  {item.href ? (
                    <Link href={item.href} className="text-sm font-light text-white/50 hover:text-teal transition-colors">
                      {item.value}
                    </Link>
                  ) : (
                    <span className="text-sm font-light text-white/50">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] font-light text-white/18">
            © 2025 Blue Luna Events · Monica Denogean · Tucson, AZ · All rights reserved.
          </span>
          <span className="font-mono text-[10px] text-white/14 tracking-widest">
            BLUELUNAEVENTS.COM
          </span>
        </div>
      </div>
    </footer>
  )
}
