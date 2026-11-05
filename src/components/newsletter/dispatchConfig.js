// THE DISPATCH — the house's weekly signal brief, and the one place its entry points
// are named.
//
// Every invitation on the platform reads its copy, its CRM source and its measurement
// label from here, so an address is filed the same way wherever the reader met it. A
// new entry point is one more key in this map — never a second contact path: `source`
// must be a key the subscribeNewsletter function already tags in GoHighLevel (see
// SOURCE_TAGS there), because GoHighLevel is the only CRM this house writes to.

export const DISPATCH_ENTRY_POINTS = {
  subscribe_page: {
    label: 'The Dispatch · Weekly',
    source: 'general',
    headline: 'One brief a week, drawn from the record.',
    standfirst:
      'Who moved, what launched, where the money went — measured across the verified aerospace and aviation graph. Free, and every issue carries its own way out.',
    cta: 'Join the Dispatch',
  },
  viral_post_2026: {
    label: 'The Dispatch',
    source: 'general',
    headline: 'The signals behind the posts, the week they land.',
    standfirst:
      'A weekly brief from the house: the Fellows behind the record, what their work changed, and where the next movement is showing. Free, and every issue carries its own way out.',
    cta: 'Join the Dispatch',
  },
  viral_post_2022: {
    label: 'The Dispatch',
    source: 'general',
    headline: 'Follow the record past the archive.',
    standfirst:
      'One brief a week: who moved, what launched, where the money went across the verified aerospace and aviation graph. Free, and every issue carries its own way out.',
    cta: 'Join the Dispatch',
  },
  // The foot of a public record. Read there, never sold there: the invitation stands below
  // everything the record itself says, and asks the same thing it asks everywhere else.
  profile: {
    label: 'The Dispatch',
    source: 'general',
    headline: 'The record, one brief a week.',
    standfirst:
      'Who moved, what launched, where the money went — measured across the verified aerospace and aviation graph. Free, and every issue carries its own way out.',
    cta: 'Join the Dispatch',
  },
};

export const DEFAULT_ENTRY_POINT = 'subscribe_page';

export function dispatchInvite(entryPoint) {
  return DISPATCH_ENTRY_POINTS[entryPoint] || DISPATCH_ENTRY_POINTS[DEFAULT_ENTRY_POINT];
}

// What happens after a submission is accepted. The house does not claim a
// confirmation it cannot observe: the welcome and every issue are sent by the
// GoHighLevel workflow behind the tag, so the reader is told what will arrive and
// how to leave — never that they have "confirmed" anything.
export const DISPATCH_NEXT_STEP = {
  headline: "You're on the Dispatch list.",
  body:
    'Watch your inbox for a welcome from the house, then for the brief each week. Every issue carries its own unsubscribe, and your address is used for nothing else.',
};