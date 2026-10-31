import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { loadKitSeed, rowToDraft } from './kitSeed';

function makeShareCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// The row written from a draft. Empty lines are dropped rather than stored, so an
// unfilled field prints nothing at all instead of a blank heading.
function draftToRow(draft) {
  return {
    nominee_id: draft.nominee_id || '',
    full_name: draft.full_name.trim(),
    headline: draft.headline.trim(),
    summary: draft.summary.trim(),
    location: draft.location.trim(),
    discipline: draft.discipline || '',
    photo_url: draft.photo_url || '',
    contact_email: draft.contact_email.trim(),
    evidence: draft.evidence
      .map((row) => ({ label: (row.label || '').trim(), detail: (row.detail || '').trim() }))
      .filter((row) => row.label || row.detail),
    links: draft.links
      .map((row) => ({ label: (row.label || '').trim(), url: (row.url || '').trim() }))
      .filter((row) => row.url),
  };
}

export default function usePressKit() {
  const { user, isLoadingAuth } = useAuth();
  const [state, setState] = useState('loading');
  const [row, setRow] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (isLoadingAuth) return undefined;
    let alive = true;
    if (!user?.email) {
      setState('signed-out');
      return undefined;
    }
    setState('loading');
    (async () => {
      try {
        const rows = await base44.entities.PressKit.filter({ owner_email: user.email }).catch(() => []);
        const existing = rows?.[0] || null;
        if (!alive) return;
        if (existing) {
          setRow(existing);
          setDraft(rowToDraft(existing));
          setState('ready');
          return;
        }
        const seed = await loadKitSeed(user);
        if (!alive) return;
        setRow(null);
        setDraft(seed);
        setState('ready');
      } catch {
        if (alive) setState('failed');
      }
    })();
    return () => {
      alive = false;
    };
  }, [isLoadingAuth, user?.email, attempt]);

  const save = useCallback(
    async (extra = {}) => {
      if (!draft || !user?.email) return null;
      setSaving(true);
      try {
        const payload = { ...draftToRow(draft), ...extra, owner_email: user.email };
        if (row?.id) {
          const next = await base44.entities.PressKit.update(row.id, payload);
          setRow(next);
          return next;
        }
        const created = await base44.entities.PressKit.create(payload);
        setRow(created);
        return created;
      } finally {
        setSaving(false);
      }
    },
    [draft, row?.id, user?.email],
  );

  // Publishing keeps the address durable: the code is minted once and reused, so a link
  // already in someone's inbox never stops working after a revision.
  const publish = useCallback(async () => {
    const shareCode = row?.share_code || makeShareCode();
    return save({
      status: 'published',
      share_code: shareCode,
      published_date: row?.published_date || new Date().toISOString(),
    });
  }, [row?.share_code, row?.published_date, save]);

  return {
    state,
    row,
    draft,
    setDraft,
    save,
    publish,
    saving,
    retry: () => setAttempt((n) => n + 1),
  };
}