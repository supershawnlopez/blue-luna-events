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

**[2026-08-31] — Public proposal pages track recipient engagement (opens, time on page, clicks), shown in Studio, with a phone alert on open.**
Approved by: Shawn (live) + Marcus Webb + Priya Nair + Angela Ahrendts
Why: Shawn sends a proposal link (e.g. Westin La Paloma to a single contact) and needs to know if it was opened, how engaged the reader is, and what they looked at — the same visibility estimates already have. Design: a `proposal_events` table logs anonymous per-session activity; a client tracker fires `view` + 15s `heartbeat`s carrying accumulated *tab-visible* seconds + scroll marks; existing controls (package select, adjust panel, print, terms, submit) log click events. Internal Studio previews are excluded both client-side (`?preview=studio` / `/studio` referrer) and server-side (`/studio` referer) so the data stays honest. Monica gets a PWA push on first open of a session and on submit. Studio → Proposals shows a per-visit timeline. The link stays a single shared URL for now (not per-recipient tokenized) — acceptable because in practice one link goes to one contact; revisit if proposals start going to multiple recipients at once.

**[2026-08-30] — Client estimate page: accepting the estimate does NOT lock the date. The deposit does. Copy must reflect that.**
Approved by: Shawn + Angela Ahrendts + Steve Jobs + Jony Ive + Priya Nair
Why: Monica flagged that the `/q/[token]` page told clients "accept your estimate to lock in your date." Accepting only means the client agrees to the quote; the 50% deposit is what actually secures the event date. Attaching the date-lock promise to acceptance sets a false expectation at the decision moment and could be disputed later. Approved wording (Option A) — pre-accept: "Review your selections below. Accept your estimate when everything looks right — then a deposit locks in your event date." Post-accept banner: "Estimate accepted 🎉 One last step — your deposit locks in your event date." The mental model to protect everywhere: review → accept (I agree) → deposit (my date is mine). Never let the accept step imply the deposit step's outcome.

**[2026-08-28] — Resort/corporate proposals are digital proposal pages first; estimates/payment links come after Monica confirms final details.**
Approved by: Shawn + Steve Jobs + Jony Ive + Angela Ahrendts + Craig Federighi + Priya Nair
Why: Westin La Paloma needs a luxury presentation path, not a normal estimate-first workflow. The client should be able to review a polished private proposal page, download a PDF for internal sharing, and request a package. That request becomes a Studio lead; Monica then confirms final placement, timing, venue access, taxes/fees if needed, and sends the official estimate/payment link. Proposals stay separate from payment records so the estimate remains the legal/money source of truth.

**[2026-08-28] — Proposal package selections become their own Studio record before estimate/payment.**
Approved by: Shawn + Steve Jobs + Angela Ahrendts + Marcus Webb + Priya Nair
Why: Shawn clarified the Westin buyer is already in a proposal state, not a public lead-form state. The client should choose a package direction without re-entering name/email/phone, then Monica should see that selection in Studio and convert it into the official estimate when ready. The approved workflow is: proposal page → package direction saved in `proposal_selections` → Monica reviews in Studio → existing estimate builder opens prefilled from the selection → Monica sends official estimate/payment link → receipt/payment notifications happen only after payment. This prevents email-only loss, avoids treating every package tap as payment, and keeps estimates as the money source of truth.

**[2026-08-28] — Balloon decor disclosures are layered: short notes on proposals, full terms page, required acceptance before estimate/payment actions.**
Approved by: Shawn + Monica + Steve Jobs + Jony Ive + Angela Ahrendts + Priya Nair
Why: Balloon decor is temporary and affected by heat, wind, sun, rain, humidity, venue conditions, guest interaction, children, pets, and latex/rental-equipment safety. The proposal should stay polished with short notes, while the official estimate/payment flow must require clear acceptance of the full terms before money actions.

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

---

## BUSINESS-WIDE AUDIT (2026-07-30)

Shawn asked for two things at once: a cleanup pass on the site itself, and a real audit of Blue Luna Events' actual footprint across the internet — not just the site. Real web research was done (not assumptions), findings below.

