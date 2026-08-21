import { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useMyConnections } from '@/components/fellow-home/useConnections';

const WINDOW_MS = 24 * 60 * 60 * 1000;

// Stories from the viewer + their connections, within the 24h window.
// Grouped by author so the bar shows one ring per person.
export function useStories(user) {
  const { accepted } = useMyConnections(user?.email);

  const emails = useMemo(() => {
    const set = new Set([user?.email].filter(Boolean));
    (accepted || []).forEach((c) => {
      set.add(c.requester_email === user.email ? c.recipient_email : c.requester_email);
    });
    return [...set];
  }, [accepted, user?.email]);

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!emails.length) return;
    try {
      const cutoff = Date.now() - WINDOW_MS;
      const res = await base44.entities.Story.filter({ author_email: { $in: emails } }, '-created_date', 100);
      const recent = (res || []).filter((s) => new Date(s.created_date).getTime() > cutoff);
      const map = new Map();
      recent.forEach((s) => {
        if (!map.has(s.author_email)) {
          map.set(s.author_email, { author: { email: s.author_email, name: s.author_name, avatar: s.author_avatar_url }, stories: [] });
        }
        map.get(s.author_email).stories.push(s);
      });
      setGroups([...map.values()]);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [emails.join(',')]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const unsub = base44.entities.Story.subscribe(() => load());
    return unsub;
  }, [load]);

  const create = async (mediaUrl, caption) => {
    await base44.entities.Story.create({
      author_email: user.email,
      author_name: user.full_name,
      author_avatar_url: user.avatar_url || '',
      media_url: mediaUrl,
      caption: (caption || '').slice(0, 200),
    });
  };

  return { groups, loading, create };
}