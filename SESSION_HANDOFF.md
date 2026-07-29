# SESSION_HANDOFF.md — Blue Luna Events Current Truth
### Start here after `brief.md`. Keep this short, current, and plain-English.
*Last updated: July 29, 2026 — Claude Code*

## Latest Session (2026-07-29)

**White/Twilight homepage v1 is LIVE on `bluelunaevents.com`.** Team meeting resolved the two open questions from the 7/28 branch, then it was built out and merged to `main` same day:
- Twilight (blush/lavender/gold) is scoped to Hero + GalleryPreview only, as a mood accent — NOT a sitewide palette change. Teal remains the one primary accent everywhere else (Nav, WhyMonica, Packages, Reviews, CTA, Footer, every other page). Reason: teal is Monica's actual favorite color (Tiffany Blue) — same color as the real logo — not an arbitrary pick, and the original branch commit's claim that Twilight was "pulled from the logo" was corrected; the real logo has none of those colors.
- WhyMonica converted from dark (`#0D0F0F`) to the same white background as Packages/Reviews, so the whole page reads as one coherent story. CTA stays dark intentionally as the one closing contrast band.
- Packages section (homepage + quinceañeras + graduations) dropped all pricing — final, per Monica's direct request to feel consultive, not transactional. Tier names/taglines/features kept as-is; card images now escalate in size per tier so "more" reads visually.
- Added a future "Grab & Go" budget-friendly self-serve page to `TASKS.md` BACKLOG — not built, not scheduled.

**Shawn's read after seeing it live:** real improvement, but still mostly a palette/photo-source reskin of the existing layout — Nav, Footer, section structure untouched. He chose to fix that same day (Option A from the team's two proposals) rather than jump straight to the bigger configurator project.

**Round 2, same day: Nav + Footer, also LIVE.** Two real structural fixes, not recoloring:
- Nav previously showed dark styling on every page regardless of scroll, except the transparent-over-video state on the homepage hero. Now it's light (white glass, dark logo/text) everywhere except that one transparent-over-hero moment — so gallery, event questionnaire, quinceañera/graduation pages all get a properly matching light nav now.
- The mobile full-screen menu was a dark overlay sliding down from the top. `DESIGN_DECISIONS.md` has locked a "Calm/Warm" white panel sliding in from the right, teal left border, italic dark nav text, phone+CTA anchored at the bottom, since June 19 — it was never actually built that way. Rebuilt to match the locked spec for real.
- Footer flipped to the same light background/logo as everything else.
- Visually verified desktop/tablet nav behavior directly in browser before merging; mobile menu was a same-pattern value change (color/direction only, no new logic), verified via clean build.

**Round 3, same day: Gallery, Quinceañeras, Graduations — also LIVE.** Same light treatment extended to the last untouched public pages. Gallery's lightbox stays dark on purpose (standard full-screen photo-viewer pattern). Also found and fixed real leftover pricing text in the quince/grad FAQ and CTA copy (specific dollar amounts) that the earlier Packages-component pricing removal missed — same consultive reframing applied. SEO meta descriptions on those two pages still mention pricing; left alone as out of scope (not visible page content) but flagged for Shawn.

**A false start worth remembering:** mid-session, "move forward with Jony's lead on design" was misread as approval to start the full configurator-with-real-photos project — a `components` column was added to `gallery_media` before Shawn caught it and clarified he meant finishing the homepage visual work. Column was reverted immediately, no lasting effect. **Lesson: don't infer approval for the big unstarted audit item from general forward-momentum language — confirm explicitly.**

**Next up, not yet scoped:** the configurator-with-real-photos idea from `FRONTEND_REDESIGN_AUDIT.md` — still the single highest-leverage, most-differentiated idea from the July 8 audit, never started. Needs gallery photos tagged by component/color first (the vocabulary already exists in `LOOKING_FOR_CATEGORIES` in `config.ts` — nothing to invent there), and a real, explicit team conversation with Shawn before touching schema or building — don't resume from the false start assuming it's still the plan.

