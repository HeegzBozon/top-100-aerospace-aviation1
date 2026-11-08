import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

// The Fellow's own Crosscheck standings.
//
// This column used to offer a random draw from the field. It now reads the Fellow's own
// record back to them: the names their own pairwise judgments carried, best first. Only the
// ballots this Fellow cast are counted — no other member's weighing, no ranked-choice weight,
// no platform score — and no count is ever printed. The order is the standing; the words
// beside each name say why it stands where it does.
//
// Nothing here writes: not to the ballot, not to a score, not to anything the measure reads.
// A name reaches the manifest only when the Fellow adds it by hand.

const STANDING_LIMIT = 8;

const ORDINAL = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth'];

const label = (value) => String(value || '').replace(/_/g, ' ');

function reasonFor(place, person) {
  if (place === 1) {
    const field = label(person.discipline);
    return field
      ? `${field} — carried furthest in your own Crosscheck`
      : 'Carried furthest in your own Crosscheck';
  }
  const word = ORDINAL[place];
  return word ? `${word} in your own Crosscheck` : 'Carried through your Crosscheck';
}

export default function usePersonalStandings({ user, pool, excludeIds }) {
  const [state, setState] = useState({
    loading: true,
    standings: [],
    standingCount: 0,
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
      setState({ loading: false, standings: [], standingCount: 0, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));

    // One tally, taken server-side: the ballots this Fellow cast, counted by the name each
    // comparison carried. Test ballots walked by an administrator are held out.
    const tally = await base44.entities.PairwiseVote.aggregate({
      query: { voter_email: email, is_test: { $ne: true } },
      groupBy: 'winner_nominee_id',
    });

    const byId = new Map((poolRef.current || []).map((n) => [n.id, n]));
    const ranked = (tally?.rows || [])
      .filter((row) => row.winner_nominee_id && row.count > 0)
      // Pool-scoped: only a name standing in the open field can take a place here.
      .map((row) => ({ person: byId.get(row.winner_nominee_id), count: row.count }))
      .filter((row) => row.person)
      .sort(
        (a, b) =>
          b.count - a.count || (a.person.name || '').localeCompare(b.person.name || '')
      );

    // Equal carries share a standing rather than being split by the alphabet.
    let place = 0;
    let carried = null;
    const standings = ranked.map((row, index) => {
      if (row.count !== carried) {
        place = index + 1;
        carried = row.count;
      }
      return { ...row.person, place, reason: reasonFor(place, row.person) };
    });

    setState({
      loading: false,
      standings: standings.filter((p) => !excludeRef.current?.has(p.id)).slice(0, STANDING_LIMIT),
      standingCount: standings.length,
      error: null,
    });
  }, [email]);

  useEffect(() => {
    let alive = true;
    load().catch((e) => {
      if (!alive) return;
      setState({
        loading: false,
        standings: [],
        standingCount: 0,
        error: e?.message || 'Your Crosscheck standings could not be read.',
      });
    });
    return () => {
      alive = false;
    };
  }, [load, poolSize]);

  return { ...state, refresh: load };
}