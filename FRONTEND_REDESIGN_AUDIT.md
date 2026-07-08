# FRONTEND_REDESIGN_AUDIT.md — Blue Luna Events
### Full team audit of the public-facing site. Written July 8, 2026.
### Everyone's independent input is below, unedited into a single recommendation. Shawn reads this, adds his own view, then the team decides together — per `brief.md` Step 4.

---

## CORRECTION TO THE JULY 7 AUDIT

`PLATFORM_REBUILD_AUDIT.md` (written July 7) said the site had "currently none — no per-page metadata generation beyond Next.js defaults, no JSON-LD structured data... no sitemap.xml, no robots.txt." That was wrong on the JSON-LD/metadata part. On actually opening `layout.tsx` today: there's a full metadata block (title template, description, keywords, OpenGraph, Twitter cards, canonical) and a `LocalBusiness`-style JSON-LD schema with `areaServed` covering Tucson, Marana, Oro Valley, Sahuarita, and Green Valley. This was built June 20, 2026 as part of a "Phase 2+3: Visual overhaul" commit that wasn't fully reflected in prior session notes.

The sitemap.xml/robots.txt claim was correct — confirmed neither exists anywhere in the project as of today.

Read Part 2 below for what's actually wrong with the SEO that IS there — it's not "missing," it's got real, fixable defects.

---

## PART 1 — WHAT'S ACTUALLY ON THE SITE TODAY (verified against real code, July 8, 2026)

**Design system:** Dark hero sections (`#0D0F0F`) with teal (`#5BBFBF`) accents, Cormorant Garamond serif display type + Inter body, glassmorphism (backdrop-blur navs and cards), scroll-reveal animations, consistent "eyebrow" label pattern, card hover-lift states, a horizontal auto-scrolling event-type marquee. This is not an amateur build — it's a coherent, considered design system already.

**Pages:** Homepage (Hero → GalleryPreview → WhyMonica → Packages → Reviews → CTA), `/quinceaneras` and `/graduations` (dedicated landing pages with hero, features, packages, FAQ, CTA), `/gallery` (dynamic, pulls from Supabase with a local-image fallback), `/get-a-quote` (4-step configurator).

**Copy:** Specific, not generic — real reviewer names, real neighborhoods (Oro Valley, Marana), concrete numbers ($299–$2,800 by package), an actual founding story (Monica, since 2018, no subcontractors).

**Content that's already good and shouldn't be thrown out:** the FAQ blocks on `/quinceaneras` and `/graduations` are specific, locally-worded, and answer real buyer questions ("How far in advance should I book," "Do you serve Oro Valley/Sahuarita"). This is exactly the kind of content AEO/GEO wants — it just isn't marked up as such yet (see Part 2).

---

## PART 2 — TECHNICAL SEO / AEO / GEO FINDINGS (specific, verified, fixable)

1. **The JSON-LD `@type` is not a real schema.org type.** `layout.tsx` uses `"@type": "EventVenueDecorService"` — this is not a recognized schema.org vocabulary term. Google's structured data parser will likely ignore or fail to validate this block entirely, meaning the LocalBusiness data (address, phone, areas served) may not be reliably picked up despite being present in the code. Fix: use `LocalBusiness` (safe, generic, guaranteed-valid) or `ProfessionalService`.

2. **The `aggregateRating` in that same schema is a real compliance risk, not just a nitpick.** It hardcodes `ratingValue: 5.0, reviewCount: 50` — but the actual page only shows 3 written reviews. Google's structured data guidelines require review counts in schema to be genuinely backed by visible, verifiable reviews (ideally sourced from an actual review platform like Google Business Profile). A schema claiming 50 reviews with 3 visible on the page is the kind of mismatch that can trigger a manual spam action on structured data, not just get ignored. This should either be removed until it's wired to real Google Business Profile data, or replaced with the real count.

3. **`/quinceaneras` and `/graduations` are client components (`'use client'`), which structurally blocks them from having their own page-specific metadata.** In Next.js App Router, `metadata`/`generateMetadata` can only be exported from Server Components. Because these two landing pages open with `'use client'`, they cannot export their own title/description — they silently inherit the homepage's generic title and description via the template. This means the two pages built specifically to rank for "quinceañera balloons Tucson" and "graduation party decorations Tucson" are almost certainly not sending Google the tailored title/description that would actually win those searches. This is a real, structural bug, not a content gap — the content (FAQ, copy) is already keyword-appropriate, the technical plumbing just can't surface it.

