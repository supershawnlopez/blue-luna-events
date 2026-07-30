# DECISIONS.md — Blue Luna Events Product Decisions
### Every approved product decision lives here. Written the moment it's decided. Never deleted.
### New AI: read this before suggesting anything. These are locked unless Steve reopens them.

---

## How to use this file

- One entry per decision
- Format: **[Date] — [Decision] — Approved by: [Name]**
- Reason: one line explaining why
- Never delete entries — mark as REVISED if changed, add new entry below

---

## CORE PRODUCT DECISIONS

**[2026-05-01] — Package configurator replaces the manual quote form as the primary booking path.**
Approved by: Shawn
Why: 50% of Monica's leads were ghosting after a manual price reveal. Real-time pricing plus a Stripe deposit removes the ambush and bakes an upgrade path into the flow itself.

**[2026-05-13] — Dual-path configurator: premade packages AND à la carte custom build, sharing one pricing engine.**
Approved by: Shawn
Why: Some clients want a bundled package; others want to build exactly what they need component by component. Both paths must feed the same lead record and pricing rules — no duplicate logic.

**[2026-05-14] — Deposit is 50% via Stripe Checkout. Consultation path triggers at total ≥ $1,200, Luxury tier, or 4+ add-ons.**
Approved by: Shawn
Why: High-value or complex bookings need a real conversation before payment; everything else can self-serve straight to deposit.

**[date uncertain, carried over from AGENTS.md] — One booking path only: every CTA on the site routes to `/get-a-quote`.**
Approved by: Shawn + Steve Jobs
Why: No duplicate booking flows. One configurator, one source of truth, no maintenance drift between multiple entry points.

**[2026-06-19 or earlier] — Monica's Studio uses simple password + cookie auth, not Supabase Auth.**
Approved by: Shawn + Craig Federighi
Why: Monica is a single user. A full auth system is unnecessary complexity for one login — revisit only if Studio becomes multi-user.

**[2026-06-20] — Hosting migrated from Netlify to Vercel.**
Approved by: Shawn + Craig Federighi
Why: Consistency with Shawn's other Next.js projects (Found Co., Say It Marketing) — one platform, one set of API tokens, simpler env var + domain management. Any remaining Netlify references in older docs are leftover from before this move.

**[2026-06-21] — Video Thumbnail System: auto-capture on Studio lightbox open, with a styled placeholder in the grid until then.**
Approved by: Shawn + Craig Federighi + Marcus Webb

Root problems that caused every prior attempt to fail:
1. iPhone `.MOV` files store metadata (moov atom) at the END of the file — partial range downloads give unusable bytes.
2. iOS Safari blocks `preload="metadata"` without an explicit user touch — `onLoadedMetadata` never fires in the background.
3. Canvas `drawImage()` fired before the GPU painted the seeked frame — black capture even when the seek itself succeeded.

Locked solution:
- Grid cells without a captured thumbnail show a branded dark-blue gradient placeholder with a teal play ring — never black or blank (see `DESIGN_DECISIONS.md`).
- When Monica taps a video in the Studio lightbox (an explicit user gesture, which iOS allows): `crossOrigin="anonymous"` + `onLoadedMetadata` → seek to 3s → `onSeeked` → wait 2× `requestAnimationFrame` (lets the GPU actually paint the frame) → capture the canvas frame → upload → `PATCH /api/studio/media/[id]`. Deduped via a `Set` of already-captured media IDs so it only runs once per video.
- New uploads run the same capture logic against the local blob URL at upload time, with an `oncanplay` + brief `play()` fallback if `onSeeked` never fires, and a 12s timeout.

**Do NOT try again — all of these were tested and failed:**
- `ref={el => { el.currentTime = 3 }}` — fires before metadata has loaded.
- Range-fetching the first N bytes of the file — the iPhone moov atom is at the END, so this data is unusable.
- Relying on `preload="metadata"` to auto-seek on iOS — Safari blocks it without a user touch.
- Calling canvas `drawImage()` immediately after a seek without the 2× `requestAnimationFrame` wait — captures a black/blank frame even though the seek succeeded.

