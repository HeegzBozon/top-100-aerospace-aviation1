import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// GET /v1/gps/jam — 3 parallel bounding boxes, merged + deduplicated by h3Index.
// Regions: Eastern Mediterranean, Baltic, Eastern Europe.
// Cache TTL: 5 minutes — GPS interference patterns shift slowly.

const BOXES = [
  { min_lat: 30, max_lat: 42, min_lng: 25, max_lng: 42 }, // Eastern Mediterranean
  { min_lat: 54, max_lat: 64, min_lng: 14, max_lng: 28 }, // Baltic
  { min_lat: 46, max_lat: 56, min_lng: 22, max_lng: 40 }, // Eastern Europe
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const WINGBITS_KEY = Deno.env.get('WINGBITS_API_KEY');
    if (!WINGBITS_KEY) return Response.json({ error: 'No Wingbits key configured' }, { status: 503 });

    const requests = BOXES.map(box => {
      const params = new URLSearchParams({
        min_lat: String(box.min_lat),
        max_lat: String(box.max_lat),
        min_lng: String(box.min_lng),
        max_lng: String(box.max_lng),
      });
      return fetch(`https://customer-api.wingbits.com/v1/gps/jam?${params}`, {
        headers: { 'x-api-key': WINGBITS_KEY },
      }).then(async res => {
        if (!res.ok) throw new Error(`GPS jam region ${res.status}`);
        return res.json();
      });
    });

    const results = await Promise.allSettled(requests);
    const allHexes = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => (r as PromiseFulfilledResult<any>).value?.hexes || []);

    // Deduplicate by h3Index — same cell can appear in overlapping bounding boxes
    const seen = new Set<string>();
    const hexes = allHexes.filter(h => {
      if (!h?.h3Index || seen.has(h.h3Index)) return false;
      seen.add(h.h3Index);
      return true;
    });

    return Response.json({
      hexes,
      lastUpdated: hexes.length > 0 ? new Date().toISOString() : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
