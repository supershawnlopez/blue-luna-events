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
| `src/components/ui/QuoteForm.tsx` | Full 8-field quote form |
| `src/components/ui/ScrollReveal.tsx` | Scroll animation trigger |
| `src/lib/config.ts` | **All business data** — SITE_CONFIG, PACKAGES, EVENT_TYPES, NAV_LINKS |
| `src/lib/actions.ts` | `submitLead()` server action → Supabase insert |
| `src/lib/supabase.ts` | Supabase client + Lead and GalleryPhoto types |
| `public/images/` | hero-main.jpg, hero-sec.jpg, gal-1 through gal-5, logos, icon |
| `netlify.toml` | Build config — do not touch |

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

Required in Netlify dashboard and in `.env.local` for local dev:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## DEPLOYMENT

- GitHub repo: `github.com/supershawnlopez/blue-luna-events`
- Every push to `main` → Netlify auto-deploys
- Build command: `npm run build`
- Publish directory: `.next`
- Plugin: `@netlify/plugin-nextjs`

---

## CURRENT STATE

| Feature | Status |
|---|---|
| Homepage | ✅ Built — needs full redesign |
| Quinceañeras landing page | ✅ Built — needs redesign |
| Graduations landing page | ✅ Built — needs redesign |
| Gallery page | ✅ Built (hardcoded 7 photos) — needs redesign |
| Get-a-quote page | ✅ Built — needs redesign |
| Lead capture (Supabase) | ✅ Working |
| Lead notification to Monica | ❌ Not built |
| Admin leads dashboard | ❌ Not built |
| Dynamic gallery (Supabase) | ❌ Not built |
| Email auto-reply on quote | ❌ Not built |

---

## WORK QUEUE

### 🎨 Phase 1 — Design Rebuild (ACTIVE)
- [ ] Lock design decisions with Shawn (colors, fonts, sections, reference sites, logo)
- [ ] Rebuild `globals.css` — clean design tokens, utility classes
- [ ] Rebuild `Nav.tsx`
- [ ] Rebuild `Hero.tsx`
- [ ] Rebuild `Packages.tsx` + `BookingSheet`
- [ ] Rebuild `Reviews.tsx`
- [ ] Rebuild `Why.tsx`
- [ ] Rebuild `CTA.tsx`
- [ ] Rebuild `GalleryPreview.tsx`
- [ ] Rebuild `Footer.tsx`
- [ ] Rebuild `gallery/page.tsx`
- [ ] Rebuild `quinceaneras/page.tsx`
- [ ] Rebuild `graduations/page.tsx`
- [ ] Rebuild `get-a-quote/page.tsx`

### ⚙️ Phase 2 — Backend
- [ ] Lead notification: Netlify function → email/SMS to Monica on new lead
- [ ] Admin dashboard: password-protected page to view/manage leads
- [ ] Dynamic gallery: connect to Supabase `gallery_photos` table
- [ ] Email auto-reply to quote requester

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
