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

1. **Real number for "200+ Events Styled" hero stat — needs Shawn/Monica, not derivable from Studio**
- Flagged by Priya during the content-strategy meeting 2026-07-29: nobody has verified this number is real, and Studio's own record count isn't a valid substitute (Studio just launched, Monica's barely used it — her real history is 2018 to now, not what's logged in the app). Needs Shawn or Monica to confirm the real figure, or the stat gets softened/dropped.
- Owner: Shawn/Monica confirm.

2. **Instagram live-feed integration — real technical project, scoped separately from today's visual work**
- Shawn wants an eventual live connection to Monica's real Instagram/Facebook content, but confirmed it should route through Studio's existing hearts (show_on_website) / stars (social_export) system, not a disconnected API pull. Needs Meta Graph API access to Monica's Instagram Business account, developer setup, possible app review. Not a same-session build.
- Owner: needs its own scoping session when Shawn's ready.

3. **Run the real live $1 payment test** (approach decided 2026-07-09 — using the discount trick, now built)
- Shawn confirmed his approach: apply a near-100% discount to a test estimate so the actual charge is ~$1, then complete a real live Stripe payment on himself. Discounts are now built (see `ESTIMATES_PAYMENTS_AUDIT.md` — payment ledger rework shipped 2026-07-09) — Shawn can do this himself from the estimate detail page in Studio whenever ready.
- Owner: Shawn runs the test.

*(Supabase auto-pause watch, mitigation shipped 2026-07-08, moved off NOW to make room — still passively monitored via the weekly summary email; revisit only if that email stops arriving.)*

---

## DONE (2026-07-28)

