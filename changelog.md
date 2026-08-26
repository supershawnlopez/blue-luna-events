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

## Session: August 26, 2026 — embedded invoice checkout for corporate-browser payment issue
**AI:** Codex
**Worked on:** Shawn shared Ava's Mimecast Browser Isolation screenshot and asked for a quick fix so the customer can pay now without the checkout handoff looking suspicious or getting blocked.

### Completed This Session
- Changed estimate/invoice checkout sessions to use embedded checkout by default, returning a client secret instead of immediately redirecting the customer to a hosted checkout URL.
- Updated the public `/q/[token]` invoice page to mount the secure card checkout inside the Blue Luna page.
- Replaced the loading text "Redirecting to payment..." with "Opening secure Blue Luna checkout..." and made full-payment/manual 100% deposit invoices show "Pay Now".
- Added a "Company browser blocking the payment?" fallback with Copy Invoice Link and Text Monica actions.
- Left a hosted checkout fallback only for the case where `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is missing.
- Verified: clean `npm run build`.

### Deployment Note
- Embedded checkout needs `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set in Vercel. Local `.env.local` has placeholder Stripe keys and the repo is not linked to Vercel locally, so production env could not be verified from this session.

---

## Session: August 26, 2026 — Traffic Report becomes a marketing decision report
**AI:** Codex
**Worked on:** Shawn asked the full team what they would fix if they owned Blue Luna and needed the report to show what increases traffic and leads, then approved following the team's actual fix list.

### Completed This Session
- Rebuilt the detailed Traffic Report around the team recommendation: Leads by Channel stays first; private `/q/*` client estimate/payment pages are excluded from marketing page reporting; "Direct / Unknown" is renamed to **Unknown / Direct / DMs**.
- Added report sections for **Marketing Pages Viewed**, **Pages That Led to Inquiries**, and **Top Lead Paths** so the report answers which public pages are actually helping produce inquiries, not just which pages got views.
- Added **Tagged Links to Use** with copy buttons for Instagram Bio, Instagram Story, Facebook Page, and Facebook Post URLs.
- Added UTM/session attribution capture to `VisitTracker` and `/api/track`, and passed the same attribution from the Event Questionnaire into `submitLead()`.
- Updated channel normalization so customer answers and UTMs collapse into practical buckets: Google, Instagram, Facebook, Referral, Saw Her Work, etc.
- Created Supabase migration `20260826010840_marketing_attribution_report_fields.sql` for `site_visits` and `leads` UTM/session columns.
- Could not apply the migration live: the available Supabase Management API token returns `403` for Blue Luna's project ref (`myumgaqlafbynsgnkdnj`). Code is backward-compatible before the migration, but richer UTM storage and lead-path reporting require applying it.
- Verified: clean `npm run build`.

### Shawn Test
1. After deploy and migration, open Studio → Home → "This Month."
2. Confirm "Client Estimate / Payment Pages" is gone from marketing pages.
3. Copy the Instagram Bio tagged link, open it fresh, submit a test Event Questionnaire lead, and confirm it reports as Instagram.
4. Review Pages That Led to Inquiries and Top Lead Paths once a few tagged leads exist.

---

## Session: August 25, 2026 — payment alerts and receipts verified
**AI:** Codex
**Worked on:** Shawn asked to verify Monica gets payment alerts and customers get receipt emails when a payment is received.

### Completed This Session
- Verified the Stripe payment path was already covered: `src/app/api/stripe/webhook/route.ts` records the `estimate_payments` row, sends the customer receipt email through `src/lib/receiptEmail.ts`, CCs Monica at `SITE_CONFIG.email`, and sends a Studio PWA push notification linking to the estimate.
- Found the real gap: manual payments recorded inside Studio (`POST /api/studio/estimates/[id]/payments`) only inserted the payment row. They did not automatically send the customer receipt email or trigger Monica's payment push alert.
- Fixed the manual-payment route to reuse the same `sendReceiptEmail()` and `sendPush()` paths after a Zelle/cash/check/other payment is recorded. Customer gets the receipt; Monica gets the receipt CC and a Studio PWA payment notification on subscribed devices.
- Rechecked customer-facing receipt branding and save/print behavior: receipt email subject/body are Blue Luna/Monica branded with no Stripe wording, the client page switches to Receipt once paid in full, and the PDF download now names the file by the current document state (`blue-luna-receipt...`, `blue-luna-invoice...`, or `blue-luna-estimate...`) instead of always saying estimate.
- Verified: clean `npm run build`. No schema change.

