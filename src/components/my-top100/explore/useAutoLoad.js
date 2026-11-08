import { useEffect, useState } from 'react';

// The roll reads on by itself.
//
// A sentinel stands at the foot of the list; when the window's own scroll brings it into
// view the next page is folded in. No key to press and nothing to watch for: the reading
// simply continues while a hand keeps moving down it, which is what a long roll is for.
//
// The observer is re-made whenever the reading or the page state changes, so it can never
// fire against a roll that has already reached its end.
export default function useAutoLoad({ rootRef, enabled, hasMore, onMore, watch }) {
  const [sentinel, setSentinel] = useState(null);

  // `watch` is the length of the reading. The observer is rebuilt every time a page lands,
  // so a sheet taller than what has been read so far keeps filling itself instead of
  // stopping on the first page because the sentinel never left the window.
  useEffect(() => {
    if (!enabled || !hasMore || !sentinel) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onMore();
      },
      { root: rootRef.current || null, rootMargin: '320px 0px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled, hasMore, onMore, rootRef, sentinel, watch]);

  return setSentinel;
}