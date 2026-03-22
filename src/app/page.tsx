import Hero from '@/components/sections/Hero'
import UrgencyBanner from '@/components/sections/UrgencyBanner'
import Packages from '@/components/sections/Packages'
import Marquee from '@/components/sections/Marquee'
import GalleryPreview from '@/components/sections/GalleryPreview'
import Reviews from '@/components/sections/Reviews'
import Why from '@/components/sections/Why'
import CTA from '@/components/sections/CTA'
import ScrollReveal from '@/components/ui/ScrollReveal'

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <Hero />
      <UrgencyBanner />
      <Packages />
      <Marquee />
      <GalleryPreview />
      <Reviews />
      <Why />
      <CTA />
    </>
  )
}