### Shawn Test
1. Make sure Monica has notifications enabled from the installed Blue Luna Studio PWA.
2. Record a small manual payment on a test estimate in Studio.
3. Confirm the customer receives the "Payment Receipt" email, Monica receives the CC, and the phone receives the payment notification.
4. Open the client link and confirm a paid-in-full record says Receipt and downloads as `blue-luna-receipt-...pdf`.
5. Separately run the live $1 Stripe test when ready to verify production webhook delivery end to end.

---

## Session: August 16, 2026 — Estimate drafts: autosave, cross-device, Duplicate, delete/Trash
**AI:** Claude Code
**Worked on:** Started from a real Monica bug report — she lost an in-progress estimate navigating away before "Save Draft." Grew into a full round of estimate-workflow fixes, all driven by Shawn's real testing feedback along the way.

### Completed This Session
- **Local-only autosave first, then upgraded to server-backed after a team pass.** In-progress estimates now save to a real `estimates` row (status: `draft`) once name+email are filled — visible in the Estimates list as "In Progress," reachable from any device via a `?draft=<id>` link. Local storage is now only the safety net for before that point. Discard via "Start Over" (wizard) or the list's trash icon.
- **Duplicate as a New Estimate** — `POST /api/studio/estimates/[id]/duplicate`, reachable from any estimate's detail page. Copies client/event/items, resets status/discount/deposit/payments. Real feedback fix same day: added a dismissible "this is a new, separate copy" banner after Shawn found there was no way to tell which estimate he'd landed on.
- **Selection editor now saves instantly.** Adding/editing/removing a line item on an existing estimate used to need a separate "Save" tap — real feedback from Shawn that it looked broken ("it doesn't add to that section until I hit save"). Every change now PATCHes immediately; the editor is just "Done."
- **Autosave indicator always visible.** The new-estimate wizard's save-status line used to stay hidden until a real server draft existed; now shows "Autosaves as you go" from the first keystroke, per Shawn not seeing any sign it was working.
- **Delete + Trash.** `estimates.deleted_at` column added (Supabase Management API). Delete is soft — sets `deleted_at`, filtered out of the normal list, recoverable from a new Trash tab (one-tap Restore). Available on every Estimates list row and the estimate detail page, gated behind an inline confirm. Estimates with recorded payments still can't be deleted/trashed at all. Verified directly against the schema that a duplicate and its original are fully independent rows — deleting one can never touch the other.
- Full decision record: `DECISIONS.md` "ESTIMATE DRAFTS: AUTOSAVE, DUPLICATE, DELETE/TRASH (2026-08-16)".
- Verified: clean `npm run build` throughout, soft-delete/restore filtering logic tested directly against the schema (hide-from-list / show-in-trash / restore, all confirmed), Selection-editor auto-persist verified live in a real logged-in browser session. Confirmed Monica's own real testing (duplicate drafts for Katie Atkins and Lauren Munsey she created herself) was never touched. Commits `de64b60b`, `09e5bfcc`, `c71432e9`, `b04c3d3f` — all pushed, Vercel confirmed `READY`/`PROMOTED`.

## Session: August 10, 2026, continued — Traffic Report cleanup (real issues Shawn caught live)
**AI:** Claude Code
**Worked on:** Minutes after the Traffic Report shipped, Shawn read the live numbers back and flagged two things: several "What They're Looking At" rows were unreadable strings of characters, and he asked what "Direct/Unknown" means, doubting it really meant "no information."

### Completed This Session
- Pulled the real `site_visits` rows directly (Supabase SQL) instead of guessing — confirmed the unreadable rows were real pages: each client's own `/q/<token>` estimate/payment link and individual `/gallery/<slug>` photos, each counted as its own separate unlabeled row. Fixed at the aggregation level in `src/app/api/studio/analytics-detail/route.ts` — `pageBucket()` now groups all `/q/*` paths and all `/gallery/*` paths before counting, not after. `src/app/studio/analytics/page.tsx` labels them "Client Estimate / Payment Pages" and "Gallery — Individual Photos."
- Pulled the real `leads` rows for the month to answer the "Direct/Unknown" question concretely — it means no self-reported answer to "how did you hear about us" *and* no usable referrer signal (common for links opened from in-app browsers/DMs/texts, not just a typed URL, or a lead from before tracking existed).
- **Real bug found while checking that:** `leadChannel()` could produce two separate rows in the same window that both display as "Direct/Unknown" — one from a lead with a technically-blank referrer (`referrer_channel = 'Direct'`), one from a lead predating referrer tracking entirely (`referrer_channel = null`). Merged into a single bucket.
- Verified: clean `npm run build`, pushed, Vercel confirmed `READY`. Commit `6d360e7a`.