Why this is locked: this took multiple sessions to root-cause. Re-attempting any of the "do not try" approaches wastes a session re-discovering the same dead ends.

**[2026-06-21] — Social Export is called "Social Export," never "Brand Pack." Three fixed Instagram canvas formats.**
Approved by: Shawn + Jony Ive
Why: "Social Export" describes what it does in plain language, matching Monica's mental model. Formats: Feed Portrait (4:5, 1080×1350), Square (1:1, 1080×1080), Story/Reel (9:16, 1080×1920) — cover what Monica actually posts to.

**[2026-06-21] — No filenames anywhere in public-facing UI — event type labels only.**
Approved by: Shawn + Jony Ive
Why: Filenames leak internal file-naming conventions and read as unpolished. `toLabel(raw)` converts the stored `event_type` into a clean display label everywhere client-facing.

**[2026-06-21] — Videos in the public gallery lightbox autoplay muted + looped, with no visible controls.**
Approved by: Shawn + Jony Ive
Why: The client never needs to hear audio, and native video controls break the editorial, magazine-like presentation the gallery is designed around (see `DESIGN_DECISIONS.md`).

**[2026-06-21] — Estimates: client pays via a shareable link (`/q/[token]`), never a login.**
Approved by: Shawn + Craig Federighi
Why: Monica's clients are one-time or infrequent — a login system is friction with no retention benefit. A token-based link keeps the estimate private without requiring an account.

**[date uncertain, carried over from AGENTS.md] — Vercel stays on the Hobby plan until Blue Luna generates revenue; upgrade to Pro after.**
Approved by: Shawn
Why: Zero-cost infrastructure keeps margins attractive while the site is still proving itself as a business.

---

## INFRASTRUCTURE FINDINGS (July 2026)

**[2026-07-08] — Resend domain verification for `bluelunaevents.com` was broken from day one; fixed.**
Approved by: Shawn (provided Resend API key for investigation) + Craig Federighi
Why this matters: the domain's required DNS records (1 DKIM TXT, 1 SPF MX, 1 SPF TXT) were never added when the domain was created on 2026-05-14 — confirmed via Resend's domain status API (`"status": "failed"`, unchanged since creation) and Vercel's DNS records API (only Vercel's own system records existed, none of the 3 required ones). Every `resend.emails.send()` call in the codebase also never checked the returned `{data, error}` shape, so a rejected send looked identical to a successful one in the app's own logs — meaning this failure mode was completely silent. Fixed by adding all 3 DNS records via Vercel's DNS API, confirming them live via independent public DNS lookup, then triggering Resend re-verification. Domain is now `verified`. Error-checking added to all `resend.emails.send()` call sites (`src/lib/actions.ts`, `src/app/api/cron/weekly-summary/route.ts`) so future failures are logged instead of silent.

**[2026-07-08] — The app's live `RESEND_API_KEY` was itself invalid — separate bug, also fixed.**
Approved by: Shawn (provided the working key) + Craig Federighi
Why: even after the domain was verified, a real test send failed with `"API key is invalid"` — the key configured in Vercel was not the same as (or was revoked relative to) the working key Shawn provided directly from his Resend account. Updated `RESEND_API_KEY` in Vercel to the confirmed-working key and redeployed. Verified via Resend's official per-email status endpoint (`GET /emails/{id}`) — not the ambiguous list endpoint — showing `"last_event": "sent"` with a real Amazon SES message ID.

