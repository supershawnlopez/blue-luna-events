# TASKS.md
### Execution board for Blue Luna Events
### Current session truth lives in `SESSION_HANDOFF.md`. Read that first.

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

1. End-to-end live test — full Stripe + email flow
- Owner: Shawn
- Status: PENDING TEST
- Use Stripe test card: 4242 4242 4242 4242, any future date, any CVV
- Go through configurator on Netlify → submit → Stripe Checkout → confirm → check /booking-confirmed
- Check Monica's inbox + client inbox for both emails
- Check Supabase leads table: deposit_paid should flip to true after payment

2. Google Calendar date availability — approach decision
- Owner: Shawn decides
- Status: DECISION NEEDED
- Option A: Supabase-backed booked_dates list, Monica updates manually (simple, fast)
- Option B: Google Calendar API — real availability in Step 4 (complex, powerful)

3. Phase 2: component photos in custom builder
- Owner: Function Agent (after Shawn sources photos)
- Status: WAITING ON PHOTOS
- Add Monica's Instagram photos to each à la carte option in Step3Custom
- Source: @BlueLunaMagic Instagram

---

## COMPLETED (Phase 1 core — do not reopen)

- ✅ config.ts consolidation — PACKAGE_CATALOG, ADD_ONS, PRICING_RULES, CONFIGURATOR_EVENT_TYPES, getPackagesForEvent()
- ✅ Packages.tsx, quinceaneras/page.tsx, graduations/page.tsx — import from config.ts
- ✅ src/lib/pricing.ts — computeTotal(), computeCustomTotal(), CustomBuild type, all rate constants, formatPrice()
- ✅ src/lib/supabase.ts — Lead type extended with all configurator fields incl. custom_build + custom_request
- ✅ src/components/ui/PackageConfigurator.tsx — 4-step dual-path configurator (package + à la carte custom build)
- ✅ src/app/get-a-quote/page.tsx — uses PackageConfigurator
- ✅ Supabase schema — all new columns live (ALTER TABLE run May 14)
- ✅ actions.ts — full insert of all fields, returns leadId
- ✅ Stripe Checkout — /api/stripe/checkout + /api/stripe/webhook + /booking-confirmed
- ✅ Resend emails — Monica notification + client confirmation (both with world-class HTML design)
- ✅ .claude/settings.json — Stop hook for end-of-session doc updates

---

## NEXT (in order)

1. Component photos for custom builder — Image Agent task (see AGENTS.md → Image Agent)
   - Source or generate 15–20 images for à la carte options in Step3Custom
   - Place in: `public/images/components/`
   - Hand off to Claude Code to wire into PackageConfigurator.tsx
   - Full brief in AGENTS.md

2. Google Calendar date availability — once approach is decided
   (Option A: manual Supabase booked_dates list — simple, fast to build)
   (Option B: Google Calendar API — real availability, complex)

3. Full design rebuild — Phase 2B (after photos + calendar decision)

4. Next.js upgrade (14.2 → 16.x) — own session, test build after

---

## BLOCKED

1. Google Calendar approach
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
6. Next.js upgrade — currently on 14.2, needs upgrade to 16.x to fix 5 remaining npm audit
   vulnerabilities (DoS, XSS, cache poisoning). Deferred — low risk for this site type but
   must be done before any future launch hardening. Run as its own session, test build after.

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
