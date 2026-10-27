import { useEffect, useState } from 'react';

// A reading, not a second session.
//
// The operator can look at the platform the way a visitor does without giving up the
// session they are signed in with: nothing is logged out, no token is touched, and the
// surfaces simply answer as if nobody were here. It is drawn on the menu bar, for an
// admin only, and it lasts as long as the tab does — a reload keeps it, closing the
// browser does not, so a Fellow can never be left standing in a view they forgot about.
const KEY = 'top100_view_as_visitor';

const listeners = new Set();
let previewing = read();

function read() {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function isViewingAsVisitor() {
  return previewing;
}

export function setViewingAsVisitor(next) {
  previewing = !!next;
  try {
    if (previewing) sessionStorage.setItem(KEY, '1');
    else sessionStorage.removeItem(KEY);
  } catch {
    // A browser that refuses to remember it simply forgets the reading on the next load.
  }
  listeners.forEach((fn) => fn(previewing));
}

// The whole machine is handed to the other reading the way it is handed anything: by
// coming up again on the front screen. That way no surface is left holding a standing
// that has just been put down — a page of the operator's own, opened in the record's
// name, would otherwise stay on the glass with nobody behind it.
export function toggleViewingAsVisitor() {
  setViewingAsVisitor(!previewing);
  window.location.assign('/');
}

export function useViewingAsVisitor() {
  const [value, setValue] = useState(previewing);

  useEffect(() => {
    const fn = (next) => setValue(next);
    listeners.add(fn);
    setValue(previewing);
    return () => listeners.delete(fn);
  }, []);

  return value;
}