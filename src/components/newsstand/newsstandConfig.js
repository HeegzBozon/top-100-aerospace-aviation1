import { C } from '@/components/crm/crmConfig';

// The stand, read the way a reader walks past it: the volumes the house has bound and the
// pieces that ran inside them; the issues — every honoree as a spotlight of their own, and
// the newsletter's own run; and the notes kept by the door, the wire on one side and what the
// platform shipped on the other.
export const NEWSSTAND_TABS = [
  { key: 'volumes', label: 'Volumes', subs: [] },
  {
    key: 'issues',
    label: 'Issues',
    subs: [
      { key: 'spotlights', label: 'Spotlights' },
      { key: 'articles', label: 'Articles' },
    ],
  },
  {
    key: 'notes',
    label: 'Notes',
    subs: [
      { key: 'linkedin', label: 'LinkedIn' },
      { key: 'release', label: 'Release notes' },
    ],
  },
];

// The stand opens on what the house is saying right now. The bound volumes keep their place
// on the rack behind it.
export const DEFAULT_TAB_KEY = 'notes';

export const RACKS = [
  {
    key: 'volumes',
    tab: 'volumes',
    label: 'The rack',
    kicker: 'Bound volumes',
    blurb: 'Every volume the house has bound and put on the stand, the live one first.',
    empty: 'The rack is being dressed. The next volume takes its place here the day it goes to press.',
  },
  {
    key: 'spotlights',
    tab: 'issues',
    sub: 'spotlights',
    label: 'The spotlights',
    kicker: 'Individual profiles',
    blurb: 'Each honoree, read on their own — the record a volume is built from.',
    empty: 'No spotlight is lit yet. The first honoree takes their page here with the next volume.',
  },
  {
    key: 'dispatches',
    tab: 'volumes',
    label: 'The dispatch stand',
    kicker: 'Blogs & field notes',
    blurb: 'Writing filed by Fellows themselves — dispatches, notes and field reports.',
    empty: 'The stand is quiet. Fellows file their dispatches here as they are written.',
  },
  {
    key: 'newsletter',
    tab: 'issues',
    sub: 'articles',
    label: 'The newsletter',
    kicker: 'Insights & Spotlights',
    blurb: 'Every issue the house has mailed since February 2022, newest first, as it went out.',
    empty: 'The first issue of the newsletter takes its place here the day it is mailed.',
  },
  {
    key: 'wire',
    tab: 'notes',
    sub: 'linkedin',
    label: 'Off the wire',
    kicker: 'LinkedIn',
    blurb: 'What the house is posting on its company page, newest first, as it goes out.',
    empty:
      'Nothing has gone out on the wire yet. A post from the house page prints here the day it is published.',
  },
  {
    key: 'release',
    tab: 'notes',
    sub: 'release',
    label: 'Release notes',
    kicker: 'What shipped',
    blurb: 'What the platform changed and shipped, pinned by the door, newest first.',
    empty: 'Nothing is pinned yet. Each release note goes up here the day it ships.',
  },
];

export const ISSUE_STATUS_LABELS = {
  published: 'On the stand',
  archived: 'The archive',
  preview: 'Preview edition',
  draft: 'At the press',
};

export const ARTICLE_TYPE_LABELS = {
  evergreen: 'Feature',
  profile: 'Profile',
  feature: 'Feature',
  results_reserved: 'Results',
};

export const POST_TYPE_LABELS = {
  dispatch: 'Dispatch',
  note: 'Note',
  photo: 'Photograph',
  quote: 'Quote',
  link: 'Reading',
  field_note: 'Field note',
};

export const dayLabel = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Newest first, on the first field the record actually carries.
export const byDateDesc = (...fields) => (a, b) => {
  const stamp = (row) => {
    for (const field of fields) {
      const time = row?.[field] ? new Date(row[field]).getTime() : NaN;
      if (!Number.isNaN(time)) return time;
    }
    return 0;
  };
  return stamp(b) - stamp(a);
};

// A bulletin's own text, boiled down to a line that can be set as a teaser.
export const firstLine = (text, max = 140) => {
  const plain = String(text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trimEnd()}…`;
};

export const rackFor = (key) => RACKS.find((rack) => rack.key === key) || RACKS[0];

export const STAND_INK = C;