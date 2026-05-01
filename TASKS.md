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

1. ✅ Consolidate package data into config.ts (single source of truth)
- Owner: Function Agent
- Status: DONE — `src/lib/config.ts` is now canonical. PACKAGE_CATALOG (10 packages),
  ADD_ONS (9 add-ons), PRICING_RULES, CONFIGURATOR_EVENT_TYPES, getPackagesForEvent()
- Remaining: update Packages.tsx, quinceaneras/page.tsx, graduations/page.tsx to import
  from config.ts instead of their local PACKAGES arrays

2. Update 3 component files to import from config.ts
- Owner: UI Agent
- Status: IN PROGRESS (next immediate task)
- Files: src/components/sections/Packages.tsx, src/app/quinceaneras/page.tsx,
  src/app/graduations/page.tsx
- Action: Remove local PACKAGES arrays, import HOMEPAGE_PACKAGES / getPackagesForEvent()

3. Supabase schema + type updates
- Owner: Function Agent
- Status: Not started
- New columns needed on `leads` table:
  - package_id (text)
  - package_name (text)
  - add_ons (text — JSON stringified array)
  - quoted_total (numeric)
  - is_consultation (boolean)
  - deposit_paid (boolean, default false)
  - deposit_amount (numeric)
  - stripe_payment_intent_id (text)
  - source (text — 'configurator' | 'direct')
- After schema: update Lead type in supabase.ts, update submitLead in actions.ts

---

## NEXT (in order)

1. Build src/lib/pricing.ts — computeTotal(packageId, addOnIds) pure function
   - Must match client-side display exactly
   - Used by configurator UI + server-side verification in submitLead
   - Apply PRICING_RULES: rush fee, distance fee logic

2. Build PackageConfigurator.tsx
   - useReducer state machine
   - Step 1: Event Type (from CONFIGURATOR_EVENT_TYPES)
   - Step 2: Base Package (filtered by event type via getPackagesForEvent())
   - Step 3: Add-Ons (filtered by event type, show upgrade math trap)
   - Step 4: Details (name, phone, email, event date, venue) + summary + CTA
   - Upgrade nudge: "Add [X] to reach Signature — save $Y"
   - framer-motion for step transitions (already installed)

3. Replace /get-a-quote/page.tsx with PackageConfigurator
   - Remove old QuoteForm component (or keep as fallback — decide with Shawn)

4. Resend email notification
   - Netlify function or Next.js route handler
   - Triggers on new lead submission
   - Sends to monica@bluelunaevents.com with full package details

5. Stripe Checkout integration
   - 50% deposit on non-consultation bookings
   - After configurator Step 4 submit, redirect to Stripe Checkout
   - On Stripe success: mark deposit_paid = true in Supabase
   - On cancel: lead still saved, Monica follows up manually

6. Google Calendar date availability (confirm approach with Shawn first)
   - Option A: Supabase-backed booked_dates array, Monica updates manually
   - Option B: Google Calendar API integration — show availability in Step 4
   - Shawn to decide

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
