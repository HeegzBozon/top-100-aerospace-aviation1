// Merge-aware identity resolution (client side).
//
// A duplicate Nominee row records the canonical master it was folded into in
// raw_nomination_data.merged_into. Rosters and deep links must resolve a person
// to that master so a superseded row never renders stale content.

export function mergedIntoId(nominee) {
  const id = nominee?.raw_nomination_data?.merged_into;
  return typeof id === 'string' && id ? id : null;
}

// One person, one record. Several rows can share an address — a legacy import and a
// later self-claim — so an address-keyed lookup must pick the copy the Fellow has
// claimed and verified, never whichever row the database happened to return first.
const standing = (n) =>
  (n?.claimed_by_user_id ? 4 : 0) +
  (n?.claim_status === 'approved' ? 2 : 0) +
  (n?.verified_status === 'self_verified' || n?.verified_status === 'fully_verified' ? 1 : 0);

export function preferredNominee(rows) {
  const list = (rows || []).filter(Boolean);
  if (list.length < 2) return list[0] || null;
  return [...list].sort((a, b) => standing(b) - standing(a))[0];
}

// id → canonical id, for every row that was folded into another.
export function mergeMap(nominees) {
  const map = new Map();
  (nominees || []).forEach((n) => {
    const master = mergedIntoId(n);
    if (master && master !== n.id) map.set(n.id, master);
  });
  return map;
}

// Follow the chain (a master may itself have been folded into a newer row).
export function canonicalId(nomineeOrId, map) {
  const start = typeof nomineeOrId === 'string' ? nomineeOrId : nomineeOrId?.id;
  const seen = new Set();
  let id = start;
  while (id && map?.has(id) && !seen.has(id)) {
    seen.add(id);
    id = map.get(id);
  }
  return id;
}