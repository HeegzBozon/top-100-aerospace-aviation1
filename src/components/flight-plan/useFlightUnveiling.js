import { useCallback, useEffect, useState } from 'react';

// ── A key that has just been unlocked ──
//
// The Flight Plan arrives with the office of Analyst, and the key that reaches it glows until
// it has actually been walked through — so the graduation leads somewhere on the visit it is
// announced, and the glow is not spent on a Fellow who never saw it. The mark is read per
// Fellow and kept on this device only: the contribution record is the record, this is a
// convenience so a key is not lit again on the next visit.
const markKey = (email) => (email ? `top100.flight-plan-seen.${email}` : null);

const readMark = (key) => {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
};

export default function useFlightUnveiling({ email, status, isAnalyst }) {
  const key = markKey(email);
  // Lit only once the standing is known: a key never glows on a guess.
  const [seen, setSeen] = useState(true);

  useEffect(() => {
    if (status !== 'ready' || !isAnalyst || !key) {
      setSeen(true);
      return;
    }
    setSeen(readMark(key));
  }, [status, isAnalyst, key]);

  const markSeen = useCallback(() => {
    if (key) {
      try {
        localStorage.setItem(key, '1');
      } catch {
        /* a convenience only: the standing itself lives on the contribution record */
      }
    }
    setSeen(true);
  }, [key]);

  return { glowing: status === 'ready' && Boolean(isAnalyst) && !seen, markSeen };
}