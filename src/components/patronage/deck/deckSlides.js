import { AUDIENCE_FIGURES, BUNDLE, SLOT_CALENDAR, TIER_LABELS, day, money } from '../patronConfig';

// THE KIT, AS SIX SLIDES — the content of the deck and nothing else.
//
// The deck is a reading of the offer, never a second copy of it: the figures and the rates
// are drawn from the same config and the same live slot records the rate card below reads,
// so a slide can never quietly disagree with the page it stands on.

export const DECK_DWELL_MS = 6000;

export const DECK_SLIDES = [
  { key: 'hook', label: 'The firewall' },
  { key: 'shift', label: 'The shift' },
  { key: 'firewall', label: 'Attribution, never placement' },
  { key: 'audience', label: 'The audience' },
  { key: 'slots', label: 'The calendar' },
  { key: 'ask', label: 'Partner with us' },
];

export const LEGACY_CLAIMS = ['Inflated reach claims', 'Combined list totals', 'Paid rankings'];

export const VERIFIED_PROMISES = ['Published calendar', 'Unbundled transparency', 'Strict governance rules'];

export const FIREWALL_POINTS = [
  'No sponsor reviews editorial.',
  'Zero vote weight or index influence.',
  'Attribution as Patron of Record only.',
];

const figure = (key) => AUDIENCE_FIGURES.find((item) => item.key === key) || AUDIENCE_FIGURES[0];

// The three figures the page already prints, in the order the slide reads them.
export const DECK_FIGURES = ['subscribers', 'email', 'opens'].map(figure);

// Every priced slot carries the same bundle, so the slide lists it once and prints it thrice.
export const DECK_DELIVERABLES = BUNDLE.map((item) => item.label);

const PRICED_TIERS = ['founding', 'standard', 'flagship'];

const WHEN_UNSTAMPED = {
  founding: 'December issue',
  standard: '2027 calendar',
  flagship: 'December 31 annual issue',
};

// Live slot records first, the published calendar second — the same order of truth the rate
// card uses. A slot already in place is named rather than priced.
export function deckTiers(rows) {
  const source = Array.isArray(rows) && rows.length ? rows : SLOT_CALENDAR;
  return PRICED_TIERS.map((tier) => {
    const slot = source.find((row) => row.tier === tier) || SLOT_CALENDAR.find((row) => row.tier === tier) || {};
    return {
      tier,
      name: TIER_LABELS[tier],
      price: money(slot.rate_amount),
      when: slot.issue_date ? `Issue ${slot.issue_number} · ${day(slot.issue_date)}` : WHEN_UNSTAMPED[tier],
      placed: ['sold', 'delivered'].includes(slot.status),
    };
  });
}