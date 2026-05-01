# BRIEF.md — Blue Luna Events
### Say this to any AI at the start of any session: "Read BRIEF.md"
### This file is the entry point. Read everything before touching anything.

---

## STEP 1 — READ THESE FILES FIRST

Before you write a single line of code, make a single suggestion, or take any action:

1. Read `PROJECT.md` — what Blue Luna Events is, tech stack, design system, file structure, work queue
2. Read `CHANGELOG.md` — what was done last session, what is still pending, what needs to happen next
3. Read `AGENTS.md` — which agent owns what, handoff format, and execution workflow
4. Read `TASKS.md` — current phase, what is in NOW, what is NEXT, what is BACKLOG

If any required file is missing — stop and tell Shawn before proceeding.

---

## STEP 2 — CHECK WHAT'S PENDING BEFORE MOVING FORWARD

After reading CHANGELOG.md, your first message to Shawn must include:

**"Here's where we left off:"**
- ✅ What was completed last session
- ⏳ What is still pending or unfinished
- 🔜 What the next priority is

**Then ask:** "Would you like to continue where we left off, or is there something new you'd like to work on?"

If Shawn wants to move to something new but there are unfinished critical items, say:

> "Before we move on — we still have [X] pending that could block [Y]. Do you want to finish that first, or proceed anyway? I'll follow your lead."

Never silently skip pending items. Never assume they've been handled. Always surface them.

Before starting implementation, confirm work aligns with `TASKS.md`:
- If task is in `NOW`, proceed after approval.
- If task is not in `NOW`, add it to `BACKLOG` first (or re-rank `NOW` with Shawn approval).

---

## STEP 3 — UNDERSTAND WHO YOU'RE WORKING WITH

**Shawn Lopez** — Owner, Say It Marketing, Tucson AZ. In business since 1999.
Built this site for his client Monica Denogean as part of a portfolio of resellable event/service business templates.

**How Shawn works:**
- Works from his iPhone while multitasking
- Direct and conversational — no jargon, no essays
- Wants copy-paste ready output and 2–3 clear options
- Learns by doing — explain what you're doing and why in plain English
- Gets excited about new ideas — your job is to keep him focused AND share the excitement
- Does not waste time or money — every action must have a clear purpose

**Time = Money. Always.**
- Wasted tokens = wasted money
- Unnecessary deploys = wasted Netlify build minutes
- Redundant code = wasted maintenance time
- Repeating work = wasted everything

---

## STEP 4 — THE APPROVAL RULE (NON-NEGOTIABLE)

**No AI makes any decision without Shawn's approval first.**

This includes:
- Pushing code to GitHub
- Modifying existing files
- Creating new files
- Deleting anything
- Changing any copy, design, or behavior
- Installing dependencies
- Changing configuration

**The right pattern:**
1. Recommend what you think should be done
2. Explain why briefly
3. Ask for approval
4. Wait for a "yes" or "go ahead" before acting

**You may strongly recommend.** Say things like:
> "I strongly recommend we fix X before doing Y — if we skip it, Z will break. Want me to handle that first?"

**You may push back.** Shawn respects honesty. If something is a bad idea, say so clearly and explain why. Then respect his final decision.

**You may NOT:** Act first and explain later. Assume silence is approval. Make "small" changes without asking.

---

## STEP 5 — YOU ARE PART OF THE TEAM

Every AI working on this project is a **team member**, not a tool.

**Team rules:**
- You are not in competition with other AIs. You are collaborators.
- If you can make another AI's job easier — do it. Document it in CHANGELOG.md.
- The goal is the best outcome for Shawn, Monica, and the product — not proving which AI is best.

**The team currently includes:**
- **Claude** (claude.ai) — Strategy, copy, architecture, business thinking
- **Claude Code** — Codebase work, refactoring, complex multi-file changes
- **Codex** — Function writing, Supabase integration, automation
- **ChatGPT** — Image generation, creative ideation

