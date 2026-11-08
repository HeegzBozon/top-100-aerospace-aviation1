import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { followKey, followTarget, rowStandsFor } from '@/components/following/followRecord';

const rowsOf = (res) => (Array.isArray(res) ? res : res?.items || []);

// One-way follow state + toggle between a viewer and a target profile.
//
// The follow is held against the profile, so a record with no address on it can still be
// followed: the address the row carries is what the record can say about itself, never the
// condition of following at all.
export function useFollow(viewer, target = {}) {
  const viewerEmail = viewer?.email;
  const { profileId, email, stored } = followTarget(target);
  const key = followKey(target);
  const isSelf = !!viewerEmail && !!email && viewerEmail.toLowerCase() === email.toLowerCase();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!viewerEmail || !key || isSelf) return;
    try {
      const rows = rowsOf(await base44.entities.Follow.filter({ follower_email: viewerEmail }, '-created_date', 500));
      setFollowing(rows.some((row) => rowStandsFor(row, { id: profileId, nominee_email: stored })));
    } catch {
    }
  }, [viewerEmail, key, profileId, stored, isSelf]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!viewerEmail || !key || isSelf) return undefined;
    return base44.entities.Follow.subscribe(() => load());
  }, [viewerEmail, key, isSelf, load]);

  const toggle = async () => {
    setBusy(true);
    try {
      const rows = rowsOf(await base44.entities.Follow.filter({ follower_email: viewerEmail }, '-created_date', 500));
      const existing = rows.find((row) => rowStandsFor(row, { id: profileId, nominee_email: stored }));
      if (existing) {
        await base44.entities.Follow.delete(existing.id);
      } else {
        await base44.entities.Follow.create({
          follower_email: viewerEmail,
          follower_name: viewer?.full_name || '',
          follower_avatar_url: viewer?.avatar_url || '',
          following_email: stored,
          following_name: target?.name || '',
          following_avatar_url: target?.avatar || '',
          ...(profileId ? { following_profile_id: profileId } : {}),
        });
      }
    } finally {
      setBusy(false);
    }
  };

  return { following, busy, toggle };
}

// The same follow graph, read once for a whole column of names. A list of a hundred rows
// asks one question — which of these does the viewer already keep — rather than a hundred:
// each row derives its own state from the one answer.
export function useFollowedProfiles(viewer) {
  const viewerEmail = viewer?.email;
  const [rows, setRows] = useState([]);
  const [busyKey, setBusyKey] = useState('');

  const load = useCallback(async () => {
    if (!viewerEmail) {
      setRows([]);
      return;
    }
    try {
      setRows(rowsOf(await base44.entities.Follow.filter({ follower_email: viewerEmail }, '-created_date', 500)));
    } catch {
      setRows([]);
    }
  }, [viewerEmail]);

  useEffect(() => {
    load();
    if (!viewerEmail) return undefined;
    return base44.entities.Follow.subscribe(() => load());
  }, [viewerEmail, load]);

  const isFollowing = useCallback(
    (person = {}) => rows.some((row) => rowStandsFor(row, person)),
    [rows],
  );

  const toggle = useCallback(
    async (person = {}) => {
      const { profileId, stored } = followTarget(person);
      if (!viewerEmail || !(profileId || stored)) return;
      setBusyKey(followKey(person));
      try {
        const existing = rows.find((row) => rowStandsFor(row, person));
        if (existing) {
          await base44.entities.Follow.delete(existing.id);
        } else {
          await base44.entities.Follow.create({
            follower_email: viewerEmail,
            follower_name: viewer?.full_name || '',
            follower_avatar_url: viewer?.avatar_url || '',
            following_email: stored,
            following_name: person.name || '',
            following_avatar_url: person.avatar_url || person.avatar || '',
            ...(profileId ? { following_profile_id: profileId } : {}),
          });
        }
        await load();
      } finally {
        setBusyKey('');
      }
    },
    [rows, viewerEmail, viewer?.full_name, viewer?.avatar_url, load],
  );

  return { isFollowing, busyKey, toggle };
}

// The owner's follow graph: who they follow, and who follows them (their community).
export function useMyFollows(email) {
  const [following, setFollowing] = useState([]);
  const [community, setCommunity] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    try {
      const [asFollower, asFollowing] = await Promise.all([
        base44.entities.Follow.filter({ follower_email: email }, '-created_date', 500),
        base44.entities.Follow.filter({ following_email: email }, '-created_date', 500),
      ]);
      setFollowing(asFollower || []);
      setCommunity(asFollowing || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!email) return;
    const unsub = base44.entities.Follow.subscribe(() => load());
    return unsub;
  }, [email, load]);

  return { following, community, loading, reload: load };
}