import {
  BadgeCheck,
  CalendarClock,
  Lock,
  Mail,
  MessagesSquare,
  Settings2,
} from 'lucide-react';

// A Fellow's own profile, as six surfaces. The title screen holds the keys and each
// key opens the same surface with its checklist: what is in place, what is still
// missing, and one way to add it. Nothing here is compared with anyone else — the
// measure is the Fellow's own profile, not their standing.
//
// Credentials stands where the business card stood: the card is one of three printings of
// the profile, and the deck Pre-Flight hands over is the same deck, so the tool is named for
// the three and the card's own lines live in its checklist. The Interview is the profile
// itself — how it is read, the words it is made of and the documents behind it — so it
// carries the reading a visitor sees as well as the writing behind it. The Data Room is
// left to the four readers who open a room to read a file.
export const RECORD_SURFACES = [
  {
    key: 'credentials',
    index: '01',
    label: 'Credentials',
    hint: '',
    icon: BadgeCheck,
  },
  {
    key: 'interview',
    index: '02',
    label: 'Interview',
    hint: 'The profile as it is read, and the words and documents it is made of',
    icon: MessagesSquare,
  },
  {
    key: 'availability',
    index: '03',
    label: 'Availability',
    hint: 'What you are open to, and how you are reached',
    icon: CalendarClock,
  },
  {
    key: 'dataroom',
    index: '04',
    label: 'Data Room',
    hint: 'What a founder, an investor, an employer or an employee is handed',
    icon: Lock,
  },
  {
    key: 'inbox',
    index: '05',
    label: 'Inbox',
    hint: 'Who has written to you',
    icon: Mail,
  },
  {
    key: 'account',
    index: '06',
    label: 'Account',
    hint: 'The choices the machine keeps for you',
    icon: Settings2,
  },
];

export const recordSurfaceFor = (key) =>
  RECORD_SURFACES.find((surface) => surface.key === key) || RECORD_SURFACES[0];

export const recordUrl = (key) => `/record?surface=${key}`;