**Site technical findings:**
1. **4 dead pages indexed in Google, all 404**: `/services`, `/about`, `/contact`, `/event-form` — leftover from an older version of the site. A real visitor clicking through from a Google search result hits a broken page. Needs a decision per page: redirect to the closest live equivalent, or rebuild with real content. Not yet fixed.
2. **Stale pricing still in page metadata** (not visible on-page, but shown in Google search results/social previews) on quinceañera (`$450`) and graduation (`$299`) pages — flagged 2026-07-29 as out of scope at the time, still unresolved.
3. Studio still doesn't match the new light/orbital design — expected, not a bug (always scoped as later Phase 2 work).

**Business footprint findings (real web research 2026-07-30):**
1. **No Google Business Profile could be found anywhere**, across multiple search attempts. Shawn confirmed: none exists yet, he's setting one up today (2026-07-30). This matters more than anything on the site — local searches ("balloon decorator near me") are won on Google Maps/GBP before a visitor ever reaches the website.
2. **A real Yelp listing exists** (`yelp.com/biz/blue-luna-events-tucson`) — Yelp blocks automated access so rating/review count/claimed-status couldn't be verified directly. Shawn: Monica may have started this by accident: **needs her to check and confirm/claim it.**
3. **Two Instagram accounts exist**: `@bluelunamagic` (the real, active one used everywhere on the site) and `@bluelunaevents` (4 followers, no content, dormant) — not a real brand-confusion risk, just noise, low priority.
4. Competitor landscape unchanged from the July 8 audit (Balloons by DRE, Sonoran Balloon Creations, Balloon Decor Service Tucson, etc.) — still active in search results.

**[2026-07-30] — "5.0 on Google" / "Google Rating" claims removed sitewide. CONFIRMED FAKE by Shawn.**
Approved by: Shawn
Why: Directly asked during the business audit above — Shawn confirmed there is no real Google Business Profile yet (being created today), so the "5.0 on Google" claim shown in three places (homepage hero stats, WhyMonica stats, Reviews section header) was fabricated. The July 8 fix only removed the machine-readable `aggregateRating` from JSON-LD at the time; this human-visible copy was never corrected in that pass. All three removed. Re-add only once the real GBP exists with genuine reviews to cite.
- **[2026-07-30, later same day] — Shawn confirmed directly: the testimonial quotes/names ARE fabricated.** Removed the homepage Reviews section (`Reviews.tsx` no longer imported in `page.tsx`, component left in place unused) and the matching fake pull-quote in `WhyMonica.tsx` ("Gabriela Morales, Tucson AZ"). Shawn is setting up a real Google Business Profile the same day — bring the Reviews section back once real reviews exist to populate it with, rather than rebuilding it with more placeholder content.

**[2026-07-30] — SHIPPED: SEO/AEO/GEO technical audit fixes, team-approved.**
Approved by: Shawn ("approved follow team explicitly")
1. `/gallery` had zero unique SEO — it's a `'use client'` component, which structurally blocks Next.js metadata exports. Same exact bug class the July 8 audit found and fixed on the quinceañera/graduation pages; this page was missed at the time. Split into a real server `page.tsx` (title/description/OG/canonical) + `GalleryPageView.tsx` client component, following the same server/client split pattern already established in this repo at `/gallery/[slug]`.
2. Every real photo across the gallery had `alt=""`. Added real descriptive alt text sourced from each item's actual `event_type` — real work is now findable via Google Image Search and accessible to screen readers.
3. The link-preview image (social shares, Google search results) was still the pre-redesign `hero-main.jpg`. Swapped to a current, representative photo (`gal-2.jpg`).
4. Added 301 redirects for 4 pages Google has indexed from an older version of the site that currently return real 404s: `/services` → `/#packages`, `/about` → `/#about`, `/contact` → `/#contact`, `/event-form` → `/event-questionnaire`.
5. Removed stale `$450`/`$299` pricing still sitting in the quinceañera/graduation page metadata (not visible on-page, but shown in Google search results and social previews) — missed when pricing was removed from the visible page content on 2026-07-29.
- **[2026-08-01] — RESOLVED, SHIPPED.** Was: no dedicated pages existed for weddings, birthdays, baby showers, or corporate events, despite all four being named in the footer and the site's own SEO keyword targets.

