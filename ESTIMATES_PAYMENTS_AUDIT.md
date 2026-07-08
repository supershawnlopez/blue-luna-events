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

## OPEN QUESTIONS FOR SHAWN

1. **Sequencing** — Steve's team recommends: real payment ledger first (Priya/Craig's rework), then discounts, then email-from-Studio, then back to the previously-planned Phase 5 (full Leads/Contacts system). Does that order match what you'd want, given "leads every day" is still the stated top business goal?
2. **Discount test approach** — once discounts exist, do you want to use that to run the real live $1 Stripe test yourself, instead of getting separate test-mode keys?
3. **Email-from-Studio scope** — just the share link, or the PDF attached too? Should it also notify Monica (bcc/copy her) so she has a record of what was sent?

Read this, add your own view, and we'll decide together — nothing here is being built yet.
