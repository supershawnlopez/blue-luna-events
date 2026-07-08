# SESSION_HANDOFF.md — Blue Luna Events Current Truth
### Start here after `brief.md`. Keep this short, current, and plain-English.
*Last updated: July 7, 2026*

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

- Platform Rebuild Phase 1 (Foundation) is active and approved — full audit in `PLATFORM_REBUILD_AUDIT.md`, locked decisions in `DECISIONS.md`.
- **Supabase was found `INACTIVE` (paused) on 2026-07-07 mid-session** — manually restored via Management API, but the root cause (keepalive cron apparently not preventing this) is still open. See `TASKS.md` NOW #1. Check project status before assuming the live site works.
- Stripe estimate checkout is now built: `/api/stripe/estimate-checkout`, webhook writes to `estimates` table, `/studio/estimates/[id]` detail view, PDF receipt route.
- `STUDIO_PASSWORD` is now set in Vercel (production + preview) and in local `.env.local`. **The value is intentionally not written in this file** — it's a secret, and this file is committed to git. Find it in `.env.local` (gitignored, local only) or ask Shawn directly.
- **Open blocker before the payment flow can be safely tested: unknown whether Stripe is in test mode or live mode.** Do not test a real payment (deposit/balance) until this is confirmed — a live-mode test with a real card would actually charge money; a live-mode test with the Stripe fake test card (`4242...`) will just fail. Check the Stripe dashboard (test-mode toggle, top-left) or ask Shawn before running the payment test below.
- A real test estimate already exists: client "Shawn Lopez," $650, unpaid — `share_token` = `6644927be9376058f4b3fa5dac11f034`. Use `/q/6644927be9376058f4b3fa5dac11f034` for the payment test instead of creating a new one.
- Latest commit: `91b5e67e` — pushed to `main`, Vercel should auto-deploy.
- **Run `git status` and `git log` before trusting anything below as fully current.**

---

## Changed / Finished (most recent known work)

- [x] StudioNav — shared 4-tab bottom nav (Home, My Work, Galleries, Estimates) across all Studio pages.
- [x] Public `Nav.tsx` hides on `/studio/*` and `/gallery/*` routes.
- [x] Studio home rebuilt — time-of-day greeting, real stats from `/api/studio/stats`, quick-action cards, logout.
- [x] My Work (media) page overhaul — safe-area header, 3-column grid, tag bottom sheet, video thumbnail auto-capture.
- [x] Social Export rebuilt — 3 Instagram canvas formats, star-tagged media, logo + URL + event-type strip on canvas.
- [x] Public gallery rebuilt — real Supabase data, filter chips by event type, masonry layout, swipe/arrow-key lightbox.
- [x] Video thumbnail system solved after multiple failed attempts — see `DECISIONS.md` for the root cause and locked fix. Do not re-attempt the approaches listed there as "do not try."
- [x] Hosting migrated from Netlify to Vercel; custom domain `bluelunaevents.com` pointed at Vercel nameservers.

## Still Needs Work

- [ ] **Supabase auto-pause root cause** — one-time restore is not a fix. Investigate the keepalive cron.
- [ ] **Confirm Stripe test vs. live mode** before running any payment test — see Current Status above.
- [ ] End-to-end Stripe test (test card `4242 4242 4242 4242`, test mode only) — checkout code is built and pushed, not yet live-verified.
- [ ] Calendar/availability system — not started (Lane A item 2).
- [x] `STUDIO_PASSWORD` — set 2026-07-08.
- [ ] Update Stripe webhook URL to `bluelunaevents.com` once DNS propagation is confirmed complete.
- [ ] `next-pwa` PWA manifest — install prompt for Monica's Studio.
- [ ] Confirm current DNS/domain propagation status — unknown as of this handoff, verify before assuming it's resolved.

---

## Shawn Test Steps

### 1. Studio login
1. Go to `bluelunaevents.com/studio/login`.
2. Password is in `.env.local` under `STUDIO_PASSWORD` (not repeated here — see Current Status above for why).
3. Confirm login works.

### 2. Estimates list actually shows data (was broken, fixed 2026-07-07)
1. In Studio, tap **Estimates**.
2. Confirm you see the real "Shawn Lopez / $650 / unpaid" estimate — not "No estimates yet." (Before this session, this screen was hardcoded to always show empty, regardless of real data.)

### 3. Client payment flow — CONFIRM STRIPE MODE FIRST, see Current Status above
1. Open `bluelunaevents.com/q/6644927be9376058f4b3fa5dac11f034` (as if you were the client).
2. Tap "Pay Deposit."
3. **Test mode:** use card `4242 4242 4242 4242`, any future expiry, any CVV — fake, safe, no real charge.
   **Live mode:** stop here and tell Claude — do not use a real card just to test.
4. After a successful test-mode payment, confirm the page shows "Deposit paid" and a "Pay Balance" button appears.
5. Back in Studio → Estimates → open that estimate, confirm it shows deposit paid with a timestamp.

### 4. Manual "Mark Paid" (for Zelle/check/cash payments)
1. On the same estimate detail page in Studio, tap "Mark Paid" next to Deposit or Balance.
2. Confirm it toggles to a green "✓ Paid" state without needing Stripe at all.

### 5. PDF receipt
1. From either the client-facing `/q/...` page or the Studio detail page, tap the PDF download button.
2. Confirm a PDF actually downloads and the details/totals look correct.

### 6. Domain / Hosting (carried from prior session — recheck if untested)
1. Visit `bluelunaevents.com` directly — confirm it loads the live site over HTTPS with no certificate warning.

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
