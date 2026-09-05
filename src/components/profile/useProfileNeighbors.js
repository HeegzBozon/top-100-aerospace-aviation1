import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Resolves same-discipline sibling Fellows + prev/next within that discipline
// for on-profile internal linking. Sorted alphabetically by name (stable, and
// governance-safe — never reads score/payment/availability fields). Keeps the
// fetch scoped to one discipline instead of loading the whole directory.
const PUBLIC_STATUSES = ['active', 'approved', 'winner', 'finalist'];

export default function useProfileNeighbors(nominee) {
  const [data, setData] = useState({ siblings: [], prev: null, next: null, loading: true });

  useEffect(() => {
    if (!nominee?.id || !nominee?.discipline) {
      setData({ siblings: [], prev: null, next: null, loading: false });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const list = await base44.entities.Nominee.filter(
          { discipline: nominee.discipline },
          'name',
          100
        );
        if (cancelled) return;
        const publicList = (list || []).filter((n) => PUBLIC_STATUSES.includes(n.status));
        const idx = publicList.findIndex((n) => n.id === nominee.id);
        const prev = idx > 0 ? publicList[idx - 1] : null;
        const next = idx >= 0 && idx < publicList.length - 1 ? publicList[idx + 1] : null;
        const siblings = publicList.filter((n) => n.id !== nominee.id).slice(0, 4);
        setData({ siblings, prev, next, loading: false });
      } catch {
        if (!cancelled) setData({ siblings: [], prev: null, next: null, loading: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nominee?.id, nominee?.discipline]);

  return data;
}