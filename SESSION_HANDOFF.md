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
- Stripe estimate checkout is now built: `/api/stripe/estimate-checkout`, webhook writes to `estimates` table, `/studio/estimates/[id]` detail view, PDF receipt route. Not yet live-tested end-to-end with a real Stripe test transaction.
- Latest commit: `9876888c` — pushed to `main`, Vercel should auto-deploy.
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
- [ ] `STUDIO_PASSWORD` env var — not yet set. Shawn needs to pick a password (or ask Claude to generate one); add it via Vercel API.
- [ ] End-to-end Stripe test (test card `4242 4242 4242 4242`) — checkout code is built and pushed, not yet live-verified.
- [ ] Calendar/availability system — not started (Lane A item 2).
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
