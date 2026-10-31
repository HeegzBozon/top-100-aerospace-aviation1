import { sinceLabel, asHref } from '@/components/crm/crmConfig';
import { JOB_TYPE_LABELS, REMOTE_LABELS } from '@/components/chamber-jobs/jobBoardConfig';
import { CAPABILITY_LABELS, OFFERING_LABELS, availabilityOption } from '@/components/profile/intent/intentConfig';

// The board, and the three desks it is cut into. A Fellow's record carries two
// standing notices of its own — open to a move, open to a mandate — and the board
// prints them beside the roles and the notices others have put up. Nothing here is
// a marketplace: no price, no fee, no featured place, and no order that money or
// availability could change.
export const CHANNELS = [
  {
    key: 'positions',
    label: 'Offers',
    short: 'OFFER',
    digit: '1',
    kicker: 'Job & Career',
    blurb: 'Roles Fellows are filling, and Fellows who are open to a move.',
    empty: 'No offers on this desk. A Fellow puts one up when their team is hiring; the board is quiet until one does.',
  },
  {
    key: 'mandates',
    label: 'Term Sheets',
    short: 'TERMS',
    digit: '2',
    kicker: 'Deal & BD',
    blurb: 'Fellows open to a commercial engagement. Introductions are made privately, through their record.',
    empty: 'No one is standing open to a term sheet just now. Those notices are set by the Fellow on their own record.',
  },
  {
    key: 'open',
    label: 'Open board',
    short: 'OPEN',
    digit: '3',
    kicker: 'Anything else',
    blurb: 'Whatever else a Fellow puts up: collaborators, a desk, a paper, kit, a room at a show.',
    empty: 'The open board is empty. It takes anything that is not an offer and not a term sheet.',
  },
];

export const NOTICE_CATEGORIES = [
  { key: 'collaboration', label: 'Collaboration' },
  { key: 'resource', label: 'Resource' },
  { key: 'event', label: 'Event' },
  { key: 'opportunity', label: 'Opportunity' },
  { key: 'other', label: 'Something else' },
];

export const TYPE_TAGS = {
  role: 'Role',
  available: 'Open to work',
  mandate: 'Term sheet',
  notice: 'Notice',
};

const labelOf = (map, key) => map[key] || key;
const lower = (value) => String(value || '').toLowerCase();

const categoryLabel = (key) => labelOf(
  Object.fromEntries(NOTICE_CATEGORIES.map((item) => [item.key, item.label])),
  key,
);

// A role: a job on the Chamber's board, read as a classified.
const roleListing = (job) => ({
  key: `role-${job.id}`,
  type: 'role',
  title: job.title || 'Untitled role',
  meta: [job.company_name, job.location, REMOTE_LABELS[job.remote_policy]].filter(Boolean).join(' · '),
  sub: job.summary || '',
  body: job.description || '',
  tags: [JOB_TYPE_LABELS[job.job_type], ...(job.required_skills || []).slice(0, 4)].filter(Boolean),
  href: asHref(job.application_url) || (job.application_email ? `mailto:${job.application_email}` : ''),
  profileId: '',
  when: sinceLabel(job.posted_date || job.created_date),
  by: job.poster_name || '',
});

// A Fellow's own standing notice. Nothing on it is priced, and the desk never orders
// these by anything but the alphabet.
const personListing = (person, type) => {
  const hire = type === 'available';
  const availability = availabilityOption(
    hire ? 'hire' : 'commercial',
    hire ? person.hire_availability : person.commercial_engagements,
  );
  const chipMap = hire ? CAPABILITY_LABELS : OFFERING_LABELS;
  const chips = (hire ? person.hire_capabilities : person.commercial_offerings) || [];

  return {
    key: `${type}-${person.id}`,
    type,
    title: person.name || 'A Fellow',
    meta: [person.title, person.company, person.country].filter(Boolean).join(' · '),
    sub: (hire ? person.hire_pitch : person.commercial_pitch) || '',
    body: '',
    tags: [availability?.label, ...chips.slice(0, 4).map((chip) => labelOf(chipMap, chip))].filter(Boolean),
    href: '',
    profileId: person.id,
    when: '',
    by: '',
    avatarUrl: person.avatar_url || '',
  };
};

const noticeListing = (notice) => ({
  key: `notice-${notice.id}`,
  type: 'notice',
  title: notice.title || 'A notice',
  meta: [categoryLabel(notice.category), notice.place].filter(Boolean).join(' · '),
  sub: notice.summary || '',
  body: notice.body || '',
  tags: [],
  href: asHref(notice.link),
  profileId: '',
  when: sinceLabel(notice.created_date),
  by: notice.posted_by_name || '',
});

const matches = (item, term) =>
  !term ||
  lower([item.title, item.meta, item.sub, item.body, item.by, ...(item.tags || [])].join(' ')).includes(term);

// One channel's desks, in the order they print. Empty groups are dropped, so a desk
// with nothing standing on it simply is not drawn.
export function boardGroups(channel, board, search = '') {
  const term = lower(search).trim();
  const people = board.people || [];
  const keep = (items) => items.filter((item) => matches(item, term));

  const groups =
    channel === 'mandates'
      ? [
          {
            label: 'Open to a term sheet · alphabetical',
            items: people.filter((person) => person.modes?.commercial).map((person) => personListing(person, 'mandate')),
          },
        ]
      : channel === 'open'
        ? [{ label: 'Notices · newest first', items: (board.notices || []).map(noticeListing) }]
        : [
            { label: 'Roles open · newest first', items: (board.jobs || []).map(roleListing) },
            {
              label: 'Open to work · alphabetical',
              items: people.filter((person) => person.modes?.hire).map((person) => personListing(person, 'available')),
            },
          ];

  return groups.map((group) => ({ ...group, items: keep(group.items) })).filter((group) => group.items.length);
}

export const channelCounts = (board) => {
  const people = board.people || [];
  return {
    positions: (board.jobs || []).length + people.filter((person) => person.modes?.hire).length,
    mandates: people.filter((person) => person.modes?.commercial).length,
    open: (board.notices || []).length,
  };
};