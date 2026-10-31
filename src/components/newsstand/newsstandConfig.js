import { C } from '@/components/crm/crmConfig';

// The stand, read the way a reader walks past it: the rack of bound editions first, then
// the folded sheets that came out of them, then the stand Fellows file their own writing
// at, and finally the board by the door where the house pins what it shipped.
export const RACKS = [
  {
    key: 'issues',
    label: 'The rack',
    kicker: 'Publications & issues',
    blurb: 'Every edition the house has bound and put on the stand.',
    empty: 'The rack is being dressed. The next edition takes its place here the day it goes to press.',
  },
  {
    key: 'articles',
    label: 'The folded sheets',
    kicker: 'Articles & features',
    blurb: 'The pieces that ran inside the editions, read in the issue they were printed in.',
    empty: 'No article has come off the press yet. The first feature lands here with its issue.',
  },
  {
    key: 'dispatches',
    label: 'The dispatch stand',
    kicker: 'Blogs & field notes',
    blurb: 'Writing filed by Fellows themselves — dispatches, notes and field reports.',
    empty: 'The stand is quiet. Fellows file their dispatches here as they are written.',
  },
  {
    key: 'notes',
    label: 'The noticeboard',
    kicker: 'Releases & platform notes',
    blurb: 'What we shipped, what changed, and what is being built next — pinned by the door.',
    empty: 'Nothing is pinned up yet. Release and platform notes appear here as they go out.',
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