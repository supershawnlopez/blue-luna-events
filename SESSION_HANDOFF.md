# SESSION_HANDOFF.md — Blue Luna Events Current Truth
### Start here after `brief.md`. Keep this short, current, and plain-English.
*Last updated: July 6, 2026*

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

- The repo's own changelog (`CHANGELOG_ARCHIVE.md` as of this reorg) was last updated May 14, 2026 — the Stripe deposit flow + dual email session. A substantial Studio rebuild (StudioNav, My Work overhaul, Social Export, public gallery, video thumbnail system) happened after that but was never logged in the repo's own docs in real time. It's reconstructed into this file from prior session notes below.
- This session added the doc system Found Co. uses: `CLAUDE.md` (auto-loads `brief.md` + this file + `AGENTS.md`), this `SESSION_HANDOFF.md`, `DECISIONS.md`, `DESIGN_DECISIONS.md`, and archived the old `changelog.md` history into `CHANGELOG_ARCHIVE.md`.
- `brief.md` Step 1 now also instructs every AI to run `git status` before trusting this file — the same loophole fix Found Co. just added, closing the gap where a session's doc updates never reach git before a credit cutoff or crash.
- **Run `git status` and `git log` before trusting anything below as fully current.** This file was assembled from prior session notes, not a fresh read of the actual repo history — confirm the real latest commit and check for uncommitted work before relying on it.

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

- [ ] `STUDIO_PASSWORD` env var — not yet set. Shawn needs to pick a password; add it via Vercel API.
- [ ] `/api/stripe/estimate-checkout` — Stripe Checkout for estimate deposit + balance payment from the client share link.
- [ ] `/studio/estimates/[id]` — Monica's individual estimate detail view.
- [ ] `/api/studio/estimates/[id]/pdf` — PDF receipt via `@react-pdf/renderer`.
- [ ] End-to-end Stripe test (test card `4242 4242 4242 4242`).
- [ ] Update Stripe webhook URL to `bluelunaevents.com` once DNS propagation is confirmed complete.
- [ ] `next-pwa` PWA manifest — install prompt for Monica's Studio.
- [ ] Confirm current DNS/domain propagation status — unknown as of this handoff, verify before assuming it's resolved.

---

## Shawn Test Steps

### 1. Studio Video Thumbnails
1. Open Monica's Studio → My Work on an iPhone.
2. Tap a video that has never been opened in the lightbox before.
3. Confirm the grid updates to a real captured thumbnail within a few seconds (not the teal placeholder).

### 2. Public Gallery
1. Open `/gallery` on mobile.
2. Confirm filter chips work, the lightbox swipes between items, and videos autoplay muted/looped with no visible controls.

### 3. Social Export
1. Star a photo and a video in My Work.
2. Open `/studio/exports`, generate all 3 formats, confirm the logo/URL/event-type strip renders correctly on each, download one.

### 4. Domain / Hosting
1. Visit `bluelunaevents.com` directly — confirm it loads the live site over HTTPS with no certificate warning.
2. If it doesn't resolve yet, DNS propagation is still the blocker — check registrar settings before assuming a code issue.

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
