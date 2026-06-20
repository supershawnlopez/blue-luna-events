# CHANGELOG.md — Blue Luna Events
### Every AI must update this file at the end of every session.
### Format: Date · What was done · What's pending · What's next.

---

## Session: May 14, 2026
**AI:** Claude Code (Sonnet 4.6)
**Worked on:** Stripe Checkout deposit flow + Resend dual email system

### ✅ Completed This Session
- **Stripe setup:** installed `stripe` + `@stripe/stripe-js`, configured Netlify env vars, created webhook endpoint in Stripe dashboard
- **`/api/stripe/checkout/route.ts`** — creates Stripe Checkout session for 50% deposit, passes `lead_id` in metadata
- **`/api/stripe/webhook/route.ts`** — verifies signature, marks `deposit_paid = true` + saves `stripe_payment_intent_id` in Supabase on `checkout.session.completed`
- **`/booking-confirmed/page.tsx`** — post-payment success page with next-steps guide and Monica's contact
- **`PackageConfigurator.tsx`** — non-consultation path now redirects to Stripe after lead save; consultation path shows thank-you screen
- **`actions.ts`** — inserts `custom_build` + `custom_request`, returns `leadId` for Stripe session metadata
- **`supabase.ts`** — Lead type extended with `custom_build` and `custom_request`
- **Supabase schema:** Shawn ran the `ALTER TABLE` SQL — all new columns live
- **Resend dual email system:**
  - Monica's notification: dark branded header, contact card with one-tap call/text, event details table, reply-to set to client's email, Call + Text CTAs
  - Client confirmation: subject personalized by event type, order summary card, numbered next steps (consultation vs. booking variants), Monica contact block, social proof footer — sent from `monica@bluelunaevents.com`
- **`.claude/settings.json`** — Stop hook added: reminds Claude to update CHANGELOG/TASKS/PROJECT.md at session end
- **npm audit fix** — fixed 2 of 7 vulnerabilities (brace-expansion, picomatch); remaining 5 require Next.js 16 upgrade (deferred, noted in TASKS backlog)
- **`.env.local`** — created with placeholders for Stripe + Resend keys

### ⏳ Still Pending
- End-to-end live test of full flow: configurator → Stripe → `/booking-confirmed` → webhook → Supabase `deposit_paid = true`
- Verify both Resend emails land in inbox (not spam) after domain propagation completes

### 🔜 Next (In Order)
1. **Test live flow end-to-end** — use Stripe test card `4242 4242 4242 4242` on Netlify deployment
2. **Google Calendar date availability** — decision needed from Shawn (manual Supabase list vs. Google Calendar API)
3. **Phase 2: component photos in custom builder** — add Monica's Instagram photos to each à la carte option
4. **Next.js upgrade** — 14.2 → 16.x to clear remaining npm vulnerabilities (own session)
5. **Design rebuild** — Phase 2 after Phase 1 is fully tested

---

## Session: May 13, 2026
**AI:** Claude Code (Sonnet 4.6)
**Worked on:** À la carte custom build path — dual-mode configurator

### ✅ Completed This Session
- **Rewrote `src/lib/pricing.ts`** — added custom build pricing layer on top of existing package pricing:
  - `CustomBuild` type: garlandTier + garlandFt, backdrop, columnSize + columnQty + columnToppers, marqueeSize + marqueeQty, centerpieceType + centerpieceQty, bouquetSmall, bouquetLarge, delivery
  - `emptyCustomBuild` default state
  - Rate constants: `GARLAND_RATES`, `BACKDROP_PRICES`, `COLUMN_PRICES`, `MARQUEE_PRICES`, `CENTERPIECE_PRICES`, `DELIVERY_PRICES`
  - `computeCustomTotal(build: CustomBuild): number` — pure function, no side effects
  - `formatPrice()` unchanged; `computeTotal()` unchanged
- **Rewrote `src/components/ui/PackageConfigurator.tsx`** — dual-path configurator:
  - Step 2: Package cards (unchanged) + new "Build My Own" dashed card — both auto-advance to Step 3
  - Step 3A (`Step3Package`): premade package base box + add-on checkboxes + `CustomRequestField`
  - Step 3B (`Step3Custom`): full à la carte component builder — garland (tier pills + footage stepper), backdrop (radio), columns (size pills + qty stepper + toppers checkbox), marquee (size pills + qty stepper), centerpieces (type pills + qty stepper), bouquets (checkboxes), delivery (radio)
  - Sticky running total bar on Step 3 when total > $0
  - `CustomRequestField`: shared textarea — "Describe it — painted wood signs, character cutouts, themed backdrops..." — for custom items Monica prices manually
  - Step 4: itemized summary differs by path (package summary vs. component breakdown), smart CTA (consultation vs. deposit)
  - State machine: `startMode: 'package' | 'custom' | null` drives which Step 3 renders
