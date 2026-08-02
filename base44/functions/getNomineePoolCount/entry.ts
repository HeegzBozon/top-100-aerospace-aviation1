import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Returns the size of the singular, additive candidate pool — every nominee
// across all seasons (rejected excluded). Cached briefly so the public hero
// counter doesn't re-paginate the full Nominee set on every load.

let cached = { count: null, at: 0 };
const TTL = 5 * 60 * 1000;

export default async function (req) {
  try {
    if (cached.count !== null && Date.now() - cached.at < TTL) {
      return Response.json({ count: cached.count, cached: true });
    }

    const base44 = createClientFromRequest(req);
    const service = base44.asServiceRole;

    let count = 0;
    let lastDate = null;
    const seen = new Set();
    for (let page = 0; page < 100; page++) {
      const query = lastDate ? { created_date: { $lt: lastDate } } : {};
      const batch = await service.entities.Nominee.filter(query, '-created_date', 1000);
      if (!batch.length) break;
      const fresh = batch.filter((n) => !seen.has(n.id));
      if (!fresh.length) break;
      fresh.forEach((n) => seen.add(n.id));
      count += fresh.filter((n) => n.status !== 'rejected').length;
      lastDate = batch[batch.length - 1].created_date;
      if (batch.length < 1000) break;
    }

    cached = { count, at: Date.now() };
    return Response.json({ count });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}