**[2026-08-01] — SHIPPED: weddings/birthdays/baby-showers/corporate-events landing pages, full depth.**
Approved by: Shawn (asked the team to decide depth, driven by SEO/AEO/GEO)
Why: Phil (Marketing/SEO) led — thin pages were the actual problem being fixed (these four routed to a homepage anchor, which reads as duplicate/no content to search engines); AEO and GEO both reward depth and extractable specifics (FAQPage schema, concrete service descriptions), so going lighter would have undercut the fix. Craig noted the general Essential/Signature/Luxury tiers already apply to all four event types (`eventTypes: 'all'` in `PACKAGE_CATALOG`), so no new pricing tiers were needed — same low lift as expected. Built to the exact same structure as `/quinceaneras`/`/graduations`: hero, features, packages, FAQ with schema, CTA. FAQ pricing answers follow the locked no-bare-number, consultive pattern ("depends on your vision, tell us and get a personal quote"). Shawn chose "build first, review after" for copy rather than pre-approving angles.
- Uses the same static 7-photo local pool (`/public/images`) as the existing two pages, not real Supabase photos tagged by event type — same tolerance already live on `/graduations` (whose hero photo visibly reads "Happy Birthday Georgia"), not a new issue. Real fix needs Monica's photos tagged by event type — not scoped yet.

---

## CUSTOM BACKEND / STUDIO INTELLIGENCE SYSTEM (2026-08-02)

Shawn asked the team to resume the backend rebuild scoped in `PLATFORM_REBUILD_AUDIT.md` (Phases 3-6, never started), then raised the bar with his own brief before any building started. Full team meeting held per `brief.md` Step 4 — Shawn participated directly across three rounds, not a rubber-stamp.

