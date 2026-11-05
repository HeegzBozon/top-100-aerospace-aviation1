import { DISPATCH_ENTRY_POINTS } from '@/components/newsletter/dispatchConfig';

// THE MAIL ROOM'S VOCABULARY — one place the desk names what it reads.
//
// The field keys are not invented here: they are the six the shared resolver in
// base44/shared/audience.ts understands. A field this desk cannot resolve is never
// offered, so a segment can never be saved that the sender would read differently.

export const SEGMENT_FIELDS = [
  {
    field: 'source',
    label: 'Where they came from',
    options: [
      { value: 'member', label: 'Members of the record' },
      { value: 'subscriber', label: 'Dispatch readers' },
      { value: 'both', label: 'Both a member and a reader' },
    ],
  },
  {
    field: 'has_account',
    label: 'Holds an account',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    field: 'role',
    label: 'House role',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'user', label: 'Member' },
    ],
  },
  {
    field: 'entry_point',
    label: 'Met the Dispatch at',
    options: Object.entries(DISPATCH_ENTRY_POINTS).map(([value, config]) => ({
      value,
      label: config.label,
    })),
  },
  {
    field: 'joined_within_days',
    label: 'Joined within (days)',
    free: true,
    placeholder: '30',
  },
  {
    field: 'status',
    label: 'Dispatch standing',
    options: [
      { value: 'subscribed', label: 'Subscribed' },
      { value: 'unsubscribed', label: 'Unsubscribed' },
    ],
  },
  // Standing in the record, read off the pool: who has nominated, who the house has
  // printed in a volume, and who holds a record at all.
  {
    field: 'affiliation',
    label: 'Standing in the record',
    options: [
      { value: 'nominator', label: 'Has nominated' },
      { value: 'honoree', label: 'Printed in a volume' },
      { value: 'nominee', label: 'Holds a record in the pool' },
    ],
  },
  // The seasons themselves come from the desk's own reading, so a season added at the desk
  // is offerable here without a code change.
  { field: 'season_id', label: 'Appeared in', dynamic: 'seasons' },
  { field: 'season_year', label: 'Season year', dynamic: 'years' },
];

const FIELD_BY_KEY = Object.fromEntries(SEGMENT_FIELDS.map((entry) => [entry.field, entry]));

// A rule whose choices are read from the ledger rather than written here.
export function optionsFor(field, seasons = []) {
  if (field?.dynamic === 'seasons') return seasons.map((season) => ({ value: season.id, label: season.label }));
  if (field?.dynamic === 'years') {
    const years = Array.from(new Set(seasons.map((season) => season.year).filter(Boolean))).sort().reverse();
    return years.map((year) => ({ value: year, label: year }));
  }
  return field?.options || [];
}

function optionLabel(field, value, seasons = []) {
  const match = optionsFor(field, seasons).find((choice) => choice.value === String(value));
  return match?.label || String(value);
}

export const LEDGER_LABEL = {
  member: 'Member',
  subscriber: 'Reader',
  both: 'Member + reader',
};

// A segment in one line, so the desk can be read without opening the editor.
export function describeRules(rules = [], seasons = []) {
  const parts = (rules || [])
    .filter((rule) => rule?.field && String(rule?.value ?? '').trim() !== '')
    .map((rule) => {
      const field = FIELD_BY_KEY[rule.field];
      if (!field) return '';
      if (field.free) return `joined within ${rule.value} days`;
      const label = optionLabel(field, rule.value, seasons);
      if (field.dynamic === 'seasons') return `appeared in ${label.toLowerCase()}`;
      return `${field.label.toLowerCase()}: ${label.toLowerCase()}`;
    })
    .filter(Boolean);
  return parts.length ? parts.join(' · ') : 'Everyone the house can reach';
}

export const EMPTY_SECTION = { label: '', title: '', body: '', url: '' };

// The letter always opens as the same five parts. An editor fills it; they do not shape it.
export function emptyIssue(nextNumber = 1) {
  return {
    issue_no: nextNumber,
    issue_date: new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    kicker: 'The Dispatch · Weekly',
    headline: '',
    standfirst: '',
    sections: [
      { ...EMPTY_SECTION, label: 'Signal one' },
      { ...EMPTY_SECTION, label: 'Signal two' },
      { ...EMPTY_SECTION, label: 'Signal three' },
    ],
    quick_links: [],
    closing: '',
    cta_label: 'Read the record',
    cta_url: 'https://top100aero.space',
    segment_id: '',
  };
}

export const ISSUE_STATUS_TONE = {
  draft: '#c9a87c',
  sending: '#8fd3e8',
  sent: '#7ec89a',
  halted: '#f2a1a1',
};

export function issueStatusLabel(status) {
  if (status === 'sending') return 'posting';
  return status || 'draft';
}