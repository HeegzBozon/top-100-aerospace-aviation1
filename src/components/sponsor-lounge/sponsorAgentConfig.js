// THE SPONSOR LOUNGE — THE DESK THAT SELLS.
//
// The Networking Lounge is the room where a sponsorship is explained and quoted. It sells
// from the published media kit and nothing else: the same slot calendar, the same bundle,
// the same firewall, the same dated audience figures. A reader is asked one question — what
// are you trying to do — and given the one rung of the ladder that answers it, with the
// price, what it carries, and what it never buys.
//
// Nothing here is invented. A rate is read from SLOT_CALENDAR, a figure from
// AUDIENCE_FIGURES, a promise from BUNDLE. If the media kit changes, this room changes.

import {
  AUDIENCE_FIGURES,
  BUNDLE,
  FIREWALL_DUTIES,
  NOT_CLAIMED,
  SLOT_CALENDAR,
  TIER_LABELS,
  money,
  day,
} from '@/components/patronage/patronConfig';

// Each answer maps onto the desk's own vocabulary (INTERESTS in patronConfig), so the
// record the hand-raise writes is the interest the pitch actually made.
export const GOALS = [
  {
    key: 'reach',
    card: 'Reach the people who read it',
    aside: 'One issue, one post, one Volume credit.',
    tier: 'standard',
    fit: 'A first sponsorship, or a product with one thing to say.',
    pitch:
      'A standard slot puts your name in front of a readership that is already in aerospace, already verified, and already reading an issue to the end. It is the cheapest honest test of whether the record reaches your buyer.',
    label: 'Ask for the next open slot',
    headline: 'The next open slot',
    blurb: 'Eighteen standard slots run through 2027. Say which quarter you would want and the desk will hold nothing until you sign.',
    next: 'The reply arrives within one business day with the next open date, the ad close, and the rate on the card.',
    interest: 'The next open slot',
  },
  {
    key: 'flagship',
    card: 'Own the December 31 reveal',
    aside: 'The flagship: the one issue the year is read in.',
    tier: 'flagship',
    fit: 'A budget that can wait for the biggest read of the cycle.',
    pitch:
      'The December 31 issue is the annual: the reveal, the Volume, and the issue that gets forwarded outside the industry. A flagship slot sits inside it, labelled and set apart from the index.',
    label: 'Ask about the December 31 flagship',
    headline: 'The December 31 flagship',
    blurb: 'The flagship runs from $3,500 to $5,000. The ad close is set well ahead of the issue, because the issue is built as one object.',
    next: 'The reply arrives within one business day with the current flagship rate and what is still open inside the issue.',
    interest: 'The December 31 flagship',
  },
  {
    key: 'anchor',
    card: 'Be in the room all year',
    aside: 'The annual: the record, all four quarters.',
    tier: 'annual',
    fit: 'An organization that wants to be known as a patron, not seen once.',
    pitch:
      'An annual anchor is the only way to be credited across a full cycle: the Volume, every issue in the year, and the standing the record gives a name that keeps turning up. It is priced from $3,500 and built with the house.',
    label: 'Ask about a 2027 anchor',
    headline: 'A 2027 anchor',
    blurb: 'One conversation, drawn against 2027. It is the rung the desk would rather sell than four separate slots bought late.',
    next: 'The reply arrives within one business day with a proposed year, the surfaces it covers, and the agreement.',
    interest: 'A 2027 anchor',
  },
];

export const NOT_SURE = {
  label: 'Not sure yet — ask the desk',
  headline: 'Not sure yet',
  blurb: 'Say what you are trying to do in your own words. The desk will tell you which rung fits, or that none does.',
  next: 'A named person answers within one business day, and will say plainly if a sponsorship is the wrong instrument for what you want.',
  interest: 'Not sure yet',
};

// The rung this answer points at, read from the one slot calendar.
export const slotFor = (tier) => SLOT_CALENDAR.find((slot) => slot.tier === tier) || null;

export const rungLine = (slot) => {
  if (!slot) return '';
  const label = TIER_LABELS[slot.tier] || slot.tier;
  const date = slot.issue_date ? ` · ${day(slot.issue_date)}` : '';
  return `${label}${date}`;
};

// The whole offer, said once, under every recommendation.
export const CARRIES = BUNDLE;
export const NEVER_BUYS = FIREWALL_DUTIES;
export const HONEST_FIGURES = AUDIENCE_FIGURES;
export const NOT_CLAIMED_LINES = NOT_CLAIMED;
export const rateOf = (slot) => (slot ? money(slot.rate_amount) : 'Rate on request');
export const rateNoteOf = (slot) => slot?.rate_note || '';