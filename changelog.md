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