## Session: August 10, 2026, continued — real Traffic Report (Leads by Channel)
**AI:** Claude Code
**Worked on:** Shawn asked for a detailed report behind Studio Home's "This Month" card. Team meeting (Phil leading) proposed a channel-performance view; Shawn's own framing reshaped it: "the goal is not fluffy numbers... we need data to know where to spend our focus for ads, promos, posts etc."

### Completed This Session
- **Real finding (Priya):** `leads.referral_source`/`referrer_channel` is reliable (self-reported or captured at submission); `site_visits.referrer` (`document.referrer`) is not — Instagram/Facebook in-app browsers routinely strip it, so real Instagram/Facebook visits quietly undercount into "Direct." A per-channel conversion-rate metric (leads ÷ visits) would combine a trustworthy numerator with a denominator skewed worst on exactly the channels that matter most — deliberately not shipped. Leads by Channel is the primary, ranked metric instead.
- **Real bug found and fixed (Craig):** `site_visits` channel counts were computed per pageview — a visitor landing from Instagram and browsing 5 pages counted as 1 Instagram + 4 "Direct" (every page after the first has `bluelunaevents.com` as `document.referrer`). Fixed: `VisitTracker.tsx` now generates a `session_id` (sessionStorage-scoped) and captures the entry referrer once per tab session, reusing it for every pageview in that session. `site_visits.session_id` column + indexes added via Supabase Management API. `/api/track` and `/api/studio/analytics-detail` updated to dedupe by session. Legacy rows (before this shipped) have no `session_id` and are each counted individually, same as the old behavior — acceptable seam in historical data only.
- New `/api/studio/analytics-detail` (`src/app/api/studio/analytics-detail/route.ts`) — accepts `?window=month|3months|all`, returns Leads by Channel (with trend vs. the immediately-preceding equal-length period), Site Visits by Channel, and top pages.
- New `/studio/analytics` (`src/app/studio/analytics/page.tsx`) — dedicated Traffic Report screen, reached by tapping the "This Month" card on Studio Home (not a 7th bottom-nav tab, same pattern as Contacts opening from Leads). Plain-English summary line up top, Leads by Channel table, "What They're Looking At" (top pages), Site Visits by Channel last with an explicit reliability caveat.
- `src/app/studio/page.tsx`: "This Month" card is now a `<Link href="/studio/analytics">` with a "Full traffic report →" affordance.
- Full decision record: `DECISIONS.md` "FULL TRAFFIC REPORT (2026-08-10)".
- Verified: clean `npm run build` (`/api/studio/analytics-detail` confirmed `ƒ` dynamic, not statically cached — same caching-bug class fixed 2026-08-03), pushed, Vercel confirmed `READY`. Commit `8bd7df81`.

## Session: August 10, 2026 — lead detail sheet shows the full Event Questionnaire
**AI:** Claude Code
**Worked on:** Shawn relayed a real gap from Monica — a lead's slide-up opens in Studio, but there's nowhere to tap through to what the customer actually submitted on the Event Questionnaire, so she can't work from it toward a quote.

### Completed This Session
- **Root cause:** `GET /api/studio/leads` (`src/app/api/studio/leads/route.ts`) hard-coded a `select()` column list that never included `setup_time`, `guest_count`, `looking_for`, or `inspo_photos` — all real columns already populated by `submitLead()` (`src/lib/actions.ts`) and already shown in Monica's lead notification email. The Studio Leads UI simply never received them.
- Added those four columns to the API select.
- Extended the `Lead` type and the lead detail sheet (`src/app/studio/leads/page.tsx`) to render them: a Venue/Guests/Budget/Setup Time details block, a "What They're Looking For" tag list, and an Inspiration Photos thumbnail grid (tap opens full-size in a new tab) — placed alongside the existing Vibe/Theme/Colors (`vision`) and Heard About Us Via (`referral_source`) sections, each conditionally rendered only when that lead has the data.
- Verified: clean `npm run build`, pushed, Vercel confirmed `READY`. Commit `41076d02`.

