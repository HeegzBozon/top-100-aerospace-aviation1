import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { COLONY_CAST, applyConfig } from '@/components/colony/colonyCast';

// The cast with admin overrides applied. Falls back to the built-in script if configs fail to load.
export default function useColonyCast() {
  const [configs, setConfigs] = useState({});
  const [status, setStatus] = useState('loading');
  const load = useCallback(() => {
    base44.entities.ColonyNpcConfig.list()
      .then(r => { setConfigs(Object.fromEntries(r.map(c => [c.npc_id, c]))); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, []);
  useEffect(load, [load]);

  const cast = useMemo(() => COLONY_CAST.map(c => applyConfig(c, configs[c.id])), [configs]);

  const save = useCallback(async (id, data, email) => {
    const cur = configs[id];
    const body = { ...data, updated_by: email, content_version: (cur?.content_version || 0) + 1 };
    const next = cur ? await base44.entities.ColonyNpcConfig.update(cur.id, body)
      : await base44.entities.ColonyNpcConfig.create({ npc_id: id, ...body });
    setConfigs(c => ({ ...c, [id]: next }));
  }, [configs]);

  return { cast, configs, status, save, reload: load };
}