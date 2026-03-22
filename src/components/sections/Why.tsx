const pillars = [
  { icon: '🎈', title: 'Custom Balloon Artistry', text: 'Every garland, arch, and installation built for your event — your colors, your vision, your moment.' },
  { icon: '📸', title: 'Photo Booth Rentals', text: 'Open-air iPad stations and full booth setups that keep guests entertained all night long.' },
  { icon: '🎵', title: 'Professional Audio & MC', text: 'Sound equipment and MC services to keep your event flowing beautifully from start to finish.' },
  { icon: '✓', title: 'Stress-Free Setup & Takedown', text: 'We arrive, set up, take down. You walk in to a transformed space and walk out without lifting a finger.' },
]

const stats = [
  { n: '5+', l: 'Years in Tucson' },
  { n: '4-in-1', l: 'Services Combined' },
  { n: 'OV·SAH', l: 'Oro Valley & beyond' },
  { n: '50%', l: 'Deposit holds your date' },
]

export default function Why() {
  return (
    <section id="about" className="py-28 bg-[#0D0F0F] overflow-hidden relative">
      <div className="absolute inset-0"
        style={{background: 'radial-gradient(ellipse 60% 50% at 80% 50%, rgba(91,191,191,0.07) 0%, transparent 60%)'}} />

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">

          {/* Left */}
          <div className="reveal">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-6 h-px bg-teal" />
              <span className="font-mono text-[11px] text-teal/70 tracking-[0.2em] uppercase">Why Blue Luna</span>
            </div>
            <h2 className="font-display text-5xl font-light leading-[1.1] text-white mb-5">
              Tucson&apos;s Only <em className="italic text-teal">Full-Service</em> Studio
            </h2>
            <p className="text-base font-light leading-[1.75] text-white/50 mb-10">
              We&apos;re not just a balloon company. Blue Luna Events is the only studio in the Tucson area combining balloon décor, photo booth, professional audio, and MC services — one team, one seamless experience.
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-px bg-white/6 border border-white/6 rounded-2xl overflow-hidden">
              {stats.map((s) => (
                <div key={s.n} className="bg-[#141818] px-6 py-5">
                  <p className="font-display text-3xl font-semibold text-white leading-none mb-1.5">
                    {s.n.includes('+') || s.n.includes('-') || s.n.includes('·') || s.n.includes('%')
                      ? <><span className="text-teal"></span>{s.n}</>
                      : s.n
                    }
                  </p>
                  <p className="text-xs font-light text-white/38 tracking-wide">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — pillars */}
          <div className="flex flex-col gap-2 reveal rd2">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="bg-[#141818] border border-white/6 rounded-2xl p-6 flex gap-4 items-start hover:bg-[#1C2222] hover:border-teal/20 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-teal/12 border border-teal/18 flex items-center justify-center text-xl flex-shrink-0">
                  {p.icon}
                </div>
                <div>
                  <p className="font-display text-lg font-light text-white mb-1">{p.title}</p>
                  <p className="text-sm font-light text-white/42 leading-relaxed">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
