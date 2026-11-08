// THE SPONSOR LOUNGES — two rooms, one offer.
//
// The Leadership Summit keeps a hosted briefing room; the Colony keeps an open table in the
// Networking Lounge. Both credit a Patron of Record, and neither belongs to one: nothing in
// either room is read by discovery, directory order, verification, measurement or scoring,
// and a patron's name moves no position in the index.
//
// Every word here is a default. An admin may override it from inside the room (one
// SponsorLounge row per room); a room with no row reads exactly as it is written below.

export const FIREWALL =
  'Attribution, never placement. No patron reviews the editorial, chooses a Fellow, or moves a position in the index.';

// The three ways a visitor can leave this room with something.
export const INTENTS = [
  {
    key: 'briefing',
    label: 'Book a briefing',
    interest: 'A briefing on the record',
    blurb: 'Thirty minutes on the record: who reads it, how attribution is counted, and what a slot would carry.',
    headline: 'Ask for a briefing',
    next:
      'A named person confirms a time within one business day. The reply carries the length of the call and who will be on it.',
  },
  {
    key: 'proposal',
    label: 'Request a proposal',
    interest: 'A proposal for the current cycle',
    blurb: 'Say which cycle and what outcome you are after. The reply is built from the published rate card.',
    headline: 'Ask for a proposal',
    next:
      'The reply arrives within one business day with the rate, the surfaces it covers and the agreement. Nothing is reserved until it is signed.',
  },
];

export const PATRONAGE_LABEL = 'Read the media kit';

export const LOUNGES = {
  summit: {
    key: 'summit',
    room: 'leadership-summit',
    label: 'The Patrons’ Lounge',
    eyebrow: 'Leadership Summit · the briefing room',
    headline: 'The conversation after the panel',
    welcome:
      'A room kept off the hall floor for the exchange that never fits on a stage: what the record is worth, who reads it, and how attribution is carried. Fellows and patrons sit at the same table, and nothing here is sold at the door.',
    agenda: [
      { key: 'record', label: 'The record', text: 'What is measured, what is verified, and what never enters a measurement at all.' },
      { key: 'reach', label: 'The reach', text: 'Who reads the index and the Volume, and how a reader becomes a Fellow.' },
      { key: 'attribution', label: 'The attribution', text: 'What a Patron of Record is credited with, and the firewall that keeps it out of the index.' },
    ],
    prompts: [
      { key: 'p1', label: 'Before a cycle', text: 'Which part of the record would your organisation need to see before it commits to a season?' },
      { key: 'p2', label: 'A credible introduction', text: 'What does a credible introduction look like from your side of the table?' },
      { key: 'p3', label: 'Worth repeating', text: 'What would make next season’s attribution worth renewing?' },
    ],
    zones: [],
    icebreakers: [],
    patron_name: '',
    patron_note: '',
    patronage_url: '/mediakit',
    handoff: { room: 'networking-lounge', label: 'Step across to the open table' },
  },
  networking: {
    key: 'networking',
    room: 'networking-lounge',
    label: 'The Patrons’ Table',
    eyebrow: 'Networking Lounge · the open table',
    headline: 'Pull up a chair',
    welcome:
      'An open table in the corner of the lounge, kept for anyone curious about how the institution is funded and what patronage actually carries. Sit down, say what you do, and ask. Nothing is assumed about your budget, and nobody joins a list they did not ask for.',
    agenda: [],
    prompts: [],
    zones: [
      { key: 'first', label: 'First season', text: 'New to the room, or to the platform. Start here and someone will introduce you.' },
      { key: 'expertise', label: 'Sharing expertise', text: 'Stand here if you have something to teach. The index is built on people who answer.' },
      { key: 'collaborate', label: 'Looking to collaborate', text: 'For the two of you who should already know each other.' },
      { key: 'curious', label: 'Curious about patronage', text: 'Ask what a Patron of Record is credited with, and what it is not.' },
    ],
    icebreakers: [
      'What did you fly, build or sign off on last?',
      'Which part of this industry is moving faster than its paperwork?',
      'Who belongs on next season’s index that nobody has named yet?',
      'What is the one measurement your organisation actually trusts?',
      'What should a stranger know about your work in one line?',
    ],
    patron_name: '',
    patron_note: '',
    patronage_url: '/mediakit',
    handoff: { room: 'leadership-summit', label: 'Take the briefing upstairs' },
  },
};

export const loungeDefault = (key) => LOUNGES[key] || LOUNGES.summit;