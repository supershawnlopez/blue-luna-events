# AGENTS.md
### Multi-agent execution playbook for Blue Luna Events
### Use this with BRIEF.md, PROJECT.md, and CHANGELOG.md

---

## PURPOSE

This file defines how AI agents collaborate on this repo without stepping on each other, creating regressions, or drifting from the core mission: a clean, luxury, high-converting lead-gen site for Monica.

`BRIEF.md` = rules and session protocol with Shawn
`PROJECT.md` = project intelligence and design system
`AGENTS.md` = execution map (who does what, in what order, with what handoff)

---

## CORE RULES

1. Mission first: every task must improve the site's ability to generate qualified leads for Monica.
2. Approval first: no file changes, deploy-impacting actions, or config changes without Shawn approval.
3. Stay in lane: each agent owns a specific scope.
4. No silent handoffs: always document what changed, what is pending, and what is next.
5. No duplicate work: check `CHANGELOG.md` and current git diff before starting.
6. Simplify-first fixes: remove/revert recent risky changes before adding new code.
7. No layered overrides: do not stack patches for the same UI/logic path.
8. One behavior, one source: keep a single authoritative implementation per feature.

---

## AGENT ROSTER

### 1) Design Agent
Owns:
- Visual system, Apple-clean aesthetic, color palette, typography, spacing, whitespace
- Mobile responsiveness (375px first)
- Brand consistency across all pages

Outputs:
- CSS updates, Tailwind class changes, layout corrections
- Must stay within the established design system (see PROJECT.md)

Done when:
- Every section breathes — nothing feels crowded
- Teal is the only accent color (outside of graduation gold pages)
- Mobile renders cleanly at 375px

### 2) Copy Agent
Owns:
- All headline copy, body copy, CTA text, package descriptions
- Conversion psychology: emotional hooks, social proof, objection handling
- SEO-aware copy for local Tucson search terms

Outputs:
- Replacement copy as plain text, ready to drop in
- Notes on why the copy works (persuasion angle used)

Done when:
- Hero headline makes someone feel something in under 3 seconds
- Every CTA is action-first and low-pressure
- Package names and descriptions sell without being pushy

### 3) UI Agent
Owns:
- Semantic component structure, JSX/TSX markup
- Interactive behavior (modals, forms, hover states)
- Responsive rendering across breakpoints

Outputs:
- Clean component rewrites using existing Tailwind + inline style patterns
- No structural regressions on existing working components

Done when:
- Mobile (375px) and desktop render correctly
- No broken layout or clipping at any common viewport

### 4) UX Agent
Owns:
- Conversion flow from hero to quote submission
- Friction points in the booking sheet and quote form
- Psychological flow: desire → trust → identify → ease → FOMO → action

Outputs:
- Flow analysis with specific friction points and severity
- Proposed changes in plain language before implementation

Done when:
- A visitor can go from landing to submitted quote in under 60 seconds
- No confusing dead ends
- Package CTAs lead directly to the booking sheet

### 5) Function Agent
Owns:
- Netlify serverless functions
- Supabase interactions (leads table, gallery table)
- Lead notification (email/SMS to Monica on new submission)
- Admin leads dashboard

Outputs:
- Netlify function files in `netlify/functions/`
- Supabase schema changes documented in CHANGELOG.md

Done when:
- Monica gets notified within minutes of a new lead
- No secrets exposed client-side
- All form submissions confirmed in Supabase

### 6) Image / Media Agent
Owns:
- Sourcing or generating product photos for the custom builder (Step3Custom)
- Each à la carte option in PackageConfigurator.tsx needs a visual reference image
- Images must match Blue Luna's luxury, teal-accented brand aesthetic

Task (Phase 2A):
Generate or source **15–20 images** for the following components:

| Component | Options needed |
|---|---|
| Balloon Garland | basic tier, full tier, luxury tier (one photo each showing style difference) |
| Backdrop | shimmer wall, hoop frame, rectangle frame |
| Balloon Columns | 6ft, 7ft, 8ft — ideally with toppers shown |
| Marquee Letters | large size example, small size example |
| Centerpieces | basic centerpiece, premium centerpiece |
| Bouquets | small 5–7 balloon bouquet, large 10–12 balloon bouquet |

Image requirements:
- Clean background preferred (white, cream, or event venue setting)
- Teal/white/neutral balloons match the brand best
- Square or portrait crop — will display in ~200px wide pill/card UI
- File format: JPG or WebP, under 200KB each
- Suggested naming: `garland-basic.jpg`, `backdrop-shimmer.jpg`, `column-6ft.jpg`, etc.
- Place in: `public/images/components/`

Sources to try (in order):
1. Monica's Instagram `@BlueLunaMagic` — real photos of her work (best option, authentic)
2. Generate with DALL·E / Midjourney / ChatGPT using: "professional balloon décor studio photo, [component], white and teal balloons, clean bright background, luxury event styling, no text"
3. Stock photo fallback (Unsplash/Pexels) — balloon décor category

Once images are placed in `public/images/components/`, hand off to Claude Code to wire them into `src/components/ui/PackageConfigurator.tsx` Step3Custom component.

Done when:
- All 15–20 images are in `public/images/components/`
- Each image clearly represents its component option
- File sizes are optimized (under 200KB each)

### 7) Steve Jobs Agent
Owns:
- Simplicity audits: remove any UI or copy that does not help a visitor book faster
- Challenge every section: "does this need to exist?"

Outputs:
- Keep/remove recommendations with rationale
- Simplified alternatives for bloated sections

Done when:
- Nothing exists on the page that doesn't earn its space
- The path from arrival to booking is frictionless and obvious

---

## STANDARD WORKFLOW (DEFAULT)

1. Read `BRIEF.md` → `PROJECT.md` → `CHANGELOG.md` → `AGENTS.md`
2. Summarize: completed, pending, next priority
3. Identify which agent roles are needed for the current task
4. Identify last known good baseline for the target area
5. Revert/remove-first pass if fixing a bug
6. Run focused implementation by role
7. Merge findings into one priority list (Critical → High → Medium → Low)
8. Ask Shawn for approval before edits
9. Execute approved changes
10. Update `CHANGELOG.md` with completed/pending/next

---

## HANDOFF FORMAT (MANDATORY)

When one agent hands to another, use this exact structure:

1. Scope completed
2. Files touched
3. Risks found
4. Pending decisions from Shawn
5. Next best action

---

## PRIORITY MODEL

- Critical: can break lead capture, form submission, or deployment
- High: directly impacts conversion or Monica's ability to receive leads
- Medium: meaningful design or UX improvement, not immediate blocker
- Low: polish or future enhancement

Always fix Critical before new feature work unless Shawn explicitly overrides.

---

## DEFINITION OF DONE (SESSION)

A session is done only when:

1. Approved work is complete
2. Basic verification is complete (or clearly reported if not run)
3. `CHANGELOG.md` is updated
4. Shawn is told:
   - what was done
   - what is still pending
   - what should happen next

---

## CHANGE CONTROL

Update this file only when one of these changes:

1. Agent roles or responsibilities
2. Handoff process
3. Priority model
4. Definition of done

If unchanged, do not edit it.