4. **No FAQPage schema.** The FAQ content on both landing pages is genuinely good and locally specific, but it's rendered as plain HTML with no `FAQPage` JSON-LD wrapper. This is the single most direct AEO lever available here — FAQ schema is what lets Google (and increasingly AI answer engines) lift a question/answer pair directly into a rich result or a generative answer, verbatim, without a click. Right now that content is invisible to that mechanism even though it's already written.

5. **No sitemap.xml or robots.txt anywhere in the project.** Confirmed via file search — neither `src/app/sitemap.ts` (Next.js's native way to generate one) nor a static `public/sitemap.xml` exists. Same for robots.txt.

6. **No per-event-type or per-neighborhood landing pages beyond quince/graduation.** The keywords array in `layout.tsx` already targets "Marana balloon decor," "Oro Valley event styling," "Sahuarita balloon decorator" — but there's no actual page built for weddings, birthdays, baby showers, or any of those specific neighborhoods to rank against those exact keyword targets. The keywords are aspirational; the content to back them up mostly isn't there.

7. **Gallery preview images use static, hardcoded local files, not real client photos synced from Studio.** `GalleryPreview.tsx` (the homepage section) has a comment saying "Once Supabase Storage is connected, replace with real query" — but the full `/gallery` page already pulls real data with a fallback. The homepage preview section was apparently never updated to match. Minor, but means the most-seen page (homepage) isn't showing Monica's freshest real work.

---

## PART 3 — TUCSON MARKET REALITY CHECK (real web research, July 8, 2026)

Blue Luna Events already appears in general search results for "balloon decorator Tucson" and "best balloon decor Tucson" queries — it's not starting from zero visibility. Real competitors surfacing alongside it:

- **Balloons by DRE** — Tucson-based, strong review language ("kindest and most caring," "creative, professional, meticulous")
- **Sonoran Balloon Creations** (Marana) — self-positions as "the premier balloon company in Tucson"
- **Balloon Decor Service Tucson** — explicitly advertises free delivery + installment payment plans
- **Balloons In Motion, Balloon Land, Pretty Balloons AZ, Balloon Artisan** — smaller but present in local search results

General market garland pricing benchmarks found: roughly $10–20/linear ft for standard balloon garland nationally, up to $42/ft for premium organic/floral-mixed garlands. Blue Luna's current package pricing (`config.ts`) is roughly in line with this range, not obviously mispriced in either direction — worth a real comparison pass but not an emergency.

Sources: [Balloon Decor Service Tucson](https://balloondecorservice.com/balloon-decor-service-tucson/), [Balloons by DRE](https://balloonsbydre.com/), [Sonoran Balloon Creations](https://sonoranballoons.com/), [Balloon Artisan](https://www.balloonartisan.com/balloon-arches-garlands-tucson-arizona), [Balloon Garland Pricing – Pop & Drop](https://www.popanddroptx.com/balloon-garland-pricing), [Balloon Decor Pricing – Chi Twist](https://www.chitwist.com/Prices-Styles-Balloon-Decor.html)

---

## PART 4 — TEAM INPUT (independent, unedited into consensus)

### Steve Jobs — Product
The site isn't broken — the audit above proves that. What it doesn't do is win the specific searches it needs to win, because two structural bugs (the client-component metadata block, the missing FAQ schema) are quietly throwing away work that's already been done. My filter on a redesign: don't let "we're not happy with it" become "let's rebuild everything" when the actual list of what's wrong is short and specific. I'd want to know, in plain terms, what "not happy" means to Shawn — is it the visual style itself, or is it that the site isn't producing leads at the rate he wants? Those are different problems with different fixes, and I don't think we've separated them yet.

### Jony Ive — Design
Visually, this is already a considered system — I wouldn't tear it down. What I'd push on: the homepage gallery preview is six static stock-feeling images that never change, on the single highest-traffic page of the site, while a real, dynamic, Monica-curated gallery already exists one click away. That's the opposite of what should happen — the best, freshest, realest work should be on the homepage, not buried a click deep. Second: three written testimonials is thin for a business claiming "200+ Events Styled" in the hero stats strip. If the goal is trust-at-a-glance, either grow the review count visibly or stop asserting a number the page can't back up (see Phil's schema point — same problem, different surface).

### Phil Schiller — Marketing / SEO / AEO / GEO
This is where I'd spend the redesign budget first, not on visual polish. In order of leverage: (1) fix the two landing pages so they can actually have their own metadata — right now they're invisible to search despite having good content; (2) wrap the existing FAQ content in FAQPage schema — free win, content's already written; (3) fix or remove the fake review count in the schema before it becomes a real compliance problem; (4) build a sitemap and robots.txt — five minutes of work that's just never been done; (5) build out the neighborhood/event-type pages the keyword list already promises Google we have. None of this requires a visual redesign. It requires finishing what's half-built.

### Angela Ahrendts — Client Experience
Reading the actual copy, I don't see anything embarrassing — the tone is warm, specific, and confident. My concern is upstream of design: the site's only real conversion path is `/get-a-quote`, and there's a real availability gap already flagged in `DECISIONS.md` (calendar/booking not built yet). A prospective client can build a beautiful package and still not know if Monica's even available for their date until she personally responds. If the goal is leads every day, closing that gap matters as much as anything visual.

### Craig Federighi — Engineering
The `'use client'` metadata bug (Part 2, #3) is the one I'd fix regardless of what direction the redesign goes — it's a structural mistake that undermines two pages that were clearly built with SEO intent (the keyword-stuffed hero copy, the FAQ blocks) and then accidentally blocked from shipping that intent to Google. Everything else in Part 2 is additive and low-risk. None of it requires touching the visual design system, which means Jony's redesign and Phil's SEO fixes genuinely don't have to compete for the same engineering time.

### Marcus Webb — Integration
The homepage gallery preview using stale local files instead of the real Supabase-backed gallery is a wiring gap, not a design gap — the real gallery page already does this correctly. I can fix the homepage section to pull from the same source in well under a day, independent of whatever the redesign decides about layout/visuals.

### Chris Lattner — Mobile
Haven't done a full mobile pass in this audit, but worth flagging before any redesign starts: the current mobile nav (full-screen dark overlay, Cormorant Garamond nav items) is already a considered, non-generic pattern — worth explicitly deciding whether a redesign keeps this or replaces it, rather than it just getting swept away by default because it's "old."

---

## SHAWN'S BRIEF (2026-07-08)

Answering Steve's question directly: SEO/AEO/GEO is priority #1, full stop — traffic is the machine that feeds everything else. Priority #2, tightly linked: the site itself has to feel like buying an iPhone — Apple-level design *and* function fused together, not visual polish alone. The build-your-own-price configurator needs to stay, but a custom-quote path has to exist *at the same time*, not as a fallback. The whole point is a psychologically self-guiding machine that leads someone from "just looking" to pulling out a card and putting down a deposit. Shawn explicitly asked the team to think outside the box on this — what hasn't been done in this industry, and separately, what *has* been done elsewhere (any industry) that already works and could be borrowed. He was clear he doesn't know the event-decor industry deeply and wants the team's real thinking here, not just his own instinct.

---

## PART 5 — RESEARCH + TEAM RESPONSE TO THE BRIEF (Round 2)

### What proven conversion psychology actually says (external research, not opinion)

- Well-built configurators can lift conversion up to ~40% — the mechanism is that each completed step is a "micro-commitment" that increases the customer's investment in finishing. ([SaleSqueze](https://salesqueze.com/how-configurator-design-impacts-conversions/), [ConvertCalculator](https://www.convertcalculator.com/blog/what-is-a-product-configurator/))
- Hick's Law: more choices at once = harder to decide, lower purchase probability. 5–7 options at a time converts meaningfully better than 30 shown at once. Progressive disclosure (one decision at a time, real-time price update after each) is the proven structure — which is directionally what Blue Luna's existing 4-step configurator already does. ([Configurator UX Best Practices](https://configurator.tech/blogs/configurator-ux-best-practices-designing-conversion/))
- Instant quote calculators in service businesses (roofing, contracting) have documented conversion jumps from ~1.8% to ~7.2% after launch — driven by the "commitment and consistency" effect (once someone starts answering questions, they psychologically want to finish) and the "reciprocity" effect (getting a real price up front makes people more willing to hand over contact info in return). ([Silver Spider Media](https://silverspidermedia.com/blog/how-quote-calculators-boost-conversion-rates))
- The "self-serve + talk to a human" dual path is standard, proven SaaS pricing-page architecture (Zendesk is a commonly cited example) — not a hedge, a deliberate pattern, because different buyers genuinely want different amounts of control. ([Webstacks](https://www.webstacks.com/blog/saas-pricing-page-design))
- **Directly on-point industry proof:** Air With Flair Decor (Raleigh, NC balloon/event stylist) runs exactly this dual model today — a self-serve "Grab & Go" shop with transparent per-foot pricing, *plus* a custom-consultation path with mockups/color iterations and a 50% deposit tied to a real proposal. Their premium feel comes from designer-consultation framing and visual mockups, not from the contact form itself. This is a working example in the *same industry*, not a hypothetical borrowed from tech. ([airwithflairdecor.com](https://airwithflairdecor.com/))

### Team response

**Jony Ive (Design):** The Apple comparison is the right instinct, but it's not about chrome — Apple's configurators win because every choice shows you something *real* immediately: color, material, a rendered product. Blue Luna's configurator currently shows a running price total, which is good, but it never shows the customer *what they're building*. My recommendation: as someone picks garland tier, backdrop, colors, the page should show real photos from Monica's actual gallery that match those choices — not a generic stock photo, an actual "this is what your columns will look like" moment. That's the single highest-leverage design change available, and it directly answers Shawn's "make it feel like an iPhone" brief — Apple sells the feeling of the object, not a spec sheet.

**Angela Ahrendts (CX):** The dual-path instinct is already correct — Air With Flair proves it works in this exact industry. What I'd tighten: right now "Build My Own" and premade packages are two *equal* buttons on one screen (Hick's Law says that's already a harder decision than it needs to be). Better: lead with the guided package path as the default, fast, low-effort choice, and surface "or build exactly what you want" as a secondary, quieter option for people who already know what they want — not two co-equal doors. And regardless of which path, the deposit CTA needs trust language right next to it addressing the actual fear (what if my date changes, what if I don't love it) — `PRICING_RULES` already has a real cancellation policy (`depositNonRefundableAfter: 7 days`) that isn't shown anywhere on the client-facing side today. Hiding a real policy doesn't reduce risk, it just moves the moment someone discovers it to *after* they've paid, which is worse for trust, not better.

**Phil Schiller (Marketing/SEO):** Sequencing note, not a new idea: don't let the "feel like an iPhone" redesign delay the SEO fixes in Part 2. They're independent — Craig already confirmed neither blocks the other. If the goal is leads every day starting soon, the FAQ schema and the landing-page metadata fix should ship first because they're finished in days, not weeks, and they don't require design to be done first. Traffic without a great funnel is wasted, but a great funnel without traffic is invisible — sequence for the fastest total leads, not for what feels most impressive to ship.

**Steve Jobs (Product):** On "what hasn't been done in this industry" — from what the team found, *nobody* in the Tucson competitive set is doing real-time visual matching (Jony's idea above) or a genuinely designed dual-path flow. Most competitor sites are static galleries with a contact form. That gap is real and winnable. On "what's already proven elsewhere" — the instant-quote-calculator psychology data is unambiguous, and Blue Luna already has the hard part (a working real-time pricing engine) built. This isn't a from-scratch invention — it's finishing what's already 70% there with more conviction, not starting over.

**Craig Federighi (Engineering):** Jony's "show real photos matching the build" idea is buildable without new infrastructure — it just needs Monica's gallery photos tagged by the same attributes the configurator already tracks (garland tier, backdrop type, color). That tagging doesn't fully exist yet (gallery photos are currently tagged by `event_type` only, not by component/color), so this is real but scoped work, not a moonshot.

**Marcus Webb (Integration):** Following on Craig's point — once photos are tagged by component/color (not just event type), the same tagging feeds three things at once: this live-matching configurator idea, a better filtered public gallery, and better-targeted social exports. One piece of data work, three payoffs.

---

## WHERE THIS LEAVES THINGS

Nothing above is decided. The team's genuine synthesis, in priority order as they see it:

1. Ship the SEO/AEO fixes from Part 2 first — fast, independent, no design work required.
2. Redesign the configurator around Jony's "show me what I'm building" idea — real photos matching real choices, not just a price ticker — as the core differentiator nobody else in Tucson has.
3. Keep the dual-path (guided package + custom build) but make the guided path the clear default, per Angela, instead of two equal buttons.
4. Surface the real deposit/cancellation policy next to the payment CTA instead of leaving it undiscovered until after payment.

Your call on whether this is the right shape before anyone starts building.
