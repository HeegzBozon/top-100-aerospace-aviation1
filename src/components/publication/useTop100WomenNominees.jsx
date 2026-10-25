import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { mergeMap, canonicalId } from '@/lib/nomineeMerge';

// Builds the published edition: the 2025 season's standings order with ranked-choice
// points folded in, resolved to each honoree's canonical master record.
//
// The standings rows are derived here from the season's own nominee pool — the same
// query and the same field mapping the standings endpoint performs — so the edition
// renders for a signed-out visitor from openly readable collections instead of
// waiting on a backend call. Scores, positions and identity resolution are unchanged.

function deriveStandingsRows(pool) {
  return pool
    .map((n) => ({
      nomineeId: n.id,
      nomineeName: n.name,
      avatarUrl: n.avatar_url || n.photo_url || null,
      title: n.title || '',
      company: n.company || '',
      country: n.country || null,
      aura: Math.round(n.aura_score || n.starpower_score || n.elo_rating || 0),
      elo_rating: n.elo_rating || 1200,
    }))
    .sort((a, b) => b.aura - a.aura);
}

async function loadEdition() {
  const allSeasons = await base44.entities.Season.list('-created_date', 50);
  const season3 = allSeasons.find((s) => s.name?.includes('Season 3'));
  const activeSeason = allSeasons.find((s) => ['completed', 'voting_open', 'active'].includes(s.status));
  const seasonId = season3?.id || activeSeason?.id || allSeasons[0]?.id;

  if (!seasonId) return { nominees: [] };

  const [pool, rankedVotes] = await Promise.all([
    base44.entities.Nominee.filter(
      { $or: [{ season_ids: seasonId }, { season_id: seasonId }], status: 'active' },
      '-updated_date',
      1000,
    ),
    base44.entities.RankedVote.filter({ season_id: seasonId }, '-created_date', 10000),
  ]);

  const standingsRows = deriveStandingsRows(pool);
  const scoreMap = {};

  standingsRows.forEach((nominee) => {
    scoreMap[nominee.nomineeId] = {
      nomineeId: nominee.nomineeId,
      bordaScore: 0,
      totalVotes: 0,
      firstChoiceVotes: 0,
    };
  });

  (rankedVotes || []).forEach((vote) => {
    if (!Array.isArray(vote.ballot)) return;
    vote.ballot.forEach((nomineeId, position) => {
      if (!scoreMap[nomineeId]) return;
      scoreMap[nomineeId].bordaScore += 100 - position;
      scoreMap[nomineeId].totalVotes += 1;
      if (position === 0) scoreMap[nomineeId].firstChoiceVotes += 1;
    });
  });

  const rcvResults = Object.values(scoreMap)
    .filter((nominee) => nominee.totalVotes > 0)
    .sort((a, b) => b.bordaScore - a.bordaScore)
    .map((nominee, index) => ({ ...nominee, rcvRank: index + 1 }));

  const rcvMap = new Map(rcvResults.map((nominee) => [nominee.nomineeId, nominee]));
  const maxAura = Math.max(...standingsRows.map((nominee) => nominee.aura || 0), 1);
  const maxBorda = Math.max(...rcvResults.map((nominee) => nominee.bordaScore || 0), 1);

  const combined = standingsRows
    .map((nominee, index) => {
      const rcvInfo = rcvMap.get(nominee.nomineeId) || { bordaScore: 0, rcvRank: null };
      const normalizedAura = ((nominee.aura || 0) / maxAura) * 100;
      const normalizedRcv = (rcvInfo.bordaScore / maxBorda) * 100;

      return {
        id: nominee.nomineeId,
        name: nominee.nomineeName,
        avatar_url: nominee.avatarUrl,
        title: nominee.title,
        company: nominee.company,
        country: nominee.country,
        aura_score: nominee.aura,
        elo_rating: nominee.elo_rating,
        borda_score: rcvInfo.bordaScore,
        combinedScore: (normalizedAura * 0.5) + (normalizedRcv * 0.5),
        auraRank: index + 1,
        rcvRank: rcvInfo.rcvRank,
      };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore);

  combined.forEach((nominee, index) => { nominee.finalRank = index + 1; });

  // A superseded duplicate row resolves to its canonical master, so the edition
  // renders each honoree's current verified profile. Position, order and season
  // scores still come from that season's row, so the published order never shifts —
  // only duplicate identity is collapsed.
  const merged = mergeMap(pool);
  const poolMap = new Map(pool.map((nominee) => [nominee.id, nominee]));
  const mastersOutsidePool = [...new Set([...merged.values()])].filter((id) => !poolMap.has(id));
  const masters = mastersOutsidePool.length
    ? await base44.entities.Nominee.filter({ id: { $in: mastersOutsidePool } })
    : [];
  const nomineeMap = new Map([...poolMap, ...masters.map((master) => [master.id, master])]);
  const seenCanonical = new Set();

  const nominees = combined
    .slice(0, 100)
    .map((result) => {
      const canonical = canonicalId(result.id, merged) || result.id;
      if (seenCanonical.has(canonical)) return null;
      seenCanonical.add(canonical);

      const fullNominee = nomineeMap.get(canonical) || nomineeMap.get(result.id) || {};

      return {
        ...result,
        ...fullNominee,
        id: canonical,
        aura_score: result.aura_score,
        elo_rating: result.elo_rating,
        borda_score: result.borda_score,
        combinedScore: result.combinedScore,
        auraRank: result.auraRank,
        rcvRank: result.rcvRank,
        finalRank: result.finalRank,
        country: fullNominee.country || result.country,
        industry: fullNominee.industry || result.industry,
        avatar_url: fullNominee.avatar_url || fullNominee.photo_url || result.avatar_url,
      };
    })
    .filter(Boolean);

  return { nominees };
}

// One load per page view, shared by every caller so the edition is never assembled
// twice, and reusable as a designed state while it is still in flight.
let cache = { status: 'idle', nominees: [], error: null };
let inflight = null;

function startLoad() {
  if (inflight) return inflight;
  cache = { status: 'loading', nominees: [], error: null };
  inflight = loadEdition()
    .then(({ nominees }) => {
      cache = { status: 'ready', nominees, error: null };
      return nominees;
    })
    .catch((error) => {
      cache = { status: 'error', nominees: [], error };
      throw error;
    })
    .finally(() => { inflight = null; });
  return inflight;
}

export function resetEditionCache() {
  cache = { status: 'idle', nominees: [], error: null };
  inflight = null;
}

export default function useTop100WomenNominees() {
  const [snapshot, setSnapshot] = useState(cache);

  useEffect(() => {
    let alive = true;

    if (cache.status === 'ready') {
      setSnapshot(cache);
      return undefined;
    }

    startLoad()
      .then((nominees) => {
        if (alive) setSnapshot({ status: 'ready', nominees, error: null });
      })
      .catch((error) => {
        if (alive) setSnapshot({ status: 'error', nominees: [], error });
      });

    return () => { alive = false; };
  }, []);

  return {
    nominees: snapshot.nominees,
    loading: snapshot.status === 'idle' || snapshot.status === 'loading',
    error: snapshot.error,
  };
}