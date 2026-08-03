// Template-based caption suggestions — deliberately not AI-generated.
// DECISIONS.md 2026-08-02 locked rules-based smart surfacing for Studio and
// explicitly deferred AI to a future, separately-approved layer. Same rule
// applies here: simple templates per event type, not a generative feature.

type Suggestion = { line: string; hashtags: string[] }

const SUGGESTIONS: Record<string, Suggestion> = {
  quinceanera: {
    line: "Another magical Quinceañera brought to life! ✨ Ready to plan yours?",
    hashtags: ['#QuinceaneraTucson', '#BalloonDecorTucson', '#BlueLunaEvents'],
  },
  graduation: {
    line: "Celebrating another graduate in style! 🎓 Let's style your celebration next.",
    hashtags: ['#GraduationParty', '#TucsonBalloons', '#BlueLunaEvents'],
  },
  birthday: {
    line: "Birthday magic, Blue Luna style! 🎈 Book your event with us.",
    hashtags: ['#BirthdayDecor', '#TucsonBalloons', '#BlueLunaEvents'],
  },
  baby_shower: {
    line: "Sweetest baby shower styling! 🍼 We'd love to help plan yours.",
    hashtags: ['#BabyShowerDecor', '#TucsonEvents', '#BlueLunaEvents'],
  },
  wedding: {
    line: "Wedding day dreams, styled with love. 💍 Let's talk about your big day.",
    hashtags: ['#TucsonWedding', '#WeddingDecor', '#BlueLunaEvents'],
  },
  corporate: {
    line: "Elevating brands, one event at a time. ✨ Ask us about corporate styling.",
    hashtags: ['#CorporateEvents', '#TucsonEvents', '#BlueLunaEvents'],
  },
  other: {
    line: "Another beautiful event, styled by Blue Luna. ✨ Let's plan yours next.",
    hashtags: ['#TucsonBalloons', '#EventDecor', '#BlueLunaEvents'],
  },
}

export function suggestCaption(eventType: string | null | undefined): string {
  const s = SUGGESTIONS[eventType ?? ''] ?? SUGGESTIONS.other
  return `${s.line}\n📍 Tucson, AZ · bluelunaevents.com\n${s.hashtags.join(' ')}`
}
