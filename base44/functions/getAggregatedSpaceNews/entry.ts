import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const CACHE_TTL_MS = 15 * 60 * 1000;
const memCache = {};

const AEROSPACE_KEYWORDS = [
  'space', 'aerospace', 'rocket', 'nasa', 'spacex', 'satellite', 'orbital',
  'astronaut', 'cosmonaut', 'launch', 'spacecraft', 'aviation', 'airspace',
  'boeing', 'lockheed', 'northrop', 'ula', 'blue origin', 'virgin galactic',
  'iss', 'station', 'mission', 'payload', 'propulsion', 'hypersonic',
  'drone', 'uav', 'reentry', 'capsule', 'starship', 'falcon', 'ariane',
  'flight', 'pilot', 'air force', 'jet', 'supersonic', 'spaceport'
];

function isAerospaceRelevant(title = '', summary = '') {
  const text = `${title} ${summary}`.toLowerCase();
  return AEROSPACE_KEYWORDS.some(kw => text.includes(kw));
}

function normalizeUrl(url = '') {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname}`.replace(/\/$/, '').toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function titleFingerprint(title = '') {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().slice(0, 60);
}

function deduplicatArticles(articles) {
  const seenUrls = new Set();
  const seenTitles = new Set();
  const out = [];
  for (const a of articles) {
    const urlKey = normalizeUrl(a.url);
    const titleKey = titleFingerprint(a.title);
    if (seenUrls.has(urlKey) || seenTitles.has(titleKey)) continue;
    seenUrls.add(urlKey);
    seenTitles.add(titleKey);
    out.push(a);
  }
  return out;
}

// --- SNAPI ---
async function fetchSnapi(search, limit, offset) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    ordering: '-published_at',
  });
  if (search) params.set('search', search);

  const url = `https://api.spaceflightnewsapi.net/v4/articles/?${params}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return { results: [], count: 0 };
  const data = await res.json();
  return {
    results: (data.results || []).map(a => ({
      id: `snapi_${a.id}`,
      title: a.title || '',
      summary: a.summary || '',
      url: a.url || '',
      image_url: a.image_url || null,
      news_site: a.news_site || 'SNAPI',
      published_at: a.published_at || null,
      source: 'SNAPI',
    })),
    count: data.count || 0,
  };
}

// --- Google News RSS ---
function parseRssItem(item) {
  const getTag = (tag) => {
    const m = item.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
    if (!m) return '';
    return (m[1] || m[2] || '').trim();
  };
  const title = getTag('title');
  const link = (() => {
    const m = item.match(/<link>([^<]+)<\/link>/i) || item.match(/href="([^"]+)"/i);
    return m ? m[1].trim() : '';
  })();
  const pubDate = getTag('pubDate');
  const source = (() => {
    const m = item.match(/<source[^>]*>([^<]+)<\/source>/i) || item.match(/data-n-au="([^"]+)"/i);
    return m ? m[1].trim() : 'Google News';
  })();

  if (!title || !link) return null;
  let published_at = null;
  if (pubDate) {
    const d = new Date(pubDate);
    if (!isNaN(d)) published_at = d.toISOString();
  }

  return {
    id: `gnrss_${link.replace(/[^a-zA-Z0-9]/g, '').slice(-16)}`,
    title,
    summary: '',
    url: link,
    image_url: null,
    news_site: source,
    published_at,
    source: 'Google News',
  };
}

async function fetchGoogleNewsRss(search) {
  const query = search
    ? `${search} aerospace OR space OR rocket`
    : 'aerospace OR aviation OR space OR rocket OR satellite OR NASA OR SpaceX';
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;

  const res = await fetch(rssUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SpaceNewsBot/1.0)',
      Accept: 'application/rss+xml, application/xml, text/xml',
    },
  });
  if (!res.ok) return [];

  const xml = await res.text();
  const items = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
  return items
    .map(parseRssItem)
    .filter(Boolean)
    .filter(a => isAerospaceRelevant(a.title, a.summary));
}

// --- Main Handler ---
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const search = (body.search || '').trim();
    const limit = Math.min(Number(body.limit) || 18, 50);
    const offset = Number(body.offset) || 0;

    const cacheKey = `aggregated_${search}_${limit}_${offset}`;
    const cached = memCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return Response.json({ results: cached.results, count: cached.count, cached: true });
    }

    // Fetch SNAPI + RSS in parallel — fetch extra from SNAPI to fill gaps after dedup
    const [snapi, rssItems] = await Promise.all([
      fetchSnapi(search, Math.min(limit * 2, 80), offset),
      fetchGoogleNewsRss(search),
    ]);

    // Merge: SNAPI first (authoritative), then RSS
    const merged = deduplicatArticles([...snapi.results, ...rssItems]);

    // For paginated response, slice from merged
    const paginated = offset === 0
      ? merged.slice(0, limit)
      : merged.slice(offset, offset + limit);

    // Count = SNAPI total + RSS additions (de-duped estimate)
    const rssAdditions = merged.length - snapi.results.length;
    const count = snapi.count + Math.max(0, rssAdditions);

    memCache[cacheKey] = { timestamp: Date.now(), results: paginated, count };

    return Response.json({ results: paginated, count });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});