import Hero from '@/components/sections/Hero'
import Packages from '@/components/sections/Packages'
import UrgencyBanner from '@/components/sections/UrgencyBanner'
import Reviews from '@/components/sections/Reviews'
import CTA from '@/components/sections/CTA'
import ScrollReveal from '@/components/ui/ScrollReveal'

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <Hero />
      <UrgencyBanner />
      <Packages />
      <Reviews />
      <CTA />
    </>
  )
}
