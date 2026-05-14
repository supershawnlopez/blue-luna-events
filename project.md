# PROJECT.md — Blue Luna Events Site Intelligence File
### Read this first. Every AI, every session, every time.
*Last updated: May 2026*
*Companion files: `AGENTS.md` (execution map) and `TASKS.md` (active board).*

---

## WHO YOU ARE WORKING FOR

**Shawn Lopez** — Owner, Say It Marketing, Tucson AZ. In business since 1999.
Built this site for his client Monica Denogean as part of a portfolio of resellable event/service business templates.

**End client:** Monica Denogean, owner of Blue Luna Events. Non-technical. The site must run itself — Monica should never need to touch code.

---

## THE MISSION

> **Blue Luna Events is a selling machine for Monica.**
> Every pixel, every word, every section exists to get a qualified lead to submit a quote request — without them even realizing they're being sold to.

**Product goal:** Resellable white-label template for any event décor, balloon, or party styling studio. Zero-cost infrastructure (Supabase + Netlify) makes margins attractive. Every feature must work for any similar business — avoid hardcoding Blue Luna-specific values; use `src/lib/config.ts` instead.

---

## TECH STACK

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14.2 (App Router) | |
| Language | TypeScript | |
| Styling | Tailwind CSS + inline styles | Inline only for complex one-off layouts |
| Database | Supabase | `leads` table for form submissions |
| Hosting | Netlify | Auto-deploys from GitHub `main` |
| Icons | lucide-react | |
| Fonts | Cormorant Garamond (display), Inter (body), DM Mono (labels) | Google Fonts via CSS |
| Node version | 18 | Set in netlify.toml |

**Installed but not yet used:** `framer-motion`, `react-hook-form`
**Never add:** jQuery, unnecessary npm packages, or any tool without a clear purpose.

---

## SITE STRUCTURE

| Path | Purpose |
|---|---|
| `src/app/page.tsx` | Homepage — composes all homepage sections |
| `src/app/layout.tsx` | Root layout — Nav + Footer wrapper |
| `src/app/globals.css` | Global styles, design tokens, utility classes |
| `src/app/gallery/page.tsx` | Photo gallery grid |
| `src/app/get-a-quote/page.tsx` | Full quote request form page |
| `src/app/graduations/page.tsx` | Graduation-specific landing page |
| `src/app/quinceaneras/page.tsx` | Quinceañera-specific landing page |
| `src/components/layout/Nav.tsx` | Sticky top nav + full-screen mobile menu |
| `src/components/layout/Footer.tsx` | Footer with contact + social |
| `src/components/sections/` | All homepage sections (Hero, Packages, Reviews, etc.) |
| `src/components/ui/QuoteForm.tsx` | Legacy quote form — no longer used on /get-a-quote |
| `src/components/ui/PackageConfigurator.tsx` | **4-step dual-path configurator** — package or à la carte custom build |
| `src/components/ui/ScrollReveal.tsx` | Scroll animation trigger |
| `src/lib/config.ts` | **All business data** — SITE_CONFIG, PACKAGE_CATALOG, ADD_ONS, PRICING_RULES, CONFIGURATOR_EVENT_TYPES, getPackagesForEvent(), HOMEPAGE_PACKAGES |
| `src/lib/pricing.ts` | `computeTotal()`, `computeCustomTotal()`, `CustomBuild` type, all rate constants |
| `src/lib/actions.ts` | `submitLead()` server action → Supabase insert + fires both Resend emails |
| `src/lib/supabase.ts` | Supabase client + Lead type (all fields) + GalleryPhoto type |
| `src/app/api/stripe/checkout/route.ts` | Creates Stripe Checkout session for 50% deposit |
| `src/app/api/stripe/webhook/route.ts` | Handles `checkout.session.completed` → marks `deposit_paid=true` in Supabase |
| `src/app/booking-confirmed/page.tsx` | Post-payment success page with next-steps guide |
| `public/images/` | hero-main.jpg, hero-sec.jpg, gal-1 through gal-5, logos, icon |
| `netlify.toml` | Build config — do not touch |
| `.claude/settings.json` | Claude Code Stop hook — reminds AI to update docs at session end |

---

## DATABASE — SUPABASE

**Table: `leads`**

