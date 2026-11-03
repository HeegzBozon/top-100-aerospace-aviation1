import { useCallback, useEffect, useState } from 'react';
import { getUpcomingLaunches } from '@/functions/getUpcomingLaunches';

// The programme the theatre plays: one read, four states, and a key to ask again.
export default function useMissionFeed(limit = 6) {
  const [launches, setLaunches] = useState([]);
  const [state, setState] = useState('loading');
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    setNote('');
    try {
      const res = await getUpcomingLaunches({ limit });
      const data = res?.data || {};
      const list = Array.isArray(data.launches) ? data.launches : [];
      setLaunches(list);
      if (!list.length) {
        setState('empty');
        setNote(data.error ? 'The launch library is not answering. The programme returns as soon as it does.' : '');
      } else {
        setState('ready');
        setNote(data.stale ? 'Holding the last programme read from the launch library.' : '');
      }
    } catch {
      setLaunches([]);
      setState('error');
      setNote('The launch library could not be reached from here.');
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  return { launches, state, note, reload: load };
}