**[2026-07-08] — No mail server existed for the root domain at all; Monica's real Namecheap-hosted mailbox was unreachable. Fixed.**
Approved by: Shawn (confirmed via Namecheap cPanel screenshots) + Craig Federighi
Why: `monica@bluelunaevents.com` is a real, working mailbox hosted on Namecheap's shared hosting (cPanel, `host55.registrar-servers.com`) — but the domain's DNS is managed by Vercel (since the June hosting migration), and Vercel had **no MX record at all**, meaning nothing was configured to route mail sent to any `@bluelunaevents.com` address anywhere. This is a different, more severe problem than the Resend/API-key issues above — it means the app's own "new lead" notification email (sent to `monica@bluelunaevents.com` via `SITE_CONFIG.email`) could never have been delivered, regardless of the Resend fixes, since there was nowhere for it to go. Fixed by pulling the mail configuration directly from Namecheap's cPanel Zone Editor and adding the matching records to Vercel's DNS: MX (`mail.bluelunaevents.com`, priority 0), an A record for that mail hostname (`198.54.126.7`), root SPF TXT, and DMARC TXT. All confirmed live via public DNS lookup. A DKIM TXT record (`default._domainkey`) was also added but was transcribed from a screenshot rather than copy-pasted — lower confidence on that one specifically; it only affects outbound spam scoring, not delivery, so low-stakes if it needs correcting later.
**Unconfirmed impact:** whether any real client has ever actually received a confirmation/notification email, or whether Monica has ever received a lead notification, since the site launched. Ask Monica directly — send a real test email to `monica@bluelunaevents.com` and confirm it lands. See `TASKS.md` NOW #1.
**Update 2026-07-08: CONFIRMED FIXED.** Shawn verified he can now both send and receive real email at `monica@bluelunaevents.com`.

**[2026-07-08] — Stripe confirmed live mode; the deployed `STRIPE_SECRET_KEY` had the exact same "stale/wrong key" bug as Resend, also fixed.**
Approved by: Shawn (provided the real key) + Craig Federighi
Why this matters: Shawn provided his Stripe secret key directly (`sk_live_...`) to resolve the open test-vs-live question — the prefix alone confirms live mode. Testing the key directly against Stripe's API worked fine (valid account, `livemode: true`, $0 balance ever collected — consistent with checkout never having worked). But calling the *deployed* `/api/stripe/estimate-checkout` route crashed with an empty 500 — the exact same symptom class as the Resend key bug. Updated `STRIPE_SECRET_KEY` in Vercel to the confirmed-working key and redeployed; the endpoint now returns a real, valid Stripe Checkout URL (`cs_live_...`).
**Not yet validated:** an actual completed payment (live mode = real money). See `TASKS.md` NOW #1 for the options Shawn is deciding between.
**Pattern worth noting:** this is the *third* instance this session of "the value actually deployed in Vercel doesn't match what the account/service actually has" (Resend domain unverified, Resend API key stale, Stripe API key stale). Worth a full audit of every "sensitive" env var in this project rather than assuming the rest are correct just because nobody's reported a problem yet.

---

## SECURITY RULES (LOCKED)

