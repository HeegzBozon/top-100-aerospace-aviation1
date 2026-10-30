import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { buildHonoreeYearIndex, honoreeVolumes } from '@/components/voting/honoreeYears';

// The closed volumes are the same list for every card on every surface, so they are read
// once and kept for the session; the merge chain behind a candidate is read one record at
// a time, and only the records actually walked are fetched.
let indexPromise = null;
const rowCache = new Map();

function loadIndex() {
  if (!indexPromise) {
    indexPromise = base44.entities.Season.list('-created_date', 100)
      .then((res) => buildHonoreeYearIndex(Array.isArray(res) ? res : res?.items || []))
      .catch(() => new Map());
  }
  return indexPromise;
}

function loadRow(id) {
  if (!rowCache.has(id)) {
    rowCache.set(id, base44.entities.Nominee.get(id).catch(() => null));
  }
  return rowCache.get(id);
}

// A candidate's archived record for a surface that was not handed the pool: the chain
// down to the master is walked, because the archive entry lives on the master while the
// card still renders the superseded duplicate.
async function resolveVolumes(nominee) {
  const index = await loadIndex();
  if (index.size === 0 || !nominee?.id) return [];

  const byId = new Map([[nominee.id, nominee]]);
  let row = nominee;
  for (let hop = 0; hop < 3; hop += 1) {
    const next = row?.raw_nomination_data?.merged_into;
    if (!next || byId.has(next)) break;
    const master = await loadRow(next);
    if (!master) break;
    byId.set(next, master);
    row = master;
  }

  return honoreeVolumes(nominee, index, byId);
}

export default function useHonoreeVolumes(nominee) {
  const id = nominee?.id;
  const appearances = nominee?.raw_nomination_data?.archive_appearances?.length || 0;
  const [volumes, setVolumes] = useState([]);

  useEffect(() => {
    if (!id) {
      setVolumes([]);
      return undefined;
    }
    let active = true;
    resolveVolumes(nominee).then((next) => { if (active) setVolumes(next); });
    return () => { active = false; };
    // The record itself is stable for a given person; the index never changes mid-session.
  }, [id, appearances]);

  return volumes;
}