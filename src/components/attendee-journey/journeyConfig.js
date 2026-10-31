// The attendee journey, read on the house's terms.
//
// Every choice a Fellow makes here is a curated variant, never a free field: the
// relationship a contact is, how warm the conversation was, and where the relationship
// stands afterwards are all chosen from a short approved set. Nothing in this file, and
// nothing it is used to write, is ever read by discovery, directory ordering,
// measurement, or scoring — it is the Fellow's own record of their own show.

export const B = {
  navy: '#1e3a5a',
  navyDeep: '#16293f',
  gold: '#c9a87c',
  copper: '#b87333',
  cream: '#faf8f5',
  sand: '#efe7dc',
  border: 'rgba(30,58,90,0.12)',
  muted: 'rgba(30,58,90,0.58)',
};

export const MAX_OUTCOMES = 3;

export const PRIORITIES = [
  { key: 'must_meet', label: 'Must meet' },
  { key: 'nice_to_meet', label: 'Nice to meet' },
];

export const TARGET_STATUS = [
  { key: 'pending', label: 'Pending' },
  { key: 'met', label: 'Met' },
  { key: 'missed', label: 'Missed' },
];

export const RELATIONSHIP_TYPES = [
  { key: 'investor', label: 'Investor' },
  { key: 'customer', label: 'Customer' },
  { key: 'hire', label: 'Hire' },
  { key: 'partner', label: 'Partner' },
  { key: 'supplier', label: 'Supplier' },
  { key: 'mentor', label: 'Mentor' },
  { key: 'press', label: 'Press' },
  { key: 'peer', label: 'Peer' },
];

export const HEAT = [
  { key: 'hot', label: 'Hot', hint: 'Asked for the next step' },
  { key: 'warm', label: 'Warm', hint: 'Real interest' },
  { key: 'cool', label: 'Cool', hint: 'Polite only' },
];

export const OUTCOMES = [
  { key: 'none', label: 'No outcome yet' },
  { key: 'meeting', label: 'Meeting held' },
  { key: 'opportunity', label: 'Opportunity' },
  { key: 'network', label: 'Network only' },
  { key: 'dormant', label: 'Dormant' },
  { key: 'won', label: 'Won' },
  { key: 'lost', label: 'Lost' },
];

export const labelOf = (set, key) => (set.find((item) => item.key === key) || {}).label || '';

// A declaration is listed unless its owner has explicitly held it private. A private
// declaration never reaches a roster, a target list, or anyone else's screen.
export const isListed = (rsvp) => (rsvp?.visibility || 'listed') === 'listed';

// The same RFC-ish gate the rest of the house uses: garbage is refused at the source.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const emailLooksReal = (value) => !value || EMAIL_SHAPE.test(String(value).trim());

export const isEmail = (value) => !!value && EMAIL_SHAPE.test(String(value).trim());

export const firstNameOf = (name) => String(name || '').trim().split(/\s+/)[0] || 'there';

const sentence = (text) => {
  const clean = String(text || '').trim().replace(/[.]+$/, '');
  return clean ? `${clean}.` : '';
};

// The follow-up, drafted from what the Fellow actually captured: the note they wrote,
// the thing they promised, and the step they agreed. It is a draft the Fellow edits and
// sends from their own account — the platform never sends anything.
export const composeFollowUp = (contact, fellowName) => {
  if (!contact) return '';
  const show = contact.conference_name || 'the show';
  const lines = [`${firstNameOf(contact.full_name)}, good to meet you at ${show}.`];

  if (contact.notes) {
    lines.push(`I made a note of what you're working on: ${sentence(contact.notes)}`);
  }
  if (contact.promise) {
    lines.push(`As promised, ${sentence(contact.promise)}`);
  }
  if (contact.next_step) {
    lines.push(`Next: ${sentence(contact.next_step)}`);
  }
  lines.push('When you are ready, reply here and we will pick it up.');

  return `${lines.join('\n\n')}\n\n${fellowName || ''}`.trim();
};

export const mailtoHref = (contact, draft) => {
  const subject = encodeURIComponent(`${contact?.conference_name || 'Good to meet you'}`);
  const body = encodeURIComponent(draft || '');
  return `mailto:${contact?.email || ''}?subject=${subject}&body=${body}`;
};

// ── The capture queue ────────────────────────────────────────────────────────────────
// A capture is the one thing that must not be lost to a dead line on a show floor. If the
// room has no signal the row is held on this device and written the moment it is back.
const queueKey = (roomId) => `cfo:capture:${roomId}`;

export const readQueue = (roomId) => {
  try {
    const raw = window.localStorage.getItem(queueKey(roomId));
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const writeQueue = (roomId, list) => {
  try {
    window.localStorage.setItem(queueKey(roomId), JSON.stringify(list));
  } catch {
    // A device that refuses storage keeps the row in the form instead; nothing else breaks.
  }
};

export const enqueueCapture = (roomId, row) => {
  const next = [...readQueue(roomId), row];
  writeQueue(roomId, next);
  return next.length;
};

export const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;