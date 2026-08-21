import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

// One-way follow state + toggle between a viewer and a target Fellow.
export function useFollow(viewer, target) {
  const viewerEmail = viewer?.email;
  const targetEmail = target?.email;
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!viewerEmail || !targetEmail || viewerEmail === targetEmail) return;
    try {
      const res = await base44.entities.Follow.filter({ follower_email: viewerEmail, following_email: targetEmail });
      setFollowing(!!res?.length);
    } catch {
    }
  }, [viewerEmail, targetEmail]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!viewerEmail || !targetEmail) return;
    const unsub = base44.entities.Follow.subscribe(() => load());
    return unsub;
  }, [viewerEmail, targetEmail, load]);

  const toggle = async () => {
    setBusy(true);
    try {
      if (following) {
        const res = await base44.entities.Follow.filter({ follower_email: viewerEmail, following_email: targetEmail });
        await Promise.all((res || []).map((f) => base44.entities.Follow.delete(f.id)));
      } else {
        await base44.entities.Follow.create({
          follower_email: viewerEmail,
          follower_name: viewer?.full_name || '',
          follower_avatar_url: viewer?.avatar_url || '',
          following_email: targetEmail,
          following_name: target?.name || '',
          following_avatar_url: target?.avatar || '',
        });
      }
    } finally {
      setBusy(false);
    }
  };

  return { following, busy, toggle };
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