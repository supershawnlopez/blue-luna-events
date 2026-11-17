// Starter follow-up emails, written in Monica's voice (Shawn + Angela/Phil/Jony,
// 2026-11-17). Loaded into Studio → Email Templates as DRAFTS; nothing here is
// ever sent until Shawn or Monica approves it.
//
// Smart fill-ins (filled in by the automatic sender, never left blank):
//   {{name}}       client's first name                         "Donna"
//   {{honoree}}    who it was for, said the way Monica would    "Lily" / "your grandbaby" / "you"
//   {{honoree_s}}  the same, as a possessive                    "Lily's" / "your daughter's" / "your"
//   {{milestone}}  what's coming up                             "17th birthday" / "first birthday"
//   {{event}}      the kind of party                            "baby shower"
//   {{date}}       event date, written out                      "Saturday, Dec 5"
//   {{link}}       their estimate / invoice page
//   {{review_link}} Monica's Google review page
//   {{share_link}} bluelunaevents.com/event-questionnaire
//   {{reason_buttons}} one-tap "why didn't you book?" links (Price, Timing…)
// If we don't know who it was for, the sender uses the general wording —
// it never guesses a relationship.

export type StarterTemplate = {
  slug: string
  category: 'not_booked' | 'client' | 'stay_in_touch'
  send_when: string
  name: string
  subject: string
  body: string
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  // ── Haven't booked yet ────────────────────────────────────────────────
  {
    slug: 'estimate_checkin',
    category: 'not_booked',
    send_when: '3 days after the estimate, if they haven’t replied or accepted',
    name: 'Estimate check-in',
    subject: 'Any questions about your estimate?',
    body: `Hi {{name}},

I just wanted to check in on the estimate I sent for your {{event}}. Did everything look the way you pictured it?

If you'd like to change anything (colors, size, adding or taking something out), just reply here and I'll update it for you. No pressure at all.

Here's your estimate again: {{link}}

Talk soon,
Monica`,
  },
  {
    slug: 'date_not_held',
    category: 'not_booked',
    send_when: '7 days after the estimate, if still no reply',
    name: 'Your date is still open',
    subject: '{{date}} is still open on my calendar',
    body: `Hi {{name}},

Quick heads up: {{date}} is still open on my calendar, but it isn't held for you until the deposit is in, and that time of year fills up fast.

If you're still deciding, I'm happy to hop on a quick call or put together a smaller option that fits your budget better. Just reply and let me know.

{{link}}

Monica`,
  },
  {
    slug: 'still_planning',
    category: 'not_booked',
    send_when: 'After 21 quiet days (they moved to Not Now)',
    name: 'Did you find what you needed?',
    subject: 'Did you find what you needed?',
    body: `Hi {{name}},

I haven't heard back about your {{event}}, so I wanted to make sure you found what you needed. Either way, it would really help me to know what happened. Just tap one:

{{reason_buttons}}

And if your plans are still coming together, I'm here whenever you're ready.

Monica`,
  },
  {
    slug: 'after_decline',
    category: 'not_booked',
    send_when: 'Right after they tap "Not right now" on their estimate',
    name: 'Thanks for letting me know',
    subject: 'Thank you for letting me know',
    body: `Hi {{name}},

Thank you for letting me know, I really appreciate it. I hope your {{event}} is beautiful!

If anything changes, your estimate is still saved, and I'd love to help with your next celebration whenever that comes around.

Monica`,
  },

  // ── Clients ───────────────────────────────────────────────────────────
  {
    slug: 'deposit_thank_you',
    category: 'client',
    send_when: 'Right after their deposit is paid',
    name: 'Deposit thank-you',
    subject: "You're booked! 🎈",
    body: `Hi {{name}},

You're officially on my calendar for {{date}}! Thank you so much for trusting me with your {{event}}.

Here's what happens next: about two weeks before, I'll reach out to confirm the final details (setup time, venue access, colors), and to collect the remaining balance.

If anything comes up before then, just reply here. I read every message myself.

So excited for this one,
Monica`,
  },
  {
    slug: 'two_weeks_out',
    category: 'client',
    send_when: '14 days before their event',
    name: 'Two weeks out',
    subject: 'Two weeks until your {{event}}!',
    body: `Hi {{name}},

Two weeks to go! I'm starting to get everything ready for {{date}}.

Can you reply and confirm a few things for me?
• What time can I start setting up?
• Anything I should know about the venue (parking, stairs, a contact person)?
• Any last-minute changes to colors or details?

Your remaining balance is on your invoice here: {{link}}

Can't wait,
Monica`,
  },
  {
    slug: 'day_after_review',
    category: 'client',
    send_when: 'The day after their event',
    name: 'Thank you + review',
    subject: 'Thank you for letting me be part of it 💙',
    body: `Hi {{name}},

Thank you again for having me yesterday. I hope everyone loved it as much as I loved putting it together!

If you have a minute, a quick Google review would mean the world to me. It's the biggest way a small business like mine gets found:
{{review_link}}

And if you snapped any photos, I'd love to see them!

With love,
Monica`,
  },
  {
    slug: 'referral',
    category: 'client',
    send_when: '2 weeks after their event',
    name: 'Know someone celebrating?',
    subject: 'Know someone with a celebration coming up?',
    body: `Hi {{name}},

I'm still smiling about your {{event}}! Most of my clients come from people like you sharing my name, so I wanted to ask: do you know anyone with a birthday, shower, or celebration coming up?

Just pass along this link and tell them you sent them: {{share_link}}

Thank you for being part of the Blue Luna family.

Monica`,
  },

  // ── Staying in touch (the smart ones) ─────────────────────────────────
  {
    slug: 'birthday_coming_up',
    category: 'stay_in_touch',
    send_when: '6 weeks before the yearly birthday (from their birthday or last party date)',
    name: 'Birthday coming up',
    subject: '{{honoree_s}} birthday is coming up!',
    body: `Hi {{name}},

Can you believe it's almost a year since we celebrated {{honoree}}? That means another birthday is right around the corner!

If you're planning something this year, I'd love to help make the {{milestone}} just as special. I can do anything from a simple balloon garland to a full setup.

Just reply here, or start here: {{share_link}}

Monica`,
  },
  {
    slug: 'first_birthday',
    category: 'stay_in_touch',
    send_when: 'About 10 months after the baby shower (or 2 months before baby’s first birthday)',
    name: 'Baby’s first birthday',
    subject: 'A first birthday is coming up! 🎂',
    body: `Hi {{name}},

I still remember {{honoree_s}} baby shower, and now that little one is almost turning ONE! Time flies.

First birthdays are some of my favorite parties to do. If you're starting to plan, I'd love to help make it unforgettable.

Just reply here, or start here: {{share_link}}

Monica`,
  },
  {
    slug: 'anniversary',
    category: 'stay_in_touch',
    send_when: '6 weeks before their wedding anniversary',
    name: 'Anniversary coming up',
    subject: 'Happy almost-anniversary!',
    body: `Hi {{name}},

Your anniversary is coming up, and I couldn't let it pass without saying congratulations!

If you're planning a dinner, a surprise, or a little celebration at home, I'd love to make it extra special with some romantic decor.

Just reply here anytime.

Monica`,
  },
  {
    slug: 'corporate_holiday',
    category: 'stay_in_touch',
    send_when: 'Every September 15, to corporate clients',
    name: 'Holiday party season',
    subject: 'Holiday party season is almost here',
    body: `Hi {{name}},

It was such a pleasure working with you! Holiday party season is just around the corner, and December dates go fast.

If your team is planning a holiday party, an end-of-year celebration, or a client event, I'd love to help make it look amazing. Reply here and I'll hold some time for you.

Monica`,
  },
  {
    slug: 'next_year',
    category: 'stay_in_touch',
    send_when: '11 months after their event (when no birthday or anniversary email fits)',
    name: 'Planning another celebration?',
    subject: 'Planning another celebration this year?',
    body: `Hi {{name}},

It's been almost a year since your {{event}}, and I've been thinking about you! I hope everyone is doing well.

If you have anything coming up this year (birthdays, showers, graduations, holidays), I'd love to be part of it again.

Monica`,
  },
  {
    slug: 'season_graduation',
    category: 'stay_in_touch',
    send_when: 'Every March 1, to everyone who hasn’t unsubscribed',
    name: 'Graduation season',
    subject: 'Graduation season is coming 🎓',
    body: `Hi {{name}},

Graduation season is almost here! If someone in your family is graduating this year, I'd love to help celebrate with balloon garlands, backdrops, and photo walls in their school colors.

May and June dates book up fast, so reply anytime and I'll save a spot.

Monica`,
  },
  {
    slug: 'season_new_year',
    category: 'stay_in_touch',
    send_when: 'Every January 5, to everyone who hasn’t unsubscribed',
    name: 'New Year check-in',
    subject: 'Happy New Year from Blue Luna!',
    body: `Hi {{name}},

Happy New Year! Thank you for being part of my year, whether we celebrated together or you reached out about an idea.

If you have birthdays, showers, quinceañeras or weddings coming up this year, I'd love to help. Reply anytime and I'll get you on my calendar early.

With love,
Monica`,
  },
]
