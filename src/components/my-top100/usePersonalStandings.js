import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { MARKS_PER_SITTING } from '@/lib/ballotMeasurement';

// The Fellow's own Crosscheck standings.
//
// Read back from the record itself: the marks this Fellow's own sittings wrote, in one
// lane, for one season. Two tallies are taken server-side — the marks each name won, and
// the marks each name lost — because a sitting writes five marks over four cards. A name
// that always stood last wins nothing, so counting wins alone silently dropped a quarter of
// every sitting out of this reading, and the tail of the list never agreed with the sets the
// live monitor prints. Counting both halves keeps every card in the reading.
//
// Only the ballots this Fellow cast are read: no other member's weighing, no ranked-choice
// weight, no platform score. Nothing here writes — not to the ballot, not to a score.

const RETURN_LIMIT = 100;

const asCount = (value) => (typeof value === 'number' ? value : value?.count || 0);

export default function usePersonalStandings({
  user,
  pool,
  excludeIds,
  scope = 'community',
  seasonIds,
}) {
  const [state, setState] = useState({
    loading: true,
    standings: [],
    standingCount: 0,
    carried: 0,
    marks: 0,
    sittings: 0,
    otherLaneMarks: 0,
    error: null,
  });

  const poolRef = useRef(pool);
  poolRef.current = pool;
  const excludeRef = useRef(excludeIds);
  excludeRef.current = excludeIds;

  const poolSize = pool?.length || 0;
  const email = user?.email;

  const load = useCallback(async () => {
    if (!email) {
      setState({
        loading: false,
        standings: [],
        standingCount: 0,
        carried: 0,
        marks: 0,
        sittings: 0,
        otherLaneMarks: 0,
        error: null,
      });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));

    // The lane this column is reading, and the one it is not. A ballot cast by an
    // administrator is stamped as a test (see submitAnchorVote), so an operator's own
    // weighing stands in the test lane and nowhere else — read there, still never the
    // community's. The other lane is counted only so the column can say where a Fellow's
    // marks actually are when this one comes back empty.
    const lane = scope === 'test' ? true : { $ne: true };
    const otherLane = scope === 'test' ? { $ne: true } : true;
    // Ballots are stamped with the cohort season they were cast in (Angels, Women, Men),
    // never with the group season the surface is working in — so the column reads the
    // group and every cohort beneath it, the way the live monitor's measure does.
    const base = seasonIds?.length
      ? { voter_email: email, season_id: { $in: seasonIds } }
      : { voter_email: email };

    const [won, lost, marks, otherMarks] = await Promise.all([
      base44.entities.PairwiseVote.aggregate({
        query: { ...base, is_test: lane },
        groupBy: 'winner_nominee_id',
      }),
      base44.entities.PairwiseVote.aggregate({
        query: { ...base, is_test: lane },
        groupBy: 'loser_nominee_id',
      }),
      base44.entities.PairwiseVote.count({ ...base, is_test: lane }),
      base44.entities.PairwiseVote.count({ ...base, is_test: otherLane }),
    ]);

    const tally = new Map();
    const bump = (id, field, count) => {
      if (!id || !count) return;
      const entry = tally.get(id) || { id, wins: 0, losses: 0 };
      entry[field] += count;
      tally.set(id, entry);
    };
    (won?.rows || []).forEach((row) => bump(row.winner_nominee_id, 'wins', row.count || 0));
    (lost?.rows || []).forEach((row) => bump(row.loser_nominee_id, 'losses', row.count || 0));

    const rankedAll = [...tally.values()].sort(
      (a, b) => b.wins - a.wins || a.losses - b.losses || a.id.localeCompare(b.id)
    );

    // Names are read from the field already in hand; the few a Fellow weighed that are not
    // standing in it (an archived volume, a record now held back) are resolved by id, so a
    // name in the record is never missing from the reading.
    const byId = new Map((poolRef.current || []).map((n) => [n.id, n]));
    const wanted = rankedAll.slice(0, RETURN_LIMIT).map((row) => row.id);
    const missing = wanted.filter((id) => !byId.has(id));
    if (missing.length) {
      const res = await base44.entities.Nominee.filter({ id: { $in: missing } });
      const people = Array.isArray(res) ? res : res.items || [];
      people.forEach((p) => byId.set(p.id, p));
    }

    const ranked = rankedAll
      .map((row) => ({ ...row, person: byId.get(row.id) }))
      .filter((row) => row.person)
      .sort(
        (a, b) =>
          b.wins - a.wins ||
          a.losses - b.losses ||
          (a.person.name || '').localeCompare(b.person.name || '')
      );

    // Equal carries share a standing rather than being split by the alphabet.
    let place = 0;
    let carried = null;
    const standings = ranked.map((row, index) => {
      if (row.wins !== carried) {
        place = index + 1;
        carried = row.wins;
      }
      return {
        ...row.person,
        place,
        wins: row.wins,
        losses: row.losses,
        marks: row.wins + row.losses,
      };
    });

    const markCount = asCount(marks);
    setState({
      loading: false,
      standings: standings
        .filter((p) => !excludeRef.current?.has(p.id))
        .slice(0, RETURN_LIMIT),
      standingCount: standings.length,
      // Every name the record carries, in this field or out of it.
      carried: tally.size,
      marks: markCount,
      sittings: Math.round(markCount / MARKS_PER_SITTING),
      otherLaneMarks: asCount(otherMarks),
      error: null,
    });
  }, [email, scope, seasonIds?.join(',')]);

  useEffect(() => {
    let alive = true;
    load().catch((e) => {
      if (!alive) return;
      setState({
        loading: false,
        standings: [],
        standingCount: 0,
        carried: 0,
        marks: 0,
        sittings: 0,
        otherLaneMarks: 0,
        error: e?.message || 'Your Crosscheck standings could not be read.',
      });
    });
    return () => {
      alive = false;
    };
  }, [load, poolSize]);

  return { ...state, refresh: load };
}