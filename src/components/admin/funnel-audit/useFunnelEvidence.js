import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// The live half of the audit. One call, grouped by journey, read-only.
export default function useFunnelEvidence() {
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [evidence, setEvidence] = useState({});

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const res = await base44.functions.invoke('getFunnelEvidence', {});
      if (res?.data?.error) throw new Error(res.data.error);
      setEvidence(res?.data?.funnels || {});
      setState('ready');
    } catch (invokeError) {
      setError(invokeError?.response?.data?.error || invokeError?.message || 'The counters could not be read.');
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { evidence, state, error, reload: load };
}