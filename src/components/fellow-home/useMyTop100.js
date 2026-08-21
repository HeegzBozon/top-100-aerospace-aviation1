import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

// The viewer's My TOP 100 list, with nominee emails resolved for story matching.
export function useMyTop100(email) {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!email) return;
    try {
      const lists = await base44.entities.UserTop100List.filter({ user_email: email }, '-updated_date', 1);
      const base = lists?.[0]?.rankings || [];
      const ids = base.map((r) => r.nominee_id).filter(Boolean);
      const emailById = {};
      if (ids.length) {
        try {
          const noms = await base44.entities.Nominee.filter({ _id: { $in: ids } }, '-created_date', 200);
          (noms || []).forEach((n) => { if (n.nominee_email) emailById[n.id] = n.nominee_email; });
        } catch {
          // email resolution is best-effort; matching falls back to name/avatar.
        }
      }
      setRankings(base.map((r) => ({ ...r, email: emailById[r.nominee_id] || '' })));
    } catch {
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!email) return;
    const unsub = base44.entities.UserTop100List.subscribe(() => load());
    return unsub;
  }, [email, load]);

  return { rankings, loading, reload: load };
}