| Column | Type | Notes |
|---|---|---|
| id | uuid | auto |
| created_at | timestamptz | auto |
| name | text | required |
| phone | text | required |
| email | text | required |
| event_type | text | required |
| event_date | text | optional |
| venue | text | optional |
| vision | text | optional |
| budget_range | text | optional |
| status | text | new / contacted / quoted / booked / completed |
| package_id | text | configurator package selection |
| package_name | text | human-readable package name |
| add_ons | text | JSON stringified string[] of add-on IDs |
| quoted_total | numeric | live-computed total from configurator |
| is_consultation | boolean | true if total ≥ $1,200 or luxury tier |
| deposit_paid | boolean | default false — flipped true by Stripe webhook |
| deposit_amount | numeric | 50% of quoted_total |
| stripe_payment_intent_id | text | set by webhook on checkout.session.completed |
| source | text | 'configurator' or 'direct' |
| custom_build | jsonb | à la carte component selections (CustomBuild type) |
| custom_request | text | customer free-text for custom items |

**✅ Schema live as of May 14, 2026.** All columns exist in Supabase.

**Table: `gallery_photos`** — defined in `supabase.ts` as `GalleryPhoto` type but not yet built. Gallery page uses hardcoded local images.

---

## DESIGN SYSTEM

### Colors
| Token | Value | Use |
|---|---|---|
| Background | `#FFFFFF` / `#FDFCFA` | Page and section backgrounds |
| Dark sections | `#0D0F0F` | Hero, dark CTAs |
| Text primary | `#0D0F0F` | Headlines, body |
| Text secondary | `#6B7280` | Supporting copy |
| Text muted | `#9CA3AF` | Labels, fine print |
| Accent teal | `#5BBFBF` | Primary accent — buttons, highlights, icons |
| Accent teal dark | `#3A8F8F` | Hover states, italic headline accents |
| Accent gold | `#C9A96E` / `#E8CCA0` | Graduation pages only |
| Border | `#E5E7EB` | Card borders, dividers |

**Rule: Teal is the only accent on all non-graduation pages. No gold outside graduation context.**

### Typography
- Display / headlines: `Cormorant Garamond, Georgia, serif` → Tailwind class `font-display`
- Body / UI: `Inter, sans-serif`
- Labels / eyebrows: `DM Mono, monospace` — 10–11px, uppercase, tracked

### Spacing
- Section padding: `clamp(64px, 10vw, 120px)` top/bottom
- Container: `max-width: 1200px`, centered, `padding: 0 32px`
- Cards: `border-radius: 20px–24px`, generous internal padding

### Component Patterns
- **Eyebrow:** `<div class="eyebrow"><div class="eyebrow-line" /><span class="eyebrow-text">Label</span><div class="eyebrow-line" /></div>`
- **Primary button:** teal background, `#0D0F0F` text, `border-radius: 999px`
- **Ghost button:** transparent, border, `border-radius: 999px`
- **Cards:** white bg, `1px solid #E5E7EB`, subtle box-shadow, rounded

---

## ENVIRONMENT VARIABLES

All required in Netlify dashboard (Site config → Environment variables) AND in `.env.local` for local dev.

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=   # pk_test_... or pk_live_...
STRIPE_SECRET_KEY=                     # sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=                 # whsec_... from Stripe dashboard → Webhooks

# Resend
RESEND_API_KEY=                        # re_... from resend.com → API Keys
```

**Stripe webhook endpoint:** `https://[your-domain]/api/stripe/webhook`
**Stripe webhook event:** `checkout.session.completed`
**Resend sending domains:** `bluelunaevents.com` — DNS records must be verified in Resend dashboard.

---

## DEPLOYMENT

- GitHub repo: `github.com/supershawnlopez/blue-luna-events`
- Every push to `main` → Netlify auto-deploys
- Build command: `npm run build`
- Publish directory: `.next`
- Plugin: `@netlify/plugin-nextjs`

---

## CURRENT STATE
*Last updated: May 14, 2026*

| Feature | Status |
|---|---|
| Homepage | ✅ Built — Phase 2 design rebuild queued |
| Quinceañeras landing page | ✅ Built — Phase 2 design rebuild queued |
| Graduations landing page | ✅ Built — Phase 2 design rebuild queued |
| Gallery page | ✅ Built (hardcoded 7 photos) — Phase 2 redesign queued |
| Package configurator (/get-a-quote) | ✅ Built — 4-step dual path (package + à la carte custom build) |
| Real-time pricing engine | ✅ Built — computeTotal() + computeCustomTotal() |
| Lead capture (Supabase) | ✅ Full schema live — all configurator fields including custom_build, custom_request |
| Monica email notification | ✅ Built — Resend, branded HTML, reply-to = client, call/text CTAs |
| Client confirmation email | ✅ Built — Resend, personalized by event type, order summary, next steps |
| Stripe deposit flow | ✅ Built — Checkout session, webhook, /booking-confirmed page |
| Component photos in custom builder | ❌ Phase 2 — needs images sourced/generated |
| Google Calendar date availability | ❌ Decision pending (manual vs. API) |
| Admin leads dashboard | ❌ Phase 3 |
| Dynamic gallery (Supabase) | ❌ Phase 3 |

