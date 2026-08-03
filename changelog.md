# changelog.md — Current Session History
### Keep this file readable. Older detailed history lives in `CHANGELOG_ARCHIVE.md`.
*Last organized: July 6, 2026*

---

## Current History Policy

- `SESSION_HANDOFF.md` is the first source of truth for what changed, what is open, and what Shawn tests next.
- `changelog.md` keeps recent active work only: the current working window plus anything still affecting launch/test decisions.
- `CHANGELOG_ARCHIVE.md` keeps older detailed history so context is never lost.
- When history gets heavy, move older completed sessions to `CHANGELOG_ARCHIVE.md` and leave a short summary here.

---

## Session: August 3, 2026, even later — Phase 5: Leads, Contacts, Email, SMS
**AI:** Claude Code
**Worked on:** Shawn approved moving straight to Phase 5, the last big phase of the originally-scoped Studio Intelligence rebuild.

### Completed This Session
- **Leads**: `leads.temperature` column (hot/warm/cold, no default). New Studio Leads tab (6th bottom-nav icon) — status/temperature filters, Call/Text/Email quick actions, "Create Estimate" handoff reusing the estimate builder's existing prefill query params. `/api/studio/leads` (GET) + `/api/studio/leads/[id]` (PATCH).
- **Contacts**: new `contacts` table — real client phone book, not every raw lead. `/api/studio/contacts` (GET/POST/PATCH/DELETE) + `/api/studio/contacts/import` (one-tap import from `estimates`, deduped by email/phone). New Studio Contacts page, reachable from Leads.
- **Email templates + campaigns**: `email_templates` + `campaign_sends` tables, `/api/studio/templates` CRUD, `/api/studio/campaigns/send`. Real unsubscribe (`contacts.unsubscribed` + `unsubscribe_token`, public `/api/unsubscribe`). Shared branded email shell (`src/lib/campaignEmail.ts`) matching the existing estimate-email look. New Studio Templates page, reachable from Contacts.
- **SMS**: real `sms:` deep-link quick actions on Leads + Contacts detail sheets (zero setup, works today). `src/lib/sms.ts` — real Twilio-backed `sendSms()`, gated behind an explicit config check, genuinely untested (no Twilio account exists for Blue Luna yet).
- Full architecture reasoning for every scope call (why Contacts isn't every lead, why no SMS mail-merge language, why the unsubscribe was added unprompted, the CAN-SPAM/private-address conflict) in `DECISIONS.md` "PHASE 5" section.
- Verified: clean `tsc`/`npm run build`, every new API route confirmed `ƒ Dynamic`. Real end-to-end testing against live production data — real leads list, a real contact import (2 real contacts, correctly deduped), a real template created, a real campaign-send attempt confirmed to fail gracefully and log the reason (Resend key is a local-only placeholder — same limitation as every other email feature in this repo locally). Browser-verified all three new screens.

### Still Open
- Shawn to real-device test Leads, Contacts, and the campaign tool — ideally sending a first real template to himself before ever sending to real clients.
- SMS bulk-send needs Shawn's own Twilio account + A2P 10DLC carrier registration before it can be trusted as real.
- Phase 6 (Social/Branded Image Generation) is the last phase in the original rebuild plan, not started.

### Shawn Test
1. Studio → Leads → open a real lead → set temperature, change status, try Call/Text/Email.
2. Leads → "Contacts" → "Import from Estimates" → confirm real past clients appear.
3. Contacts → "Email Templates & Campaigns" → build a real template → send it to just yourself first.

---

## Session: August 3, 2026, continued — Phase 4 Calendar/Booking + a real caching bug
**AI:** Claude Code
**Worked on:** Shawn said to do Phase 4 next (Calendar/Booking), following the team-directed order.

### Completed This Session
- **Phase 4 shipped**, scoped to Blue Luna's real shape (one event per day) rather than Found's generic hourly-appointment engine — see `DECISIONS.md` 2026-08-02 for the full reasoning. New `availability_blocks` + `external_busy_blocks` (future CalDAV) tables, `src/lib/availability.ts`, public `/api/availability`, Studio `/api/studio/availability`, new Schedule tab (5th Studio nav item, month calendar), and a real availability-aware calendar replacing the bare date input on the public Event Questionnaire.
- **Found and fixed a real production bug while testing**: `force-dynamic` alone wasn't reliably busting Next.js's fetch cache for Supabase queries — confirmed directly (added real data, the public endpoint kept serving the old result while a raw curl against the database was correct). This affected `/api/studio/today`, `/api/studio/analytics`, `/api/studio/stats`, `/api/availability`, and by extension anything relying on those. Fixed at the shared `serverClient()` level (forces `cache: 'no-store'`) and consolidated 9 other files that were each independently creating their own Supabase client (including the public gallery feed and the client-facing `/q/[token]` estimate page) onto the same shared, now-fixed client. Full detail in `DECISIONS.md` 2026-08-03.
- Verified: clean `tsc`/`npm run build`, confirmed every API route now shows `ƒ Dynamic` (none `○ Static`) in the build output, live end-to-end test (added a real block, confirmed the public calendar reflected it immediately and consistently), browser-tested both the Studio Schedule page and the public calendar picker visually.

### Still Open
- Shawn to test Schedule + the public availability calendar for real.
- Phase 5 (Leads/Contacts/Email) is next in the approved order.
- Phase 3 Camera still needs Shawn's real-device confirmation.

### Shawn Test
1. Studio → Schedule → block a date → confirm it shows on the calendar and in the list.
2. `/event-questionnaire` → open the date picker → confirm that date shows struck-through.
3. Tap a booked (teal) date on Schedule → confirms it opens that client's estimate.

---

## Session: August 3, 2026 — Google Search Console + Phase 3 Camera & Photos
**AI:** Claude Code
**Worked on:** Closed out Google Search Console setup from the prior session's analytics decision, then Shawn said to move forward on the Studio Intelligence rebuild's next phases in the team-directed order.

### Completed This Session
- Google Search Console fully verified (DNS TXT record added via Vercel API, Shawn verified ownership in the UI) and `sitemap.xml` submitted — `Success`, 9 pages discovered. Cleaned up an unrelated stale `sitemap_index.xml` entry from May 2025.
- **Phase 3 — Camera & Photos.** Ported Found's real in-app `CameraSheet` (zoom, torch, aspect ratio, photo/video, iOS permission-denied handling) into `src/components/studio/CameraSheet.tsx`, replacing the native camera-app handoff on My Work's "Shoot" button. Skipped Found's annotation feature (not approved scope). Confirmed Blue Luna's existing event-type-first flow already satisfies "album-at-capture-time picker" — no change needed there. New captures flow through the same upload pipeline (`processFiles`/`runUploads`) the file picker already used.
- Found and fixed a local-only dev gap: `.env.local` was missing `STUDIO_SESSION_TOKEN`, silently breaking local Studio login (production unaffected).
- Verified: clean `tsc`/`npm run build`, real browser test against a live login and real media library — event-type sheet, camera UI, and permission-denied error path all confirmed working. Actual capture unverified (no camera hardware in the test sandbox).

### Still Open
- Shawn to confirm the real camera works end-to-end on his actual phone.
- Cancel the duplicate Google Business Profile — still pending.
- The real live $1 Stripe payment test — still Shawn's to run.
- Phase 4 (Calendar/Booking) is next in the approved order.

### Shawn Test
1. Studio → My Work → Shoot — should open a real in-app camera (zoom/flash/ratio controls), not your phone's own camera app.
2. Take a photo or short video, tap "Add to Studio," confirm it lands in your library correctly tagged.

---

## Session: August 2, 2026 — Studio Intelligence North Star + "Today" Surface + Real Traffic Analytics
**AI:** Claude Code
**Worked on:** Shawn asked the team to resume the backend/Studio rebuild scoped in `PLATFORM_REBUILD_AUDIT.md` (Phases 3-6, never started). Before building, he raised the bar with his own brief across a real 3-round team meeting: Studio has to make both him and Monica say "wow," it has to think for her since she's not technical, Steve and Jony are the required approval gate, and it needs Apple/iOS-level ease — daily/weekly/monthly/quarterly usefulness, real traffic/source stats, and help promoting. Full reasoning and all locked decisions in `DECISIONS.md` "CUSTOM BACKEND / STUDIO INTELLIGENCE SYSTEM."

### Decided
- Build order flipped: design the home "Today" surface first (what needs Monica's attention right now), build features as what it pulls from — not the old feature-list order.
- Rules-based smart surfacing now. AI-generated suggestions explicitly deferred — Shawn was direct that's a future layer, not now.
- Analytics: Vercel Analytics + Google Search Console, team's call (Shawn delegated), using both for different signals rather than picking one.
- No design-mockup ceremony step — Shawn trusts Jony to execute directly; Steve stays in the loop at a high level.

### Completed This Session
- **Found and committed real uncommitted security fixes from a prior (crashed) session** — `middleware.ts` had zero auth check on `/api/studio/*` API routes (only page routes were gated); `/q/[token]` was fetching estimates with the anon key and forwarding client PII + internal fields to the browser. Both fixed in the working tree already, verified against a clean build, committed separately. Commit `96086086`.
- **Studio home rebuilt around a real "Today" surface** (`/api/studio/today`) — rules-based, no AI: untouched leads (status still `new`), estimates with an event soon and a balance still owed, events coming up without payment issues, and starred-but-unposted photos. Replaces the old static-only stats-first dashboard; empty state reads "You're all caught up."
- **Self-hosted traffic analytics** — new `site_visits` Supabase table, a public `/api/track` beacon fired from a `VisitTracker` client component in the root layout (public site only, Studio itself excluded), and `/api/studio/analytics` aggregating this week's visit count vs. last week + a referrer-channel breakdown (Instagram/Facebook/Google/Direct/Other) in plain English on the Studio home screen. Built self-hosted (not just an external Vercel dashboard link) specifically so Monica can see it without needing her own separate analytics account.
- **`@vercel/analytics` added** as a second, zero-effort traffic source for Shawn's own use.
- Verified: `tsc --noEmit` clean, full `npm run build` clean (all new routes registered), a real Supabase insert/read/delete smoke test against `site_visits` before wiring the app to it. Both commits pushed, Vercel deployment confirmed `READY`/production (`dpl_4Q5CKyagwgaYrMqBFGvyhDAMppwk`). Commit `212dc29b`.

### Still Open
- **Google Search Console** — needs Shawn (or Monica) to actually create the property at search.google.com/search-console under a real Google login; Claude can then wire the DNS verification record via the Vercel API token already on file and submit the existing `sitemap.xml`. Not something Claude can do alone.
- Shawn to cancel the duplicate Google Business Profile under his own email — still not confirmed done.
- The real live $1 Stripe payment test — still Shawn's to run.
- Full Phases 3-6 (Camera, Calendar/Booking, Leads/Contacts, real email templates, Social) are still ahead — Today surface + analytics were the first concrete piece under the new north star, not the whole rebuild.
- `site_visits` has no data yet as of this deploy — the "This Week" card will read "just turned on" until real traffic accumulates.

### Shawn Test
1. Open Studio on your phone — the home screen should now lead with a "Today" section (or "You're all caught up" if nothing's pending), not just the stats grid.
2. Below that, a "This Week" traffic card — will say tracking just started until a few days of real visits come in.
3. Tapping a lead in Today should open your phone's dialer with that client's number already filled in.

---

## Session: August 1, 2026 — Real Reviews, Estimates Round 3, Four Landing Pages
**AI:** Claude Code
**Worked on:** Shawn confirmed the real Google review, and greenlit three prior open items in one message: rebuild Reviews, scope + build the event-type landing pages, and ship the previously-approved Estimates Round 3 design.

### Completed This Session
- Verified Christian Ortiz's real 5.0★ Google review live on Google Maps (reviewer, text, event type) rather than guessing or reusing old fabricated content. Rebuilt `Reviews.tsx` as a real-review spotlight card + a "Leave a Google Review" CTA card, re-added to `page.tsx`. Commit `0c287592`.
- Shipped `ESTIMATES_PAYMENTS_AUDIT.md` Round 3, approved 2026-07-09 but never built: discounted total shown bold with the original struck through, "paid so far" line describes the discounted balance, decorative icon + card wrapper replaced with flat rows on a hairline divider. Verified visually by temporarily discounting the real Shawn Lopez test estimate via Supabase, screenshotting the Studio estimates list, then reverting. Commit `3650a057`.
- Short team discussion on landing-page depth (Phil/SEO led) — went with full depth matching `/quinceaneras`/`/graduations`, not lighter pages. Built `/weddings`, `/birthdays`, `/baby-showers`, `/corporate-events`: hero, features, packages (reusing the existing general Essential/Signature/Luxury tiers), FAQPage schema with consultive no-bare-number pricing answers, CTA. Updated footer links (previously `/#packages` for 3 of them, Baby Showers wasn't linked at all) and `sitemap.xml`. Commit `f9325c5b`.
- All three deploys confirmed `READY`/production on Vercel and live on `bluelunaevents.com`.

### Still Open
- Shawn to cancel the duplicate Google Business Profile under his own email — not yet confirmed done.
- The real live $1 Stripe payment test — still Shawn's to run.
- The 4 new landing pages use the same static local photo pool as `/quinceaneras`/`/graduations` (not real Supabase photos tagged by event type) — same tolerance already live elsewhere on the site, not a regression, but a real fix needs Monica's photos tagged by event type.

### Shawn Test
1. `bluelunaevents.com` — scroll to Reviews, confirm the real review + "Leave a Google Review" card.
2. Studio → Estimates list — a discounted estimate should show struck-through original + bold discounted price, flat rows, no icon.
3. `bluelunaevents.com/weddings`, `/birthdays`, `/baby-showers`, `/corporate-events` — each loads as a real page.

---

## Session: July 30, 2026, evening — Google Business Profile Confirmed + Review Button
**AI:** Claude Code
**Worked on:** Shawn set up Google Business Profile, briefly thought it was a duplicate of one Monica already had (it showed unfamiliar photos/reviews), almost cancelled it before checking with Claude.

### Completed This Session
- Traced the confusion: profile is real, single, under Monica's own Gmail — the "unfamiliar" content was Shawn's own pending edits not yet cleared Google's review queue, not a second profile. Confirmed nothing needed cancelling here.
- Identified a real separate duplicate: a second profile Shawn had started under his own email before catching the mix-up. Gave him cancellation steps (his to complete).
- Added `SITE_CONFIG.googleReviewUrl` (`g.page/r/CZsdOfmFmuebEAE/review`) and a "Leave us a review" footer link, opens in new tab. Build verified clean, pushed to `main`.

### Still Open
- Shawn to cancel the duplicate profile under his own email — not yet confirmed done.
- Shawn to confirm who left the existing "1 Google review" (5.0★) before it's ever treated as real.
- Rebuild homepage Reviews section once real reviews exist (testimonials were confirmed fabricated earlier the same day — see below).

### Shawn Test
1. Footer on any page should show a "Leave us a review" star link under phone/email/address.

---

## Session: July 30, 2026 — Hero Video Fix, Business-Wide Audit, SEO Fixes (reconstructed after a second crash)
**AI:** Claude Code
**Worked on:** A second crash (same pattern as 2026-07-28) cut off `SESSION_HANDOFF.md`/`changelog.md` updates, though `TASKS.md` and `DECISIONS.md` had already been kept current through the session. Reconstructed from `git log` + Vercel deploy history; confirmed nothing was lost — all work through `c4e2db3f` is committed, pushed, and live in production.

### Completed This Session
- Fixed the new quinceañera hero video not playing (raw `.mov` moov-atom issue, re-encoded to faststart `.mp4` via `ffmpeg-static`, re-uploaded to Supabase Storage). Confirmed playing on Shawn's real device.
- Fixed the hero flash/mismatch glitch — fallback image and video poster now both use the video's own auto-captured thumbnail.
- Ran a real business-wide audit (web research, not assumptions): no Google Business Profile exists yet (Shawn creating one today), a real unclaimed-status-unknown Yelp listing exists, a dormant second Instagram account, 4 dead-but-indexed pages.
- Removed fake "5.0 on Google" claims sitewide (3 locations) — confirmed fabricated by Shawn, no real GBP exists yet.
- Shipped SEO/AEO/GEO technical fixes: `/gallery` real per-page metadata (split into server `page.tsx` + client component), real alt text on all gallery photos, updated social-share preview image, 301 redirects for 4 dead indexed pages, removed stale pricing from quince/grad page metadata.

### Still Open
- Whether the Reviews.tsx testimonial quotes are real or also fabricated — Shawn's explicit call was to leave them alone for now.
- Dedicated landing pages for weddings/birthdays/baby showers/corporate events — needs a scoping conversation with Shawn, biggest remaining SEO gap.
- The real live $1 Stripe payment test — still Shawn's to run.

### Shawn Test
1. Visit `bluelunaevents.com` — hero video should play smoothly, no mismatched flash first.
2. Homepage/Reviews — "5.0 on Google" claims should be gone; testimonial names untouched.
3. Try `/services`, `/about`, `/contact` — should redirect instead of 404.

---

## Session: July 29, 2026 — White/Twilight Homepage v1 Shipped
**AI:** Claude Code
**Worked on:** Reconstructed the July 28 session (crash cut it short before docs updated), then held a team meeting with Shawn to resolve two open questions from the `redesign/gallery-twilight` branch: how far the new Twilight palette should spread, and whether Packages should drop pricing. Built both, merged to `main`, live same day.

### Completed This Session
- Reconstructed `SESSION_HANDOFF.md`/`TASKS.md`/`changelog.md`/`DECISIONS.md` from `git log` + Vercel deploy history after the crash.
- Team decision: Twilight (blush/lavender/gold) scoped to Hero + GalleryPreview only, as a mood accent — teal stays the sole sitewide primary accent (it's Monica's real favorite color/Tiffany Blue, matching the actual logo; corrected the branch's inaccurate claim that Twilight came from the logo itself).
- Team decision: Packages drops all pricing sitewide (homepage, quinceañeras, graduations) — final, per Monica's direct request to feel consultive not transactional. Tier names/taglines/features kept as-is; card images escalate per tier instead.
- Added future "Grab & Go" budget page to `TASKS.md` BACKLOG.
- Built and shipped: WhyMonica converted to white (matching Packages/Reviews); pricing stripped from all three Packages blocks with build verified clean each step.
- Merged `redesign/gallery-twilight` → `main`, pushed, confirmed live in production on Vercel.

### Still Open
- Shawn's reaction after seeing it live: real improvement, but still a reskin of the existing layout — Nav, Footer, section structure, and every other page untouched. He wants to continue same-day into deeper structural work. **Not yet scoped** — needs a fresh team conversation before building; candidate is the configurator-with-real-photos idea from `FRONTEND_REDESIGN_AUDIT.md`, still never started.

### Shawn Test
1. Visit `bluelunaevents.com` — confirm the new video hero and white sections load correctly on your phone.
2. Check Packages and the quinceañera/graduation pages — confirm no dollar amounts appear anywhere.
3. Confirm the site still reads as Blue Luna (teal) outside the hero/gallery area.

---

## Session: July 28, 2026 — Real-Device Testing Fixes + Gallery/Twilight Redesign Started
**AI:** Claude Code
**Worked on:** Shawn phone-tested the inquiry form live and found several real bugs; fixed them same-day and deployed to production. Then started a from-scratch homepage redesign on a separate branch (Jony's "Gallery + Twilight" direction). Session ended when the computer crashed before end-of-session docs were updated — this entry was reconstructed 2026-07-29 from `git log` and Vercel deploy history.

### Completed This Session (all on `main`, confirmed live in production 8:06 PM)
- Deployed the 2026-07-27 inquiry form + lead-submission RLS fix (had been sitting unpushed).
- Renamed `/get-a-quote` → `/event-questionnaire` (route + every visible label), with a permanent redirect from the old path. Real-device feedback: the old name implied pricing/instant booking.
- Fixed a real bug: Monica got zero emails on a live double-submission test — sends were unawaited "fire and forget" and failing silently. Fixed via `Promise.all`.
- Fixed a real bug: 3 of 4 uploaded inspiration photos never reached Monica — a Vercel serverless body-size limit was silently truncating uploads, and the client marked failures as "done" anyway. Also raised the photo cap 6 → 15 and fixed the email's photo grid to wrap.
- Found and dropped a leftover Supabase trigger (`notify_new_lead`) that was independently firing a second, unwanted "View in Supabase" email on every lead insert — a direct database fix, not a code change.
- Renamed Monica's lead email "New Event Inquiry" → "New Lead," split it into acknowledge-first/quote-second blocks, brought it up to the same visual scale as the client email, and applied serif headlines + clearer tables to both templates per Jony's review.
- Client confirmation email now shows everything the client submitted (theme/colors, inspiration photos) for full parity with what Monica sees.
- Fixed a Studio upload hang: `compressImage()` and both upload XHRs had no timeout, so a stuck HEIC decode or a stalled network request left Monica stuck mid-upload with no error and no feedback.

### Started This Session (branch `redesign/gallery-twilight` — preview only, NOT merged to `main`)
- Fresh homepage direction: white/bright "Gallery" treatment for real photos + a soft blush/lavender/gold "Twilight" accent pulled from the crescent-moon logo mark.
- Hero rebuilt as full-bleed video (locked to one curated, Jony-reviewed clip, slowed to 0.5x for a cinematic feel) with a transparent nav that becomes solid on scroll or on other pages.
- Live masonry gallery pulling all of Monica's uploaded media directly from Supabase.
- Removed a duplicate logo, strengthened the hero's text-legibility scrim.
- Nav/Footer/every other page intentionally untouched until this direction is approved by Shawn.

### Still Open
- `redesign/gallery-twilight` needs Shawn's explicit go/no-go before merging to `main`. Preview: `blue-luna-events-3akoqkmn5-foundco.vercel.app`.
- Whether the homepage `Packages` section should also lose its visible pricing — still flagged, not touched.
- The real live $1 Stripe payment test — still Shawn's to run.

### Shawn Test
1. Visit `bluelunaevents.com/event-questionnaire` on your phone, submit a real-feeling inquiry.
2. Confirm exactly ONE "New Lead" email arrives at `monica@bluelunaevents.com` (not two), plus a client confirmation signed "— Monica."
3. Upload more than 6 inspiration photos, confirm they all arrive.
4. Open the redesign preview link and give a thumbs up/down.

---

## Session: July 27, 2026 — Inquiry Form Replaces Pricing Configurator
**AI:** Claude Code
**Worked on:** Monica wants to go back to a manual-quote model — she finds visible pricing scares off price-sensitive clients before she can explain the value. Team meeting (Steve, Jony) reopened the May 1 "configurator replaces manual form" decision; Shawn gave direct input on the design. Built the replacement, then found a real production bug while testing it.

### Completed This Session
- New `src/components/ui/InquiryForm.tsx` — single-scroll form modeled closely on Monica's real Tally form (`tally.so/r/nWBaVe`), customized for the site's design system. Chip/button selection wherever possible to minimize typing; free text only for name/phone/email/vibe description.
- `/get-a-quote` now renders `InquiryForm` instead of `PackageConfigurator` — all-white background (first step toward the site-wide light redesign Shawn wants next), no pricing shown.
- `leads` table gained 4 columns: `guest_count`, `setup_time`, `looking_for` (jsonb), `inspo_photos` (jsonb).
- New public route `/api/leads/upload` — lets visitors upload inspiration photos without needing Studio auth; uploads to the existing `media` bucket under `lead-inspo/`.
- Two new email templates (`sendMonicaInquiryNotification`, `sendClientInquiryConfirmation` in `actions.ts`) — no pricing/deposit language; client confirmation signed "— Monica" per Shawn's request.
- Nav/Hero/ProcessStrip copy updated — "Build My Package" / "See your price in real time" language removed since it no longer describes what happens on the page.
- `PackageConfigurator.tsx`, `pricing.ts`, `/api/stripe/checkout` intentionally left in place, unused — not deleted, since they represent real prior work and might be revisited.
- **Found and fixed a real, pre-existing bug**: lead submission has likely been completely broken in production. `submitLead()` used the anon Supabase key with `.insert().select().single()` — the `leads` table has an INSERT policy for anon but no SELECT policy, so the implicit read-back required by `.select()` failed RLS, and since `INSERT...RETURNING` is atomic, the whole insert rolled back. Fixed by switching to the existing `serverClient()` helper (service-role key) — same pattern already used by every Studio API route. Full root-cause detail in `DECISIONS.md`.

### Still Open
- **Not yet deployed** — needs a push to `main` for both the new form and (more urgently) the lead-submission fix to go live.
- Whether the homepage `Packages` section's visible pricing should also change — out of scope this session, flagged for Shawn.
- Real Resend/Stripe keys were also missing from local `.env.local` (placeholders only) — filled in real Supabase keys to make local testing possible; Resend/Stripe local keys left as placeholders since they weren't needed to verify this feature and touching them wasn't requested.

### Shawn Test
1. Push to `main`, confirm Vercel deploy finishes.
2. On your phone, fill out `bluelunaevents.com/get-a-quote` for real and submit.
3. Confirm the "New Event Inquiry" email lands at `monica@bluelunaevents.com`, and the confirmation email lands at whatever address you used, signed "— Monica."
4. Check the Supabase `leads` table (or ask Claude) to confirm the row saved with everything you entered.

---

## Session: July 9, 2026 — Payment Ledger Rework
**AI:** Claude Code
**Worked on:** Shawn's live testing of the estimate/payment system surfaced real gaps (no dynamic balance display, no discounts, no email-from-Studio). Full team meeting, Shawn approved the recommendation explicitly, built it.

### Completed This Session
- New `estimate_payments` table — every payment (Stripe, Zelle, cash, check) logs as its own entry with amount/method/note/date, replacing the old fixed 50/50 deposit/balance booleans.
- `discount_type`/`discount_value`/`discount_note` added to `estimates` — Monica can apply a percent or flat discount with her own note.
- `src/lib/estimateBalance.ts` — single shared function computing subtotal → discount → total → paid → amount owed. The client page, Studio detail page, PDF, and weekly summary email all read from this one function now.
- Studio estimate detail page rebuilt: discount editor, "Record Payment" manual entry (Zelle/cash/check + note), live payment history with delete, real balance breakdown.
- New "Email Estimate to Client" button — system-send (not `mailto:`, which can't reliably attach files), PDF attached + live link, reply-to `monica@bluelunaevents.com`.
- Client-facing page and PDF rewritten to show a real running balance instead of static paid/unpaid checkmarks.
- Stripe checkout now charges the actual computed amount owed, not a fixed split. Webhook logs a ledger entry instead of toggling booleans.
- Weekly summary email's money-in/outstanding numbers updated to read from the new ledger (would have silently gone stale otherwise).
- Live-tested the entire flow end-to-end on the real production test estimate — added a payment, applied a discount, verified the math, generated a PDF, created a real Stripe checkout session — then cleaned up all test data.

### Still Open
- Shawn to run the real live $1 payment test using the discount trick (apply a near-100% discount, complete a real Stripe payment on himself).
- Everything else in `TASKS.md` NEXT (Phase 5 Leads/Contacts, calendar, configurator redesign) — unstarted, unchanged priority.

### Shawn Test
1. Open a real (non-shared) estimate in Studio, add a manual payment, confirm the balance updates live.
2. Apply a discount, confirm the total recalculates.
3. Tap "Email Estimate to Client" (use your own email as a safe test) — confirm you receive it with both the PDF attached and a working link.
4. Open the client-facing link — confirm it shows the same numbers as Studio.

---

## Session: July 6, 2026 — Documentation System Rebuild
**AI:** Claude Code
**Worked on:** Shawn asked to verify the Blue Luna agent team against Found Co.'s, and copy over Found's updated file system (current-truth handoff + locked decision logs + the git-status safeguard Found just added after a near-miss with uncommitted docs).

### Completed This Session
- Confirmed Blue Luna's `AGENTS.md` team already matches Found's Apple-style roster (Steve, Jony, Phil, Angela, Craig, Priya, Marcus, Chris) — no change needed there.
- Added `CLAUDE.md` — auto-loads `brief.md`, `SESSION_HANDOFF.md`, and `AGENTS.md` every session.
- Added `SESSION_HANDOFF.md` — current-truth handoff file, including the git-status safeguard.
- Added `DECISIONS.md` and `DESIGN_DECISIONS.md` — locked product and design decisions, pulled from `AGENTS.md`, `project.md`, and prior session history.
- Rewrote `brief.md` — reads `SESSION_HANDOFF.md` first, added the git-status check to Step 1, fixed the stale multi-AI "agent role" list (Design/Copy/UX/Function Agent) that no longer matched the real `AGENTS.md` team, and corrected the hosting reference from Netlify to Vercel.
- Archived the old `changelog.md` (May 1–14 sessions) into `CHANGELOG_ARCHIVE.md`.

### Still Open
- Repo's own changelog never captured the June 20–21 Studio rebuild (StudioNav, gallery, social export, video thumbnails, Netlify→Vercel migration) in real time — reconstructed into `SESSION_HANDOFF.md` and `DECISIONS.md` from prior session notes. Verify exact dates/commits against actual git history next session.
- Everything listed in `SESSION_HANDOFF.md` → "Still Needs Work."

### Shawn Test
1. Start a new Claude Code session in this repo.
2. Say: "Read brief.md."
3. Confirm the AI reads `SESSION_HANDOFF.md` first and reports what changed / what's open / what to test — same process Found Co. uses now.

---

## Session: July 7, 2026 — Platform Rebuild Audit + Team Decisions
**AI:** Claude Code
**Worked on:** Shawn asked for a full team audit of what needs fixing/rebuilding (design, camera/photos ported from Found, calendar booking ported from Found, Leads, Contacts, email marketing modeled on Spa Mambo, branded social image generation, SEO/AEO/GEO). Team ran the explicit meeting pattern from `brief.md` Step 4 on the resulting open questions.

### Completed This Session
- Researched Found's actual camera/photo, calendar/booking, and leads/contacts architecture (confirmed portable, not industry-locked).
- Researched Spa Mambo's actual email/template system — found it's not owner-editable as assumed (hardcoded JS templates, no DB table, individual templated-send button is disabled/stubbed, SMS/Twilio not installed).
- Wrote `PLATFORM_REBUILD_AUDIT.md` — full audit of current gaps + 8-lead team meeting + 6-phase plan.
- Ran the team meeting pattern on 4 open questions (phase order, calendar approach, email scope, SMS). Team reached unanimous recommendations on all 4.
- Locked all 4 decisions into `DECISIONS.md` (approved by default — Shawn didn't respond to the explicit approval prompt, so the unanimous team recommendation was adopted per his standing "approve direction, I execute" pattern — flagged for revisit if needed).
- Updated `TASKS.md` — current phase is now "Platform Rebuild Phase 1: Foundation" split into two parallel lanes (payment/calendar = blocking; SEO/design = non-blocking parallel), NEXT reflects Phases 2–6.

### Still Open
- Phase 1 Lane A: Stripe estimate checkout, calendar/availability port, `STUDIO_PASSWORD` — none started yet.
- Phase 1 Lane B: SEO/AEO/GEO foundation, early design exploration — none started yet.
- Confirm with Shawn that the 4 default-approved decisions still hold before deep implementation begins.

### Shawn Test
Nothing to test yet — this session was planning/audit only, no code changed.

---

## Session: July 7, 2026 (Session 2) — Stripe Estimate Checkout + Supabase Pause Discovery
**AI:** Claude Code
**Worked on:** Started Phase 1 Lane A. Shawn confirmed the team's approved plan; work began on finishing the Stripe estimate checkout.

### Completed This Session
- **Critical finding:** Supabase project was `INACTIVE` (paused) mid-session — the keepalive cron isn't actually preventing pauses. Manually restored via Management API; site was likely broken for real visitors until this was caught. Root cause still needs investigation — see `TASKS.md` NOW #1.
- Confirmed real `estimates` table schema before writing code (already had `deposit_paid_at`, `deposit_stripe_session_id`, `deposit_stripe_payment_intent_id` and balance equivalents — anticipated but never wired up).
- Built `/api/stripe/estimate-checkout` — Stripe Checkout session for either the deposit or balance amount.
- Updated `/api/stripe/webhook` to write estimate payment fields on `checkout.session.completed`, alongside the existing lead-deposit flow. Also switched it to use the service-role client instead of anon key (matches the rest of the codebase's server-write pattern).
- Built `/studio/estimates/[id]` — the missing estimate detail view. Client info, line items, payment status, manual "Mark Paid" toggle (for Zelle/check/cash, since card payments update automatically via the webhook), share link, PDF download.
- Built `/api/studio/estimates/[id]/pdf` — PDF receipt via `@react-pdf/renderer`, using `React.createElement` (not JSX) since API route handlers must be `.ts`.
- **Fixed bug:** `/studio/estimates` list page had `const estimates: Estimate[] = []` hardcoded — it never fetched from Supabase, so it always showed "No estimates yet" regardless of real data. Now fetches from `/api/studio/estimates` and derives display status from `deposit_paid`/`balance_paid`/`status`.
- **Fixed bug:** `@react-pdf/renderer` was listed in `package.json` but never actually installed (missing from `node_modules` and `package-lock.json`). Ran `npm install` to correct it.
- Verified all changes with `npx tsc --noEmit` (clean) — did not run a full local `next build` since that requires live env vars this project doesn't have locally; Vercel's own build on deploy is the real gate, consistent with this project's established pattern.

### Still Open
- Live end-to-end test with Stripe test card `4242 4242 4242 4242` once deployed.
- Supabase auto-pause root cause (see TASKS.md NOW #1) — needs a real fix, not just a one-time manual restore.
- `STUDIO_PASSWORD` still not set — waiting on Shawn.
- Calendar/availability system not started.

### Shawn Test
1. Open a test estimate's share link (`/q/[token]`), pay the deposit with Stripe test card `4242 4242 4242 4242`.
2. Confirm the estimate flips to deposit-paid on the client page and in `/studio/estimates/[id]`.
3. Confirm the "Pay Balance" button appears after deposit is paid, and completes the same way.
4. Download the PDF from both the client page and the Studio detail page — confirm it renders correctly.
5. In Studio, manually toggle "Mark Paid" on a fresh estimate to confirm the Zelle/cash fallback path works independent of Stripe.

---

## Session: July 8, 2026 — STUDIO_PASSWORD set + test steps documented
**AI:** Claude Code
**Worked on:** Shawn asked for plain-English testing instructions with real links, saved to the doc system so another AI (Codex, Claude) can pick up full context.

### Completed This Session
- Set `STUDIO_PASSWORD` via Vercel API. Found it already existed as an empty placeholder (Shawn had created it earlier without a value) — likely why Studio login wasn't working. Value added to local `.env.local` (gitignored) and Vercel production+preview; intentionally not written into any committed doc, per the existing "never commit secrets" rule in `DECISIONS.md`.
- Confirmed `STRIPE_SECRET_KEY` is stored as Vercel's "sensitive" type — genuinely unreadable via API by anyone, including Claude. Could not determine test vs. live mode this way; needs Shawn to check the Stripe dashboard directly.
- Found an existing real test estimate (Shawn Lopez, $650, unpaid, `share_token=6644927be9376058f4b3fa5dac11f034`) to use for testing instead of creating a new one.
- Rewrote `SESSION_HANDOFF.md` → Shawn Test Steps section to reflect the actual current priority (estimate payment flow) instead of the prior session's stale steps (video thumbnails, gallery, social export).

### Still Open
- Confirm Stripe test vs. live mode before running any payment test (see `TASKS.md` NOW #2).
- Everything else listed in `SESSION_HANDOFF.md` → Still Needs Work.

### Shawn Test
See `SESSION_HANDOFF.md` → Shawn Test Steps for the full current list.

---

## Session: July 8, 2026 (Session 2) — Frontend redesign direction locked in
**AI:** Claude Code
**Worked on:** Shawn read the full frontend audit + team research, gave his own brief (SEO/AEO/GEO is priority #1, site needs to feel like an Apple product, dual-path configurator with deposit psychology), team responded with researched reasoning, Shawn approved explicitly.

### Completed This Session
- Locked 5 decisions into `DECISIONS.md` and `DESIGN_DECISIONS.md`: SEO/AEO/GEO fixes ship first; configurator redesign shows real matching photos instead of just a price total; guided package path becomes the default over "Build My Own"; deposit/cancellation policy becomes visible next to the payment CTA.
- Reprioritized `TASKS.md` — SEO/AEO/GEO quick fixes are now NOW #1, configurator redesign is NEXT #1, calendar/booking moved to NEXT #4.

### Still Open
- Nothing built yet — this session was direction-setting. See `TASKS.md` NOW for the next actual build session.

---

## Session: July 8, 2026 (Session 3) — SEO/AEO/GEO fixes shipped
**AI:** Claude Code
**Worked on:** Shawn approved the frontend redesign direction and said go ahead on the SEO/AEO/GEO fixes (his explicit #1 priority).

### Completed This Session
- Fixed the invalid JSON-LD `@type` (`EventVenueDecorService` → `LocalBusiness`) in `layout.tsx`.
- Removed the fake `aggregateRating` (claimed 50 reviews, page shows 3) — flagged as a real Google compliance risk, not cosmetic. Left a comment explaining why it's gone and what's needed to safely re-add it.
- Converted `/quinceaneras` and `/graduations` from `'use client'` to real Server Components — confirmed first that neither used any hooks or client-only APIs, so this was a safe, clean conversion. Each page now exports its own `metadata` (title/description/OG) instead of silently inheriting the homepage's generic ones.
- Added `FAQPage` JSON-LD to both landing pages, generated directly from the FAQ content that already existed in each page's `FAQS` array.
- Added `src/app/sitemap.ts` and `src/app/robots.ts` (Next.js's native generators) — neither existed before.
- Verified everything with `npx tsc --noEmit` (clean) and a grep for client-only APIs in the converted files (none found).
- Commit `8951d7b0`, pushed to `main`.

### Still Open
- Supabase auto-pause root cause investigation.
- Confirm Stripe test vs. live mode (still waiting on Shawn).
- The bigger configurator redesign (real matching photos, guided-path-default, deposit policy visibility) — not started, see `TASKS.md` NEXT #1.

### Shawn Test
1. View page source (or use a tool like Google's Rich Results Test) on `/quinceaneras` and `/graduations` — confirm each shows its own unique title tag, not the homepage's.
2. Confirm `bluelunaevents.com/sitemap.xml` and `bluelunaevents.com/robots.txt` both load once deployed.

---

## Session: July 8, 2026 (Session 4) — Weekly summary email replaces silent keepalive
**AI:** Claude Code
**Worked on:** Investigated why the Supabase auto-pause happened despite an existing keepalive cron, then built Shawn's idea of folding the fix into a genuinely useful weekly email instead of a silent ping.

### Completed This Session
- Investigated the old `/api/cron/keepalive`: confirmed it was correctly coded, registered and enabled on Vercel, and worked perfectly when manually triggered. Could not find a code-level bug — the likely explanation is Vercel Hobby-plan cron reliability, which can't be proven or fixed from application code.
- Built `/api/cron/weekly-summary` — pulls real data from Supabase (new leads, new estimates + value, money collected, outstanding unpaid balances, events in the next 14 days) and emails it via Resend, styled to match the existing transactional email design.
- Deleted the old keepalive route (fully superseded, avoids duplicate logic paths).
- Updated `vercel.json` to point the existing Mon+Thu 10am UTC cron at the new route.
- Added `WEEKLY_SUMMARY_EMAIL` env var (Shawn's email) rather than hardcoding it, since this repo is meant to be a resellable template per `project.md`'s long-term vision.
- Verified live end-to-end after deploy: real data returned (`outstandingTotal: 325`, matching the known unpaid test estimate), email actually sent (`emailed: true`).

### Still Open
- Confirm Stripe test vs. live mode (still waiting on Shawn).
- Watch for the Monday/Thursday email over the next couple weeks — if it stops arriving, that's the signal the underlying Vercel cron reliability issue is real and needs the external-pinger or Supabase Pro fallback.

### Shawn Test
Check your email (shawnlopez@me.com) — a "Blue Luna Weekly Update" should have just landed from today's manual test. Confirm it looks right and the numbers match what's actually in Studio.

---

## Session: July 8, 2026 (Session 5) — Resend domain was broken since May 14, now fixed
**AI:** Claude Code
**Worked on:** Shawn gave me a Resend API key to investigate why the weekly summary email never arrived. Found something much bigger than the weekly email.

### Completed This Session
- Checked `bluelunaevents.com`'s domain status in Resend: `"status": "failed"`, unchanged since the domain was created on **2026-05-14** — the same day the original Stripe/email booking system was built.
- Confirmed via Vercel's DNS API that the 3 records Resend requires (1 DKIM TXT, 1 SPF MX, 1 SPF TXT) simply never existed — only Vercel's own system records were present.
- Added all 3 missing DNS records via Vercel's DNS API, confirmed they were live worldwide via an independent public DNS lookup (`dns.google`), then triggered Resend to re-verify. Domain status is now `verified`.
- Found and fixed a second, related bug: every place in the code that calls `resend.emails.send()` — Monica's lead notification, the client confirmation email, and today's new weekly summary — never checked the return value for an error. A rejected send from Resend looked exactly like a successful one in the app's own logs. Added real error checking/logging to all three.
- Saved the Resend key + this finding to persistent memory for future sessions.

### Still Open
- **Need Monica/Shawn to confirm**: has she actually been receiving real "new booking" notification emails since May 14 when clients submit the public quote form? If not, this domain issue was the reason, and it's likely every real client has also never received their confirmation email either.
- Confirm Stripe test vs. live mode (still open).
- Supabase auto-pause monitoring (still open, see prior session).

### Shawn Test
1. Check your inbox now — the weekly summary email should actually arrive this time since the domain is verified.
2. Ask Monica directly whether she's been getting real booking notification emails over the past two months. This is the real-world confirmation of whether this bug had actual business impact.

---

## Session: July 8, 2026 (Session 6) — Two more email problems found and fixed
**AI:** Claude Code
**Worked on:** Continuing from the Resend domain fix — turned out there were two more stacked problems underneath it.

### Completed This Session
- **Found the app's live `RESEND_API_KEY` was itself invalid.** A real test send after the domain fix still failed with `"API key is invalid"` — the key configured in Vercel wasn't the working one. Swapped it for the key Shawn provided directly, redeployed, and confirmed via Resend's official per-email status endpoint (`GET /emails/{id}`, not the ambiguous list endpoint) — got a real `"last_event": "sent"` with a genuine Amazon SES message ID.
- **Found there was no mail server configured for the domain at all.** Shawn confirmed via Namecheap cPanel screenshots that `monica@bluelunaevents.com` is a real, working mailbox hosted on Namecheap's shared hosting — but the domain's DNS (managed by Vercel since June) had zero MX record, meaning nothing routed mail there. This is separate from and more severe than the Resend issues — it means the app's own lead-notification email to Monica could never have been delivered regardless of anything else.
- Pulled the exact mail server config from Namecheap's cPanel Zone Editor and replicated it in Vercel's DNS: MX record (`mail.bluelunaevents.com`, priority 0), matching A record, root SPF TXT, and DMARC TXT (all confirmed live via public DNS lookup). Also added a DKIM record, transcribed from a screenshot — lower confidence on that specific one, but it only affects outbound spam scoring, not delivery.

### Still Open
- **Real-world confirmation needed**: send a test email to `monica@bluelunaevents.com` and confirm it's actually received. Ask Monica directly whether she's ever gotten a real lead notification.
- Confirm Stripe test vs. live mode (still open, several sessions now).

### Shawn Test
1. Send a test email to `monica@bluelunaevents.com` from any other account (Gmail, etc.) and confirm it shows up in Namecheap's webmail or wherever Monica checks that inbox.
2. Ask Monica directly: has she ever received a real "new booking" email since the site launched?

**CONFIRMED by Shawn (2026-07-08): can now both send and receive at `monica@bluelunaevents.com`.** All three stacked email bugs are genuinely fixed, not just fixed-on-paper.

---

## Session: July 8, 2026 (Session 7) — Stripe live mode confirmed; same stale-key bug found and fixed
**AI:** Claude Code
**Worked on:** Shawn provided his Stripe secret key directly to resolve the open test-vs-live question.

### Completed This Session
- Confirmed Stripe is in **live mode** (`sk_live_...` prefix, `"livemode": true` per Stripe's own API).
- Found the exact same category of bug as the Resend key: the `STRIPE_SECRET_KEY` deployed in Vercel didn't match the real, working key — `/api/stripe/estimate-checkout` was crashing with an empty 500 on every call. Verified the key worked fine talking to Stripe directly (real account, `$0` balance ever collected — consistent with checkout never having worked) before concluding the deployed value was the problem.
- Updated `STRIPE_SECRET_KEY` in Vercel, redeployed, re-tested — the endpoint now returns a real, valid Stripe Checkout URL.
- Did NOT complete an actual payment, since live mode means real money — see `TASKS.md` NOW #1 for options.
- **Pattern flagged:** this is the third stale/wrong "sensitive" env var found this session (Resend domain, Resend key, Stripe key). Worth auditing the rest (`STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`) rather than assuming they're fine.

### Still Open
- Shawn to decide how to validate a real completed payment (test-mode keys vs. one real small transaction vs. trust today's verification).
- Consider auditing remaining sensitive env vars for the same stale-value pattern.

---

## Older History

Sessions May 1–14, 2026 (documentation setup, configurator build, custom build path, Stripe + email flow) moved to `CHANGELOG_ARCHIVE.md` on July 6, 2026.