**Shawn, test this:**
1. Visit `bluelunaevents.com` on your phone — homepage should load with the new video hero and white sections throughout.
2. Navigate to Gallery, the Event Questionnaire, and the quinceañera/graduation pages — the top nav bar should now be white/light on all of them, not dark.
3. Open the mobile menu (hamburger icon) — it should slide in from the right as a white panel with a teal left edge, not a dark overlay from the top.
4. Scroll to the very bottom of any page — Footer should be light, matching the rest of the site.
5. Check Packages, and the quinceañera/graduation pages — confirm no dollar amounts show anywhere on the page itself.
6. Confirm the site still feels like Blue Luna (teal, or gold on graduation pages — not a different brand) outside the homepage hero/gallery area.
7. Visit `/gallery`, `/quinceaneras`, `/graduations` directly — all three should now be light/bright like the homepage, not dark.

---

## Prior Session (2026-07-28, reconstructed 2026-07-29 after a crash cut the session short before docs were updated)

**What changed and IS LIVE on `bluelunaevents.com` (all on `main`, last deploy confirmed `READY`/production on Vercel at 8:06 PM 7/28, commit `09da80fb`):**
- The 2026-07-27 inquiry form + the lead-submission RLS bug fix (previously flagged "not yet deployed" below) — **that's now stale, it shipped.**
- Renamed the page itself from "Get a Quote" to **"Event Questionnaire"** everywhere (Nav, Hero, CTA, urgency banner, quinceañera/graduation pages) — Shawn's real-device testing showed the old label implied pricing or instant booking, neither of which happens anymore.
- Renamed the route `/get-a-quote` → **`/event-questionnaire`**, with a permanent redirect from the old path so existing links/bookmarks/search results still work.
- Fixed a real bug found via live double-submission test: Monica got **zero emails** on a real inquiry — sends were unawaited "fire and forget" and failing silently. Now awaited via `Promise.all`.
- Fixed a real bug: 3 of 4 uploaded inspiration photos never reached Monica (Vercel serverless body-size limit; client was silently marking failed uploads as "done"). Also raised the photo cap 6 → 15 and fixed the email's photo grid to wrap instead of overflowing.
- Found and dropped a leftover Supabase trigger (`notify_new_lead`) that was firing a second, unwanted "View in Supabase" email on every lead — direct DB fix, not a code change.
- Monica's lead email: renamed "New Event Inquiry" → "New Lead," split into acknowledge-first / quote-second, resized to match the client email's visual scale (Jony's review), serif headlines + clearer tables applied to both templates.
- Client confirmation email now shows everything the client submitted (theme/colors, inspiration photos) for full parity with what Monica sees.
- Fixed a Studio upload hang — `compressImage()` and both upload XHRs had no timeout, so certain HEIC photos or a stalled network request left Monica stuck mid-upload with zero feedback.

**What changed and is PREVIEW ONLY — not live on the real site:**
Work then moved to a new branch, `redesign/gallery-twilight` (4 commits, last one 10:52 PM 7/28) — Jony's "Gallery + Twilight" homepage direction: white/bright background, real photos treated like gallery pieces, a soft blush/lavender/gold accent pulled from the crescent-moon logo mark (not a dark theme). Includes a full-bleed hero video (transparent nav over it, one curated clip locked in and slowed to 0.5x for a cinematic feel) and a live masonry gallery pulling all of Monica's uploaded media. Nav/Footer/every other page intentionally untouched until this direction is approved. **Not merged to `main`.** Latest preview: `blue-luna-events-3akoqkmn5-foundco.vercel.app`.

**About the crash:** the session ended mid-work without the usual doc update (this file, `TASKS.md`, `changelog.md` were all stale as a result — reconstructed from `git log` + Vercel deploy history 2026-07-29). No lost work found — working tree is clean, nothing in the stash, no dangling commits. Everything through the 10:52 PM commit is safely committed and pushed to GitHub.

**Shawn, test this:**
1. Visit `bluelunaevents.com/event-questionnaire` on your phone, fill it out for real, submit.
2. Confirm you get exactly ONE "New Lead" email at `monica@bluelunaevents.com` (not two), and a confirmation signed "— Monica" at whatever address you used.
3. Try uploading more than 6 inspiration photos — confirm they all actually arrive in the email.
4. Open the redesign preview link above and give Jony's team a thumbs up/down before it gets merged to `main`.
5. Still open: whether the homepage `Packages` section (which shows prices) should also lose its pricing — not touched, flagged for a future conversation.

---

---

## Purpose

This is the shared handoff file for Claude Code, Codex, Claude, or any other AI working on Blue Luna Events.

Use this file to prevent lost context when Shawn switches tools, runs out of credits, or tests from his phone. This is not the full history. It is the current operational truth.

Current session history belongs in `changelog.md`.
Older detailed history belongs in `CHANGELOG_ARCHIVE.md`.
Active task backlog belongs in `TASKS.md`.
Locked decisions belong in `DECISIONS.md` and `DESIGN_DECISIONS.md`.

---

## Current Status

- Latest `main` commit: `88cba55d` — Gallery/Quinceañeras/Graduations light theme, confirmed live in production on Vercel 2026-07-29. Combined with the homepage and Nav/Footer merges earlier the same day, the entire public site is now one coherent light-themed whole.
- All three feature branches (`redesign/gallery-twilight`, `redesign/nav-footer-light`, `redesign/light-remaining-pages`) were merged and deleted — further redesign work should branch fresh off `main`.
- **Run `git status`, `git branch`, and `git log` before trusting anything below as fully current** — this file was assembled from session notes, not guaranteed to be re-verified live at read time. In particular, check which branch you're actually on before assuming `main`'s state is what's checked out.
- Full context for everything below lives in three audit docs — read them before making changes in these areas:
  - `PLATFORM_REBUILD_AUDIT.md` — the original full-scope audit (design, camera, calendar, leads, email, social, SEO)
  - `FRONTEND_REDESIGN_AUDIT.md` — public site redesign direction (SEO/AEO/GEO priority #1, then configurator shows real matching photos as customer builds, guided path as default)
  - `ESTIMATES_PAYMENTS_AUDIT.md` — the payment ledger rework (most recent work), including an **approved-but-not-yet-built** design change (see below)
- All locked decisions are in `DECISIONS.md` (product/technical) and `DESIGN_DECISIONS.md` (visual/UX) — read before assuming something is undecided.

### What's fully working and confirmed (not just "looks done")
- **Email is completely fixed.** Three stacked bugs (unverified Resend domain since May 14, an invalid Resend API key, a missing MX record so Monica's real Namecheap-hosted mailbox was unreachable) all found and fixed 2026-07-08. Shawn confirmed real-world: can both send and receive at `monica@bluelunaevents.com`.
- **Stripe is live mode, confirmed**, and a stale/wrong deployed key (same bug pattern as Resend) was found and fixed 2026-07-08. Checkout session creation verified working with a real Stripe Checkout URL.
- **Payment ledger rework shipped 2026-07-09** (commit `b74a9a4e`) — replaced the old fixed 50/50 deposit/balance booleans with a real `estimate_payments` ledger table + `src/lib/estimateBalance.ts` shared calculation used by the client page, PDF, Studio detail page, and weekly summary email. Built: discount editor (percent/flat + note), manual "Record Payment" (Zelle/cash/check + note), real one-tap "Email Estimate to Client" (PDF attached + live link, system-send not `mailto:`). Live-tested end-to-end on the real production test estimate, then cleaned up.
- **Raw internal IDs bug fixed 2026-07-09** (commit `02ec1c79`) — add-ons and event types were printing as `shimmer_backdrop`, `cp_premium_3pack` etc. on customer-facing PDF/pages instead of proper labels. Fixed via `labelForAddOn()`/`labelForEventType()` in `config.ts`.
- **SEO/AEO/GEO 5 fixes shipped 2026-07-08** (commit `8951d7b0`) — fixed invalid JSON-LD `@type`, removed fake review count, fixed `/quinceaneras` + `/graduations` to have their own metadata (were unnecessarily client components), added FAQPage schema, added sitemap.xml + robots.txt.

### Approved but NOT yet built — likely next task
`ESTIMATES_PAYMENTS_AUDIT.md` "Round 3" — team recommendation approved in principle by Shawn's framing but not yet explicitly greenlit to build, and not built:
1. Estimates list page: show discounted total as the bold primary price with the original struck through (e.g. `~~$650~~ **$1**`) instead of showing the pre-discount total as if it's fully at risk.
2. Remove the decorative file icon and the per-row card wrapper on the estimates list — replace with flat rows separated by a hairline divider (consistent with the already-locked "flowing surface, not card-stack" principle in `DESIGN_DECISIONS.md`).
**Confirm with Shawn whether to proceed with this before building it** — last message in the conversation was Shawn saying he's switching to Codex, not an explicit "yes build it."

### Still open / not started
- Shawn has not yet run the real live $1 payment test (discount a test estimate near 100%, complete a real Stripe payment on himself) — capability is built, he just hasn't done it yet.
- Supabase auto-pause: root cause never fully proven (likely Vercel Hobby-plan cron reliability). Mitigated by replacing the silent keepalive ping with a real weekly business-summary email (`/api/cron/weekly-summary`) so a failure becomes visible (missing email) instead of silent. If Shawn stops getting the Monday/Thursday email, that's the signal to investigate further or pay for Supabase Pro ($25/mo).
- **Pattern worth remembering:** 3 separate "sensitive" Vercel env vars were found stale/wrong this session (Resend domain, Resend key, Stripe key). Nobody has yet audited the remaining ones (`STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`) for the same issue.
- Calendar/availability system (Platform Rebuild Lane A item 2) — not started. Decided: port Found's `availability`/`availability_blocks`/`bookings` pattern, schema built for a future iCloud CalDAV two-way sync (Monica's calendar is iCloud, not Google).
- Configurator redesign (`FRONTEND_REDESIGN_AUDIT.md` — real matching photos as customer builds, guided package path as default, visible deposit/cancellation policy) — not started. Requires gallery photos to be tagged by component/color, not just `event_type`, as a prerequisite.
- Phase 5 — real Leads system, Contacts phone book, owner-editable email template system, SMS (Twilio, capability only — activation needs Shawn's A2P 10DLC carrier registration) — not started, was next after the payments work per the locked build order.
- Camera/Photos port from Found (in-app `CameraSheet`, replacing the native file-input "Shoot" button) — not started.

---

## Test Estimate for QA

Real test estimate exists — client "Shawn Lopez," originally $650: `id = 1899b5a3-af43-4404-90bd-8932e8a52462`, `share_token = 6644927be9376058f4b3fa5dac11f034`. Use `/q/6644927be9376058f4b3fa5dac11f034` for client-side testing. Currently clean (no payments, no discount) as of last session — Claude added test data to verify the ledger rework, then removed it.

---

## Credentials note

`STUDIO_PASSWORD`, Vercel/Supabase/Resend API access, and the Stripe key are held by Claude Code in its own memory system (not in this repo's committed docs — see the security rule in `DECISIONS.md`: never commit secrets). If Codex needs any of these, ask Shawn directly rather than assuming they're discoverable from the repo alone.

---

## Required End-Of-Session Update

Before ending any work session, update this file with:

1. What changed or shipped.
2. What still needs work.
3. Shawn's plain-English test steps.
4. Commit hash, if a commit was made.

If there was a product or design decision, also update `DECISIONS.md` or `DESIGN_DECISIONS.md`.
If there was meaningful code or QA work, also update `changelog.md`.
If priorities changed, also update `TASKS.md`.
