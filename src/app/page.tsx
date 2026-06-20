import Hero from '@/components/sections/Hero'
import GalleryPreview from '@/components/sections/GalleryPreview'
import WhyMonica from '@/components/sections/WhyMonica'
import Packages from '@/components/sections/Packages'
import Reviews from '@/components/sections/Reviews'
import CTA from '@/components/sections/CTA'
import ScrollReveal from '@/components/ui/ScrollReveal'

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <Hero />
      <GalleryPreview />
      <WhyMonica />
      <Packages />
      <Reviews />
      <CTA />
    </>
  )
}
