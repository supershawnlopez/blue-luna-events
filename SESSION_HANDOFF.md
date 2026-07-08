# SESSION_HANDOFF.md — Blue Luna Events Current Truth
### Start here after `brief.md`. Keep this short, current, and plain-English.
*Last updated: July 9, 2026 — handoff from Claude Code to Codex*

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

- Latest commit: `8e6c20df` — pushed to `main`, Vercel should auto-deploy. **Run `git status` and `git log` before trusting anything below as fully current** — this file was assembled from session notes, not guaranteed to be re-verified live at read time.
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
