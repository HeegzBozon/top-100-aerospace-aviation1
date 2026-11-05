// The opening card, and the links that already know where they are going.
//
// Every load opens the way a game opens: the Colony plate with Start and the Main
// Menu, then the title card. That is right for someone arriving at the house. It is
// wrong for a promoted link: /vote is sent to a person in a post or a message, and its
// whole promise is that it lands on the ballot. Standing the plate in front of it makes
// the invitation a detour through a menu it never asked for.
//
// So a direct-entry route retires the opening for the session: the card is not drawn,
// and the plate is marked seen as well, so it cannot follow them in on the next tap.

const BOOT_KEY = 'colony-boot-seen';

// The routes that carry their own door. Anchored on the whole path so nothing else can
// borrow them by accident.
const DIRECT_ENTRY = [/^\/vote$/i];

function currentPath() {
  try {
    const path = window.location.pathname.replace(/\/+$/, '');
    return path || '/';
  } catch {
    return '/';
  }
}

// Whether the surface the reader asked for answers for itself.
export function takesOwnDoor() {
  const path = currentPath();
  return DIRECT_ENTRY.some((pattern) => pattern.test(path));
}

// The plate is spent: this visitor did not come in through it, so it must not appear
// over the surface they did come in on.
export function retireOpening() {
  try {
    sessionStorage.setItem(BOOT_KEY, '1');
  } catch {
    // A browser in private mode has no storage. The card is simply skipped this load.
  }
}