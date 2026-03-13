import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const CACHE_TTL_MS = 10 * 60 * 1000;
const memCache = {};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const type = body.type || 'articles'; // articles | blogs | reports
    const launchId = body.launchId || null;
    const search = body.search || '';
    const titleContains = body.title_contains || '';
    const summaryContains = body.summary_contains || '';
    const publishedAtGte = body.published_at__gte || '';
    const publishedAtLte = body.published_at__lte || '';
    const newsSite = body.news_site || '';
    const ordering = body.ordering || '-published_at';
    const limit = body.limit || 9;
    const offset = body.offset || 0;

    const cacheKey = `${type}_${launchId}_${search}_${titleContains}_${summaryContains}_${publishedAtGte}_${publishedAtLte}_${newsSite}_${ordering}_${limit}_${offset}`;
    const cached = memCache[cacheKey];
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
      return Response.json({ results: cached.data, count: cached.count, cached: true });
    }

    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('offset', String(offset));
    params.set('ordering', ordering);
    if (launchId) params.set('launch_id', launchId);
    if (search) params.set('search', search);
    if (titleContains) params.set('title_contains', titleContains);
    if (summaryContains) params.set('summary_contains', summaryContains);
    if (publishedAtGte) params.set('published_at__gte', publishedAtGte);
    if (publishedAtLte) params.set('published_at__lte', publishedAtLte);
    if (newsSite) params.set('news_site', newsSite);

    const url = `https://api.spaceflightnewsapi.net/v4/${type}/?${params.toString()}`;
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });

    if (!response.ok) {
      return Response.json({ error: `SNAPI error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    const results = data.results || [];
    const count = data.count || 0;

    memCache[cacheKey] = { timestamp: Date.now(), data: results, count };

    return Response.json({ results, count });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});