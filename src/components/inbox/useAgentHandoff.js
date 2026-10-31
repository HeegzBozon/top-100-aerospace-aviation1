import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// The one handoff open for a thread: handed over, drafted by the Superagent, then used or set aside.
export default function useAgentHandoff(sourceKey) {
  const [handoff, setHandoff] = useState(null);
  const [status, setStatus] = useState('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const rows = await base44.entities.AgentHandoff.filter(
        { source_key: sourceKey, status: { $in: ['requested', 'drafted'] } }, '-created_date', 1);
      setHandoff(rows[0] || null);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [sourceKey]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => base44.entities.AgentHandoff.subscribe((e) => {
    if (e.data?.source_key === sourceKey) setHandoff(['requested', 'drafted'].includes(e.data.status) ? e.data : null);
  }), [sourceKey]);

  const handOver = async (payload) => setHandoff(await base44.entities.AgentHandoff.create({ source_key: sourceKey, status: 'requested', ...payload }));
  const close = async (next) => {
    await base44.entities.AgentHandoff.update(handoff.id, { status: next });
    setHandoff(null);
  };

  return { handoff, status, reload: load, handOver, close };
}