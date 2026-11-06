import { useEffect, useRef, useState } from 'react';

// Pull to refresh, for the phone's listings.
//
// The gesture is read from the touch itself rather than from a wrapper, because the
// picture on a handheld scrolls in the shell's own window (.hh-stage) — a container
// the page does not own. So the hook finds whichever element is actually scrolling
// under the thumb, and only answers when that element is already at its head.
const MAX_PULL = 108;
const THRESHOLD = 66;

function scrollParent(node) {
  let element = node instanceof Element ? node : null;
  while (element && element !== document.body) {
    const style = window.getComputedStyle(element);
    if (/(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight) {
      return element;
    }
    element = element.parentElement;
  }
  return document.scrollingElement || document.documentElement;
}

export default function usePullToRefresh(onRefresh) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const gesture = useRef({ startY: 0, active: false, target: null, distance: 0 });
  const busy = useRef(false);
  busy.current = refreshing;

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    // A phone only: the desk has its own keys, and a hand on a trackpad is not a thumb.
    if (!window.matchMedia('(max-width: 767px)').matches) return undefined;

    const onStart = (event) => {
      if (busy.current || event.touches.length !== 1) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      const scroller = scrollParent(target);
      if ((scroller?.scrollTop || 0) > 0) return;
      gesture.current = {
        startY: event.touches[0].clientY,
        active: true,
        target: scroller,
        distance: 0,
      };
    };

    const onMove = (event) => {
      const current = gesture.current;
      if (!current.active) return;
      const dy = event.touches[0].clientY - current.startY;
      if (dy <= 0) {
        current.distance = 0;
        setPull(0);
        return;
      }
      if ((current.target?.scrollTop || 0) > 0) {
        current.active = false;
        current.distance = 0;
        setPull(0);
        return;
      }
      // Half the travel, so the sheet answers the thumb instead of following it.
      const distance = Math.min(MAX_PULL, dy * 0.5);
      current.distance = distance;
      if (distance > 4 && event.cancelable) event.preventDefault();
      setPull(distance);
    };

    const onEnd = async () => {
      const current = gesture.current;
      if (!current.active) return;
      current.active = false;
      const reached = current.distance;
      current.distance = 0;
      setPull(0);
      if (reached < THRESHOLD || busy.current) return;
      setRefreshing(true);
      try {
        await Promise.all([
          Promise.resolve(onRefresh?.()).catch(() => {}),
          new Promise((resolve) => setTimeout(resolve, 600)),
        ]);
      } finally {
        setRefreshing(false);
      }
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd, { passive: true });
    window.addEventListener('touchcancel', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, [onRefresh]);

  return { pull, refreshing, ready: pull >= THRESHOLD };
}