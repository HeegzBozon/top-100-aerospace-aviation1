import { Compass, Landmark, Users } from 'lucide-react';

// THE THREE APPLICATIONS THE CONFERENCES MACHINE RUNS.
//
// One launcher, three doors. The circuit is an index of what is ahead; the room is
// where a Fellow stands in it; the desk is where a host sets the show. Declared once
// and read by the launcher, the chrome every micro-app wears, and nothing else — so
// an application is added here once and is reachable from all three places.
//
// The printed index is the number the radio's keypad types: press 2 and the Attend
// application opens. Never reorder without reprinting, and never let a key's number
// stand for anything but its own door.
export const CONFERENCE_APPS = [
  {
    key: 'discover',
    index: '01',
    label: 'Discover',
    short: 'Discover',
    title: 'Discover the circuit',
    blurb: 'Every conference the network holds rooms in, in date order.',
    to: '/conferences/discover',
    icon: Compass,
    accent: '#c9a87c',
  },
  {
    key: 'attend',
    index: '02',
    label: 'Attend & Network',
    short: 'Attend',
    title: 'Stand in the room',
    blurb: 'What you have declared, and the Fellows standing in it with you.',
    to: '/conferences/attend',
    icon: Users,
    accent: '#b87333',
  },
  {
    key: 'host',
    index: '03',
    label: 'Host & Facilitate',
    short: 'Host',
    title: 'Run the room',
    blurb: 'Stage a conference, set the run of show, say what is live now.',
    to: '/conferences/host',
    icon: Landmark,
    accent: '#7a8fa6',
  },
];

export const CONFERENCE_LAUNCH_HREF = '/conferences';

export const conferenceApp = (key) => CONFERENCE_APPS.find((app) => app.key === key) || null;