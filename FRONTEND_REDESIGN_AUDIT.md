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

## OPEN QUESTION FOR SHAWN

Steve's question above is the one that actually needs an answer before the team can give a real recommendation: when you say "we're not happy with it" — is that about how it *looks*, or about what it's *producing* (leads, bookings)? The technical fixes in Part 2 are cheap, fast, and don't require a visual redesign at all. A full ground-up visual redesign is a much bigger, slower undertaking. Knowing which problem you're actually trying to solve changes which one the team would prioritize first.

Read this, add your own view, and we'll decide together — nothing here is being built yet.
