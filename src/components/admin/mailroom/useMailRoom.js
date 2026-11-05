import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// The desk's one reading. The audience sheet, the segments resolved against it and the
// arrivals by door all come back from a single call, so what the desk shows is one
// consistent picture rather than three counters read at three moments.
export default function useMailRoom() {
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async (term = '') => {
    setState((previous) => (previous === 'ready' ? 'refreshing' : 'loading'));
    setError('');
    try {
      const res = await base44.functions.invoke('mailRoomAudience', { search: term });
      if (res?.data?.error) throw new Error(res.data.error);
      setData(res.data);
      setState('ready');
    } catch (invokeError) {
      setError(
        invokeError?.response?.data?.error ||
          invokeError?.message ||
          'The audience could not be read.',
      );
      setState('error');
    }
  }, []);

  useEffect(() => {
    load('');
  }, [load]);

  const searchFor = (term) => {
    setSearch(term);
    load(term);
  };

  return { data, state, error, search, searchFor, reload: () => load(search) };
}