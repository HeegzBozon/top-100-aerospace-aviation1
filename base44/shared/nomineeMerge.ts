// Merge-aware identity resolution.
//
// A Nominee record that was folded into another row records its canonical master
// in raw_nomination_data.merged_into (set alongside pre_merge_status when the
// duplicate is retired). Every surface that resolves a person — by slug or by id
// — must land on the master, never on a superseded row. These are the only two
// primitives that rule needs, shared by every backend reader so they never
// diverge.

export function mergedIntoId(n: any): string | null {
  const id = n?.raw_nomination_data?.merged_into;
  return typeof id === "string" && id ? id : null;
}

// Returns the canonical row for a nominee: the record itself when it is already
// canonical, otherwise the master it was folded into. `sr` is a service-role
// entities client (e.g. base44.asServiceRole.entities).
export async function resolveCanonical(sr: any, nominee: any): Promise<any> {
  const masterId = mergedIntoId(nominee);
  if (!masterId || masterId === nominee?.id) return nominee;
  const master = await sr.Nominee.get(masterId);
  return master || nominee;
}