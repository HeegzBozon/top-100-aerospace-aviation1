import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

// A suggestion is an invitation to look, never a placement. It is drawn from the sets a
// Fellow has already judged — the faces they advanced — and this file writes nothing: not
// to the ballot, not to a score, not to anything the measure reads. A suggested profile
// reaches a ballot only when the Fellow adds it.

const HISTORY_LIMIT = 400;
const SUGGESTION_LIMIT = 8;
const PER_DISCIPLINE = 3;

const DISCIPLINE_LABEL = {
  space_rd: 'Space R&D',
  commercial_aviation: 'Commercial Aviation',
  defense: 'Defense',
  manufacturing: 'Manufacturing',
  operations: 'Operations',
  engineering: 'Engineering',
  policy: 'Policy',
  entrepreneurship: 'Entrepreneurship',
};

export const disciplineLabel = (value) => DISCIPLINE_LABEL[value] || null;

const key = (value) => (value || '').toString().trim().toLowerCase();

function bump(map, k, by = 1) {
  if (!k) return;
  map.set(k, (map.get(k) || 0) + by);
}

// Why this profile is being shown, in words a reader can check against their own record.
function reasonFor(row, topDiscipline) {
  const label = disciplineLabel(row.person.discipline);
  if (label && topDiscipline && key(row.person.discipline) === topDiscipline) {
    return `${label} — the field you have advanced most`;
  }
  if (label && row.d) return `${label} — a field on your record`;
  if (row.c) return `Also ${row.person.country}`;
  return 'Close to the profiles you have advanced';
}

// One draw from the eligible field. Every draw is shuffled, so reading the column a second
// time shows more of who is out there rather than the same eight; the cap per discipline is
// what keeps it a short list instead of eight faces from one corner of the industry.
function draw(candidates, exclude) {
  const pool = candidates.filter((row) => !exclude?.has(row.person.id));
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const used = new Map();
  const out = [];
  for (const row of pool) {
    const discipline = key(row.person.discipline);
    if ((used.get(discipline) || 0) >= PER_DISCIPLINE) continue;
    used.set(discipline, (used.get(discipline) || 0) + 1);
    out.push({ ...row.person, reason: row.reason });
    if (out.length >= SUGGESTION_LIMIT) break;
  }
  return out;
}

export default function useBallotSuggestions({ user, pool, excludeIds }) {
  const [state, setState] = useState({ loading: true, suggestions: [], basis: [], judged: 0, error: null });
  const poolRef = useRef(pool);
  poolRef.current = pool;
  const poolSize = pool?.length || 0;
  const email = user?.email;
  // Every profile the record points at, kept so a fresh draw costs nothing to read.
  const candidatesRef = useRef([]);
  const excludeRef = useRef(excludeIds);
  excludeRef.current = excludeIds;

  const load = useCallback(async () => {
    if (!email) {
      setState({ loading: false, suggestions: [], basis: [], judged: 0, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const page = await base44.entities.PairwiseVote.filter(
      { voter_email: email },
      { sort: '-created_date', limit: HISTORY_LIMIT }
    );
    const rows = Array.isArray(page) ? page : page?.items || [];

    const byId = new Map((poolRef.current || []).map((n) => [n.id, n]));
    const advanced = new Map();
    const witnessed = new Set();
    for (const row of rows) {
      if (row.winner_nominee_id) {
        bump(advanced, row.winner_nominee_id);
        witnessed.add(row.winner_nominee_id);
      }
      if (row.loser_nominee_id) witnessed.add(row.loser_nominee_id);
    }

    // What a voter has rewarded is read off the profiles themselves — the fields, places
    // and industries they keep advancing. No score field is consulted and no tier is read.
    const byDiscipline = new Map();
    const byCountry = new Map();
    const byIndustry = new Map();
    for (const [id, times] of advanced) {
      const person = byId.get(id);
      if (!person) continue;
      bump(byDiscipline, key(person.discipline), times);
      bump(byCountry, key(person.country), times);
      bump(byIndustry, key(person.industry), times);
    }

    if (!advanced.size) {
      candidatesRef.current = [];
      setState({ loading: false, suggestions: [], basis: [], judged: 0, error: null });
      return;
    }

    const top = [...byDiscipline.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2);
    const topDiscipline = top[0]?.[0] || null;

    const scored = [];
    for (const person of poolRef.current || []) {
      // A face already met in a set is not suggested again: the point of the surface is to
      // widen the field, not to hand a voter back what they have already judged.
      if (witnessed.has(person.id)) continue;
      const d = byDiscipline.get(key(person.discipline)) || 0;
      const c = byCountry.get(key(person.country)) || 0;
      const i = byIndustry.get(key(person.industry)) || 0;
      const score = d * 3 + c * 2 + i;
      if (!score) continue;
      scored.push({ person, score, d, c, i, reason: reasonFor({ person, d, c }, topDiscipline) });
    }
    scored.sort((a, b) => b.score - a.score || (a.person.name || '').localeCompare(b.person.name || ''));

    candidatesRef.current = scored;
    const suggestions = draw(scored, excludeRef.current);

    setState({
      loading: false,
      suggestions,
      basis: top.map(([d]) => disciplineLabel(d)).filter(Boolean),
      judged: advanced.size,
      error: null,
    });
  }, [email]);

  useEffect(() => {
    let alive = true;
    load().catch((e) => {
      if (!alive) return;
      setState({ loading: false, suggestions: [], basis: [], judged: 0, error: e?.message || 'Suggestions could not be read.' });
    });
    return () => { alive = false; };
  }, [load, poolSize]);

  // Another draw from the field already in hand — no query, no waiting.
  const shuffle = useCallback(() => {
    if (!candidatesRef.current.length) return;
    setState((prev) => ({ ...prev, suggestions: draw(candidatesRef.current, excludeRef.current) }));
  }, []);

  return { ...state, refresh: load, shuffle };
}