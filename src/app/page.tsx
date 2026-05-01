import Hero from '@/components/sections/Hero'
import Packages from '@/components/sections/Packages'
import UrgencyBanner from '@/components/sections/UrgencyBanner'
import GalleryPreview from '@/components/sections/GalleryPreview'
import Reviews from '@/components/sections/Reviews'
import ProcessStrip from '@/components/sections/ProcessStrip'
import CTA from '@/components/sections/CTA'
import ScrollReveal from '@/components/ui/ScrollReveal'

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <Hero />
      <Packages />
      <UrgencyBanner />
      <GalleryPreview />
      <Reviews />
      <ProcessStrip />
      <CTA />
    </>
  )
}