- ✅ **Lead-submission RLS fix deployed** — the 2026-07-27 fix (was stuck "not yet pushed" for a full day) is confirmed live in production as of 8:06 PM 7/28.
- ✅ **`/get-a-quote` renamed to `/event-questionnaire`** (route + every visible label), with a permanent redirect from the old path. Real-device testing feedback: the old name implied pricing/instant booking, which no longer happens.
- ✅ **Fixed silent zero-email bug** — lead emails were fire-and-forget and failing silently; now awaited.
- ✅ **Fixed real photo-upload bug** — 3 of 4 photos were never reaching Monica (serverless body-size limit, failures silently marked "done"); upload cap raised 6 → 15; email photo grid now wraps.
- ✅ **Dropped a leftover Supabase trigger** sending Monica a duplicate "View in Supabase" email on every lead.
- ✅ **Lead email redesign per Jony's review** — Monica's email renamed "New Lead," split acknowledge-first/quote-second, resized to match the client email, serif headlines + clearer tables on both templates. Client confirmation now shows everything submitted (theme/colors/photos).
- ✅ **Fixed Studio upload hang** — added timeouts to image compression and both upload XHRs so a stuck HEIC decode or stalled network request fails visibly instead of hanging forever.
- 🟡 **`redesign/gallery-twilight` branch started** (Jony's "Gallery + Twilight" homepage direction) — 4 commits, preview-deployed, NOT merged to `main`. See NOW #1 above.

---

## DONE (2026-07-29)

- ✅ **White/Twilight homepage v1 merged to `main` and LIVE in production.** Team meeting resolved the open questions from the 7/28 branch: Twilight (blush/lavender/gold) scoped to Hero + GalleryPreview only, teal stays sole primary accent sitewide (it's Monica's real favorite color/Tiffany Blue, same as the logo — corrected the branch's inaccurate "pulled from the logo" claim). WhyMonica converted to match Packages/Reviews' white background; CTA stays dark intentionally as the closing contrast band.
- ✅ **Pricing removed from Packages sitewide** (homepage, quinceañeras, graduations) — final, per Monica's direct ask to feel consultive not transactional. Tier names/taglines/features untouched; card images escalate per tier instead.
- ✅ Added future "Grab & Go" budget-friendly self-serve page to BACKLOG.
- ✅ **Nav + Footer converted to light theme, merged and LIVE.** Nav now goes light everywhere except transparent-over-hero on the homepage — previously every other page (gallery, event questionnaire, quince/grad) always showed a dark nav regardless of scroll. Mobile full-screen nav rebuilt to actually match the "Calm/Warm" white slide-in-from-right spec that's been locked in `DESIGN_DECISIONS.md` since June 19 but was never built that way — real bug fix, not just a recolor. Footer flipped to match. This closes out Shawn's "is there more than a color swap" feedback — Nav/Footer/homepage are now a coherent, structurally-updated whole.
- ✅ **Gallery, Quinceañeras, Graduations converted to light theme too — LIVE.** Same treatment as the homepage. Gallery's full-screen lightbox stays dark intentionally (standard photo-viewer UX, same reasoning as the homepage CTA staying dark). Also fixed real leftover pricing text on the quince/grad FAQ and CTA copy that the earlier Packages-component-only pass missed (specific dollar figures like "$450," "$75 rush fee") — reworded to the same consultive framing used everywhere else. SEO meta descriptions on both pages still mention pricing — left alone since that's not visible page content, flagged for Shawn to decide separately.
- ⚠️ **Correction, same day:** the above (Nav/Footer/Gallery/Quince/Grad light theme) was still incremental patching, section by section. Shawn stopped this process directly, said it wasted his time and money, and directed one real full redesign pass instead — see the ORBITAL entry below and `DECISIONS.md`/`DESIGN_DECISIONS.md` for the full account, including a false start on the unrelated configurator project that had to be reverted.
- ✅ **Orbital/circular design language — full redesign pass, LIVE.** Real photos cropped as circles and staggered like balloons clustering, echoing Blue Luna's own crescent-moon/balloon logo — the sitewide signature motif per Shawn's direct brief ("modern, fresh, out of the ordinary, not your usual"). Shipped across Hero (floating circular photo cluster with float animation), WhyMonica (circular accent photo), Packages (numbered circular tier markers), Reviews (twilight glow accent), CTA (orbital ring accents), and circular hero-image crops on Quinceañeras/Graduations/Gallery. See `DESIGN_DECISIONS.md` "ORBITAL / CIRCULAR DESIGN LANGUAGE" for the full locked spec.
- ✅ **Real bug found and fixed: homepage GalleryPreview was unfiltered.** Was fetching every photo Monica's ever uploaded, including non-decor candids, instead of her curated `show_on_website` set — same bug class as the silent-failure pattern found repeatedly this week. Fixed to match the real `/gallery` page's existing filter.
- ✅ **Real bug found and fixed: circular hero images not loading.** Next.js `Image fill` without `priority` never fired for these above-the-fold circular crops (confirmed via devtools — the image request never fired, not a timing delay). Added `priority` + `sizes` sitewide to every above-the-fold circular image.
- ✅ **Homepage photo grid replaced with a real video showcase — LIVE.** Shawn flagged genuine redundancy: the homepage gallery preview and `/gallery` page were the same masonry grid at different sizes. Replaced with a bento layout of real event videos (autoplay muted loop, shimmer sweep on hover), pulling from the 23 real videos already in Studio. `/gallery` stays the deep-browse page; the homepage section is now proof-in-motion, not a smaller copy.
- ✅ **All 48 existing Studio uploads defaulted to `show_on_website=true`** — Shawn's explicit executive call. Studio is brand new and Monica hasn't started real curation yet; she only uploaded things she already liked, so defaulting everything live unblocks today's content work. Revisit with real curation once she's actively using Studio.
- 🟡 **Open, needs Shawn/Monica:** the "200+ Events Styled" hero stat has never been verified as real — see NOW above.
- 🟡 **Open, scoped as its own project:** live Instagram/Facebook feed integration, routed through Studio's existing hearts/stars system rather than a disconnected API pull — see NOW above.

---

## DONE (2026-07-27)

- ✅ **`/get-a-quote` replaced: inquiry form instead of pricing configurator** — see `DECISIONS.md` "INQUIRY FORM REPLACES CONFIGURATOR" for full reasoning. New `InquiryForm.tsx`, all-white page, no pricing shown anywhere. Feeds the same `leads` table Monica already sees; she quotes manually via the existing Studio estimate tool (no new payment surface built or needed).
- ✅ **Real production bug fixed: lead submission was completely broken (RLS)** — see `DECISIONS.md` for root cause. Not yet deployed — see NOW #3 above.
- ⚠️ **NEXT #1 below ("Configurator redesign") is now superseded** by the decision above — do not resume building real-time-pricing-with-photos work on `/get-a-quote` without a fresh conversation with Shawn first, since the whole premise (showing price live) is what today's change reverses.

---

## DONE (2026-07-07 to 07-09)

- ✅ **Payment ledger rework shipped** (2026-07-09, commit `b74a9a4e`): replaced the fixed 50/50 deposit/balance booleans with a real `estimate_payments` ledger + `src/lib/estimateBalance.ts` shared calculation. Built: discount editor (percent/flat + note), manual "Record Payment" flow (Zelle/cash/check + note), real "Email Estimate to Client" system-send (PDF attached + live link, reply-to Monica), PDF and client page both rewritten to show subtotal/discount/total/paid/owed live. Stripe checkout now charges the actual amount owed instead of a fixed split. Live-tested end-to-end on the real production estimate (added a payment, applied a discount, generated PDF, created a real Stripe session, confirmed math, then cleaned up test data). Full detail in `ESTIMATES_PAYMENTS_AUDIT.md` and `DECISIONS.md`.
- ✅ **Email fully fixed and confirmed working** (2026-07-08): three stacked bugs found and fixed — unverified Resend domain (missing DKIM/SPF since May 14), an invalid `RESEND_API_KEY` in Vercel, and a completely missing MX record so nothing routed mail to Monica's real Namecheap-hosted mailbox at all. Shawn confirmed real-world: **can now both send and receive at `monica@bluelunaevents.com`.** Full detail in `DECISIONS.md`.
- ✅ **SEO/AEO/GEO 5 fixes shipped** (2026-07-08): `layout.tsx` JSON-LD `@type` fixed to `LocalBusiness`; fake `aggregateRating` (50 claimed, 3 shown) removed pending real data; `/quinceaneras` and `/graduations` converted from unnecessary client components to real Server Components, each now has its own tailored `metadata`; `FAQPage` JSON-LD added to both from existing FAQ content; `src/app/sitemap.ts` and `src/app/robots.ts` added. Commit `8951d7b0`.
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

## NEXT (in order)

1. **Configurator redesign — the core of the frontend rebuild** (APPROVED 2026-07-08, see DECISIONS.md + DESIGN_DECISIONS.md + FRONTEND_REDESIGN_AUDIT.md)
   - Tag gallery photos by component/color (garland tier, backdrop type, palette), not just `event_type` as today — prerequisite data work, owned by Craig/Priya. Vocabulary already exists in `LOOKING_FOR_CATEGORIES` in `config.ts` — nothing to invent.
   - Configurator shows real matching gallery photos as the customer builds, not just a running price total (Jony's core idea)
   - Step 2 restructured so the guided package path is the clear default; "Build My Own" becomes a quieter secondary option, not a co-equal button (Angela's fix)
   - Surface the real deposit/cancellation policy (`PRICING_RULES.depositNonRefundableAfter`) next to the payment CTA — currently exists in code but is never shown to the client
   - **⚠️ Two false starts on this exact item, 2026-07-29** — general "keep going" / "move forward" language was twice misread as approval to start this. Do NOT resume without Shawn explicitly naming this project by name.
2. **Phase 2 — Remaining visual rebuild (Jony-led)**: everything outside the configurator — homepage, Studio, remaining sections — one unified design language across public site + Studio.
3. **Phase 3 — Camera & Photos**: port Found's in-app `CameraSheet` pattern (zoom, torch, aspect ratio, album-at-capture picker), replacing the native file-input "Shoot" button. Keep existing heart/star model + locked video-thumbnail solution.
4. **Phase 4 — Calendar/Booking**: port Found's `availability`/`availability_blocks`/`bookings` tables + slot algorithm, single-tenant scoped, schema built for future iCloud CalDAV sync. Build Monica's Schedule tab and surface real availability in the public configurator. Follow-on: iCloud two-way sync — requires Monica to generate an Apple ID app-specific password.
5. **Phase 5 — Leads, Contacts, Email**: real Leads system (temperature/status/source, lead→estimate handoff), Contacts phone book, real owner-editable `email_templates` system + Studio editor + campaign send tool. SMS sending capability (Twilio) built alongside, activation gated on Shawn's A2P 10DLC registration.
6. **Phase 6 — Social / Branded Image Generation**: extend Social Export into an automatic branded-image pipeline off starred photos, caption assistance, lightweight posting view.
7. Component photos for custom builder — Image Agent task (see AGENTS.md → Image Agent). Source or generate 15–20 images for à la carte options in Step3Custom, from @BlueLunaMagic Instagram.
8. Next.js upgrade (14.2 → 16.x) — own session, test build after.

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
5. **"Grab & Go" — separate, budget-friendly, self-serve page** (added 2026-07-29, per Shawn/Monica)
   Future work, not scheduled yet. Mirrors the dual self-serve + consultative model
   `FRONTEND_REDESIGN_AUDIT.md` found Air With Flair Decor already running in this exact
   industry — pairs with the now-final "no pricing on Packages" decision by giving
   price-sensitive clients their own transparent, self-serve path instead of pricing
   living on the main site.

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
