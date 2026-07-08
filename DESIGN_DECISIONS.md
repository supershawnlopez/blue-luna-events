# DESIGN_DECISIONS.md — Blue Luna Events Visual & UX Decisions
### Jony Ive's approved design system. Every decision with the reasoning.
### New AI: do not override these without Jony explicitly reopening the decision. These are locked.

---

## BRAND COLOR (LOCKED)

**Teal (`#5BBFBF`) is the only accent color sitewide, outside graduation pages.**
Approved by: Jony Ive
Why: The site must feel like a luxury brand, not a local balloon company. Teal reads calm and premium; blue reads generic-web and is banned. Gold (`#C9A96E` / `#E8CCA0`) is reserved for graduation pages only — it must never bleed into quinceañera, general event, or Studio contexts.

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
- Nav items: large, italic heading font, dark text (`#333333`); active item in teal.
- Items separated by hairline dividers in `#f5f5f5`.
- Phone + CTA button anchored to the bottom, with a top border separator.

Why: Calm/Warm reads as refined and unhurried — the right register for an event décor brand, versus the Bold/Modern dark-overlay treatment used for contractor-type brands elsewhere in Shawn's portfolio.

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
