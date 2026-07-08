# ESTIMATES_PAYMENTS_AUDIT.md — Blue Luna Events
### Written July 9, 2026, from Shawn's live testing of the estimate/payment system.
### Team input below is independent, unsynthesized. Shawn reads, adds his own view, then the team decides together — per `brief.md` Step 4.

---

## WHAT TESTING CONFIRMED WORKS

- Studio login
- Estimates list shows real data (the bug from last session is genuinely fixed)
- Estimate detail page — client info, line items, share link, PDF download
- Manual "Mark Paid" toggle — checks/unchecks correctly, teal brand color
- PDF actually downloads
- Client-facing share link works
- `sitemap.xml` and `robots.txt` verified — exactly match what was built, five URLs at the intended priorities/frequencies (checked directly against the live output, not just the code)

---

## WHAT SHAWN FOUND THAT NEEDS WORK

### 1. Payments don't show a live "what's actually owed" picture
Right now the system tracks exactly two fixed buckets — a 50% deposit and a 50% balance — each with a simple paid/unpaid flag. Marking one "paid" just adds a checkmark next to that fixed line item. It does not compute or display: original total → amount actually paid → what's genuinely still owed. Shawn's real-world scenario: a client hands Monica cash in person for some amount and says "put it toward the full thing, I'll pay the rest later" — the system has no way to represent a payment that doesn't line up exactly with the pre-set 50/50 split, and neither the client-facing page nor the PDF currently shows a clear running balance.

### 2. Discounts don't exist
Monica needs to apply a discount to an estimate — either a percentage or a flat dollar amount — with her own free-text note (e.g., "Birthday discount," "Friend discount"). This should recompute the total, deposit, and balance accordingly. Shawn also pointed out a practical side-benefit: a discount feature lets him safely live-test the real Stripe payment flow by discounting a test estimate down to $1, instead of needing separate test-mode keys.

### 3. No way for Monica to email an estimate from inside the system
Right now getting an estimate to a client means Monica copies a share link and sends it herself (text, her own email, however). There's no "send this estimate by email" button inside Studio itself.

### 4. No Leads system (asked directly: are we building this?)
Confirmed factually, not a team opinion: yes, this was already planned. It's Phase 5 of the platform rebuild (`PLATFORM_REBUILD_AUDIT.md`), covering a real Leads system (temperature, status, source, lead→estimate handoff), a Contacts phone book, and the real owner-editable email template system — none of it started yet. Today's findings are new information the team should weigh against that existing plan.

---

## TEAM INPUT (independent, not synthesized into one answer)

### Priya Nair — Backend/Data
The real fix for #1 is architectural, not cosmetic: move from two fixed 50/50 buckets to a proper running ledger — a `payments` table recording each individual payment (amount, method, date, note) against an estimate, with the estimate's "amount owed" always computed as `total − sum(payments) − discount`. This directly supports partial/irregular payments, Zelle/cash entries with a note, and eventually multiple payments over time. It's a bigger change than a UI tweak, but it's the only model that actually matches how Monica gets paid in real life.

### Craig Federighi — Engineering
Agree with Priya's direction. Practically: the `estimates` table keeps `quoted_total` and gets a new `discount_type`/`discount_value`/`discount_note`, and a new `estimate_payments` table replaces the rigid deposit/balance boolean pair. The client-facing page and the PDF both need to read from the same computed "amount owed" function so they're never out of sync with each other — right now they're two separate hand-written views of the same data, which is exactly the kind of thing that drifts apart over time.

### Angela Ahrendts — Client Experience
Whatever the backend model, the client-facing page needs to read like a real receipt: "Total: $650 · Paid: $325 · Remaining: $325" in plain language, not three separate line items the client has to do math on themselves. Same standard for the PDF — it's often the thing that gets forwarded to a spouse or printed, it needs to stand alone and make sense without Studio open next to it.

### Phil Schiller — Marketing
On the sitemap/robots check: the technical setup is correct as built, but there's real headroom to use it better. Two things worth doing while we're in there: (1) `get-a-quote` is arguably weekly-priority, not monthly — it's the conversion page, it should signal to Google that it's actively maintained; (2) once the configurator redesign ships (the photo-matching work already approved), the sitemap should be revisited since new content = new signal to send. Not urgent, but worth a pass alongside that work rather than treating sitemap.xml as "done forever."

### Marcus Webb — Studio/Integration
The "email from Studio" request is straightforward to build on top of Resend, which is already wired up and now confirmed working end-to-end. I'd tie it to the same share-link flow that already exists — Monica taps "Email Estimate," picks or confirms the client's address, it sends a branded email with the link (and optionally the PDF attached) using the same visual style as the other transactional emails. Small, contained feature.

### Steve Jobs — Product
Shawn's discount-as-a-testing-tool idea is genuinely good and worth keeping in mind as a reason to prioritize discounts over pure test-mode-key setup — it solves two problems (a real feature Monica needs, and a safe way to test payments) with one build. On sequencing: the payments/ledger rework (Priya's item) is more foundational than discounts or email-from-Studio — build the real ledger first, since discounts and partial payments both need to sit on top of it correctly, not be bolted onto the old fixed-bucket model and then redone.

### Chris Lattner — Mobile
No new mobile-specific concerns here — whatever ships needs to keep working one-handed in Studio on Monica's phone, same as everything else, but nothing about payments/discounts changes that standard.

---

## ROUND 2 — Shawn asked the team to settle the email-from-Studio approach directly

