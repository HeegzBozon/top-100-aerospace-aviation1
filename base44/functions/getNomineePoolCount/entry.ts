import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { resolveOutreachPersons } from '../../shared/nomineeResolve.ts';

// Returns the number of UNIQUE PEOPLE in the nominee pool — deduped by email
// and LinkedIn slug (same resolver the outreach export uses), rejected
// excluded. Counts people, not nominations: a person nominated across three
// seasons is one person here. Cached briefly so the public hero counter doesn't
// re-paginate and re-dedupe the full Nominee set on every load.

let cached = { count: null, at: 0 };
const TTL = 5 * 60 * 1000;

export default async function (req) {
  try {
    if (cached.count !== null && Date.now() - cached.at < TTL) {
      return Response.json({ count: cached.count, cached: true });
    }

    const base44 = createClientFromRequest(req);
    const service = base44.asServiceRole;

    const records = [];
    const seen = new Set();
    let lastDate = null;
    for (let page = 0; page < 100; page++) {
      const query = lastDate ? { created_date: { $lt: lastDate } } : {};
      const batch = await service.entities.Nominee.filter(query, '-created_date', 1000);
      if (!batch.length) break;
      const fresh = batch.filter((n) => !seen.has(n.id));
      if (!fresh.length) break;
      fresh.forEach((n) => seen.add(n.id));
      for (const n of fresh) {
        if (n.status !== 'rejected') records.push(n);
      }
      lastDate = batch[batch.length - 1].created_date;
      if (batch.length < 1000) break;
    }

    // knownUserEmails is unused for the count; resolveOutreachPersons only
    // needs it to stamp the per-person "has account" flag, which doesn't
    // affect membership. Empty set keeps the counter cheap.
    const persons = resolveOutreachPersons(records, new Set<string>());
    const count = persons.length;

    cached = { count, at: Date.now() };
    return Response.json({ count });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}