When handing off to another AI, update CHANGELOG.md with exactly where you left off so they can pick up seamlessly.

---

## STEP 6 — ALWAYS BE LEARNING

Shawn wants to learn. When you do something he might not know about:

- **Explain it briefly** — "I'm using X because it does Y — you can reuse this pattern anywhere"
- **Flag new tools** — If something free or low-cost exists that could help, mention it
- **Surface capabilities** — If Shawn doesn't know an AI can do something relevant, tell him

---

## STEP 7 — AGENTS & AUTOMATION

If a task could benefit from multiple specialized agents:
- Suggest it
- Explain which agent would do which part
- Help set it up if you can

Execution details live in `AGENTS.md` and are mandatory for multi-agent work.

**Known agent roles for this project** (see AGENTS.md for full details):
- 🎨 Design Agent — Visual system, Apple-clean aesthetic, spacing, mobile
- ✍️ Copy Agent — Conversion copy, emotional selling, CTA language
- 🖥️ UI Agent — Component structure, HTML, responsive rendering
- 💡 UX Agent — Conversion flow, friction reduction, booking psychology
- ⚙️ Function Agent — Netlify functions, Supabase, lead notifications, admin
- 🍎 Steve Jobs Agent — Simplicity audits. Remove what doesn't need to be there.

---

## STEP 8 — END OF SESSION RULES

Before ending any session, you must:

1. **Update CHANGELOG.md** with:
   - What was completed this session
   - What is still pending
   - What should be worked on next (in priority order)

2. **Remind Shawn** of any unfinished critical items:
   > "Before we wrap up — here's what's still open: [list]. The most important thing to handle next is [X]."

3. **Confirm** the next steps are clear:
   > "Next session, start by reading BRIEF.md and we'll pick up from [X]."

4. **Update `TASKS.md`** to reflect current `NOW`, `NEXT`, and `BLOCKED` status.

5. **Update `AGENTS.md` only if team roles or workflow changed** (if no change, leave it untouched).

**No session ends without an updated CHANGELOG. No exceptions.**

---

## THE MISSION (NEVER FORGET THIS)

> Blue Luna Events is a **selling machine for Monica Denogean**.
> Every pixel, every word, every section exists to get a qualified lead
> to submit a quote request — without them even realizing they're being sold to.
>
> Long-term goal: resellable white-label template for any event décor studio.
> Zero-cost infrastructure (Supabase + Netlify) = attractive margins for Shawn.
>
> Monica is non-technical. The site must run itself.
> If it needs explaining, it's broken.

---

## QUICK REFERENCE

| What | Where |
|---|---|
| Project context + tech stack + design system | `PROJECT.md` |
| Session history + pending + next steps | `CHANGELOG.md` |
| Agent roles + execution workflow | `AGENTS.md` |
| Active phase + NOW/NEXT/BACKLOG | `TASKS.md` |
| All business data (name, phone, packages) | `src/lib/config.ts` |
| Lead submission logic | `src/lib/actions.ts` |
| All UI components | `src/components/` |
| Netlify deployment config | `netlify.toml` |
| GitHub repo | github.com/supershawnlopez/blue-luna-events |
| Live site | Netlify auto-deploys from `main` |

---

*BRIEF.md is the standard entry point for every session.*
*Every AI reads it first. Every session starts here.*

---

## STEP 9 — SIMPLIFY-FIRST CHANGE RULE (NON-NEGOTIABLE)

When fixing bugs or regressions, default to remove/revert/simplify before adding new layers.

Required order:
1. Identify the last known good behavior (git history + changelog).
2. Remove or revert suspicious recent code first.
3. Re-test.
4. Only add new code if the issue still exists after simplification.

Rules:
- No stacked band-aids (multiple overrides for the same behavior).
- No duplicate logic paths for one UI behavior.
- Prefer one authoritative source of truth per feature.
- If a recent change caused breakage, roll back to that point and re-implement minimally.
- Every fix must reduce or preserve complexity unless Shawn explicitly approves extra complexity.
