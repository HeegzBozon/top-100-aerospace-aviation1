import { C } from '@/components/crm/crmConfig';

// The stand, read the way a reader walks past it: the volumes the house has bound, the
// issues mailed out of them, and the notes it keeps by the door — the wire on one side and
// what the platform shipped on the other.
export const NEWSSTAND_TABS = [
  { key: 'volumes', label: 'Volumes' },
  { key: 'issues', label: 'Issues' },
  { key: 'notes', label: 'Notes' },
];

export const RACKS = [
  {
    key: 'editions',
    tab: 'volumes',
    label: 'The rack',
    kicker: 'Publications & volumes',
    blurb: 'Every edition the house has bound and put on the stand.',
    empty: 'The rack is being dressed. The next edition takes its place here the day it goes to press.',
  },
  {
    key: 'articles',
    tab: 'volumes',
    label: 'The folded sheets',
    kicker: 'Articles & features',
    blurb: 'The pieces that ran inside the volumes, read in the issue they were printed in.',
    empty: 'No article has come off the press yet. The first feature lands here with its issue.',
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
    label: 'The archive',
    kicker: 'The newsletter · 41 issues',
    blurb:
      'Insights and Spotlights, mailed weekly since February 2022 — every issue, newest first, as it went out.',
    empty: 'The first issue of the newsletter takes its place here the day it is mailed.',
  },
  {
    key: 'wire',
    tab: 'notes',
    label: 'Off the wire',
    kicker: 'LinkedIn',
    blurb: 'What the house is posting on its company page, newest first, as it goes out.',
    empty:
      'Nothing has gone out on the wire yet. A post from the house page prints here the day it is published.',
  },
  {
    key: 'release',
    tab: 'notes',
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