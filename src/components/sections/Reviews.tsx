import { Star } from 'lucide-react'

const reviews = [
  {
    text: "Blue Luna transformed our baby shower into something out of a Pinterest dream. The backdrop and balloons were beyond beautiful.",
    name: "Jessica R.",
    location: "Tucson, AZ",
    initial: "J",
    color: "bg-teal",
  },
  {
    text: "I was blown away by the creativity and detail. They made my daughter's quinceañera look like a magazine shoot.",
    name: "Maria V.",
    location: "Oro Valley, AZ",
    initial: "M",
    color: "bg-[#C9A96E]",
  },
  {
    text: "Monica and her team are the definition of professional. We hired Blue Luna for everything — balloons, photo booth, sound system, and MC. Our quinceañera ran flawlessly. Every single guest asked who did our décor. Worth every penny.",
    name: "Ana & Carlos Mendoza",
    location: "Sahuarita, AZ",
    initial: "A",
    color: "bg-[#3A8F8F]",
    wide: true,
  },
]

function Stars() {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={13} className="text-[#C9A96E] fill-[#C9A96E]" />
      ))}
    </div>
  )
}

export default function Reviews() {
  return (
    <section id="reviews" className="py-28 bg-[#FDFCFA]">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">

          {/* Left */}
          <div className="reveal">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-6 h-px bg-teal" />
              <span className="font-mono text-[11px] text-teal tracking-[0.2em] uppercase">Client Love</span>
            </div>
            <h2 className="font-display text-4xl font-light leading-[1.1] text-[#0D0F0F] mb-5">
              Tucson Families <em className="italic text-[#3A8F8F]">Trust</em> Blue Luna
            </h2>
            <p className="text-base font-light leading-[1.75] text-[#4A5050] mb-8">
              Real reviews from real families. See why we&apos;re the area&apos;s most-loved event styling studio.
            </p>
            <div className="flex items-center gap-3">
              <Stars />
              <span className="font-mono text-[11px] text-[#8A8F8F] tracking-widest">5.0 on Google</span>
            </div>
          </div>

          {/* Reviews grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5 reveal rd2">
            {reviews.map((r) => (
              <div
                key={r.name}
                className={`bg-white border border-[#D4D8D8] rounded-2xl p-7 hover:shadow-xl hover:border-teal/30 transition-all duration-300 ${r.wide ? 'sm:col-span-2' : ''}`}
              >
                <Stars />
                <p className={`font-display font-light italic text-[#0D0F0F] leading-[1.65] my-4 ${r.wide ? 'text-lg' : 'text-base'}`}>
                  &ldquo;{r.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${r.color} flex items-center justify-center font-display text-base text-white font-semibold flex-shrink-0`}>
                    {r.initial}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0D0F0F]">{r.name}</p>
                    <p className="text-xs font-light text-[#8A8F8F]">{r.location} · Google Review</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
