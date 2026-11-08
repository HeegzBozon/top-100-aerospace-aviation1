import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { MARKS_PER_SITTING } from '@/lib/ballotMeasurement';

// A set is written as one burst of comparison rows, all sharing a voter and a moment.
// The number of rows per set has differed across ballot versions, so the monitor reads
// sets by clustering rows rather than by dividing a total by a fixed figure.
const RECENT_ROWS = 60;
const SET_CLUSTER_MS = 5000;
const POLL_MS = 9000;
const PACE_WINDOW_MIN = 15;
const FEED_SETS = 6;

// A review is seven marks written against four records (see shared/ballotMeasurement.ts),
// so a Fellow's reviews are read back off their own rows. The rungs below are the ballot's
// own milestone list: signal progress is how deep the cohort's analysis runs, counted in
// Fellows who have passed each rung.
const SIGNAL_RUNGS = [10, 25, 50, 100, 250];

// A count is a number; a page is an object. Read either without asking which was sent.
const asCount = (value) => (typeof value === 'number' ? value : value?.count || 0);

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
//
// Every set cast by an administrator is stamped as a test, so the record holds two
// readings side by side. `scope` chooses which one is being read: 'community' is the
// Fellows' weighing, 'test' is the house's own walkthroughs. The two never mix in one
// figure — a test run is held out of measurement, and the monitor never blends them.
//
// The pool, the marks and the coverage all arrive from getBallotMeasurement, the same
// reading the selection desk is built on: one definition of a sitting, one pool, one
// coverage, so the two monitors cannot disagree. This hook only adds what is particular to
// the live feed — the rows themselves, and how many Fellows stand at each rung.
export default function useLiveBallotFeed(seasonId, refreshToken = 0, scope = 'community') {
  const isTestScope = scope === 'test';
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
  }, [seasonId, scope]);

  const load = useCallback(async () => {
    if (!seasonId) return;
    try {
      const since = new Date(Date.now() - PACE_WINDOW_MIN * 60000).toISOString();
      // The stamp the whole reading is cut on: one scope, one filter, every query.
      const stamped = isTestScope ? true : false;

      const [tallies, recent, pace, measured] = await Promise.all([
        base44.entities.PairwiseVote.aggregate({
          query: { season_id: seasonId, is_test: stamped },
          groupBy: 'voter_email',
        }),
        base44.entities.PairwiseVote.filter(
          { season_id: seasonId, is_test: stamped },
          { sort: '-created_date', limit: RECENT_ROWS }
        ),
        base44.entities.PairwiseVote.count({
          season_id: seasonId,
          is_test: stamped,
          created_date: { $gte: since },
        }),
        // The canonical reading: the cohort's pool, both lanes' marks, both lanes' coverage.
        base44.functions.invoke('getBallotMeasurement', { season_ids: [seasonId] }),
      ]);

      const measurement = measured?.data?.success ? measured.data : null;

      const voterRows = tallies?.rows || [];
      const voterReviews = voterRows.map((r) => Math.floor((r.count || 0) / MARKS_PER_SITTING));
      const rungs = SIGNAL_RUNGS.map((sets) => ({
        sets,
        reached: voterReviews.filter((n) => n >= sets).length,
      }));
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
        scope: isTestScope ? 'test' : 'community',
        voters: voterRows.length,
        // The lane's own marks, and the other lane's — never mixed in one figure.
        comparisons: Number(
          isTestScope ? measurement?.comparisons_test : measurement?.comparisons_live
        ) || 0,
        heldApart: Number(
          isTestScope ? measurement?.comparisons_live : measurement?.comparisons_test
        ) || 0,
        measurement,
        rungs,
        recentComparisons: asCount(pace),
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
  }, [seasonId, isTestScope]);

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