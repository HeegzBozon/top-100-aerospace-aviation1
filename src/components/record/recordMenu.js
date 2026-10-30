import { CalendarClock, CreditCard, Eye, Lock, Mail, Settings2 } from 'lucide-react';

// A Fellow's own record, as six surfaces. The title screen holds the keys and each
// key opens the same surface with its checklist: what is in place, what is still
// missing, and one way to add it. Nothing here is compared with anyone else — the
// measure is the Fellow's own record, not their standing.
export const RECORD_SURFACES = [
  {
    key: 'view',
    index: '01',
    label: 'View',
    hint: 'What a visitor reads when the record is opened',
    icon: Eye,
  },
  {
    key: 'card',
    index: '02',
    label: 'Business Card',
    hint: 'Your card, ready to hand over',
    icon: CreditCard,
  },
  {
    key: 'dataroom',
    index: '03',
    label: 'Data Room',
    hint: 'Dossier, portfolio, flightography and the deck',
    icon: Lock,
  },
  {
    key: 'availability',
    index: '04',
    label: 'Availability',
    hint: 'What you are open to, and how you are reached',
    icon: CalendarClock,
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