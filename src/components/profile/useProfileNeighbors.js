import { useEffect, useState } from 'react';
import { getAdjacentNomineeIds } from '@/functions/getAdjacentNomineeIds';

// Resolves same-discipline sibling Fellows + prev/next via a lightweight
// backend endpoint (one tiny payload) instead of fetching 100 nominees to
// the browser. Governance-safe: the endpoint only returns public fields and
// never reads score/payment/availability data.
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
        const res = await getAdjacentNomineeIds({ nomineeId: nominee.id });
        if (cancelled) return;
        const d = res?.data || {};
        setData({
          siblings: Array.isArray(d.siblings) ? d.siblings : [],
          prev: d.prev || null,
          next: d.next || null,
          loading: false,
        });
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