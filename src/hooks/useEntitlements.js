import { useEffect, useState } from 'react';
import { checkEntitlements } from '@/functions/checkEntitlements';

const NONE = { pro: false, groundControl: false, archiveExport: false };

// What the signed-in member has paid for, read from the payment ledger once per surface.
export default function useEntitlements(enabled = true) {
  const [entitlements, setEntitlements] = useState(NONE);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    checkEntitlements({})
      .then((res) => {
        if (!alive || !res?.data) return;
        setEntitlements({
          pro: res.data.pro === true,
          groundControl: res.data.groundControl === true,
          archiveExport: res.data.archiveExport === true,
        });
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [enabled]);

  return { ...entitlements, loading };
}