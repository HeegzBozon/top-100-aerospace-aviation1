import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

// A set is written as one burst of comparison rows, all sharing a voter and a moment.
// The number of rows per set has differed across ballot versions, so the monitor reads
// sets by clustering rows rather than by dividing a total by a fixed figure.
const RECENT_ROWS = 60;
const SET_CLUSTER_MS = 5000;
const POLL_MS = 9000;
const PACE_WINDOW_MIN = 15;
const FEED_SETS = 6;

// A set is seven rows written in one call, so they share a voter and arrive together.
function groupSets(rows) {
  const ordered = [...rows].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  const sets = [];
  for (const row of ordered) {
    const at = new Date(row.created_date).getTime();
    const open = sets[sets.length - 1];
    if (open && open.voter_email === row.voter_email && at - open.at < SET_CLUSTER_MS) {
      open.rows.push(row);
      continue;
    }
    sets.push({
      key: row.id,
      voter_email: row.voter_email,
      voter_role: row.voter_role,
      is_test: Boolean(row.is_test),
      at,
      created_date: row.created_date,
      rows: [row],
    });
  }
  return sets;
}

// The first-place and last-place nominee of a set, read back off its own comparisons:
// whoever wins most often stood first, whoever loses most often stood last.
function anchorsOf(rows) {
  const wins = {};
  const losses = {};
  for (const row of rows) {
    wins[row.winner_nominee_id] = (wins[row.winner_nominee_id] || 0) + 1;
    losses[row.loser_nominee_id] = (losses[row.loser_nominee_id] || 0) + 1;
  }
  const first = Object.entries(wins).sort((a, b) => b[1] - a[1])[0];
  const last = Object.entries(losses).sort((a, b) => b[1] - a[1])[0];
  return { top: first ? first[0] : null, bottom: last ? last[0] : null };
}

// The counting cohort's ballots as they land. Read only, admins only: the feed watches
// the record, it never writes to it.
export default function useLiveBallotFeed(seasonId, refreshToken = 0) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(seasonId));
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    setData(null);
    setError(null);
    setLoading(Boolean(seasonId));
  }, [seasonId]);

  const load = useCallback(async () => {
    if (!seasonId) return;
    try {
      const since = new Date(Date.now() - PACE_WINDOW_MIN * 60000).toISOString();
      const [tallies, recent, pace] = await Promise.all([
        base44.entities.PairwiseVote.aggregate({
          query: { season_id: seasonId, is_test: false },
          groupBy: 'voter_email',
        }),
        base44.entities.PairwiseVote.filter(
          { season_id: seasonId },
          { sort: '-created_date', limit: RECENT_ROWS }
        ),
        base44.entities.PairwiseVote.count({
          season_id: seasonId,
          is_test: false,
          created_date: { $gte: since },
        }),
      ]);

      const voterRows = tallies?.rows || [];
      const comparisons = voterRows.reduce((sum, r) => sum + (r.count || 0), 0);
      const feed = groupSets(recent?.items || [])
        .reverse()
        .slice(0, FEED_SETS)
        .map((set) => ({ ...set, ...anchorsOf(set.rows) }));

      const ids = [...new Set(feed.flatMap((set) => [set.top, set.bottom]).filter(Boolean))];
      const names = {};
      if (ids.length) {
        const people = await base44.entities.Nominee.filter({ id: { $in: ids } });
        (Array.isArray(people) ? people : people.items || []).forEach((p) => { names[p.id] = p.name; });
      }

      if (!mounted.current) return;
      setData({
        voters: voterRows.length,
        comparisons,
        recentComparisons: typeof pace === 'number' ? pace : pace?.count || 0,
        feed: feed.map((set) => ({
          ...set,
          top_name: names[set.top] || null,
          bottom_name: names[set.bottom] || null,
        })),
      });
      setError(null);
      setUpdatedAt(new Date());
    } catch (e) {
      if (mounted.current) setError(e?.message || 'The monitor could not read the record.');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    load();
  }, [load, refreshToken]);

  // The feed keeps itself current while the tab is being looked at, and stands still
  // when it is not.
  useEffect(() => {
    const tick = () => { if (!document.hidden) load(); };
    const timer = setInterval(tick, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  return { data, loading, error, updatedAt, refresh: load };
}