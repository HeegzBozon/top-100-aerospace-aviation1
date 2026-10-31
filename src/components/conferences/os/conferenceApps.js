import { CheckSquare, Compass, Handshake, Luggage } from 'lucide-react';

// THE FOUR STAGES THE CONFERENCES MACHINE RUNS: Plan, Pack, Lock In, Follow Up.
//
// One launcher, one journey. Plan is where a show is chosen (or staged) and the trip is
// booked; Pack, Lock In and Follow Up are worked inside the conference itself. Declared
// once and read by the launcher, the app bar and the File and Edit menus.
//
// The printed index is the number the radio's keypad types. Never reorder without
// reprinting.
export const CONFERENCE_APPS = [
  {
    key: 'plan',
    index: '01',
    label: 'Plan',
    short: 'Plan',
    title: 'Choose the show, book the trip',
    blurb: 'Discover or host a conference, then plan your stay.',
    to: '/conferences/plan',
    icon: Compass,
    accent: '#c9a87c',
  },
  {
    key: 'pack',
    index: '02',
    label: 'Pack',
    short: 'Pack',
    title: 'Get ready to go',
    blurb: 'The checklist that gets you to the floor prepared.',
    to: '/conferences/attend?stage=pack',
    icon: Luggage,
    accent: '#b87333',
  },
  {
    key: 'lockin',
    index: '03',
    label: 'Lock In',
    short: 'Lock In',
    title: 'Work the floor',
    blurb: 'Meet your targets and capture every conversation.',
    to: '/conferences/attend?stage=lockin',
    icon: CheckSquare,
    accent: '#c9a87c',
  },
  {
    key: 'follow',
    index: '04',
    label: 'Close',
    short: 'Close',
    title: 'Close the loop',
    blurb: 'Debrief, send what you promised, record the outcome.',
    to: '/conferences/attend?stage=follow',
    icon: Handshake,
    accent: '#7a8fa6',
  },
];

export const STAGE_KEYS = ['plan', 'pack', 'lockin', 'follow'];

export const CONFERENCE_LAUNCH_HREF = '/conferences';

export const conferenceApp = (key) => CONFERENCE_APPS.find((app) => app.key === key) || null;