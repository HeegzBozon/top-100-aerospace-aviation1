import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMyTop100 } from '@/components/fellow-home/useMyTop100';
import { readHonoree } from './honoreeRecord';

// The Fellow's own list, written from wherever a name is kept.
//
// One press adds one entry to the list the Selection Committee already owns — the record a
// Fellow orders, and can submit as a ranked-choice ballot. Nothing here is a second list:
// a name kept in the edition's register is a name on that one list, and personal keeping
// carries no weight in measurement, in the index, or in anything the institution counts.
export default function useListEntry() {
  const [me, setMe] = useState(undefined);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    base44.auth
      .me()
      .then((user) => alive && setMe(user))
      .catch(() => alive && setMe(null));
    return () => {
      alive = false;
    };
  }, []);

  const { rankings, reload } = useMyTop100(me?.email);

  const positionOf = useCallback(
    (nomineeId) => (nomineeId ? rankings.findIndex((entry) => entry.nominee_id === nomineeId) + 1 : 0),
    [rankings],
  );

  const add = useCallback(
    async (entry = {}) => {
      if (!me) return { ok: false, reason: 'signed-out' };

      const record = await readHonoree(entry);
      if (!record.nomineeId) return { ok: false, reason: 'no-record' };
      if (positionOf(record.nomineeId)) return { ok: true, already: true, name: record.name };

      setBusy(true);
      try {
        const lists = await base44.entities.UserTop100List.filter({ user_email: me.email }, '-updated_date', 1);
        const list = lists?.[0] || null;
        const rankings_next = [
          ...(list?.rankings || []),
          {
            rank: (list?.rankings?.length || 0) + 1,
            nominee_id: record.nomineeId,
            nominee_name: record.name,
            nominee_title: record.title,
            nominee_company: record.company,
            nominee_avatar: record.avatar,
            nomination_category: 'women',
          },
        ];

        if (list) await base44.entities.UserTop100List.update(list.id, { rankings: rankings_next });
        else
          await base44.entities.UserTop100List.create({
            user_email: me.email,
            user_name: me.full_name || '',
            rankings: rankings_next,
          });

        await reload();
        return { ok: true, name: record.name, position: rankings_next.length };
      } catch {
        return { ok: false, reason: 'failed' };
      } finally {
        setBusy(false);
      }
    },
    [me, positionOf, reload],
  );

  return useMemo(
    () => ({ me, signedIn: !!me, count: rankings.length, positionOf, add, busy }),
    [me, rankings.length, positionOf, add, busy],
  );
}