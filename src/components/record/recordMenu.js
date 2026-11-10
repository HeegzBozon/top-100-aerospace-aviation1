import {
  BadgeCheck,
  CalendarClock,
  Eye,
  Lock,
  Mail,
  MessagesSquare,
  Settings2,
} from 'lucide-react';

// A Fellow's own record, as seven surfaces. The title screen holds the keys and each
// key opens the same surface with its checklist: what is in place, what is still
// missing, and one way to add it. Nothing here is compared with anyone else — the
// measure is the Fellow's own record, not their standing.
//
// Credentials stands where the business card stood: the card is one of three printings of
// the record, and the deck Pre-Flight hands over is the same deck, so the tool is named for
// the three and the card's own lines live in its checklist. The words that used to sit in
// the Data Room are the Interview; the room itself is for the four readers who open one.
export const RECORD_SURFACES = [
  {
    key: 'view',
    index: '01',
    label: 'View',
    hint: 'What a visitor reads when the record is opened',
    icon: Eye,
  },
  {
    key: 'credentials',
    index: '02',
    label: 'Credentials',
    hint: '',
    icon: BadgeCheck,
  },
  {
    key: 'dataroom',
    index: '03',
    label: 'Data Room',
    hint: 'What a founder, an investor, an employer or an employee is handed',
    icon: Lock,
  },
  {
    key: 'interview',
    index: '04',
    label: 'Interview',
    hint: 'The dossier, the portfolio, the flightography and the deck',
    icon: MessagesSquare,
  },
  {
    key: 'availability',
    index: '05',
    label: 'Availability',
    hint: 'What you are open to, and how you are reached',
    icon: CalendarClock,
  },
  {
    key: 'inbox',
    index: '06',
    label: 'Inbox',
    hint: 'Who has written to you',
    icon: Mail,
  },
  {
    key: 'account',
    index: '07',
    label: 'Account',
    hint: 'The choices the machine keeps for you',
    icon: Settings2,
  },
];

export const recordSurfaceFor = (key) =>
  RECORD_SURFACES.find((surface) => surface.key === key) || RECORD_SURFACES[0];

export const recordUrl = (key) => `/record?surface=${key}`;