import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const rows = (page) => (Array.isArray(page) ? page : page?.items || []);

// The board reads three sources, and reads each of them on its own: one desk failing
// must not take the other two off the glass. Only when all three come back empty-eyed
// does the board report itself closed.
export default function useClassifieds() {
  const [state, setState] = useState({ loading: true, error: '', jobs: [], people: [], notices: [] });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setState((current) => ({ ...current, loading: true, error: '' }));

    (async () => {
      const [jobs, desk, notices] = await Promise.allSettled([
        base44.entities.Job.filter({ status: 'active' }, { sort: '-posted_date', limit: 60 }),
        base44.functions.invoke('getTalentDesk', { mode: 'all' }),
        base44.entities.Classified.filter({ status: 'open' }, { sort: '-created_date', limit: 60 }),
      ]);
      if (!alive) return;

      const failed = [jobs, desk, notices].every((result) => result.status === 'rejected');
      setState({
        loading: false,
        error: failed ? 'The board could not be read just now.' : '',
        jobs: jobs.status === 'fulfilled' ? rows(jobs.value) : [],
        people: desk.status === 'fulfilled' ? desk.value?.data?.people || [] : [],
        notices: notices.status === 'fulfilled' ? rows(notices.value) : [],
      });
    })();

    return () => { alive = false; };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { ...state, reload };
}