**[2026-08-02] — Studio's north star: a system that "thinks for her," not a data-entry tool. Steve + Jony are the required approval gate on anything shipped.**
Approved by: Shawn
Why, in Shawn's own words: it has to make both Monica and Shawn say "wow," it has to not just be functional but think for her since she's not technical, and it has to be Apple/iOS-level easy. Concretely (Angela's translation, confirmed by Shawn): the Studio home screen should surface what needs Monica's attention *today* (untouched leads, upcoming payment/event dates, photos ready to post) rather than showing her tables/filters she has to interpret herself. This reframes the build order from "ship the Phase 3-6 feature list in order" to "design the home surface first, build features as what it pulls from" — see Jony's note below.
- Steve is included at a high level on major decisions; Jony has Shawn's trust to execute without a separate design-mockup ceremony step first.

**[2026-08-02] — Rules-based smart surfacing now. AI-generated suggestions explicitly deferred, not in scope yet.**
Approved by: Shawn
Why: Shawn was direct — "think for her" does not mean AI yet, that's an explicit future layer. For now: simple rule-based logic (e.g., lead untouched 48hrs → flag it; event in N days with balance owed → remind; starred photos with no recent social activity → nudge). Do not reach for an LLM-backed suggestion feature under this decision — that requires a fresh conversation with Shawn first.

**[2026-08-02] — Analytics: Vercel Analytics (primary, traffic + referrer/source breakdown) + Google Search Console (complementary, real search-query-level insight for SEO/AEO).**
Approved by: Shawn (delegated the tool choice to the team: "whatever they decide is fine... or if they wanna use all of them to grab different pieces of information")
Why (Craig/Priya/Phil): Vercel Analytics is already on the hosting platform Blue Luna runs on — zero new vendor, no cookie-consent banner needed, gives page views + referrer/channel breakdown (Instagram vs. Google vs. direct) which directly answers Monica's "where do my visitors come from" question. Google Search Console is free and adds a different, valuable signal Vercel Analytics can't: the actual search queries bringing people to the site, which matters directly for the SEO/AEO work already underway. Both are zero-cost, consistent with this project's "zero-cost infrastructure" principle (`project.md`). Not mutually exclusive — using both to cover different questions, not picking one.

**[2026-08-02] — Phase 4 (Calendar/Booking): date-granularity availability, not Found's hourly-slot engine — built directly off `estimates`, not a parallel booking table.**
Approved by: Craig Federighi (architecture call, consistent with the 2026-07-07 "one authoritative source of truth per feature" rule from `brief.md` Step 8)
Why: Found's `availability`/`bookings` schema is built for appointment-style businesses (haircuts, consultations — many short slots per day). Blue Luna does one event per day — Monica sets up, runs, and tears down a single job. Porting Found's hourly slot-generation algorithm as-is would have modeled a business Blue Luna isn't. Instead: a date is "unavailable" if it has a real `estimates.event_date` (any status except `declined`/`cancelled`) or falls inside a manually-created `availability_blocks` range. No parallel `bookings` table — an accepted estimate already *is* the booking record; duplicating that into a second table would fragment the source of truth the moment the two ever disagreed. `external_busy_blocks` table also created now (empty, unused) per the 2026-07-07 iCloud CalDAV sequencing note, so that future sync work won't need a schema migration.

**[2026-08-03] — FOUND AND FIXED: a real production bug where Studio's dashboard, stats, traffic analytics, the public gallery feed, and the client estimate page could silently serve stale cached data instead of live data.**
Approved by: Craig Federighi (found during Phase 4 testing, fixed same session)
Why this happened: Next.js 14's App Router caches `fetch()` calls by default. `export const dynamic = 'force-dynamic'` on a route is supposed to disable that, but in practice did not reliably bust caching for `fetch()` calls made *inside* the Supabase client library — confirmed directly: a query for a real database row returned an empty result long after the row existed, while a raw `curl` against the same Supabase REST endpoint was always correct. `/api/studio/today`, `/api/studio/analytics`, `/api/studio/stats`, and the new `/api/availability` were all confirmed statically pre-rendered at build time (visible in `npm run build`'s route table as `○ Static` instead of `ƒ Dynamic`) despite querying live data — meaning Monica's "Today" surface, traffic numbers, and dashboard stats could have been frozen at whatever they were the moment of the last deploy, not live, since the day they shipped.
**Fix:** `serverClient()` in `src/lib/supabase.ts` now passes a custom `fetch` override forcing `cache: 'no-store'` on every request it makes — fixing the root cause at the client level instead of hoping route-level config catches every case. Also consolidated 9 files that were each independently calling `createClient()` inline (a real "one authoritative source of truth" violation — each one a separate place this same bug could hide) to import the shared `serverClient()` instead: `/q/[token]` (the client-facing estimate page — this one mattered most, since it could have shown a client an outdated payment status), `/api/leads/sign`, `/api/cron/weekly-summary`, `/api/stripe/webhook`, `/api/studio/estimates`, and all four `/api/studio/media/*` routes (including the one that also serves the public gallery via `?website=true`). Verified the fix directly: added a real availability block, confirmed the public endpoint reflected it immediately and consistently across repeated calls (previously it did not, reproducibly, in a clean environment with zero other explanation).

---

## PHASE 5 — LEADS, CONTACTS, EMAIL, SMS (2026-08-03)

