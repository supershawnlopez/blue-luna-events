# DESIGN_DECISIONS.md — Blue Luna Events Visual & UX Decisions
### Jony Ive's approved design system. Every decision with the reasoning.
### New AI: do not override these without Jony explicitly reopening the decision. These are locked.

---

## BRAND COLOR (LOCKED)

**Teal (`#5BBFBF`) is the sole sitewide primary accent color, outside graduation pages.**
Approved by: Jony Ive
Why: The site must feel like a luxury brand, not a local balloon company. Teal reads calm and premium; blue reads generic-web and is banned. It is also not an arbitrary pick — it's Monica's actual favorite color (Tiffany Blue), which is why the real logo mark (`public/images/logo-mark.png`, `logo-color.png`) is that color. Gold (`#C9A96E` / `#E8CCA0`) is reserved for graduation pages only — it must never bleed into quinceañera, general event, or Studio contexts.

---

## DIGITAL PROPOSALS — LUXURY PRESENTATION, NOT ESTIMATE UI (LOCKED — 2026-08-28)

**Resort/corporate proposal pages use a polished editorial presentation with generous whitespace, co-branding where appropriate, package cards, unit pricing, and PDF download. They should not look like the normal estimate/payment page.**
Approved by: Shawn + Jony Ive + Steve Jobs
Why: Venue and corporate buyers may need to share a proposal internally before Monica creates an official estimate. The proposal must feel upscale and easy to scan, while the official estimate remains the transactional/payment record. The Westin La Paloma proposal is the first implementation of this pattern.

**Mobile addendum, approved 2026-08-28:** Proposal pages must not reuse public lead-form behavior when the client is already known. Package selection should ask only for package direction, optional notes, and required disclosure acknowledgement. Unit pricing must become readable mobile cards instead of a horizontally scrolling or clipped table. Co-branding should stay quiet: the global header owns Blue Luna branding, and the client/venue mark belongs inside the proposal content as a secondary mark.

**Selection addendum, approved 2026-08-28:** Package-card actions should look and behave like quiet buttons, not text links. Selecting a package from the card must visibly mark the matching bottom selector and guide the client to confirm. In pricing comparisons, Standard Price is supporting context; Westin Partner Price is the visual lead.

---

## TWILIGHT ACCENT — SUBTLE ATMOSPHERE, NOT A REPLACEMENT (REVISED — 2026-07-29)

**A secondary "Twilight" glow (soft blush/lavender/gold radial gradient, `--twilight-glow` in `globals.css`) is used as a subtle atmospheric accent behind circular photo elements sitewide. It never becomes a solid fill, never appears as flat blush/lavender/gold blocks, and never replaces teal as the primary functional color (buttons, links, active states, borders).**
Approved by: Shawn + Jony Ive
Why: Originally scoped to homepage Hero + GalleryPreview only (see the entry this revises, same date). Same day, Shawn reviewed the shipped result and said it still read as a color-swap on the existing layout, not a real redesign — directed the team to do one real, cohesive pass instead of incremental patches. The result is the ORBITAL/CIRCULAR DESIGN LANGUAGE below, which uses the Twilight glow as connective atmosphere behind circular photo crops on every page (Hero, WhyMonica, Reviews, Gallery, Quinceañeras). Teal remains the only *solid* color used for buttons, links, and functional UI — Twilight is glow/atmosphere only, never a competing solid brand color.

---

## ORBITAL / CIRCULAR DESIGN LANGUAGE (LOCKED — 2026-07-29)

**Real photos are cropped as circles and staggered like balloons clustering — not rectangular cards — as the sitewide signature motif, echoing Blue Luna's own crescent-moon/balloon logo mark.**
Approved by: Shawn + Jony Ive
Why: Direct instruction from Shawn after seeing the first homepage pass: wanted something "modern, fresh, out of the ordinary, not your usual" — specifically not another templated luxury-brand look every competitor site can copy. Jony's reasoning: Blue Luna's own mark is already a circle; no competitor in Tucson is designed around that shape. Applied as: a floating cluster of circular real-photo crops in the Hero (subtle continuous float animation), a circular accent photo overlapping Monica's portrait in WhyMonica, numbered circular tier markers on Packages cards, a Twilight glow accent behind Reviews, orbital ring accents on the closing CTA, and circular hero-image crops on the Quinceañera/Graduation landing pages (replacing single rectangular photos).
- Technical note for future work: circular photos using Next.js `Image fill` above the fold must have `priority` set — `loading="lazy"` (the default) was found not to reliably fire for these nested absolutely-positioned circular crops, leaving them blank. Fixed sitewide 2026-07-29.

---

## TYPOGRAPHY (LOCKED)

- Display / headlines: `Cormorant Garamond, Georgia, serif` — every headline should feel editorial, not like software.
- Body / UI: `Inter, sans-serif`.
- Labels / eyebrows: `DM Mono, monospace` — 10–11px, uppercase, tracked.

---

## COLOR TOKENS (LOCKED)

| Token | Value | Use |
|---|---|---|
| Background | `#FFFFFF` / `#FDFCFA` | Page and section backgrounds |
| Dark sections | `#0D0F0F` | Hero, dark CTAs |
| Text primary | `#0D0F0F` | Headlines, body |
| Text secondary | `#6B7280` | Supporting copy |
| Text muted | `#9CA3AF` | Labels, fine print |
| Accent teal | `#5BBFBF` | Primary accent — buttons, highlights, icons |
| Accent teal dark | `#3A8F8F` | Hover states, italic headline accents |
| Accent gold | `#C9A96E` / `#E8CCA0` | Graduation pages ONLY |
| Border | `#E5E7EB` | Card borders, dividers |

