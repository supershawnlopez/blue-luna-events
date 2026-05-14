# TASKS.md
### Execution board for Blue Luna Events
### Single source of truth for active work

---

## OPERATING RULES

1. Only one active phase at a time.
2. Max 3 tasks in `NOW`.
3. New ideas go to `BACKLOG`, not `NOW`.
4. If a critical issue appears, pause and re-rank `NOW`.
5. Update this file before ending a session.

---

## CURRENT PHASE

**Phase 1: Package Configurator + Lead Automation**

Goal:
- Replace the manual quote process with a real-time package configurator
- Customers build their own package, see price instantly, and pay a 50% deposit via Stripe
- Monica stops losing 50% of leads at price reveal — the price is already theirs before they submit
- Psychological upgrade path baked in: customers self-upgrade or self-select to budget

Exit criteria:
1. Configurator live on /get-a-quote — 4-step flow: Event Type → Package → Add-Ons → Details
2. Real-time pricing displayed at every step
3. Consultation path triggers correctly (≥$1,200 total OR Luxury tier OR 4+ add-ons)
4. Leads write to Supabase with full package + pricing data
5. Monica gets email notification within minutes of each new lead (Resend)
6. Stripe deposit redirect working for non-consultation bookings

---

## NOW (MAX 3)

1. Supabase schema update — leads table new columns
- Owner: Shawn (manual step — paste SQL in Supabase SQL editor)
- Status: PENDING SHAWN ACTION
- SQL is in CHANGELOG.md (May 13 session) — includes package fields + custom_build (jsonb) + custom_request (text)
- After running: Function Agent updates src/lib/actions.ts to insert all fields

2. Update src/lib/actions.ts — full configurator insert
- Owner: Function Agent
- Status: BLOCKED on #1 (schema must exist first)
- Fields to insert: package_id, package_name, add_ons, quoted_total, is_consultation, deposit_paid, deposit_amount, source, custom_build, custom_request

3. Resend email notification to Monica
- Owner: Function Agent
- Status: Not started
- Netlify function or Next.js route handler
- Triggers on new lead submission
- Sends to monica@bluelunaevents.com with full package + pricing details

---

## COMPLETED (Phase 1 core — do not reopen)

- ✅ config.ts consolidation — PACKAGE_CATALOG, ADD_ONS, PRICING_RULES, CONFIGURATOR_EVENT_TYPES, getPackagesForEvent()
- ✅ Packages.tsx, quinceaneras/page.tsx, graduations/page.tsx — import from config.ts
- ✅ src/lib/pricing.ts — computeTotal(), computeCustomTotal(), CustomBuild type, all rate constants, formatPrice()
- ✅ src/lib/supabase.ts — Lead type extended with configurator fields
- ✅ src/components/ui/PackageConfigurator.tsx — 4-step dual-path configurator (package + à la carte custom build)
- ✅ src/app/get-a-quote/page.tsx — uses PackageConfigurator

---

## NEXT (in order)

1. Stripe Checkout integration
   - 50% deposit on non-consultation bookings
   - After configurator Step 4 submit → redirect to Stripe Checkout
   - On success: mark deposit_paid = true in Supabase
   - On cancel: lead still saved, Monica follows up manually
   - Blocker: verify Stripe keys are in Netlify env vars

2. Phase 2 — component photos in custom builder
   - Add product photos to each à la carte option (garland tiers, backdrops, columns, etc.)
   - Source: Monica's Instagram content
   - Goal: help clients visualize what they're building

3. Google Calendar date availability (confirm approach with Shawn first)
   - Option A: Supabase-backed booked_dates list, Monica updates manually (simple)
   - Option B: Google Calendar API — show real availability in Step 4 (complex)
   - Decision needed from Shawn before building

---

## BLOCKED

1. Stripe setup
- Blocker: Need to verify if Stripe keys are already in Netlify env vars
- Action: Shawn to check Netlify dashboard → Site Settings → Environment Variables

2. Google Calendar approach
- Blocker: Decision needed from Shawn — manual Supabase list vs. Google Calendar API

---

## BACKLOG (Phase 2)

1. Design rebuild — globals.css, Nav, Hero, all sections, quince/grad/gallery pages
   (Paused; configurator is higher priority. Design refresh follows once core conversion
   machine is working.)
2. Admin leads dashboard (view + manage leads, password-protected)
3. Dynamic gallery (Supabase-backed, Monica manages photos without code deploy)
4. Email auto-reply to quote requester on submission
5. bl_pricing.json — decide: add to .gitignore? (contains private home address)

---

## SESSION UPDATE TEMPLATE

Use this at session end:

```md
### Session Update (YYYY-MM-DD)
- Done:
  - ...
- Moved to NEXT:
  - ...
- Added to BACKLOG:
  - ...
- Blockers:
  - ...
```
