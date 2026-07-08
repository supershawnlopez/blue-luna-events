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

**Platform Rebuild — Phase 1: Foundation (two parallel lanes) — APPROVED by Shawn 2026-07-07 (see DECISIONS.md).**

Full audit + team decisions: `PLATFORM_REBUILD_AUDIT.md`. Locked decisions: `DECISIONS.md` (July 7, 2026 entries).

Goal: fix what's broken (unfinished payments, no real calendar) and lay SEO groundwork, without blocking Jony's design work behind it. Package Configurator + Lead Automation (the original Phase 1) is complete — see COMPLETED below — this is the next phase of the full platform rebuild Shawn requested.

**Lane A — blocking, sequential:**
1. Finish Stripe estimate checkout (deposit + balance from `/q/[token]`) + PDF receipt generation + the end-to-end Stripe test that's been pending since May.
2. Build the calendar/availability system — port Found's `availability` / `availability_blocks` / `bookings` tables + slot algorithm, simplified for single-tenant (resolves the Google Calendar decision — Option B, real availability).

**Lane B — non-blocking, parallel (can start immediately alongside Lane A):**
3. SEO/AEO/GEO foundation — per-page metadata, JSON-LD (LocalBusiness + Service/Event + FAQ schema), sitemap.xml, robots.txt, Core Web Vitals pass.
4. Early design exploration (Jony) — does not need to wait on Lane A.

Exit criteria for Phase 1:
1. `STUDIO_PASSWORD` set.
2. Client can pay a deposit and balance on an estimate end-to-end, tested with Stripe test card.
3. PDF receipt generates correctly.
4. Public configurator shows Monica's real availability, not just a date picker with no constraints.
5. Every public page has unique metadata + JSON-LD; sitemap.xml and robots.txt exist.

---

## NOW (MAX 3)

1. **Fix Supabase auto-pause** (NEW — found 2026-07-07, higher priority than anything else)
- Owner: Craig / Shawn
- Status: NOT STARTED — one-time manual restore done 2026-07-07, root cause still open
- The project was found `INACTIVE` (paused) mid-session — the keepalive cron (`/api/cron/keepalive`, Mon+Thu 10am UTC) is evidently not preventing this. A paused DB breaks the live site for real visitors (leads, estimates, gallery, Studio login all fail).
- Investigate: confirm the Vercel cron is actually registered/firing (check `vercel.json` + Vercel dashboard cron logs), or accept periodic manual restores until revenue justifies Supabase Pro ($25/mo removes pausing entirely).

2. **Confirm Stripe test vs. live mode** (NEW — found 2026-07-08, blocks safe testing)
- Owner: Shawn confirms (check Stripe dashboard test-mode toggle, top-left)
- Status: NOT STARTED
- Blocks: the end-to-end Stripe test below. If live mode, do not test with a real card — either switch to test mode temporarily or verify checkout opens correctly without completing payment.

3. Calendar/availability system — port from Found, schema built for future iCloud sync
- Owner: Craig + Priya (schema) → Marcus (wiring into Studio Schedule tab + public configurator)
- Status: NOT STARTED
- Port `availability` / `availability_blocks` / `bookings` tables + slot algorithm, single-tenant scoped
- Design schema so a CalDAV-based two-way sync with Monica's iCloud calendar can be added later without a rebuild (external busy-block source + write-back path for confirmed bookings). The sync itself is a near-term follow-on, not required for this task's completion.

---

## DONE (2026-07-07 to 07-08)

- ✅ Stripe estimate checkout — `/api/stripe/estimate-checkout` (deposit + balance), webhook updated to write `estimates.deposit_paid`/`balance_paid`/`*_paid_at`/`*_stripe_session_id`/`*_stripe_payment_intent_id`.
- ✅ `/studio/estimates/[id]` detail view — client info, line items, payment status, manual "Mark Paid" for Zelle/cash/check, share link, PDF download.
- ✅ `/api/studio/estimates/[id]/pdf` — PDF receipt via `@react-pdf/renderer`.
- ✅ Fixed real bug: Studio estimates list page never fetched from Supabase (hardcoded empty array) — now fetches and derives display status from `deposit_paid`/`balance_paid`.
- ✅ Fixed real bug: `@react-pdf/renderer` was listed in `package.json` but never installed — `npm install` run, `package-lock.json` corrected.
- ✅ `STUDIO_PASSWORD` set (2026-07-08) — turned out the env var already existed but was blank (Shawn had created a placeholder earlier), which is likely why Studio login wasn't working. Value lives in Vercel + local `.env.local`, not in any committed doc.
- ⏳ Still needed before Lane A item 1 is fully done: confirm Stripe test/live mode (item 2 above), then live end-to-end test with Stripe test card `4242 4242 4242 4242` on the deployed site. A real test estimate already exists for this: `/q/6644927be9376058f4b3fa5dac11f034`.

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

## NEXT (in order — Platform Rebuild Phases 2–6, see PLATFORM_REBUILD_AUDIT.md)

1. **Phase 2 — New Design (Jony-led)**: unified visual rebuild across public site + Studio, one design language. Early exploration can start now (Lane B), full build after Phase 1 Lane A completes.
2. **Phase 3 — Camera & Photos**: port Found's in-app `CameraSheet` pattern (zoom, torch, aspect ratio, album-at-capture picker), replacing the native file-input "Shoot" button. Keep existing heart/star model + locked video-thumbnail solution.
3. **Phase 4 — Calendar/Booking UI**: once the Lane A schema/algorithm lands, build Monica's Schedule tab (Calendar/Bookings/Hours) and surface real availability in the public configurator. Follow-on: iCloud CalDAV two-way sync (Monica's personal calendar auto-blocks Blue Luna availability; confirmed bookings push to her iPhone calendar) — requires Monica to generate an Apple ID app-specific password.
4. **Phase 5 — Leads, Contacts, Email**: real Leads system (temperature/status/source, lead→estimate handoff), Contacts phone book, real owner-editable `email_templates` system + Studio editor + campaign send tool. SMS sending capability (Twilio) built alongside, activation gated on Shawn's A2P 10DLC registration.
5. **Phase 6 — Social / Branded Image Generation**: extend Social Export into an automatic branded-image pipeline off starred photos, caption assistance, lightweight posting view.
6. Component photos for custom builder — Image Agent task (see AGENTS.md → Image Agent). Source or generate 15–20 images for à la carte options in Step3Custom, from @BlueLunaMagic Instagram.
7. Next.js upgrade (14.2 → 16.x) — own session, test build after.

---

## BLOCKED

*(none currently — Google Calendar approach resolved 2026-07-07, see DECISIONS.md)*

---

## BACKLOG

1. Admin leads dashboard — superseded by Phase 5's real Leads system above.
2. Dynamic gallery (Supabase-backed, Monica manages photos without code deploy) — largely satisfied by the existing Studio media pipeline; revisit if gaps remain after Phase 3.
3. bl_pricing.json — decide: add to .gitignore? (contains private home address)
4. Next.js upgrade — currently on 14.2, needs upgrade to 16.x to fix 5 remaining npm audit
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