---

## SPACING & COMPONENTS (LOCKED)

- Section padding: `clamp(64px, 10vw, 120px)` top/bottom.
- Container: `max-width: 1200px`, centered, `padding: 0 32px`.
- Cards: `border-radius: 20px–24px`, generous internal padding, white background, `1px solid #E5E7EB` border, subtle shadow.
- Primary button: teal background, `#0D0F0F` text, `border-radius: 999px`.
- Ghost button: transparent, border, `border-radius: 999px`.
- Eyebrow pattern: line + uppercase tracked label (DM Mono) + line.

---

## PUBLIC GALLERY: EDITORIAL, NOT A GRID (LOCKED — 2026-06-21)

**The public gallery is a masonry layout, not a uniform grid — and it never shows filenames.**
Approved by: Jony Ive
Why: The gallery is Monica's portfolio. It should read like a magazine spread, not a file browser. Masonry via CSS columns; filter chips by event type; lightbox with swipe on mobile and arrow keys on desktop; only the event-type label appears in the caption strip, never a filename.

---

## VIDEO THUMBNAIL PLACEHOLDER (LOCKED — 2026-06-21)

**Grid cells for videos without a captured thumbnail show a branded dark-blue gradient with a teal play ring — never a black or blank frame.**
Approved by: Jony Ive
Why: A black thumbnail reads as broken software. A styled placeholder reads as intentional design while the real thumbnail captures quietly in the background the next time Monica opens that video. See `DECISIONS.md` for the full technical root cause and the locked capture solution.

---

## MOBILE MENU — CALM/WARM VARIANT (LOCKED)

Blue Luna Events uses the Calm/Warm mobile menu treatment:
- Full-screen white panel, not a dark overlay.
- Left border: 2px solid primary (teal).
- Slide-in animation from the right.
- Nav items: bold uppercase Inter (sans-serif), dark text (`#374151`); active item in teal — **revised 2026-08-01, see below.**
- Items separated by hairline dividers in `#f5f5f5`.
- Phone + CTA button anchored to the bottom, with a top border separator.

Why: Calm/Warm reads as refined and unhurried — the right register for an event décor brand, versus the Bold/Modern dark-overlay treatment used for contractor-type brands elsewhere in Shawn's portfolio.

**[2026-08-01] — REVISED: mobile menu items switched from italic serif to bold uppercase Inter, matching desktop nav.**
Approved by: Shawn
Why: Shawn found the mobile menu copy hard to read on his phone, especially the gold (Graduations) and teal (Quinceañeras) colored items — correctly diagnosed as a font/weight problem, not a color problem. The original spec used the large italic Cormorant Garamond display font at regular weight; thin serif strokes at an italic angle read poorly in light brand colors even at a bigger size. Desktop nav uses bold (500) uppercase Inter at those same colors with no legibility complaints, so mobile was changed to match exactly (weight 600, uppercase, `0.03em` tracking) for consistency and readability. Brand color hex values themselves were not changed — teal/gold stay locked, this was purely a typography fix.

---

## CONFIGURATOR: GUIDED PATH IS THE DEFAULT, CUSTOM BUILD IS SECONDARY (APPROVED — 2026-07-08)

**The package configurator's Step 2 currently shows "premade package" and "Build My Own" as two equal, co-located buttons. That changes: the guided package path leads, the custom build path becomes a quieter secondary option for people who already know exactly what they want.**
Approved by: Shawn + Angela Ahrendts + Jony Ive

Why: Hick's Law — more equal-weight choices at once measurably lowers completion rates. Air With Flair Decor (a real event-decor competitor nationally) runs this exact hierarchy: a fast, guided default path, with a custom/consultation path available but not competing for the same visual weight. Most people don't know exactly what they want yet when they land on this screen — they should be led, not asked to choose between two unknowns immediately.

---

## CONFIGURATOR: SHOW WHAT'S BEING BUILT, NOT JUST THE PRICE (APPROVED — 2026-07-08)

**As a customer selects garland tier, backdrop, columns, colors, etc. in the configurator, the page should show real photos from Monica's actual gallery matching those choices — not just a running price total.**
Approved by: Shawn + Jony Ive + Craig Federighi + Marcus Webb

Why: This is the single highest-leverage idea from the July 8 frontend audit. Researched conversion psychology confirms configurators that show something *real* as you build convert better than ones that only update a number — this is why Apple's own product configurators render the actual object at every step. No competitor in the Tucson market shows this; most are static galleries with a separate contact form, disconnected from the pricing/building moment. Implementation requires gallery photos tagged by component/color (garland tier, backdrop type, palette) — not just `event_type` as today — see `DECISIONS.md` for the data-model note. Full reasoning and research sources in `FRONTEND_REDESIGN_AUDIT.md`.

---

## THE STANDARD

Every Blue Luna Events screen must look like a $10,000 agency built it. Clean. Editorial. Nothing that reads as "local business website." If a stranger from Instagram can't feel calm authority within 3 seconds of landing, it isn't done.
