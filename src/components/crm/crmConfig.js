import { B } from '@/components/fellow-home/fellowHomeConfig';

// AeroSync CRM, in the institution's own voice: the navy, the cream, and the two
// metals — copper for structural rules, rose gold for the masthead. A contact is a
// card someone handed over at a show, so the surfaces read like paper.
export const C = {
  ...B,
  surface: '#ffffff',
  paper: '#fffdf9',
};

// The fields a captured card has to offer, in the order the form reads them. The card
// extraction fills exactly these, so a draft is never shaped differently from a contact
// typed in by hand.
export const PERSON_FIELDS = [
  { key: 'full_name', label: 'Name', placeholder: 'As it reads on the card', wide: true, required: true },
  { key: 'role_title', label: 'Role', placeholder: 'Head of Flight Operations' },
  { key: 'company', label: 'Organization', placeholder: 'Where they stand' },
  { key: 'email', label: 'Email', placeholder: 'name@organization.com', type: 'email' },
  { key: 'phone', label: 'Telephone', placeholder: '+1 …', type: 'tel' },
  { key: 'linkedin_url', label: 'LinkedIn', placeholder: 'linkedin.com/in/…' },
  { key: 'website', label: 'Site', placeholder: 'organization.com' },
  { key: 'city', label: 'City', placeholder: 'Toulouse' },
  { key: 'country', label: 'Country', placeholder: 'France' },
];

// The show, and the room inside it. A contact without these is a name out of context.
export const SHOW_FIELDS = [
  { key: 'conference_name', label: 'The show', placeholder: 'IAC 2026' },
  { key: 'met_on', label: 'Met on', type: 'date' },
  { key: 'met_context', label: 'Where in the show', placeholder: 'Exhibit hall, stand 214', wide: true },
];

// What a contact record is allowed to carry. A draft that came back from the card reader
// is shaped exactly like one typed by hand, and only these fields are ever written.
export const CONTACT_KEYS = [
  ...PERSON_FIELDS.map((field) => field.key),
  ...SHOW_FIELDS.map((field) => field.key),
  'first_name',
  'last_name',
  'notes',
  'next_step',
  'tags',
  'card_file_uri',
  'source',
];

export const TAG_SUGGESTIONS = [
  'Follow up',
  'Warm introduction',
  'Hiring',
  'Partnership',
  'Speaking',
  'Press',
  'Mentorship',
];

export const EMPTY_CONTACT = {
  full_name: '',
  first_name: '',
  last_name: '',
  role_title: '',
  company: '',
  email: '',
  phone: '',
  linkedin_url: '',
  website: '',
  city: '',
  country: '',
  conference_name: '',
  met_on: '',
  met_context: '',
  notes: '',
  next_step: '',
  tags: [],
  card_file_uri: '',
  source: 'manual',
};

// Case-insensitive server-side search, built from the term rather than typed around it.
export const asRegex = (text) => `(?i)${String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`;

// The RFC-ish gate: a garbage address is refused at the door, before it is saved.
export const isEmailShaped = (value) => /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(String(value || '').trim());

// A printed card rarely carries a scheme: a bare linkedin.com/in/… still has to open.
export const asHref = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const splitName = (full) => {
  const parts = String(full || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { first_name: parts[0] || '', last_name: '' };
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
};

export const initialsFor = (name) =>
  String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || '·';

export const metLine = (contact) =>
  [contact?.conference_name, contact?.met_on].filter(Boolean).join(' · ');

export const formatDay = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};