**[2026-08-03] — Leads: added `temperature` with no default (nullable), reused the existing `leads` table rather than a new "prospects" model.**
Approved by: Craig Federighi / Marcus Webb (architecture), consistent with Angela's original ask that Leads/Contacts "feel like texting a friend, not a database screen"
Why: The raw `leads` table already existed with a real `status` enum (new/contacted/quoted/booked/completed) and was already the thing `/api/studio/today` surfaces — building a second, parallel prospects table (closer to Found's model) would have fragmented the one real pipeline Monica already has into two. `temperature` (hot/warm/cold) has **no default** — Found's own history flagged silently defaulting to "Warm" as a real bug (a lead nobody's actually assessed reads as false-confident data); Monica must set it herself, same lesson applied here proactively. New Studio **Leads** tab (6th bottom-nav item): status/temperature filters, one-tap Call/Text/Email, and a "Create Estimate" handoff that pre-fills the existing estimate builder's already-supported `?name=&email=&phone=&event_date=&venue=` query params — no new prefill mechanism needed, that path already existed from lead-email deep links.

**[2026-08-03] — Contacts: a real client phone book, populated from booked estimates + manual entry — not every raw inquiry.**
Approved by: Marcus Webb / Priya Nair
Why: Most leads never become clients; treating every inquiry as a "contact" would make the phone book noise, not signal, and would poison the audience for email campaigns with people who never actually booked. A contact is either imported from real `estimates.client_name/email/phone` (deduped by email, then phone, against existing contacts) via a one-tap "Import from Estimates" button, or added manually by Monica. No new "which leads are worth keeping" judgment call was invented — the estimate itself is already the signal that a lead became real.

**[2026-08-03] — Email: real owner-editable templates (create/edit/duplicate/delete) + a campaign send tool, per the 2026-07-07 decision to build the genuine thing, not Spa Mambo's hardcoded-JS reality.**
Approved by: Marcus Webb / Phil Schiller
Why: this was locked back on 2026-07-07 specifically because Spa Mambo's "template" system turned out to be hardcoded JS with no owner UI — Shawn's framing ("templates driving marketing") requires Monica to actually own her templates. Built: `email_templates` table + Studio editor, `{{name}}` as the one supported placeholder (kept simple on purpose — a mail-merge language would be over-engineering for a single business owner), and a campaign-send tool reusing the same branded HTML email shell already used for estimate emails (dark header, teal CTA, `SITE_CONFIG` footer) so campaign emails look consistent with every other email Blue Luna already sends. **Real, working unsubscribe added** (`contacts.unsubscribed` + a per-contact `unsubscribe_token`, a public `/api/unsubscribe` endpoint) — not originally asked for by name, but a bulk marketing-send tool without one is a real deliverability and goodwill risk for Monica's actual business, not a hypothetical. Every campaign send is logged to `campaign_sends` (per-recipient, success/failure) so Monica has a real record of who got what.
- Physical mailing address was deliberately left out of the campaign email footer — `bl_pricing.json`'s note that Monica's only address on file is her private home address (never to be shown on client-facing documents) directly conflicts with CAN-SPAM's usual physical-address expectation. Used the same city-level `SITE_CONFIG.location` ("Tucson, AZ") the existing estimate email footer already uses — no new address decision was made, followed existing precedent.

**[2026-08-03] — SMS: real zero-config `sms:` deep-link quick actions shipped now (Leads + Contacts); the Twilio-backed bulk-send capability is written but genuinely untested and inactive.**
Approved by: Chris Lattner / Craig Federighi
Why: the 2026-07-07 decision explicitly separated "build sending capability" from "activation, pending Shawn's A2P 10DLC carrier registration" — no Twilio account or credentials exist for Blue Luna yet. `src/lib/sms.ts` is a real `sendSms()` function using the Twilio SDK, gated behind an explicit `smsConfigured()` check (`TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`/`TWILIO_PHONE_NUMBER`), so it fails clearly instead of pretending to work — but it has never been exercised against a real Twilio account, since none exists, and should not be treated as verified until it has been. What *is* real and working today, no setup required: `sms:` links next to Call/Email on both the Leads and Contacts detail sheets, opening Monica's own Messages app pre-addressed — same fallback pattern Found itself uses.

---

## PHASE 6 — SOCIAL / CAPTION ASSISTANCE (2026-08-03)

**[2026-08-03] — Caption suggestions are template-based per event type, not AI-generated.**
Approved by: Craig Federighi (consistency call — same standing rule as the 2026-08-02 Studio Intelligence decision)
Why: the same "no AI yet, that's an explicit future layer" rule locked for the Today surface applies here too, for the same reason — Shawn hasn't approved an AI-generation feature, and reaching for one silently under a different phase's banner would be exactly the kind of scope-creep that rule exists to prevent. `src/lib/captionSuggestions.ts` is a plain lookup table (one line + 3 hashtags per event type: quinceañera, graduation, birthday, baby shower, wedding, corporate, other) — simple, predictable, fully editable by Monica before use, not a black box.

**[2026-08-03] — Caption editing lives on the Exports page, not My Work — and `gallery_media.caption` + the PATCH allow-list for it already existed in the code before this session, unused.**
Why: `caption` was already in `/api/studio/media/[id]`'s PATCH allow-list and `exports/page.tsx` already had a `displayCaption()` helper reading `item.caption` — evidence a caption field was planned earlier but the actual DB column and editing UI were never finished. Completed it rather than re-designing: added the missing `gallery_media.caption` column, wired a real editor (pre-filled with the saved caption, or a template suggestion if none exists yet) directly onto each starred photo's card in Social Export — that's the exact moment Monica is about to post, so editing the caption where she already is beats sending her to a different screen first.

**[2026-08-03] — "Lightweight posting view" = Copy Caption next to the existing Save-image button, not real Instagram API posting.**
Approved by: Marcus Webb
Why: `PLATFORM_REBUILD_AUDIT.md` Phase 6 always scoped a real automated Instagram/Facebook feed as "its own future project" requiring Monica's Instagram Business account connected via the Meta Graph API — separate, bigger, and not part of this pass. What "lightweight posting view" concretely closes today: previously Monica downloaded a branded image with no caption text attached, then had to write a caption from scratch inside Instagram itself. Now she taps Copy Caption, opens Instagram, pastes — the full manual-post workflow is covered without needing any Meta API integration at all.

**[2026-08-03] — Lead-source attribution replaces the raw "N visits this week" card on Studio Home. Team meeting, Steve leading.**
Approved by: Shawn ("let's try it, if it doesn't work then we will do a change")
Why (Steve): judged against the standing filter — does it get Monica more bookings or save her time — a raw visit count does neither. "3 of 5 leads this month came from Instagram" is a real answer to a real question she'd ask herself; a number alone isn't.
Why (Angela): Monica isn't a marketer. A count needs interpreting; a plain sentence doesn't. Same bar already set for the Today surface — think for her, don't hand her a number.
Why (Priya, on the method): built by capturing `document.referrer` at the exact moment someone submits the inquiry form and storing it directly on that lead row — not by trying to stitch a separate traffic-tracking row to a lead after the fact (session/device matching gets unreliable fast and risks quietly showing Monica something untrue). Same visitor, same moment, no guessing.
Why (Craig, sequencing): this was the cheap, high-value option — the referrer-capture pattern already existed in `VisitTracker`. Google Search Console (the other half of the original analytics decision — what people actually search to find her) is real and still worth doing, but needs a Google Cloud service account against the verified domain — its own session, not bundled into this one.
What shipped: `leads.referrer_channel`/`referrer_raw` columns, a shared `src/lib/channel.ts` (single categorization function, now used by both traffic analytics and lead attribution so the two numbers can't quietly disagree), `/api/studio/lead-sources`, and Studio Home's "This Month" card now leads with the lead breakdown; the raw weekly visit count is still there but demoted to a small secondary line, not deleted.
**Real bug found and fixed during this build:** the "this month" boundary was computed off the server's own clock. This dev machine happens to be set to Arizona time, which masked it locally — but Vercel's production runtime is UTC, and confirmed directly (ran the same calculation both ways against real data) that in production a lead made late at night in Arizona would have been miscounted into the wrong month. Fixed by computing the boundary against a fixed UTC-7 offset regardless of server timezone, not the ambient one.

**[2026-08-03] — Social Export scratched, removed from Studio's UI. Heart (show_on_website) is the only curation flag Monica sees now.**
Approved by: Shawn, directly — real screenshots of the branded export first exposed the corrupted-logo bug (fixed separately, see above), then Shawn made the call himself once the fix was live: "looks horrible, let's scratch it for now and leave heart only for sites."
Why: closes the open question from the earlier team meeting — is manual download-and-caption-copy worth continuing to build on, given real Instagram auto-posting stays a separate future project regardless. Shawn's answer: not right now.
What changed: the Star toggle (grid cards, lightbox, filter pill), the "N starred" header button, and the "Export for Social" Home quick-action are all removed from Studio. The Today surface no longer surfaces a "photos ready to post" nudge.
What did NOT change: `gallery_media.social_export` and `.caption` columns, `/studio/exports`, `src/lib/captionSuggestions.ts`, and the fixed canvas-drawn logo all stay in the codebase, just unlinked — same treatment as the removed-but-not-deleted homepage Reviews section from 2026-07-30. Nothing is lost if this gets picked back up once real auto-posting is on the table.

---

## FULL TRAFFIC REPORT (2026-08-10)

Shawn asked whether tapping the "This Month" card could open a more detailed report — Monica needs to see where traffic actually comes from. Team meeting held per `brief.md` Step 4 (Phil leading, Marketing/Growth). Shawn's own framing, after hearing the team's first pass: **"the goal is not fluffy numbers. the goal is to increase business. we need data to know where to spend our focus for ads, promos, posts etc."**

**[2026-08-10] — Leads by Channel is the primary, decision-driving metric. Site Visits by Channel is secondary context only, shown with an explicit reliability caveat.**
Approved by: Shawn (direct framing above)
Why (Priya, real finding made while scoping this): `leads.referral_source`/`referrer_channel` is a self-reported or submission-moment-captured signal — reliable. `site_visits.referrer` is read from `document.referrer` in the visitor's browser, and Instagram/Facebook's in-app browsers routinely strip or blank that value — meaning real Instagram/Facebook visits already quietly undercount into "Direct" on the visits side, while the matching lead still correctly says "Instagram" (the client typed it themselves). Computing a "conversion rate" (leads ÷ visits) per channel from these two would combine a trustworthy numerator with a denominator known to be skewed worst on exactly the channels Monica most wants to evaluate — presented as a precise-looking percentage, that's the "fluffy number" Shawn was rejecting, not a fix for it. Deliberately did not ship a per-channel conversion-rate metric for this reason. Leads by Channel (ranked, with an up/down indicator vs. the immediately-preceding equal-length period) is the number the report leads with; visits are shown underneath, muted, with the caveat spelled out in-app.
Why (Craig, on visit-counting accuracy): also found and fixed a smaller real bug while scoping this — `site_visits` channel/visit counts were being computed per pageview, so one visitor browsing 5 pages after landing from Instagram counted as 1 Instagram + 4 "Direct" (every page after the first has the site's own domain as `document.referrer`). Fixed by adding a `session_id` (generated client-side, `sessionStorage`-scoped) to `site_visits`, capturing the entry referrer once per browser tab session and reusing it for every pageview in that session, and deduping visit/channel counts by session in `/api/studio/analytics-detail`. Rows from before this shipped have no `session_id` and are each counted as their own visit, same as the old behavior — a known, acceptable seam in historical data, not a bug going forward.
What shipped: `/studio/analytics` — a dedicated Traffic Report screen (This Month / Last 3 Months / All Time toggle), reached only by tapping the "This Month" card on Studio Home, not a 7th bottom-nav tab (Marcus — same pattern as Contacts opening from Leads). Leads by Channel table (ranked, trend arrow vs. previous period), a "What They're Looking At" top-pages list (which content is pulling people in — feeds directly into what to post/promote more of), Site Visits by Channel underneath with the reliability caveat. Google Search Console search-query data (what people actually type to find her) remains the one still-outstanding, higher-value addition — unchanged from the 2026-08-03 decision, still needs its own session.

**[2026-08-26] — Traffic Report is a marketing decision report, not an operations traffic report.**
Approved by: Shawn, following team recommendation (Steve/Phil/Priya/Craig/Angela)
Why: Shawn looked at the live report and correctly questioned the value of "Client Estimate / Payment Pages" in a marketing context. Private estimate/payment page views are operational proof that a client opened a link, not useful evidence for deciding what marketing, public pages, posts, or ads are working. Steve's call: the report exists to help Monica get more qualified leads, so it should lead with source and public-page behavior that can change marketing action.
Locked behavior:
- `/q/*` private client estimate/payment pages are excluded from the marketing page list.
- Leads by Channel remains the primary decision metric.
- Site Visits by Channel stays secondary and explicitly caveated.
- Direct/Unknown is labeled **Unknown / Direct / DMs** because it can include typed links, saved links, text messages, Instagram/Facebook DMs, privacy-blocked visits, and in-app browsers that hide referrers.
- Attribution order: customer's self-reported source first, UTM source second, browser referrer third.
- Instagram/Facebook should be tracked with first-party UTM links wherever Monica/Shawn control the link, because browser referrer alone is not reliable enough for those platforms.
- The report should surface public marketing pages viewed, pages that led to inquiries, and top lead paths such as `Instagram -> Gallery -> Event Questionnaire -> Lead`.

---

## ESTIMATE DRAFTS: AUTOSAVE, DUPLICATE, DELETE/TRASH (2026-08-16)

Monica lost an in-progress estimate by navigating away before the final "Save Draft" step. Fixed same-day, then Shawn asked to bring the cross-device question to the team before going further (per `brief.md` Step 4).

**[2026-08-16] — In-progress estimates autosave to a real server-side draft (not just local storage) once name+email are filled, so they're visible in the Estimates list and reachable from any device.**
Approved by: Shawn, after a team pass (Marcus/Priya/Jony/Angela — Marcus's recommendation to make it a real `status: 'draft'` row rather than local-only, Jony's call to skip a native browser exit-confirm popup in favor of a quiet in-page "Saving…/Saved" indicator).
Why: local-only autosave (`localStorage`) only protects against navigating within the same browser — it doesn't survive Monica opening Studio on a different phone. A real draft row, created once there's enough info to save one (name + email — same gate the wizard already uses), solves both: visible in the Estimates list as "In Progress," and a `?draft=<id>` link works from any logged-in device.
What shipped: debounced server autosave in `src/app/studio/estimates/new/page.tsx`, an "In Progress" badge + "Tap to continue" row on the Estimates list routing back into the wizard, and a Trash-icon discard. Local storage is kept only as a first-line safety net for the moment *before* there's enough info to save a real row.

**[2026-08-16] — Estimates can be duplicated ("Duplicate as a New Estimate") so Monica can offer a client a different item mix without losing the original.**
Approved by: Shawn (direct ask — "she may need to duplicate estimates so she can create different estimates for a client from the first one with less or more items").
What shipped: `POST /api/studio/estimates/[id]/duplicate` copies client info, event details, and every line item into a brand-new estimate with its own share link — resets status to draft, clears discount, resets deposit to default, starts with zero payments (it's a new offer, not an edit). Lands on the new copy with a dismissible banner confirming it's separate from the original, added after Shawn's real feedback that there was no way to tell which one you were looking at.

**[2026-08-16] — Delete is a soft-delete. A new "Trash" tab holds anything deleted, restorable with one tap. Anything with recorded payments can't be deleted or trashed at all.**
Approved by: Shawn (direct ask — delete needed everywhere, deleting one duplicate must never affect the other, and "we should probably have a trash folder in case she needs to undo a delete").
Why: a real client estimate isn't as disposable as an abandoned $0 in-progress draft — a permanent, no-recovery delete on real business records was too risky to ship without an undo path.
What shipped: `estimates.deleted_at` column (nullable timestamp, added via Supabase Management API). `DELETE /api/studio/estimates/[id]` now sets `deleted_at` instead of removing the row; `GET /api/studio/estimates` excludes trashed rows by default, `?trash=1` returns only trashed rows. Delete is available on every row of the Estimates list and on the estimate detail page, both gated behind an inline confirm (not a native browser dialog). A duplicate and its original are fully independent rows with no relationship between them, so a delete can never cascade from one to the other — confirmed directly against the schema, not just assumed. The existing payment guard (estimates with recorded `estimate_payments` can't be deleted) still applies to trashing, unchanged.
Also fixed same session, real feedback from Shawn testing: the Selection editor on an existing estimate (`src/app/studio/estimates/[id]/page.tsx`) required a separate "Save" tap after adding/removing a line item, which read as if items weren't actually being added — every change now persists to the server immediately, and the editor is just "Done." The new-estimate wizard's autosave status line was also invisible until a real server draft existed; now shows "Autosaves as you go" from the first keystroke.
