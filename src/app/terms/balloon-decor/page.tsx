import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Balloon Decor Terms | Blue Luna Events',
  robots: { index: false, follow: false },
}

const sections = [
  {
    title: 'Outdoor + Environmental Conditions',
    body: 'Balloon decor is temporary and can be affected by heat, direct sun, wind, rain, humidity, dust, and changing outdoor conditions. Outdoor balloon lifespan cannot be guaranteed.',
  },
  {
    title: 'Popping, Fading + Movement',
    body: 'Balloons may pop, fade, oxidize, shrink, expand, dull, or shift during an event. Wind or unsafe conditions may require Blue Luna Events to move, modify, reduce, or decline an installation.',
  },
  {
    title: 'Guest + Venue Interaction',
    body: 'After setup is complete and the decor is approved, the client and venue are responsible for guest interaction, children, pets, venue staff, movement, tampering, or damage to the installation.',
  },
  {
    title: 'Latex Safety',
    body: 'Latex balloons can be a choking hazard and may affect guests with latex sensitivities or allergies. Children and pets should be supervised around balloon decor.',
  },
  {
    title: 'Rental Equipment',
    body: 'Frames, stands, poles, bases, weights, props, and specialty hardware remain the property of Blue Luna Events unless otherwise noted. Missing or damaged rental equipment may result in replacement charges.',
  },
  {
    title: 'Venue Access + Rules',
    body: 'The client or venue must confirm approved attachment methods, load-in access, parking, elevators, stairs, security, setup windows, teardown timing, and any venue restrictions before installation.',
  },
  {
    title: 'Substitutions',
    body: 'Blue Luna Events may substitute similar colors, products, or materials when inventory, safety, or venue conditions require it while preserving the intended design direction as closely as possible.',
  },
  {
    title: 'Photography',
    body: 'Blue Luna Events may photograph completed decor for portfolio and marketing use unless the client requests otherwise in writing before the event.',
  },
]

export default function BalloonDecorTermsPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#FDFCFA', color: '#0D0F0F', fontFamily: 'Inter, -apple-system, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <section style={{ width: 'min(900px, calc(100% - 40px))', margin: '0 auto', padding: '72px 0' }}>
        <Link href="/" style={{ color: '#3A8F8F', fontSize: '0.82rem', fontWeight: 800, textDecoration: 'none' }}>
          Blue Luna Events
        </Link>
        <p style={{ color: '#5BBFBF', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: '0.72rem', fontWeight: 900, margin: '40px 0 12px' }}>
          Terms + Disclosures
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(3rem, 9vw, 6rem)', lineHeight: 0.92, margin: '0 0 18px' }}>
          Balloon Decor Terms
        </h1>
        <p style={{ color: '#667085', fontSize: '1.05rem', lineHeight: 1.75, maxWidth: '720px', margin: '0 0 42px' }}>
          These notes help set clear expectations for temporary balloon decor, especially for outdoor or exposed installations.
        </p>

        <div style={{ display: 'grid', gap: '14px' }}>
          {sections.map(section => (
            <article key={section.title} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '18px', padding: '22px' }}>
              <h2 style={{ fontSize: '1rem', margin: '0 0 8px' }}>{section.title}</h2>
              <p style={{ color: '#667085', lineHeight: 1.7, margin: 0 }}>{section.body}</p>
            </article>
          ))}
        </div>

        <p style={{ color: '#9CA3AF', fontSize: '0.82rem', lineHeight: 1.6, margin: '32px 0 0' }}>
          Final terms may be updated in the official estimate, invoice, or event agreement for each event.
        </p>
      </section>
    </main>
  )
}
