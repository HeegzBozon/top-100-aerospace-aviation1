// Where the code on the title screen points.
//
// The code is not nailed to one address. A Fellow hands over their card in a corridor,
// the edition on the floor of a show, or the archive when the talk turns to who was on
// last year's record — so the destination is the holder's to set, and it is remembered:
// the code standing on the title screen is always the one last chosen, and it is scanned
// from there without a tap.

const STORE = 'top100.share.destination';

export const SHARE_DESTINATIONS = [
  {
    key: 'card',
    label: 'My card',
    note: 'Your record, saved as a contact',
    path: (holder) => `/card/${holder.cardId}`,
    needsCard: true,
  },
  {
    key: 'edition',
    label: 'The edition',
    note: 'The published issue',
    path: () => '/women-2025',
  },
  {
    key: 'record',
    label: 'The record',
    note: 'Everyone named this cycle',
    path: () => '/Top100Women2025',
  },
  {
    key: 'viral',
    label: 'Viral posts',
    note: 'The series, as it runs',
    path: () => '/viralpost2026',
  },
  {
    key: 'archive',
    label: 'The archive',
    note: 'Past volumes, kept',
    path: () => '/volume-two-women',
  },
  {
    key: 'platform',
    label: 'The front door',
    note: 'The platform itself',
    path: () => '/',
  },
];

// A Fellow with no record behind the screen has no card to hand over, so that
// destination simply is not on offer; everything else prints the same.
export function availableDestinations(holder) {
  return SHARE_DESTINATIONS.filter((entry) => (entry.needsCard ? !!holder?.cardId : true));
}

export function resolveDestination(key, holder) {
  const list = availableDestinations(holder);
  return list.find((entry) => entry.key === key) || list[0];
}

export function shareUrl(key, holder) {
  const entry = resolveDestination(key, holder);
  return `${window.location.origin}${entry.path(holder || {})}`;
}

export function readStoredDestination() {
  try {
    return window.localStorage.getItem(STORE) || '';
  } catch {
    return '';
  }
}

export function storeDestination(key) {
  try {
    window.localStorage.setItem(STORE, key);
  } catch {
    /* a private window keeps no memory of the choice; the code still prints */
  }
}

// A program handed over from the menu — a share key on the title screen, pressed for one
// particular surface. It is written down rather than only carried in the navigation, so a
// badge put away in a room and worn again still carries the last program it was picked up
// for; choosing a destination on the badge forgets it.
const PROGRAM = 'top100.share.program';

export function readStoredProgram() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PROGRAM) || 'null');
    if (!parsed?.url) return null;
    return { url: parsed.url, label: parsed.label || '' };
  } catch {
    return null;
  }
}

export function storeProgram(program) {
  try {
    if (!program?.url) window.localStorage.removeItem(PROGRAM);
    else window.localStorage.setItem(PROGRAM, JSON.stringify({ url: program.url, label: program.label || '' }));
  } catch {
    /* a private window keeps no memory of the program; the badge still prints it now */
  }
}