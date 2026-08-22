import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

// Loads bulletins authored by a Fellow for a given post_type, with realtime sync.
// create/update/delete operate on Bulletin; subscription auto-refreshes the list.
export function useBulletins(authorEmail, postType) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!authorEmail || !postType) { setLoading(false); return; }
    try {
      const res = await base44.entities.Bulletin.filter(
        { author_email: authorEmail, post_type: postType },
        '-created_date', 50
      );
      setItems((res || []).filter((b) => b.status !== 'archived'));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [authorEmail, postType]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!authorEmail) return;
    const unsub = base44.entities.Bulletin.subscribe(() => load());
    return unsub;
  }, [authorEmail, load]);

  const create = useCallback((payload) => base44.entities.Bulletin.create(payload), []);
  const update = useCallback((id, patch) => base44.entities.Bulletin.update(id, patch), []);
  const remove = useCallback((id) => base44.entities.Bulletin.delete(id), []);

  return { items, loading, create, update, remove, reload: load };
}