---

## WORK QUEUE

### ⚙️ Phase 1 — Configurator + Lead Automation ✅ COMPLETE (May 14, 2026)
- [x] config.ts — single source of truth for all packages, add-ons, pricing rules
- [x] pricing.ts — computeTotal(), computeCustomTotal(), CustomBuild type, rate constants
- [x] PackageConfigurator.tsx — 4-step dual-path (premade package + à la carte custom build)
- [x] get-a-quote/page.tsx — replaced with PackageConfigurator
- [x] Supabase schema — all columns live including custom_build (jsonb) + custom_request (text)
- [x] actions.ts — full insert of all fields, returns leadId, fires both emails
- [x] Monica email notification — Resend, branded HTML, reply-to = client email
- [x] Client confirmation email — Resend, personalized by event type, order summary, next steps
- [x] Stripe Checkout — /api/stripe/checkout + /api/stripe/webhook + /booking-confirmed
- [ ] **PENDING TEST** — end-to-end live test with Stripe test card 4242 4242 4242 4242

### 🖼️ Phase 2A — Component Photos in Custom Builder (NEXT)
- [ ] Source or generate photos for each à la carte option (15–20 images)
  - Garland: basic, full, luxury tier samples
  - Backdrops: shimmer, hoop frame, rectangle frame
  - Columns: 6ft, 7ft, 8ft with and without toppers
  - Marquee letters: large and small size comparison
  - Centerpieces: basic and premium examples
  - Bouquets: small (5–7 balloons) and large (10–12 balloons)
- [ ] Add images to Step3Custom component in PackageConfigurator.tsx
- [ ] Image Agent handoff brief: see AGENTS.md → Image Agent section

### 🎨 Phase 2B — Full Design Rebuild (BACKLOG)
- [ ] Lock design decisions with Shawn (reference sites, logo finalization)
- [ ] Rebuild `globals.css` — clean design tokens, utility classes
- [ ] Rebuild `Nav.tsx`, `Hero.tsx`
- [ ] Rebuild `Packages.tsx` + `BookingSheet`
- [ ] Rebuild `Reviews.tsx`, `Why.tsx`, `CTA.tsx`, `GalleryPreview.tsx`, `Footer.tsx`
- [ ] Rebuild `gallery/page.tsx`, `quinceaneras/page.tsx`, `graduations/page.tsx`
- [ ] Google Calendar date availability (decision first: manual list vs. API)

### ⚙️ Phase 3 — Admin + Automation (BACKLOG)
- [ ] Admin dashboard: password-protected page to view/manage leads
- [ ] Dynamic gallery: connect to Supabase `gallery_photos` table
- [ ] Next.js upgrade — 14.2 → 16.x (clears remaining npm audit vulnerabilities)

---

## CODING STANDARDS

- **TypeScript:** Strict types. No `any`.
- **Styling:** Tailwind for layout and spacing; inline styles only for complex one-off layouts.
- **Data:** All business data lives in `src/lib/config.ts` — never hardcode Monica's info in components.
- **Icons:** lucide-react only.
- **Never:** Push API keys. Use Netlify env vars. Never expose Supabase service role key client-side.
- **Comments:** Only when the WHY is non-obvious. No narrative comments.

---

## DESIGN PRINCIPLES (owner-specified)

- **Apple-clean:** Massive whitespace, one idea per section, nothing superfluous
- **Luxury:** The site should feel like it costs more than it does
- **Conversion-first:** Beautiful AND a selling machine — not one or the other
- **Mobile-first:** Monica's customers are on their phones
- **No blue** — teal is the brand color; blue reads as generic web
- Fewer elements, more impact — if it doesn't help Monica get a booking, it doesn't exist

---

*This file lives at the root of the blue-luna-events GitHub repo.*
*Every AI working on this project reads this first.*
*Keep it updated. Keep it honest. Keep it focused on the mission.*