- Committed and pushed: `8f469c44` — Netlify auto-deploy triggered

### ⏳ Still Pending
- **Supabase schema:** leads table still needs new columns (SQL below — Shawn runs in Supabase SQL editor)
  - Now includes `custom_build` (jsonb) and `custom_request` (text) for the à la carte path
- **`src/lib/actions.ts`:** after schema runs, uncomment full insert (package + custom build fields)
- Resend email notification to Monica on new lead
- Stripe Checkout for 50% deposit (non-consultation bookings)
- Google Calendar date availability approach (decision needed)
- Phase 2: add photos to each component in the custom builder (Monica's Instagram content)

### Supabase SQL to run (paste in Supabase SQL Editor → New query):
```sql
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS package_id              text,
  ADD COLUMN IF NOT EXISTS package_name            text,
  ADD COLUMN IF NOT EXISTS add_ons                 text,
  ADD COLUMN IF NOT EXISTS quoted_total            numeric,
  ADD COLUMN IF NOT EXISTS is_consultation         boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deposit_paid            boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deposit_amount          numeric,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS source                  text,
  ADD COLUMN IF NOT EXISTS custom_build            jsonb,
  ADD COLUMN IF NOT EXISTS custom_request          text;
```
After running: update `src/lib/actions.ts` to insert all fields (package_id, package_name, add_ons, quoted_total, is_consultation, deposit_paid, deposit_amount, source, custom_build, custom_request).

### 🔜 Next (In Order)
1. **Shawn: run Supabase SQL above** — enables full lead data capture for both paths
2. Update `src/lib/actions.ts` — insert all configurator fields after schema update
3. Build Resend email to Monica on new lead (Netlify function or Next.js route handler)
4. Wire Stripe Checkout — 50% deposit redirect for non-consultation path
5. Test live configurator on Netlify (both package and custom paths end-to-end)
6. Phase 2: component photos in builder (Monica's Instagram content)

---

## Session: May 1, 2026 (Session 3)
**AI:** Claude Code (Sonnet 4.6)
**Worked on:** Package configurator build — complete Phase 1 core

### ✅ Completed This Session
- Updated TASKS.md to reflect Phase 1 pivot (configurator-first, design second)
- Removed duplicate PACKAGES arrays from all 3 component files:
  - `src/components/sections/Packages.tsx` — now imports `HOMEPAGE_PACKAGES` from config.ts
  - `src/app/quinceaneras/page.tsx` — now filters `PACKAGE_CATALOG` for `quinceanera` event type
  - `src/app/graduations/page.tsx` — now filters `PACKAGE_CATALOG` for `graduation` event type
  - BookingSheet updated to accept `Package` type (price is now a number, formatted in render)
- Created `src/lib/pricing.ts`:
  - `computeTotal(packageId, addOnIds, opts?)` → PricingResult
  - Consultation trigger: total ≥ $1,200 OR 4+ add-ons
  - `formatPrice(n)` helper
- Updated `src/lib/supabase.ts` — Lead type extended with optional configurator fields
  (package_id, package_name, add_ons, quoted_total, is_consultation, deposit_paid,
  deposit_amount, stripe_payment_intent_id, source)
- Updated `src/lib/actions.ts` — submitLead safely inserts only existing DB columns;
  package info is embedded in `vision` field until schema is updated
- **Created `src/components/ui/PackageConfigurator.tsx`** — full 4-step configurator:
  - Step 1: Event type selector (6 tiles, auto-advances on selection)
  - Step 2: Base package selector (filtered by event type, price displayed)
  - Step 3: Add-on selector (checkboxes, running total, upgrade nudge)
  - Step 4: Details form + order summary + smart CTA (consultation vs. booking)
  - useReducer state machine, real-time pricing via computeTotal()
  - Consultation path shows "Monica will reach out personally" CTA
  - Non-consultation path shows deposit amount
- Updated `src/app/get-a-quote/page.tsx` — replaced QuoteForm with PackageConfigurator

### ⏳ Still Pending
- Supabase schema: new columns not yet added to `leads` table
  (See SQL below — Shawn needs to run this in Supabase SQL editor)
- Resend email notification to Monica on new lead
- Stripe Checkout for deposit payment
- Google Calendar date availability
- bl_pricing.json → decision: add to .gitignore? (has private home address)

### Supabase SQL to run (paste in Supabase SQL Editor → New query):
```sql
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS package_id              text,
  ADD COLUMN IF NOT EXISTS package_name            text,
  ADD COLUMN IF NOT EXISTS add_ons                 text,
  ADD COLUMN IF NOT EXISTS quoted_total            numeric,
  ADD COLUMN IF NOT EXISTS is_consultation         boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deposit_paid            boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deposit_amount          numeric,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS source                  text;
```
After running this, update `src/lib/actions.ts` — uncomment the full insert.

### 🔜 Next (In Order)
1. **Shawn: run Supabase SQL above** — enables full configurator data capture
2. After schema: update actions.ts to insert all configurator fields
3. Build Resend email notification (Netlify function or route handler)
4. Wire Stripe Checkout for deposit
5. Push to main → test on Netlify

---

## Session: May 1, 2026 (Session 2)
**AI:** Claude Code (Sonnet 4.6)
**Worked on:** Configurator strategy + config.ts consolidation + pricing data

### ✅ Completed This Session
- Strategic pivot: replaced quote-form approach with interactive package configurator
  - Rationale: 50% of Monica's leads ghost after manual price reveal
  - Solution: real-time pricing, Stripe deposit, upgrade psychology baked in
- Created `bl_pricing.json` — Monica's full component pricing (garlands, columns,
  centerpieces, backdrops, delivery, fees, payment schedule). Contains private base
  address — never print on client docs.
- Complete rewrite of `src/lib/config.ts` — now single canonical source of truth:
  - CONFIGURATOR_EVENT_TYPES (6 types with emoji + description)
  - PACKAGE_CATALOG (10 packages: 3 general + 4 quince + 3 grad)
  - getPackagesForEvent() helper
  - ADD_ONS (9 add-ons with prices and eventType filters)
  - PRICING_RULES (thresholds, fees, deposit rules)
  - HOMEPAGE_PACKAGES (3 general packages for homepage section)
- Created BRIEF.md, AGENTS.md, PROJECT.md, CHANGELOG.md, TASKS.md
  (Spa Mambo format — project intelligence files for all future AI sessions)
- Confirmed: Netlify + GitHub connected, auto-deploys from `main`

### 🔜 Next (In Order)
1. Update Packages.tsx, quinceaneras/page.tsx, graduations/page.tsx → import from config.ts
2. Add new columns to Supabase leads table
3. Update Lead type (supabase.ts) and submitLead action (actions.ts)
4. Build src/lib/pricing.ts — computeTotal() pure function
5. Build PackageConfigurator.tsx — 4-step useReducer flow
6. Wire Resend email notification
7. Wire Stripe deposit

---

## Session: May 1, 2026 (Session 1)
**AI:** Claude Code (Sonnet 4.6)
**Worked on:** Project documentation setup + codebase audit

### ✅ Completed This Session
- Full codebase audit — read all pages, components, lib files, config
- Confirmed GitHub repo: `github.com/supershawnlopez/blue-luna-events`
- Confirmed Netlify is connected and auto-deploying from `main`
- Identified key gaps: no lead notification, no admin dashboard, hardcoded gallery
- Created `BRIEF.md` — universal AI entry point (modeled on Spa Mambo)
- Created `AGENTS.md` — multi-agent execution playbook
- Created `PROJECT.md` — full project intelligence file (tech stack, design system, file map, work queue)
- Created `CHANGELOG.md` — session history going forward
- Created `TASKS.md` — active execution board

---

## Historical: v4 (current live site)
`bf6c9d4` — "v4 final - full screen nav, event packages, icons, 2026 dates"

- Full-screen mobile navigation overlay
- Event-specific landing pages: `/quinceaneras` and `/graduations`
- Package cards with BookingSheet modal
- FAQ sections on quince and graduation pages
- Stats bar in hero, Summer 2026 badge, Class of 2026 urgency messaging
- Supabase lead capture wired to QuoteForm and BookingSheet

---

## How To Update This File

At the end of every AI session, add a new entry at the top:

```markdown
## Session: [Date]
**AI:** [Which AI / model]
**Worked on:** [Brief topic]

### ✅ Completed This Session
- Item 1

### ⏳ Still Pending
- Item 1

### 🔜 Next (In Order)
1. First priority
```

**Rule:** No AI closes a session without updating this file.
**Rule:** "Next" section is always in priority order.
**Rule:** Move completed items to "Completed" — never delete history.