## Session: August 4, 2026, continued — "No Add-Ons" clear-all option
**AI:** Claude Code
**Worked on:** Shawn clarified the prior fix in this session missed the actual ask — he wasn't reporting a toggle bug, he wanted a direct "no add-ons" clear control, parallel to the "No Package — Custom Only" option already shipped.

### Completed This Session
- Added a "No Add-Ons" link next to the Add-Ons header in the estimate Selection editor (`src/app/studio/estimates/[id]/page.tsx`) that clears `selAddOnIds` to `[]` in one tap, only shown when at least one add-on is selected. Commit `baad4fd6`.
- Verified: clean `tsc`/`npm run build`, pushed, Vercel confirmed `READY`, production confirmed 200.

## Session: August 4, 2026, continued — stuck add-on removal fixed + Stripe payment receipt email
**AI:** Claude Code
**Worked on:** Shawn reported he couldn't remove an add-on from an estimate — it "stuck." Same message asked to confirm Stripe checkout stays in sync with edits made in Studio, and that customers get a real receipt email after paying.

### Completed This Session
- **Root-caused the stuck add-on bug:** `saveSelection()` in `src/app/studio/estimates/[id]/page.tsx` had a guard — `if (!selPackageId && selAddOnIds.length === 0 && selCustomItems.length === 0) return` — originally meant to stop an accidental fully-blank save. It also silently blocked the legitimate case of removing the very last item when nothing else was selected, which is exactly the state right after clearing a premade package (shipped earlier this session). The toggle button updated local state fine, but Save quietly no-op'd, so the removal never persisted and reverted on next load — reading as permanently "stuck." Removed the guard from both `saveSelection()` and the Save button's `disabled` condition. Commit `5d48709e`.
- **Verified Stripe checkout needed no fix:** read `src/app/api/stripe/estimate-checkout/route.ts` directly — it re-fetches the estimate and calls `computeBalance()` fresh at checkout time, so the deposit/balance charged always reflects whatever's currently saved (package, add-ons, custom items, discount), never a stale cached number.
- **Found and fixed a real gap in the Stripe webhook** (`src/app/api/stripe/webhook/route.ts`): on `checkout.session.completed`, the payment was correctly inserted into `estimate_payments`, but nothing was ever emailed to the client — no receipt, no confirmation of any kind. Added `sendReceiptEmail()` — re-fetches the estimate + all payments, computes the post-payment balance, and sends a branded Blue Luna Events receipt (amount paid, date, remaining balance or "Paid in Full," link back to `/q/[token]`) via Resend, matching the visual style of the existing estimate email. Wrapped the call in try/catch so a failed send can't return a non-200 to Stripe (which would trigger a retry and double-insert the payment row).
- Verified: clean `tsc`/`npm run build`, pushed, Vercel confirmed `READY`, production confirmed 200.

## Session: August 4, 2026 — estimate-form confusion fix, real estimate editing, custom/freeform items, lead-source question
**AI:** Claude Code
**Worked on:** Urgent, in stages — Shawn reported a real lead (Daniella Zepeda) came in and Monica couldn't complete an estimate for her in Studio, describing the "+ New" flow as looking pre-filled with someone else's info. Once that was fixed, Shawn was mid-phone-call with a real client and needed to change her already-created estimate — surfaced that existing estimates had no editing at all. Then, still on the same thread, flagged that a client might abandon the premade packages entirely and need a fully custom quote. Also asked for a "where did you hear about us?" question on the public form now that real leads are starting to arrive.

