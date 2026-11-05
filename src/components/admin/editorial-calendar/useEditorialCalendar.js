import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// One call in, one whole calendar out. Every action goes through the same function so the
// ledger, the desk states and the standard can never be read from three different moments.
export default function useEditorialCalendar() {
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [data, setData] = useState({ issues: [], campaigns: [], standard: null, seeded: false });

  const call = useCallback(async (action, payload = {}) => {
    const res = await base44.functions.invoke('editorialCalendar', { action, ...payload });
    return res.data;
  }, []);

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      setData(await call('state'));
      setState('ready');
    } catch (loadError) {
      setError(loadError?.response?.data?.error || loadError?.message || 'The calendar could not be read.');
      setState('error');
    }
  }, [call]);

  useEffect(() => {
    load();
  }, [load]);

  const run = useCallback(
    async (action, payload) => {
      try {
        const result = await call(action, payload);
        await load();
        return { ok: true, result };
      } catch (actionError) {
        const message = actionError?.response?.data?.error || actionError?.message || 'That did not go through.';
        return { ok: false, message };
      }
    },
    [call, load],
  );

  return {
    state,
    error,
    ...data,
    reload: load,
    seed: () => run('seed'),
    saveIssue: (id, patch) => run('save_issue', { id, patch }),
    stageDesk: (issue_id, desk) => run('stage_desk', { issue_id, desk }),
    saveCampaign: (payload) => run('save_campaign', payload),
    draftLetter: (issue_id) => run('draft_letter', { issue_id }),
    saveStandard: (standard) => run('save_standard', { standard }),
  };
}