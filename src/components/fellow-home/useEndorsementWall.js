import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

// Shared endorsement wall logic for the internal profile and the public profile.
export default function useEndorsementWall(ownerEmail, ownerNomineeId) {
  const [entries, setEntries] = useState([]);

  const refresh = useCallback(async () => {
    if (!ownerEmail) return;
    const wall = await base44.entities.Endorsement.filter({ nominee_email: ownerEmail }, '-created_date', 50).catch(() => []);
    setEntries((wall || []).filter((e) => e.kind === 'authored'));
  }, [ownerEmail]);

  useEffect(() => { refresh(); }, [refresh]);

  // Live updates while on the page
  useEffect(() => {
    if (!ownerEmail) return;
    return base44.entities.Endorsement.subscribe((event) => {
      if (event?.data?.nominee_email !== ownerEmail || event?.data?.kind !== 'authored') return;
      setEntries((prev) => {
        const rest = prev.filter((e) => e.id !== event.data.id);
        return event.type === 'delete' ? rest : [event.data, ...rest];
      });
    });
  }, [ownerEmail]);

  const submit = useCallback(async (body, me) => {
    await base44.entities.Endorsement.create({
      nominee_id: ownerNomineeId || ownerEmail,
      nominee_email: ownerEmail,
      endorser_email: me.email,
      kind: 'authored',
      body,
      author_name: me.full_name || me.email,
      author_avatar_url: me.avatar_url,
      author_headline: me.headline,
      moderation_status: 'pending',
    });
    await refresh();
  }, [ownerEmail, ownerNomineeId, refresh]);

  const approve = useCallback(async (id) => {
    await base44.entities.Endorsement.update(id, { moderation_status: 'approved' });
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, moderation_status: 'approved' } : e)));
  }, []);

  return { entries, submit, approve };
}