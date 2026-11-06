import { useEffect, useState } from 'react';
import { getLivePresence } from '@/functions/getLivePresence';

// The reading of this minute: how many are on the site, and how many are standing on the
// campus floor. Taken again once a minute while the surface is on the glass, and never
// while the tab is put away — a hidden surface has no reader to report to.

const POLL_MS = 60 * 1000;

export default function useLivePresence() {
  const [state, setState] = useState('loading');
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const read = async () => {
      try {
        const res = await getLivePresence({});
        if (cancelled) return;
        setData(res?.data || null);
        setState(res?.data ? 'ready' : 'error');
      } catch {
        if (!cancelled) setState('error');
      }
    };

    read();
    const timer = setInterval(() => {
      if (!document.hidden) read();
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return {
    state,
    site: data?.site || null,
    campus: data?.campus || null,
    readAt: data?.readAt ? new Date(data.readAt) : null,
  };
}