- `bl_pricing.json` is PRIVATE — contains Monica's home address. Never show on client-facing docs or public routes. Never add to any prompt or export that a client could see.
- Never hardcode Monica's business info anywhere in components — always read from `SITE_CONFIG` / `src/lib/config.ts`.
- Never push API keys to the repo — Vercel env vars only.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` client-side — server routes only, via `serverClient()`.
- Studio is protected by middleware — the `studio_session` cookie must match `STUDIO_SESSION_TOKEN`.

---

## PLATFORM REBUILD — DECIDED (July 2026)

Full audit and team meeting: `PLATFORM_REBUILD_AUDIT.md`. Shawn sat in the meeting himself, added his own input (notably the iCloud calendar requirement below), and approved all 4.

**[2026-07-07] — Foundation and design work run in two parallel lanes, not strict sequence.**
Approved by: Shawn + Steve Jobs + Jony Ive + Craig Federighi + Angela Ahrendts
Why: Craig's real constraint is the unfinished Stripe estimate-checkout path — no new payment surface should be added on top of an unproven one. Jony's design work and Phil's SEO scaffolding don't touch the same files and don't need to wait. Lane A (blocking): finish Stripe checkout + resolve calendar/availability. Lane B (parallel): SEO foundation + early design work.

**[2026-07-07] — Calendar/availability: port Found's real-availability system AND build toward a two-way sync with Monica's personal iCloud calendar.**
Approved by: Shawn + Craig Federighi + Priya Nair + Angela Ahrendts + Marcus Webb
Why: Craig confirmed Found's `availability`/`availability_blocks`/`bookings` tables and slot algorithm are portable to single-tenant, and this is the engine that shows clients real open slots. But Shawn raised the real gap: Monica's actual weekend availability lives in her personal iPhone calendar, not in an admin panel she has to remember to update. Two directions matter: (1) her personal calendar's busy times should eventually auto-block Blue Luna availability, and (2) confirmed bookings should eventually push onto a calendar she already sees on her phone — otherwise "real availability" still depends on manual upkeep, which defeats the point.

**Technical note — iCloud, not Google:** Monica's calendar is iCloud, not a Google account. Google Calendar has a clean, well-documented OAuth API; iCloud does not — sync has to go through CalDAV (`caldav.icloud.com`), authenticated with an Apple ID **app-specific password** (generated once by Monica at appleid.apple.com, since Apple blocks normal password auth for third-party CalDAV access). This is more fragile than a Google integration would have been (no modern OAuth flow, more edge cases), but workable. **Build sequencing:** ship the internal availability/booking engine first (Phase 1, Lane A) as the source of truth for client-facing slots and booking records; design its schema now so a CalDAV sync layer can be added afterward without a rebuild (an `external_busy_blocks` style table or equivalent, populated by a periodic CalDAV read, plus a write-back path that creates an iCloud calendar event per confirmed booking). The CalDAV sync itself is a near-term follow-on, not a Phase 1 blocker.

**[2026-07-07] — Email/marketing system: build a real owner-editable template system, not a copy of Spa Mambo's current hardcoded-template reality.**
Approved by: Shawn + Marcus Webb + Priya Nair + Phil Schiller + Angela Ahrendts + Steve Jobs
Why: Spa Mambo's actual "template" system is hardcoded JS with no owner UI to create/save templates, and the one-guest templated-send button is currently disabled. Shawn's framing ("templates driving marketing and promos") implies Monica owns and edits her own templates.

**[2026-07-07] — SMS: build sending capability now, defer activation pending carrier registration.**
Approved by: Shawn + Phil Schiller + Craig Federighi + Chris Lattner + Steve Jobs
Why: Twilio integration itself is a small lift; the real constraint is A2P 10DLC carrier registration, which is outside the team's control and is Shawn's action item (business phone number + carrier registration).

---

## PAYMENTS/ESTIMATES REWORK (July 2026)

Full audit and team discussion: `ESTIMATES_PAYMENTS_AUDIT.md`. Shawn approved explicitly on 2026-07-09.

**[2026-07-09] — Replace fixed 50/50 deposit/balance booleans with a real payment ledger.**
Approved by: Shawn + Priya Nair + Craig Federighi + Angela Ahrendts
Why: live testing showed the current model can't represent real payment behavior (partial amounts, cash/Zelle payments that don't match the pre-set split). New model: an `estimate_payments` table logs every individual payment (amount, method, note, date); "amount owed" is always computed fresh as `total − discount − sum(payments)`. Both the client-facing page and the PDF read from the same computed value so they can never disagree.

**[2026-07-09] — Discounts: percent or flat dollar, with Monica's own free-text note.**
Approved by: Shawn + Steve Jobs
Why: real business need (birthday/friend discounts), and doubles as a safe way for Shawn to run a real live Stripe test by discounting a test estimate to $1.

**[2026-07-09] — Email-from-Studio is a real one-tap system send, not a `mailto:` link.**
Approved by: Shawn + Craig Federighi + Marcus Webb + Jony Ive + Angela Ahrendts
Why: `mailto:` cannot reliably attach a file or render branded HTML across email clients — a hard technical limitation, not a preference — and Shawn requires both a PDF attachment and a live link in the same email. Build: PDF attached + live link included, `reply-to: monica@bluelunaevents.com`, quiet "Sent to [email]" confirmation shown to Monica after sending.

**Build order locked:** payment ledger → discounts → email-from-Studio → Phase 5 Leads/Contacts (previously planned, unchanged).

---

## INQUIRY FORM REPLACES CONFIGURATOR (July 2026)

**[2026-07-27] — REVISES the 2026-05-01 decision above. `/get-a-quote` is now a no-pricing inquiry form, not the live-pricing configurator.**
Approved by: Shawn + Steve Jobs + Jony Ive
Why: Monica reports the opposite failure mode from the one the configurator was built to solve — clients see a number with no relationship or context yet and bounce, especially ones who don't yet understand the value behind the price. Steve's read: this isn't a contradiction of the May decision, it's the same root cause (sticker shock) from the other side — the fix is selling before pricing, not after. Team recommendation: separate **inquiry** (public, no price, feeds Monica a real quote she builds herself) from **quoting** (Monica, in Studio, using the estimate ledger already built in the July 9 payments rework). No new payment surface needed — Monica sends the client a `/q/[token]` link exactly like she already does for referrals.
- New component `src/components/ui/InquiryForm.tsx` — single-scroll (not paginated like the old Tally form), chip/button selection wherever the answer is a fixed set of options, free text only where it has to be (name/phone/email, vibe description). Modeled closely on Monica's real Tally form (`tally.so/r/nWBaVe`) and two real submissions she shared for reference, customized to the site's design system.
- `/get-a-quote` renders `InquiryForm`, all-white background (first step toward the site-wide light redesign Shawn wants next), no pricing copy anywhere on the page.
- `PackageConfigurator.tsx`, `pricing.ts`, and `/api/stripe/checkout` are **left in place, unused** — not deleted. They represent real, previously-live-tested Stripe work and the July 8 frontend-redesign decision (below) to eventually invest further in a configurator-with-real-photos. Revisit explicitly with Shawn before deleting.
- `leads` table gained 4 new nullable columns: `guest_count`, `setup_time`, `looking_for` (jsonb), `inspo_photos` (jsonb) — inspiration photos upload to the existing `media` storage bucket under `lead-inspo/`, via a new public route `/api/leads/upload` (mirrors the existing Studio upload pattern, no auth needed since this is a public form).
- Both lead emails (`sendMonicaNotification`/`sendClientConfirmation` in `actions.ts`) got inquiry-specific siblings (`sendMonicaInquiryNotification`/`sendClientInquiryConfirmation`) — no price/deposit language, client confirmation is signed "— Monica" per Shawn's explicit ask.
- **Still open, not yet decided:** whether the homepage `Packages` section (which shows package prices) also needs to change. Out of scope for this session — Shawn scoped today's work to the form specifically, with the full site-wide light redesign as an explicit "next step."

**[2026-07-27] — Fixed a real, pre-existing bug: lead submission was completely broken (RLS).**
Approved by: Shawn (implicitly — discovered while building the item above, not requested separately, but blocking)
Why this matters: `submitLead()` used the anon Supabase key and called `.insert([...]).select('id').single()`. The `leads` table has an RLS policy allowing anon INSERT, but no SELECT policy for anon/public — so the implicit read-back required by `.select()` failed RLS, and because `INSERT ... RETURNING` is atomic in Postgres, **the entire insert rolled back**. Confirmed via direct REST calls against the anon key (fails) vs `Prefer: return=minimal` (succeeds) vs the service-role key (succeeds). This means **every lead submission through the app — old configurator and new inquiry form alike — has likely been failing outright**, showing the customer a "Something went wrong" error rather than silently losing the lead. Fixed by switching `submitLead()` to the existing `serverClient()` helper (service-role key, already used by every Studio API route) instead of manually constructing an anon client — this is a `'use server'` function, never runs in the browser, so using the service-role key here is safe and matches the codebase's existing pattern. No RLS policy changes were made (kept `leads` SELECT locked down — granting public SELECT would leak every customer's contact info to any anon caller). **DEPLOYED 2026-07-28**, confirmed live in production.

**[2026-07-28] — Renamed `/get-a-quote` to `/event-questionnaire`, everywhere.**
Approved by: Shawn (real-device testing feedback)
Why: Every CTA pointing at the page ("Get a Quote," "Reserve Your Date") implied pricing or instant booking, and neither happens on this page anymore since the July 27 inquiry-form change — customers shouldn't think they're about to receive a number. Renamed the route itself (not just the label) with a permanent redirect from the old path so existing links/bookmarks/search results keep working. Updated every internal link (Nav, Hero, CTA, urgency banner, quinceañera/graduation pages).

---

## FRONTEND REDESIGN DIRECTION (July 2026)

Full audit, research, and team discussion: `FRONTEND_REDESIGN_AUDIT.md`. Shawn read it, gave his own brief, the team responded with researched reasoning (not just opinion), and Shawn approved explicitly on 2026-07-08.

**[2026-07-08] — SEO/AEO/GEO fixes ship first, ahead of the visual redesign.**
Approved by: Shawn + Phil Schiller + Steve Jobs
Why: Shawn's own framing — "SEO, AEO, and GEO... that's number one." The 5 fixes identified in the audit (invalid schema.org `@type`, fake `aggregateRating` review count, client-component pages structurally blocking their own metadata, missing FAQPage schema, missing sitemap/robots.txt) are independent of the visual redesign, fast to ship, and don't require design work to be done first. Traffic is the growth lever; a great funnel with no traffic is invisible.

**[2026-07-08] — The configurator becomes the core redesign focus: show real photos matching each choice, not just a running price total.**
Approved by: Shawn + Jony Ive + Craig Federighi + Marcus Webb
Why: Researched conversion psychology confirms configurators lift conversion by showing the customer something real as they build (Apple's own configurators work this way). No competitor in the Tucson market does this — most are static galleries with a contact form. Requires gallery photos to be tagged by component/color (garland tier, backdrop type, palette), not just `event_type` as they are today — this is scoped data work, not a rebuild, and it also improves the public gallery and social exports as a side effect (see Craig/Marcus notes in the audit).

**[2026-07-08] — Deposit/cancellation policy must be visible next to the payment CTA, not discoverable only after payment.**
Approved by: Shawn + Angela Ahrendts
Why: `PRICING_RULES.depositNonRefundableAfter` (7 days) already exists in `src/lib/config.ts` but is never shown to the client. Hiding a real policy doesn't reduce perceived risk — it just moves the moment of discovery to after money has already changed hands, which damages trust rather than protecting it.

**[2026-07-29] — Packages section drops all pricing, sitewide. FINAL, approved by Shawn.**
Approved by: Shawn (relaying Monica's explicit ask)
Why: Monica wants her business to feel consultive, not transactional — Packages' real job is to get a prospective client thinking about building up from a basic setup toward something bigger, so by the time Monica personally reaches out with a manual quote, they're already primed to spend more. A visible price short-circuits that; closes the "should Packages also lose pricing" question left open since the July 27 inquiry-form change.
- Execution (Jony Ive, design lead, delegated by Shawn): keep every existing tier's name, tagline, and feature list in `PACKAGE_CATALOG` exactly as-is (Essential → Signature → Luxury, etc. — already a real ladder, nothing to invent). Strip `price`/`priceNote` from the display only. Visual size/richness of each tier's card escalates moving up the ladder so "more" reads through presentation, not a number.
- Future, NOT now: a separate budget-friendly "Grab & Go" self-serve page for price-sensitive clients — added to `TASKS.md` BACKLOG. Mirrors the dual self-serve/consultative model `FRONTEND_REDESIGN_AUDIT.md` found Air With Flair Decor already running successfully in this exact industry.

**[2026-07-29] — Twilight accent (blush/lavender/gold) is scoped to Hero + Gallery only. Teal remains the sole sitewide primary accent. LOCKED — see `DESIGN_DECISIONS.md`.**
Approved by: Shawn + Jony Ive
Why: Teal isn't an arbitrary brand pick — it's Monica's actual favorite color (Tiffany Blue), which is why the logo itself is that color. Retiring it sitewide would mean walking away from something personally hers. What Shawn actually responded well to in the `redesign/gallery-twilight` preview was the white/bright layout shift, not the specific new palette spreading everywhere. Corrects the imprecise claim in the original commit message that Twilight was "pulled directly from the crescent-moon logo mark" — the real logo files contain no blush, lavender, or gold; Twilight is a mood/atmosphere accent (dusk, moonlight), not a literal palette extraction, and only belongs in the two sections built so far (Hero, GalleryPreview). WhyMonica, Packages, Reviews, CTA, Nav, Footer, and every other page keep teal.

**[2026-07-29] — SHIPPED. Homepage redesign v1 merged to `main`, live in production.** WhyMonica converted to white (matching Packages/Reviews) per the scope above; CTA kept dark intentionally as the one closing contrast band. Shawn's read after seeing it live: real improvement, but still a reskin of the existing layout/structure, not a rebuild — Nav, Footer, section order, and every other page are untouched.

**[2026-07-29] — REVISED same day. Full redesign, not incremental patches — see `DESIGN_DECISIONS.md` "ORBITAL / CIRCULAR DESIGN LANGUAGE."**
Approved by: Shawn
Why: After Nav/Footer/Gallery/Quince/Grad were also converted to light theme (still section-by-section patching), Shawn stopped the process directly: the incremental approach itself was the problem, and doing another "audit" mid-way through an already-partially-changed site would compound the mess, not fix it. Direct instruction: one full redesign pass, existing content kept, genuinely "modern, fresh, out of the ordinary" — not another templated luxury-brand look. Also: there is no written record of whatever design conversation actually produced the original White/Twilight direction on 2026-07-28 — it happened in a session lost to the crash, only the resulting code survived. Lesson logged so this doesn't repeat: **hold real design/product discussions inside this repo's docs (or paste the outcome in immediately after), not only in chat, since chat history does not survive a crash the way committed files do.**
- Result: the circular/orbital design language, built same session, shipped to production. See `DESIGN_DECISIONS.md` for the full spec.
- Real bug found and fixed during the rebuild: homepage `GalleryPreview` was fetching ALL of Monica's uploads unfiltered (including non-decor candid photos) instead of her curated `show_on_website` set — same bug class as the March/July email and key issues, a silently-wrong default nobody had visually audited. Fixed.
- Real bug found and fixed: circular hero images using Next.js `Image fill` without `priority` failed to load at all (not a timing delay — confirmed via devtools the image request never fired) since these are above-the-fold. Fixed sitewide.

**[2026-07-29] — Homepage photo grid replaced with a real video showcase. `/gallery` remains the deep-browse page. SHIPPED.**
Approved by: Shawn + Jony Ive
Why: Shawn's own observation — the homepage `GalleryPreview` and `/gallery` were the same masonry grid at different sizes, pure redundancy. Team direction: the homepage's job is trust-fast/proof, not browsing, so it shouldn't look like a smaller `/gallery`. Shawn's brief: "make it feel like magic," tying directly to the `@BlueLunaMagic` Instagram handle — video was the answer since Monica has no before/after photo pairs, only final-result photos and videos (23 real videos already in Studio). Built as a bento-style layout of real event videos, autoplay muted loop, subtle shimmer sweep on hover.

**[2026-07-29] — All 48 existing Studio uploads set `show_on_website=true`. Executive decision, not a default policy going forward.**
Approved by: Shawn
Why: Studio just launched; Monica hasn't started real content curation and only uploaded things she already liked, so there wasn't a meaningful curation signal to filter on yet. This unblocks today's content work but is not a standing rule — once Monica is actively using Studio's heart toggle, that becomes the real curation signal again, same as designed.

**[2026-07-29] — Instagram/Facebook integration must route through Studio's existing hearts/stars system, not a disconnected live feed pull. Scoped as a separate future project, NOT built today.**
Approved by: Shawn
Why: Studio's star toggle already drives `social_export` — the system built specifically so Monica controls what's curated from within Studio. A live-pulled Instagram feed would bypass that and become a second, competing source of truth. A real live feed (pulling FROM Instagram) is also a nontrivial technical project — Meta Graph API access to Monica's Instagram Business account, developer setup, possible app review — not a same-session build. Real reels/videos already exist on Instagram/Facebook; getting the good ones into Studio (so they feed the new video showcase and the existing Social Export tool) is the near-term path, not a live API integration.

**[2026-07-29] — OPEN QUESTION, not decided: is "200+ Events Styled" a real number?**
Flagged by: Priya Nair, during the content-strategy meeting
Why it matters: nobody has verified this stat against anything real. Studio's own record count is NOT a valid substitute — Studio only just launched and doesn't reflect Monica's real business history since 2018. Needs Shawn or Monica to confirm the real figure directly; do not touch this number without their input, and do not infer it from Studio data.

**[2026-07-29] — Hero video swapped to the quinceañera balloon garland arch, and a real technical capability established: raw `.mov` uploads can be converted to web-ready `.mp4` in-session.**
Approved by: Shawn + Jony Ive
Why: Same root problem already documented for the video-thumbnail system — iPhone `.mov` files store playback metadata (moov atom) at the end of the file, which blocks browser autoplay entirely (confirmed via devtools: `readyState` never left 0 on the raw `.mov`). Rather than being limited to only the handful of videos Monica happened to export as `.mp4`, `ffmpeg-static` (npm package, no system/winget install needed — that path is blocked by an interactive Microsoft Store agreement prompt in this environment) can re-encode any `.mov` to a faststart `.mp4` in-session, then re-upload via the Supabase Storage API. **Note for future sessions:** the `SUPABASE_SERVICE_ROLE_KEY` stored in Vercel env is in a wrapped format that does NOT work directly against the Storage API (`Invalid Compact JWS`) — the real raw JWT must be pulled via the Supabase Management API (`GET /v1/projects/{ref}/api-keys`) instead.
- Technical verification: ffmpeg's own encode log confirmed "moving the moov atom to the beginning of the file"; the re-uploaded file is publicly reachable with a clean `200 OK` and range-request support (`Accept-Ranges: bytes`).
- **CONFIRMED on Shawn's real device, same day** — he saw the fallback photo (blue/white balloons) briefly, then the quinceañera video crossfaded in and looped correctly. That's the intended sequence (photo is the safety fallback until the video is confirmed playing, then it stays on video). Fully closed.

**[2026-07-29] — Fixed a real, visible glitch: the fallback photo shown before the hero video loads was a different, unrelated photo. SHIPPED.**
Approved by: Shawn + Jony Ive
Why: Shawn caught it directly — for a split second on every refresh, an unrelated photo (blue/white balloons, a different room) flashed before the quinceañera video crossfaded in, reading as broken rather than intentional. Root cause: the fallback `<Image>` used a generic `/images/hero-main.jpg` with no relationship to whichever video happens to be playing. Fixed by using Studio's real auto-captured thumbnail of the actual hero video as both the base `<Image>` and the `<video poster>` — same frame either way, so the transition reads as the photo coming alive, not being replaced. Also added `preload="auto"` to shrink the gap before playback starts. Pattern to follow for any future hero video swap: the poster/fallback image must always be a real frame from that same video, never a generic photo.
