# SESSION_HANDOFF.md — Blue Luna Events Current Truth
### Start here after `brief.md`. Keep this short, current, and plain-English.
*Last updated: August 3, 2026 — Claude Code*

## 2026-08-03: Google Search Console fully set up

Closed out the last open piece from the 2026-08-02 analytics decision. Shawn created the GSC property himself (required his real Google login), sent Claude the DNS verification code, Claude added it as a TXT record via the Vercel API and confirmed via the live DNS records that nothing on any other project (Found Co. included — Shawn asked directly) was touched, only `bluelunaevents.com`'s own records. Shawn verified ownership in the GSC UI, then submitted `sitemap.xml` — confirmed `Success`, 9 pages discovered. Also noticed and helped clean up an unrelated stale sitemap entry from May 2025 pointing at a file that 404s.

**Note for next session:** search-query data (what people actually type to find Blue Luna) takes a few days to weeks to start populating in GSC — don't expect anything useful there immediately.

---

## Prior: 2026-08-02: Studio Intelligence north star locked + "Today" surface + real traffic analytics — LIVE

Shawn asked to resume the backend/Studio rebuild (`PLATFORM_REBUILD_AUDIT.md` Phases 3-6, approved 2026-07-07, never started). Before any building, he raised the bar in a real 3-round team meeting: Studio has to make both him and Monica say "wow," it has to genuinely think for her (she's not technical), Steve and Jony are the required approval gate on anything shipped, and it needs to feel Apple/iOS-easy — daily/weekly/monthly/quarterly usefulness, real traffic/source stats she can actually read, help promoting. Full reasoning in `DECISIONS.md` "CUSTOM BACKEND / STUDIO INTELLIGENCE SYSTEM." This reframes the whole rebuild's build order: design the home "Today" surface first, build features as what it pulls from — not the old feature-list order.

**Also found and fixed, unrelated to today's brief:** a prior (crashed) session had left two real, uncommitted security fixes sitting in the working tree — `/api/studio/*` API routes had zero auth check (only page routes were gated by middleware), and `/q/[token]` was fetching estimates with the anon key and forwarding client PII + internal fields to the browser. Both were already correctly fixed in the code, just never committed. Verified against a clean build, committed separately. Commit `96086086`.

**Shipped today, in order:**
1. **Studio home rebuilt around a real "Today" surface.** New `/api/studio/today` — rules-based (explicitly no AI yet, per Shawn's direction), surfaces: leads still sitting untouched, estimates with an event coming up soon and a balance still owed, other events coming up soon, and starred-but-unposted photos. Replaces the old stats-first dashboard as the first thing Monica sees; shows "You're all caught up" when there's nothing pending. Tapping a lead opens the phone dialer directly with that client's number.
2. **Self-hosted traffic analytics, built natively into Studio.** New `site_visits` table + a public `/api/track` beacon (fired from the public site only, not Studio itself) + `/api/studio/analytics` aggregating this week's visits vs. last week and a referrer-channel breakdown (Instagram/Facebook/Google/Direct/Other), shown in plain English on the Studio home screen. Built self-hosted on purpose — Monica has no separate analytics login, so it had to live where she already is. `@vercel/analytics` also added as a second, zero-effort source for Shawn.
3. Both changes committed and pushed, Vercel deployment confirmed `READY`/production.

**Still open:**
- **Google Search Console** — needs Shawn/Monica to create the property themselves at search.google.com/search-console (requires a real Google login Claude doesn't have); Claude can then wire the DNS verification via the existing Vercel API access and submit `sitemap.xml`.
- The full Phases 3-6 rebuild (Camera, Calendar/Booking, Leads/Contacts, real owner-editable email templates, Social) is still ahead of us — today was the first concrete piece under the new north star, not the whole thing.
- `site_visits` has no real data yet — the "This Week" card will read "just turned on" until a few days of traffic accumulate.
- Carried over, unchanged: cancel the duplicate Google Business Profile (Shawn's), the real live $1 Stripe payment test (Shawn's).

**Shawn, test this:**
1. Open Studio on your phone — home screen should lead with a "Today" section (or "You're all caught up"), not just the stats grid.
2. Below it, a "This Week" traffic card — will say tracking just started for the first few days.
3. Tap a lead in Today — should open your phone's dialer with that client's number already filled in.

---

## Prior: 2026-08-01: Real Reviews section, Estimates Round 3, four new landing pages — all LIVE

Shawn confirmed the existing "1 Google review" is real (Christian Ortiz, 5.0★, quinceañera) and gave the go-ahead on three items from the prior handoff.

**Shipped, in order:**
1. **Homepage Reviews rebuilt with the real review.** Verified the actual review text live on Google Maps (not guessed or reused from the old fabricated set) — "Highly, highly, highly recommend Blue Luna Events! They helped elevate a vision to perfection for our daughter's quinceañera. The team was incredibly professional and easy to work with." Built as a spotlight card paired with a second card inviting past clients to leave their own review (links to the existing `googleReviewUrl`). Re-added to the homepage. Commit `0c287592`.
2. **Estimates list Round 3 shipped** — this was approved by Shawn back on 2026-07-09 but never actually built (`ESTIMATES_PAYMENTS_AUDIT.md`). Discounted total now shows bold with the original struck through (e.g. `~~$650~~ **$1**`); the "paid so far" line now describes the discounted balance; the decorative file icon and per-row card wrapper are gone in favor of flat rows on a hairline divider. Verified visually by temporarily discounting the real Shawn Lopez test estimate, screenshotting the result, then reverting it back to clean. Commit `3650a057`.
3. **Four new landing pages: `/weddings`, `/birthdays`, `/baby-showers`, `/corporate-events`.** These were the biggest remaining SEO/AEO/GEO gap — all four were named in the footer but routed to a homepage anchor instead of a real page. Held a short team discussion on depth (Phil/SEO led): went with full depth matching `/quinceaneras` and `/graduations` — real FAQPage schema, features, packages — not lighter pages, since thin/duplicate content was the actual problem being fixed. Reused the existing general Essential/Signature/Luxury tiers (already apply to all four event types, so no new pricing work). Footer links and `sitemap.xml` updated to point at the real routes. Commit `f9325c5b`.

**Follow-up same session — Shawn flagged the photos as wrong, fixed:**
Checked Studio's real tagged `gallery_media`: baby showers (4 real photos), birthdays (9), and corporate (4) all had real, usable content — no faces, no conflicting signage. Swapped those three pages' hero images and OG previews to the real ones. **Weddings has zero tagged photos in Studio at all** — Shawn's call was to keep the generic placeholder there until Monica has a real wedding job to tag. Also added an "Events" dropdown to the top nav (was footer-only for 4 of the 6 event types before) — desktop hover menu, flattened list on mobile. Commit `393597ca`.

**Still open from before, unchanged:**
- Shawn still needs to cancel the duplicate Google Business Profile he started under his own email (steps already given, not yet confirmed done).
- The real live $1 Stripe payment test — still Shawn's to run.
- **New:** Weddings page has no real Studio photos to pull from — needs Monica to shoot and tag a real wedding job, then swap `/weddings`' hero images the same way the other three were fixed today.

**Shawn, test this:**
1. Visit `bluelunaevents.com` and scroll to the Reviews section — you should see Christian Ortiz's real review on the left and a "Leave a Google Review" card on the right.
2. In Studio → Estimates, open the list — any estimate with a discount should show the original price struck through next to the discounted price in bold, and the rows should be flat with a thin line between them, no icon, no separate card boxes.
3. Visit `bluelunaevents.com/weddings`, `/birthdays`, `/baby-showers`, `/corporate-events` — each should load as a real page (hero, features, packages, FAQ, CTA), not bounce to the homepage. Birthdays/baby showers/corporate should show real event photos now, not generic stock-looking ones.
4. Hover "Events" in the top nav (desktop) or open the mobile menu — all six event types should be listed.

---

## Prior: 2026-07-30, evening: Google Business Profile confirmed real + review button added

Shawn set up what he thought was a new Google Business Profile, got confused when it already showed real photos and a review he didn't recognize, and almost cancelled it thinking Monica had a separate pre-existing one. Traced it down together: it's a real, single profile under **Monica's own Gmail** (not a duplicate, not new) — what looked unfamiliar was just his own submitted edits (photos, description, hours) still sitting in Google's review queue while the profile showed an older/auto-populated version in the meantime. **Confirmed: nothing to cancel here.**

**What Shawn does still need to cancel:** a second, separate profile he'd started under his own email before catching this — that one's a real duplicate. Steps given to him (business.google.com → that profile → Business Profile settings → Remove Business Profile). **Not yet confirmed done — check next session.**

**Shipped:** Got the real "write a review" link from Monica's profile (`g.page/r/CZsdOfmFmuebEAE/review`), added it to `SITE_CONFIG.googleReviewUrl`, and added a "Leave us a review" link to the site footer (next to phone/email/location, opens in a new tab). Live in production.

**Open, needs Shawn:**
1. Cancel the duplicate profile under his own email (see above).
2. Confirm who left the existing "1 Google review" (5.0★) on Monica's real profile — needs to be verified as a real client before it's ever treated as genuine social proof.
3. Once real reviews start coming in (via the new footer button or organically), rebuild the homepage `Reviews.tsx` section — currently removed, not deleted, since the prior testimonials were confirmed fabricated (see 2026-07-30 daytime entry below).

**Shawn, test this:** scroll to the footer on any page — there should be a small "Leave us a review" link with a star icon under the phone/email/address, opening Google's review box in a new tab.

---

## Prior: 2026-07-30, daytime — reconstructed from git log + Vercel after a crash

**About this reconstruction:** Shawn's computer crashed again (same failure pattern as 2026-07-28). This file was stuck showing last night's video-showcase work as the latest thing, but `git log` showed 7 more real commits after that, running up through this morning. Checked carefully: **nothing was lost.** Every commit through `c4e2db3f` is committed, pushed to `origin/main`, and confirmed `READY`/production on Vercel (deployment `dpl_A74uS784...`, promoted). `TASKS.md` and `DECISIONS.md` had actually already been kept current through today — only this file and `changelog.md` were behind. Below is everything that shipped since last night's handoff that hadn't been recorded here yet.

**Shipped and LIVE, in order:**
1. **Hero video fix** — the quinceañera hero video (swapped in per Jony's review, replacing an outdoor clip with a chain-link fence in frame) didn't actually play at first: raw iPhone `.mov` metadata placement issue, same known bug class as the video-thumbnail system. Fixed by re-encoding to faststart `.mp4` via `ffmpeg-static` and re-uploading to Supabase Storage. Confirmed playing correctly on Shawn's real device.
2. **Hero flash fixed** — a mismatched fallback photo (different balloons, different room) was flashing for a split second before the video loaded. Fixed by using the video's own auto-captured thumbnail as both the fallback image and the video poster, so it reads as "the photo comes alive" instead of a jarring swap.
3. **Business-wide audit completed** (real web research, not guesses): no Google Business Profile exists yet (Shawn creating one today); a real Yelp listing exists that Monica may need to claim; two Instagram accounts exist but the second is dormant/no real conflict; 4 old pages still indexed dead in Google.
4. **Fake "5.0 on Google" claims removed sitewide** — Shawn confirmed these were fabricated (no real GBP exists yet). Removed from homepage hero stats, WhyMonica stats, and the Reviews section header. **Open, needs Shawn/Monica:** whether the actual written testimonial quotes (Gabriela Morales, Diana & Robert Castillo, Sofia Reyes) are real or also placeholder — Shawn's explicit call was to leave them alone for now, not confirmed either way.
5. **SEO/AEO/GEO technical fixes shipped**: `/gallery` now has real per-page metadata (was a `'use client'` component blocking it, same bug class as an earlier quince/grad fix); real alt text added to every gallery photo; social-share preview image updated off the old pre-redesign photo; 4 dead indexed pages (`/services`, `/about`, `/contact`, `/event-form`) now 301-redirect instead of 404ing; stale `$450`/`$299` pricing removed from page metadata.

**Full detail for all of the above is already written in `TASKS.md` (DONE 2026-07-30 section) and `DECISIONS.md` (BUSINESS-WIDE AUDIT section)** — this entry just brings this file back in sync with those.

**Shawn confirmed same day:** the hero video plays perfectly, the "5.0 on Google" claim is gone, and **the testimonials ARE fabricated** — not real. Also asked about `/services`/`/about` since they're not on his menu: clarified those are old indexed URLs now redirecting, not missing nav items, nothing to add.

**Shipped in response:** Reviews section (fake names/quotes: Gabriela Morales, Diana & Robert Castillo, Sofia Reyes) removed from the homepage, plus the matching fake pull-quote in `WhyMonica.tsx`. Component left in the repo, just unused — rebuild it with real reviews once Shawn's Google Business Profile (being set up today) has some.

**Still open:**
- Rebuild Reviews section once real Google reviews exist — see `TASKS.md` NOW #1.
- Dedicated landing pages for weddings/birthdays/baby showers/corporate events — biggest remaining SEO gap, needs a scoping conversation, not a quick fix.
- The real live $1 Stripe payment test — still Shawn's to run whenever ready.

**Shawn, test this:** visit `bluelunaevents.com` — the "What Families Say" section should no longer appear on the homepage at all (removed, not just edited). Everything else is unchanged from what you already confirmed working.

---

## Prior: Round 5, same day (2026-07-29): Content strategy meeting + real video showcase — LIVE

Shawn liked the Orbital redesign, then flagged a real content problem: the homepage's photo grid and `/gallery` were doing the same job. Team meeting (Jony leading) proposed replacing it with real video content instead of more photos — Shawn confirmed and added his own brief: "make it feel like magic," tying to `@BlueLunaMagic`.

**Shipped:** Homepage `GalleryPreview` rebuilt as a bento layout of real event videos (autoplay muted loop, subtle shimmer sweep on hover), pulling from the 23 real videos already sitting in Studio. `/gallery` stays the deep-browse page — the homepage section is now genuinely different content (motion, not more stills), not a smaller copy.

**Also decided/done:**
- All 48 existing Studio uploads defaulted to `show_on_website=true` — Shawn's explicit executive call, since Studio just launched and Monica hasn't started real curation, she only uploaded things she already liked.
- **Open, needs Shawn/Monica directly:** the "200+ Events Styled" hero stat has never been verified as real — Studio's own record count isn't a valid stand-in (it just launched). Don't touch this number without their input.
- **Open, scoped as its own future project, not built today:** a live Instagram/Facebook feed. Shawn was clear it should route through Studio's existing hearts (show_on_website)/stars (social_export) system, not a disconnected API pull — real Meta Graph API work, needs Monica's Instagram Business account connected.
- **Third false start on the configurator-with-real-photos project, same pattern as twice before** — deferred to `TASKS.md` NEXT, needs Shawn to name it explicitly before it's touched again.

**Shawn, test this:** visit the homepage — the section right under the hero should now show real event videos playing quietly on loop in a few different sizes, with a soft shimmer when you hover, not a grid of static photos.

---

## Prior: 2026-07-29 (Rounds 1-4)

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

**Two false starts on the same wrong idea, worth remembering clearly:** twice this session, general forward-momentum language ("move forward with Jony's lead on design," then later "next steps from Jony") was misread as approval to start the unrelated configurator-with-real-photos project from the July 8 audit — once actually adding a `components` column to `gallery_media` before Shawn caught it. Both reverted immediately, no lasting effect, but it visibly cost Shawn's patience the second time. **Lesson, now written down explicitly in `TASKS.md` NOW #2: do not resume the configurator project from general "keep going" language — it needs Shawn to name it directly.**

**Round 4, same day — the real correction: Shawn stopped the section-by-section patching entirely.** After Round 3 shipped, Shawn's direct feedback: continuing to patch section-by-section was itself the problem, wasting his time and money, and doing another design "audit" partway through an already-half-changed site would make it worse, not better. Also surfaced a real gap: there is no written record of whatever conversation actually produced the original White/Twilight direction on 2026-07-28 — it happened in a session lost to the crash, only the resulting code survived, which is why nothing could be recovered when asked. Direct instruction going forward: one full redesign pass, existing content kept, genuinely "modern, fresh, out of the ordinary, not your usual, something that's gonna make Blue Luna Events bring in business."

**What shipped from that brief — the Orbital/Circular design language, LIVE:** Blue Luna's own mark is a circle (crescent moon, balloon) — no competitor in Tucson is designed around that. Real photos now crop as circles and stagger like balloons clustering, sitewide:
- Hero: a floating cluster of circular real-photo crops with a subtle continuous float animation, twilight glow behind them.
- WhyMonica: a circular detail-photo accent overlapping Monica's portrait.
- Packages: numbered circular tier markers on each card.
- Reviews: a twilight glow accent behind the header.
- CTA: orbital ring accents in the corners.
- Quinceañeras, Graduations, Gallery: hero images converted from single rectangles to circular crops/accents matching the homepage.

**Two real bugs found and fixed while building this:**
1. Homepage `GalleryPreview` was fetching every photo Monica's ever uploaded, unfiltered — including non-decor candid photos (someone's legs on a deck, a hand holding a grill towel) on the highest-traffic page. Fixed to match the real `/gallery` page's existing `show_on_website` filter. Residual: even filtered, a few of Monica's curated photos aren't great (empty stage, plain ceiling, grass) — that's a Studio tagging/curation task for her, not a code fix.
2. The new circular hero images (quinceañera/graduation pages first, then homepage too for robustness) weren't loading at all — confirmed via devtools the image request never fired. Root cause: Next.js `Image fill` defaults to `loading="lazy"`, which doesn't reliably fire for these above-the-fold nested circular crops. Fixed by adding `priority` + `sizes` — same fix already correctly used on the original hero background photo.

**Full spec now locked in `DESIGN_DECISIONS.md`** so this doesn't get lost again — see "ORBITAL / CIRCULAR DESIGN LANGUAGE."

**Next up, still not scoped, still needs Shawn to name it explicitly (see the false-starts note above):** the configurator-with-real-photos idea from `FRONTEND_REDESIGN_AUDIT.md`.

**Shawn, test this:**
1. Visit `bluelunaevents.com` on your phone — you should see circular photo clusters floating in the hero, not just a rectangular video.
2. Scroll through the whole homepage — WhyMonica, Packages, Reviews, and the CTA should all have small circular accents (a photo, numbered badges, or glowing rings) tying them together.
3. Visit Quinceañeras and Graduations — the hero photo should now be a circular crop with a smaller circular accent overlapping it, not one rectangle.
4. Open the mobile menu — still the white slide-in-from-right panel from earlier today.
5. Check Packages and the quince/grad pages — still no dollar amounts anywhere on the page itself.
6. Does this actually feel "modern, fresh, out of the ordinary" to you, or does it need another pass? This was built to your direct brief — real reaction wanted, not just an approve/reject.

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

- Latest `main` commit: `212dc29b` — Studio "Today" surface + real traffic analytics, confirmed `READY`/production on Vercel 2026-08-02 (`dpl_4Q5CKyagwgaYrMqBFGvyhDAMppwk`). See the 2026-08-02 entry at the top of this file. Preceding commit `96086086` is a recovered security fix (Studio API auth gap + `/q/[token]` PII exposure) from an earlier crashed session, also confirmed live.
- All feature branches from today (`redesign/gallery-twilight`, `redesign/nav-footer-light`, `redesign/light-remaining-pages`, `redesign/orbital-v2`, `redesign/orbital-v3`, `redesign/orbital-v4`) were merged and deleted — further redesign work should branch fresh off `main`.
- **Run `git status`, `git branch`, and `git log` before trusting anything below as fully current** — this file was assembled from session notes, not guaranteed to be re-verified live at read time. In particular, check which branch you're actually on before assuming `main`'s state is what's checked out.
- Full context for everything below lives in three audit docs — read them before making changes in these areas:
  - `PLATFORM_REBUILD_AUDIT.md` — the original full-scope audit (design, camera, calendar, leads, email, social, SEO)
  - `FRONTEND_REDESIGN_AUDIT.md` — public site redesign direction (SEO/AEO/GEO priority #1, then configurator shows real matching photos as customer builds, guided path as default)
  - `ESTIMATES_PAYMENTS_AUDIT.md` — the payment ledger rework, including Round 3 (discount-aware display + flat rows), shipped 2026-08-01
- All locked decisions are in `DECISIONS.md` (product/technical) and `DESIGN_DECISIONS.md` (visual/UX) — read before assuming something is undecided.

### What's fully working and confirmed (not just "looks done")
- **Email is completely fixed.** Three stacked bugs (unverified Resend domain since May 14, an invalid Resend API key, a missing MX record so Monica's real Namecheap-hosted mailbox was unreachable) all found and fixed 2026-07-08. Shawn confirmed real-world: can both send and receive at `monica@bluelunaevents.com`.
- **Stripe is live mode, confirmed**, and a stale/wrong deployed key (same bug pattern as Resend) was found and fixed 2026-07-08. Checkout session creation verified working with a real Stripe Checkout URL.
- **Payment ledger rework shipped 2026-07-09** (commit `b74a9a4e`) — replaced the old fixed 50/50 deposit/balance booleans with a real `estimate_payments` ledger table + `src/lib/estimateBalance.ts` shared calculation used by the client page, PDF, Studio detail page, and weekly summary email. Built: discount editor (percent/flat + note), manual "Record Payment" (Zelle/cash/check + note), real one-tap "Email Estimate to Client" (PDF attached + live link, system-send not `mailto:`). Live-tested end-to-end on the real production test estimate, then cleaned up.
- **Raw internal IDs bug fixed 2026-07-09** (commit `02ec1c79`) — add-ons and event types were printing as `shimmer_backdrop`, `cp_premium_3pack` etc. on customer-facing PDF/pages instead of proper labels. Fixed via `labelForAddOn()`/`labelForEventType()` in `config.ts`.
- **SEO/AEO/GEO 5 fixes shipped 2026-07-08** (commit `8951d7b0`) — fixed invalid JSON-LD `@type`, removed fake review count, fixed `/quinceaneras` + `/graduations` to have their own metadata (were unnecessarily client components), added FAQPage schema, added sitemap.xml + robots.txt.
- **Estimates list Round 3 shipped 2026-08-01** (commit `3650a057`) — discount-aware pricing display (struck-through original + bold discounted total) and flat rows replacing the per-row card/icon. See the 2026-08-01 entry above.
- **Homepage Reviews section rebuilt with a real review shipped 2026-08-01** (commit `0c287592`) — see the 2026-08-01 entry above.
- **Weddings, birthdays, baby showers, corporate events landing pages shipped 2026-08-01** (commit `f9325c5b`) — see the 2026-08-01 entry above.
- **Studio API auth gap + `/q/[token]` PII exposure fixed 2026-08-02** (commit `96086086`) — `/api/studio/*` now requires a valid session the same way pages do; the client estimate view no longer uses the anon key or forwards internal/PII fields.
- **Studio "Today" surface + self-hosted traffic analytics shipped 2026-08-02** (commit `212dc29b`) — see the 2026-08-02 entry above. First concrete piece of the new Studio Intelligence north star (`DECISIONS.md`).
- **Google Search Console fully verified and sitemap submitted, 2026-08-03** — `Success`, 9 pages discovered. See the 2026-08-03 entry above.

### Still open / not started
- Shawn has not yet run the real live $1 payment test (discount a test estimate near 100%, complete a real Stripe payment on himself) — capability is built, he just hasn't done it yet.
- Supabase auto-pause: root cause never fully proven (likely Vercel Hobby-plan cron reliability). Mitigated by replacing the silent keepalive ping with a real weekly business-summary email (`/api/cron/weekly-summary`) so a failure becomes visible (missing email) instead of silent. If Shawn stops getting the Monday/Thursday email, that's the signal to investigate further or pay for Supabase Pro ($25/mo).
- **Pattern worth remembering:** 3 separate "sensitive" Vercel env vars were found stale/wrong this session (Resend domain, Resend key, Stripe key). Nobody has yet audited the remaining ones (`STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`) for the same issue.
- Calendar/availability system (Platform Rebuild Lane A item 2) — not started. Decided: port Found's `availability`/`availability_blocks`/`bookings` pattern, schema built for a future iCloud CalDAV two-way sync (Monica's calendar is iCloud, not Google).
- Configurator redesign (`FRONTEND_REDESIGN_AUDIT.md` — real matching photos as customer builds, guided package path as default, visible deposit/cancellation policy) — not started. Requires gallery photos to be tagged by component/color, not just `event_type`, as a prerequisite.
- Phase 5 — real Leads system, Contacts phone book, owner-editable email template system, SMS (Twilio, capability only — activation needs Shawn's A2P 10DLC carrier registration) — not started, was next after the payments work per the locked build order.
- Camera/Photos port from Found (in-app `CameraSheet`, replacing the native file-input "Shoot" button) — not started.
- The 4 new event-type landing pages (`/weddings`, `/birthdays`, `/baby-showers`, `/corporate-events`) use the same static 7-photo local pool as `/quinceaneras`/`/graduations` — a real fix means tagging Monica's Supabase photos by event type so these pages can pull matching real photos instead. Not scoped yet.

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
