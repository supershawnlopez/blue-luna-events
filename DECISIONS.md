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
