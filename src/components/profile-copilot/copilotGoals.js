// The three goals the Copilot composes for. Both an opportunity and a deal are
// first-class here: neither is the fallback of the other.
export const COPILOT_GOALS = [
  {
    key: 'job',
    label: 'A job opportunity',
    kicker: 'The career move',
    blurb: 'Positioned for the next role you want to be considered for.',
    icon: 'Briefcase',
  },
  {
    key: 'deal',
    label: 'A business deal',
    kicker: 'The commercial case',
    blurb: 'Positioned to open a partnership, contract or commercial relationship.',
    icon: 'Handshake',
  },
  {
    key: 'general',
    label: 'My general profile',
    kicker: 'The standing presentation',
    blurb: 'A considered presentation of the record with no single ask.',
    icon: 'Compass',
  },
];

export const goalByKey = (key) => COPILOT_GOALS.find((g) => g.key === key) || null;

// Provenance labels. The distinction is the point of the copilot: what the
// platform can corroborate, and what is the member's own framing.
export const PROVENANCE = {
  verified: { label: 'Verified', hint: 'Corroborated by the platform' },
  submitted: { label: 'Your words', hint: "Your own framing, not independently verified" },
};