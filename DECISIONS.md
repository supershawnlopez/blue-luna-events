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

## SECURITY RULES (LOCKED)

- `bl_pricing.json` is PRIVATE — contains Monica's home address. Never show on client-facing docs or public routes. Never add to any prompt or export that a client could see.
- Never hardcode Monica's business info anywhere in components — always read from `SITE_CONFIG` / `src/lib/config.ts`.
- Never push API keys to the repo — Vercel env vars only.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` client-side — server routes only, via `serverClient()`.
- Studio is protected by middleware — the `studio_session` cookie must match `STUDIO_SESSION_TOKEN`.

---

## OPEN QUESTION CARRIED FROM PRIOR SESSION

**Google Calendar date availability — decision still needed from Shawn.**
- Option A: Supabase-backed `booked_dates` list, Monica updates manually (simple, fast to build).
- Option B: Google Calendar API — real availability shown in the configurator (complex, more powerful).
No decision recorded yet — do not build either path until Shawn picks one.
