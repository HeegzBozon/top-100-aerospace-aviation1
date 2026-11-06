import { useEffect, useState } from 'react';
import { getLivePresence } from '@/functions/getLivePresence';

// The reading of this minute: who is signed in and standing on the platform, and who is on
// the campus floor. Taken again once a minute while the surface is on the glass, and never
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
        if (!res?.data) {
          setState('error');
          return;
        }
        setData(res.data);
        setState('ready');
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
    people: data?.people || null,
    campus: data?.campus || null,
    readAt: data?.readAt ? new Date(data.readAt) : null,
  };
}