### Completed This Session
- **Diagnosed live, not from description alone:** queried Supabase directly for Daniella Zepeda's lead and confirmed her estimate had in fact saved correctly — real row, $650, Essential package, $325/$325 deposit/balance split, valid `share_token`. No data loss, nothing structurally broken. Then logged into production Studio and live-tested the "+ New" estimate wizard myself to see the actual confusion firsthand.
- **Root cause confirmed:** the Client Info step's placeholder text (`'Maria Hernandez'`, `'maria@email.com'`, `'(520) 555-0100'`) was realistic-looking example data with no explicit `::placeholder` styling — inline `style` props can't target that pseudo-element, so it fell back to the browser's default dimming, which wasn't visually distinct enough to read as "example," not "already filled in."
- **Fixed** (`src/app/studio/estimates/new/page.tsx`): reworded every placeholder to an unambiguous instruction ("Type the client's full name," "Type their email address," etc.) and added a real `<style>` block targeting `.est-client-input::placeholder` (dimmer + italic) so it can't be mistaken for real content again. Commit `885495ff`.
- **Added real editing to existing estimates.** Checked the estimate detail page (`src/app/studio/estimates/[id]/page.tsx`) directly — confirmed the PATCH route's allow-list only accepted `status`, `notes`, and discount fields; package, add-ons, and client/event info were locked in permanently once created. Extended the allow-list and added inline "Edit" mode to the Details card (client name/email/phone, event date, venue, notes) and the Selection card (package + add-ons, reusing `PACKAGE_CATALOG`/`ADD_ONS`/`computeTotal` from `src/lib/pricing.ts` so pricing logic isn't duplicated) — total recalculates live, saves to the same estimate/share link. Commit `83f63511`.
- **Added support for fully custom estimates.** Immediate follow-up from Shawn: a client might change their mind mid-call and want something outside the premade catalog entirely (the packages are still being refined). Added `estimates.custom_items` (jsonb, default `[]`, array of `{label, price}`) via the Supabase Management API. Selection editor gained a "No Package — Custom Only" option that clears `package_id`/`package_name`, plus a free-form label+price add-item form with live total recalculation. Wired custom items through every surface that renders an estimate's selection so nothing goes stale on one screen while another was updated: the client-facing `/q/[token]` page + `ClientEstimateView.tsx`, the PDF (`src/lib/estimatePdf.tsx`), and Studio's own read-only Selection display. Commit `47c035fb`.
- **Added "Where did you hear about us?"** to the public Event Questionnaire — reused an existing-but-unused `leads.referral_source` column (confirmed via `information_schema` + a repo-wide grep that it was never wired up) rather than adding a new one. Optional chip question (Google Search / Instagram / Facebook / Referral / Saw her work / Other) between Budget and Delivery in `InquiryForm.tsx`, stored on submission via `actions.ts`, surfaced in Studio's lead detail sheet (`src/app/studio/leads/page.tsx`) as "Heard About Us Via." Commit `300ad340`.
- Verified: clean `tsc`/`npm run build` for every change, each pushed and confirmed `READY` on Vercel individually, production (`bluelunaevents.com`) confirmed 200 after each deploy.

---

## Session: August 3, 2026, real-device feedback round — bug fixes to Phases 3 & 4
**AI:** Claude Code
**Worked on:** Shawn tested Phases 3-6 on his real phone and reported back real issues. Triaged: Phase 3/4 items were clear bugs, fixed directly. Phase 6 feedback ("weak and ugly," the "11 starred" button doesn't feel intuitive) was an explicit ask for a team conversation before touching any more code — held that in chat, no code changed for Phase 6 this round.

### Completed This Session
- **Camera (Phase 3):**
  - Added a real "Requesting camera access…" loading state with a spinner — previously the screen was just black while waiting on the browser's own permission prompt, reading as broken instead of loading.
  - Fixed a real overlap bug: the "Add N to Studio" button and the zoom/mode controls were each positioned with independently-guessed `bottom` offsets that drifted out of sync, causing them to visually collide (confirmed exactly what Shawn described — a button appearing "right behind the zoom features," unreadable). Restructured into one flex-column stack so spacing is never guessed again.
- **Schedule (Phase 4):**
  - Removed the native `<input type="date">` for the block sheet's end date — it was popping the phone's own OS calendar mid-flow right after Monica had already picked a date on the app's own calendar grid, which read as confusing and inconsistent (Shawn's exact complaint). Replaced with quick-pick buttons ("Just this day," "+1 day," "+2 days," "1 week") with a live date-range preview.
  - Fixed bottom sheets sitting too low / partially hidden behind the mobile browser's own address-bar chrome (not covered by `env(safe-area-inset-bottom)`, which only accounts for the iPhone home-indicator area) — added a flat cushion on top of the safe-area inset across every Studio bottom sheet (Schedule, Leads, Contacts, Templates, My Work).
- Verified: clean `tsc`/`npm run build`, browser-confirmed the Schedule block sheet (no more OS calendar popup, correct date-range preview) and the camera loading state (visible spinner + message instead of blank black) both work as intended.

- **Logo bug fix (Phase 6):** Shawn sent real screenshots of an exported image. Opening `/public/images/logo-white.png` directly confirmed the source file itself is corrupted — the wordmark reads "BLUFLUNA EVENTS," letters missing/overlapping — not a bug in the canvas rendering code. Only ever visible inside generated export images, so it was never caught browsing the site. Fixed by no longer depending on that file at all: the branding strip now draws the moon mark and wordmark directly on canvas. Team explicitly held off on any further Social redesign per Shawn's ask — this was a pure bug fix, not a product/design decision.