Shawn's question: should "Email Estimate" open Monica's own email app with a pre-filled message she taps send on (a `mailto:` link), or should the system send it directly, one-tap, done? He confirmed two requirements while asking: the email needs **both a PDF attachment and a live link** in the same message (different clients think differently — some want to click, some want to print for their records), and replies should land at `monica@bluelunaevents.com`.

### Craig Federighi — Engineering
This decides itself on a technical fact, not a preference: a `mailto:` link **cannot reliably attach a file** — there's no standard way to attach a PDF through it across email apps and phones, some ignore the attempt entirely, and the message body only supports plain text, not the branded HTML design already built for the other emails. Since Shawn wants a PDF attached in the same message, `mailto:` can't deliver that requirement at all. That's not a close call.

### Marcus Webb — Studio/Integration
The system-send path is a small, contained build on infrastructure that already exists and is now confirmed working — Resend is proven end-to-end today. One button in the estimate detail page, one new API route: generates the same PDF that already works, attaches it, includes the live link, sends with `reply-to: monica@bluelunaevents.com` — the exact same reply-routing pattern already used and working in the client confirmation email. Nothing new to invent.

### Jony Ive — Design
One tap, done, beautiful every time — this is the version that actually matches "feel like an iPhone." Monica shouldn't have to compose or proofread anything; the system already knows how to make this look right (see the existing branded email templates). The `mailto:` path would hand her a plain, unstyled draft to manually clean up and send — the opposite of what we're building toward.

### Angela Ahrendts — Client Experience
Agree on including both the PDF and the live link in one email, exactly as Shawn described — some people will tap the link, some will screenshot or print the PDF for their own records, and there's no reason to force one behavior. Small addition: show Monica a quiet confirmation after sending ("Sent to maria@email.com") so she has peace of mind it went out, without needing her own email app open to check.

### Steve Jobs — Product
Team's unanimous, and for good reason — this isn't really two competing philosophies, it's one option that technically can't do what was asked and one that can. Build the real send. Shawn's instinct ("why not the system do all the hard work") was correct; the `mailto:` idea was the overthinking, not the other way around.

**Team recommendation: system-send, one tap, PDF attached + live link included, reply-to `monica@bluelunaevents.com`.**

---

## CONFIRMED BY SHAWN (2026-07-09)

- Use the discount trick for the live payment test — Shawn will discount a test estimate to $1 and run a real transaction on himself.
- Email-from-Studio includes both the PDF attachment and the live link in the same email.
- Replies to any estimate email go to `monica@bluelunaevents.com`.

## ROUND 3 — Estimates list page: discount-aware display + declutter (2026-07-09)

Shawn's live testing after the payment ledger shipped: (1) a real bug — raw internal IDs like `shimmer_backdrop`, `cp_premium_3pack` were printing verbatim on the customer-facing PDF instead of proper labels. Fixed directly (not a team question — displaying internal identifiers to a client is just wrong, not a style choice). See `DECISIONS.md`.

Two genuine design questions, brought to the team as asked:

**(a) The estimates list shows the full $650 as "unpaid" even when a $649 discount already brought the real amount owed down to $1.** Shawn wants to glance at the list and immediately understand "this isn't real money at risk, a discount already covers most of it" — not have to open the estimate to find out.

**(b) Does the little file icon on each list row do anything, and do we need the full card wrapper at all — could this just be flat rows with a hairline divider between them?**

### Jony Ive — Design
On (a): use the standard sale-price pattern — show the *discounted* total as the bold, primary number, with the original total struck through above or beside it (`~~$650~~ **$1**`). Everyone already reads this pattern instantly from any store; it doesn't need new UI vocabulary, and it directly answers "is this really at risk" in the same glance as the price itself.

On (b): the icon is decorative — it's identical on every row, carries zero differentiating information, and is exactly the kind of thing that should go. Same for the card wrapper. This list is a repeating set of rows, not a set of discrete standalone objects — the right pattern is flat rows separated by a hairline divider within one continuous surface, the same principle already locked for Found's estimate builder ("flowing surface, not card-stack" — see `DESIGN_DECISIONS.md`). Removing both frees up real width for the actual useful information: name, status, discount-aware price.

### Angela Ahrendts — Client Experience
Agree with Jony's price treatment. One addition: keep the "$X paid so far" line, but have it describe the *discounted* total's remaining balance, not the original — so the full picture on one row is "was $650, now $1 after discount, $1 still owed" without ever feeling like three separate facts.

### Craig Federighi — Engineering
Both changes are presentation-only — no new data needed, `computeBalance()` already returns everything (subtotal, discountAmount, finalTotal, amountOwed). Small, low-risk change.

### Steve Jobs — Product
Approve both. This is exactly the "make space, no fluff" instinct Shawn had — cut what's decorative, keep what's informative, and don't make him open a record to learn something the list should have told him already.

**Team recommendation: strike-through original price + bold discounted price; remove the icon and card wrapper in favor of flat rows with a hairline divider.**

---

## APPROVED — 2026-07-09

Shawn approved the team's recommendation explicitly: design, details, and build order as stated. Build sequence locked:
1. Real payment ledger (Priya/Craig's rework) — replaces the fixed 50/50 deposit/balance booleans with a real running balance
2. Discounts (percent or flat + note)
3. Email-from-Studio (system-send, PDF + link, reply-to monica@bluelunaevents.com — see Round 2 above)
4. Phase 5 Leads/Contacts system (previously planned, unchanged)

Building now — see `TASKS.md` and `changelog.md` for progress.
