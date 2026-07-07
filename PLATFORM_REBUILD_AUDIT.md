# PLATFORM_REBUILD_AUDIT.md — Blue Luna Events
### Full team audit + rebuild plan. Written July 7, 2026. Read this before starting any rebuild work.
### Locked once Shawn approves a direction — status tracked in `TASKS.md`.

---

## Why this exists

Shawn is not happy with the current site's design or function. The ask: a full redesign led by Jony, a rebuilt backend led by Craig, with the whole team weighing in — camera/photo system ported from Found (customized to Blue Luna), calendar booking ported from Found, a real Leads system, a real Contacts system, an email system modeled on Spa Mambo's (templates driving marketing/promos, but built for Blue Luna), a way to organize and brand social content from photos, and SEO/AEO/GEO "top notch" — because the ultimate goal, beyond looking and functioning amazing, is new clients for Monica.

This document is the audit (what's actually wrong or missing today, verified against the real codebase — not assumptions) plus the team's recommended plan. Nothing here is being built yet. Per `brief.md` Step 4, the team recommends, Shawn approves, then implementation starts.

---

## PART 1 — AUDIT: WHAT'S ACTUALLY THERE TODAY

Verified directly against `src/` on 2026-07-07, not against stale docs.

### Design
- Public site (homepage, `/quinceaneras`, `/graduations`, `/gallery`) has not had a real design pass since the original May 2026 build. `project.md` itself has flagged "Phase 2 design rebuild" as queued-but-never-started for over a month.
- Monica's Studio was built functionally (StudioNav, media grid, exports, estimates) but never given a considered visual pass the way the public site's Jony-approved design system was. It reads as utilitarian, not Apple-quality.
- Public site and Studio currently feel like two different products bolted together rather than one visual language.

### Camera & Photos
- The "Shoot" button on My Work is a native `<input type="file" capture="environment">` — this hands off to the phone's own camera app and back. It is **not** an in-app camera. There's no zoom, no torch, no aspect-ratio choice, no album-at-capture-time picker, none of what "bring in the camera system from Found" implies.
- Heart (website) / star (social) dual-flag curation exists and works — this part is solid and should stay.
- Video thumbnail auto-capture-on-lightbox-open is solved and locked (see `DECISIONS.md`) — do not touch.
- Social Export exists (3 canvas formats: 4:5, 1:1, 9:16) but is entirely manual: Monica stars a photo, opens Exports, generates, downloads, then posts it herself from her own phone. No caption help, no posting calendar, no automatic branded overlay beyond what's already coded into the canvas.

### Calendar / Booking
- Does not exist. The Google Calendar vs. manual-list decision flagged back in May was never made. The configurator still cannot show a client Monica's real availability before they submit a quote request.

### Leads
- There is no Leads system. The only thing resembling a "lead" is the raw Supabase `leads` row written directly by the public configurator (name, contact info, package/pricing snapshot). No temperature, no status, no filtering, no lead-to-contact promotion, no lead-to-estimate handoff prompt. Monica has no dashboard view of her leads at all today — they only exist as rows in a table and an email in her inbox.

### Contacts
- Does not exist in any form.

### Email / Marketing
- Only transactional email exists: the Stripe deposit confirmation flow and the two Resend emails (Monica notification + client confirmation) built in May. There is no way for Monica to send a promo, a seasonal campaign, or a "haven't seen you in a while" message to past clients.
- **Important correction to the original assumption:** Spa Mambo's actual template/marketing system is not the polished, owner-editable system it sounds like from the name. Verified in the codebase:
  - Templates are hardcoded in the admin JavaScript (`ALL_TEMPLATES` object) — there is no database table for templates and no UI for the owner to create or save a new one. The owner can freely edit the subject/body text per-send, but can't build a reusable named template without a developer editing code.
  - The one-guest "birthday / miss you / rebook" templated send button is **stubbed and disabled** ("Email sending coming soon") — it doesn't actually send.
  - SMS is unfinished — the Twilio package isn't even installed in `package.json`; the only real "text" action is a `sms:` deep link that opens the staff member's own Messages app.
  - The broadcast/blast tool (bulk email to all guests or a scope-filtered set) is the one part that's fully live end-to-end, including a send preview and per-recipient send log.
  - **Implication:** if we build Blue Luna's email system to literally match what Spa Mambo has today, Monica will not get a real template library — she'll get one hardcoded template list a developer edits and a free-text composer. If Shawn wants Monica to actually create/edit/save her own templates, that's a step beyond what Spa Mambo currently does, not a straight port.

### SEO / AEO / GEO
- There is currently **none** — no per-page metadata generation beyond Next.js defaults, no JSON-LD structured data (no LocalBusiness, Service, Event, or FAQ schema anywhere), no `sitemap.xml`, no `robots.txt`, no OG image strategy. Given the stated ultimate goal is new clients, this is the single highest-leverage gap on this entire list — a beautiful redesign with zero structured data or search/AI-answer optimization will not move the needle on discovery.

### Backend / Technical Debt
- `STUDIO_PASSWORD` env var is still unset (flagged since the June 21 session, never resolved).
- Stripe estimate checkout (deposit + balance payment from the client share link, `/q/[token]`) was never finished — Monica cannot actually collect money on an estimate today.
- Individual estimate detail view and PDF receipt generation were never built.
- The full Stripe deposit flow has never been tested end-to-end on the live configurator.
- Next.js is on 14.2; no decision has been made on upgrading.

---

## PART 2 — TEAM MEETING

### Steve Jobs — Product, final approval
Frame the entire rebuild around one sentence: *does this get Monica more booked events, or save her time getting there?* Cut anything that doesn't serve one of those two things. Of everything on Shawn's list, **branded social image generation** and **SEO/AEO/GEO** are the two highest-leverage items against the stated goal — new clients — and must not get quietly deprioritized behind a design refresh that only makes the site prettier for people who already found it.

### Jony Ive — Design
This needs a full visual rebuild, not a patch on top of the existing system. Recommend one unified design pass across the public site *and* Studio at the same time, so Monica's internal tool and Monica's public site finally share one visual language instead of reading as two different products. Blue Luna already sits in Found's "Portrait" layout family (photography-forward, work shown before words) — lean into that harder rather than drifting toward a generic template feel. Studio in particular needs the same level of care the public site's design system already has on paper (`DESIGN_DECISIONS.md`) — right now it's functional, not considered.

### Phil Schiller — Marketing, SEO/AEO/GEO
This is where "new clients" actually gets won or lost. Minimum bar: unique meta title/description per page, OG images, JSON-LD `LocalBusiness` schema plus `Service`/`Event` schema for quinceañera and graduation packages, an FAQ schema block per landing page (this is the actual mechanism that lets ChatGPT/Perplexity/Google AI Overviews lift a direct, quotable answer — that's what "AEO" means in practice), `sitemap.xml` + `robots.txt`, and a Core Web Vitals pass (image optimization is the likely biggest lever given the site is gallery-heavy). "GEO" isn't a separate system from AEO — it's the same structured, clearly-labeled, directly-quotable content, written so a generative answer engine can extract it cleanly. Also recommend Google Business Profile integration once the technical SEO foundation is in, matching what was already done for another client.

### Angela Ahrendts — Client experience
The journey from Instagram → site → booking → estimate → payment needs to feel continuous, not four separate tools. Top recommendation: get the calendar/booking system feeding real availability directly into the configurator, so a prospective client sees an actual open date before they submit a request — this closes a two-month-old open decision and removes a real point of friction. On Monica's side, Leads/Contacts/Email need to feel like texting a friend, the same standard Found holds itself to — not a database screen with fields to fill in.

### Craig Federighi — Engineering, architecture
Verified against the actual Found codebase: the camera component, the availability/blocks/bookings tables + slot-generation algorithm, and the leads/contacts data model are all clean, portable, and *not* industry-locked — they can be ported close to as-is. What has to be stripped out is Found's multi-tenant layer: the industry-vocabulary relabeling system, plan-gating (Pro vs. base), and the Stripe Connect/application-fee plumbing — none of that applies to a single-business app. Before adding new payment surfaces (booking deposits, campaign links), we need to finish and prove the estimate-checkout flow that's already half-built — an unfinished payment path is a foundation crack, not a place to build more on top of.

### Priya Nair — Backend, data
New tables needed, modeled on Found's proven schema but scoped to one company (no `company_id` multi-tenancy needed): `availability` / `availability_blocks` / `bookings` (direct port), an upgraded `leads` table (temperature, status, source — the current raw table needs real columns, not just configurator snapshot fields), `contacts`, `email_templates` (a real one, not Spa Mambo's hardcoded-JS-object version — see Marcus's note), and a `social_post_drafts`-equivalent for branded image generation. Since Blue Luna is single-tenant, RLS can be written as real per-owner policy rather than the service-role-bypass workaround Found uses out of multi-tenant necessity — this is a chance to do that piece *better* than Found does it, not just copy it.

### Marcus Webb — Studio tool & integration
I own wiring the heart/star photo system into the branded-image generator and building the actual campaign-send flow for Monica. Explicit recommendation: **do not** copy Spa Mambo's hardcoded-template-JS-object approach as-is. Shawn asked for something that lets templates "drive" marketing and promos — that implies Monica can create and edit her own templates from Studio. Spa Mambo doesn't actually do that today (see audit above), so matching it literally would under-deliver on the ask. Recommend building the real thing: an `email_templates` table with a small Studio UI to create/duplicate/edit templates, closer to what Spa Mambo *should* eventually become than what it is now.

### Chris Lattner — Mobile / PWA
The camera port has to work flawlessly on iPhone Safari — Found already solved the permission-denied/black-screen problem (July 6 fix) and the timeout-based "is this actually blocked or just slow" detection; reuse that logic directly rather than re-discovering it. Also recommend finally adding the PWA install-to-home-screen manifest for Studio as part of this rebuild (it's been an open item for a while) — Monica is about to start living in this app daily with leads, calendar, and photos all in one place, and "add to home screen" is the difference between that feeling like a real tool versus a bookmark.

---

## PART 3 — PROPOSED PHASED PLAN

**Phase 1 — Foundation & Trust**
Fix what's broken before building more on top of it.
- Set `STUDIO_PASSWORD`.
- Finish Stripe estimate checkout (deposit + balance from `/q/[token]`) + PDF receipts + the end-to-end test that's been pending since May.
- Resolve the calendar/availability decision — recommended: port Found's `availability` / `availability_blocks` / `bookings` tables + slot algorithm, simplified for single-tenant.
- SEO/AEO/GEO foundation: metadata, JSON-LD, sitemap, robots.txt, Core Web Vitals pass.

**Phase 2 — New Design (Jony-led)**
One unified visual rebuild across the public site and Studio.

**Phase 3 — Camera & Photos**
Port Found's in-app `CameraSheet` pattern (zoom, torch, aspect ratio, album-at-capture picker), replacing the native file-input "Shoot" button. Keep the existing heart/star model and locked video-thumbnail solution.

**Phase 4 — Calendar / Booking**
Surface real availability in the public configurator; build Monica's Schedule tab (Calendar/Bookings/Hours) in Studio, ported from Found's pattern.

**Phase 5 — Leads, Contacts, Email**
Real Leads system (temperature/status/source, lead→estimate handoff), Contacts phone book, and a genuinely owner-editable email template system + campaign send tool — going further than Spa Mambo's current hardcoded-template reality, per Marcus's recommendation above.

**Phase 6 — Social / Branded Image Generation**
Extend Social Export into an automatic branded-image pipeline off starred photos (closer to Found's `social_post_drafts` concept), with caption assistance and a lightweight posting view.

---

## DECISIONS — LOCKED 2026-07-07

Team ran the explicit meeting pattern from `brief.md` Step 4 on all 4 open questions. Shawn sat in the meeting, added his own input, and approved all 4 — full reasoning in `DECISIONS.md`.

1. **Phase order** — two parallel lanes: Lane A (blocking) finishes Stripe checkout + calendar/availability; Lane B (parallel) runs SEO scaffolding + early design work.
2. **Calendar** — port Found's real-availability engine now; build it to support a future two-way sync with Monica's personal iCloud calendar (CalDAV, app-specific password — see `DECISIONS.md` technical note). This was Shawn's own addition to the team's original proposal.
3. **Email** — build the real, owner-editable template system, not a copy of Spa Mambo's current lighter reality.
4. **SMS** — build sending capability now; activation waits on Shawn's carrier registration.

Phase 1 work is now unblocked — see `TASKS.md`.