- **Lead-source attribution shipped.** Team meeting (Steve leading) on Shawn's "This Week traffic doesn't do her or me any good" complaint — landed on capturing which channel (Instagram/Google/Facebook/Direct) a lead actually came from at the moment they submit the inquiry form, rather than a raw visit count. Shawn approved: "let's try it, if it doesn't work then we will do a change." New `leads.referrer_channel`/`referrer_raw` columns, shared `src/lib/channel.ts` (single categorization function used by both this and traffic analytics), `/api/studio/lead-sources`, and Studio Home's card now reads "3 leads — 2 from Instagram, 1 from Google" instead of a bare visit count (which is demoted to a small secondary line, not removed). **Found and fixed a real bug during testing:** the "this month" date boundary used the server's own clock — this dev machine happens to be set to Arizona time so it looked fine locally, but Vercel's production runtime is UTC, and confirmed directly that the same code would have miscounted a late-night Arizona lead into the wrong month in production. Fixed to compute the boundary against a fixed Arizona offset regardless of server timezone. Full reasoning in `DECISIONS.md`.
- **Social Export scratched.** Shawn tested the logo fix, said the export itself "looks horrible," and made the call directly: "let's scratch it for now and leave heart only for sites." Removed the Star toggle (grid + lightbox + filter pill), the "N starred" header button, and the "Export for Social" Home quick-action from Studio's UI. The Today surface no longer nudges about photos ready to post. Nothing deleted underneath — `social_export`/`caption` columns, `/studio/exports`, and the caption-suggestion code all stay in the repo, just unlinked, same treatment as the removed-but-not-deleted homepage Reviews section. Full reasoning in `DECISIONS.md`.

### Still Open
- Shawn to confirm the logo fix on a real exported image (couldn't get a clean browser screenshot this round due to tooling issues — shipped on code-correctness grounds, needs his eyes on the real output).
- Shawn to confirm the other 3 fixes on his real phone.
- Phase 6 (Social) — the bigger question (is manual download/copy-paste worth building further given real Instagram auto-posting is a separate future project) is still open, waiting on Shawn's call.
- Camera upload progress "took a little long" for 4 photos — likely just real mobile upload time (same compression pipeline as file-picker uploads), not confirmed as a bug. Worth a second look if it keeps happening.
- Whether/how to link Monica's iCloud calendar, or make bulk-blocking easier (e.g. recurring days off) — real ask, not yet scoped.

---

## Session: August 3, 2026, last of the day — Phase 6: Social caption assistance
**AI:** Claude Code
**Worked on:** Shawn said "continue" right after Phase 5 shipped — kept going into Phase 6, the last phase in the original `PLATFORM_REBUILD_AUDIT.md` plan.

### Completed This Session
- Added the missing `gallery_media.caption` column — the PATCH allow-list and a `displayCaption()` helper already existed in the code unused, evidence this was half-planned earlier and never finished.
- `src/lib/captionSuggestions.ts` — template-based (not AI, same standing rule as the Today surface) caption suggestions per event type, with hashtags.
- Social Export page (`exports/page.tsx`): every starred photo now shows an editable caption (saved caption, or the template suggestion if none saved yet), with "Copy Caption" next to the existing "Save" (image) button.
- Full reasoning for every scope call (why not AI, why Exports not My Work, why "lightweight posting view" means copy-paste not real Instagram API posting) in `DECISIONS.md` "PHASE 6" section.
- Verified: clean `tsc`/`npm run build`. Real API test — set a caption on a real starred photo, confirmed it persisted, reverted it. Browser-confirmed correct per-event-type suggestions across multiple real starred photos.

### Still Open
- Shawn to test the caption editor and Copy Caption button for real.
- All 6 originally-scoped Studio Intelligence rebuild phases (Camera, Calendar, Leads/Contacts/Email/SMS, Social) are now shipped. Phase 2 (full visual redesign of Studio itself, from the original 2026-07-07 audit) was never picked back up — still open if Shawn wants it.

### Shawn Test
1. Studio → Social Export → scroll to a starred photo → confirm a real caption suggestion is already there, matching that photo's event type.
2. Edit it if you want, tap Copy Caption, paste it somewhere to confirm it copied.

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
