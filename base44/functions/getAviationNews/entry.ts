import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const RSS_FEEDS = [
  'https://www.flightglobal.com/rss/news',
  'https://aviationweek.com/rss.xml',
  'https://www.ainonline.com/rss.xml',
  'https://simpleflying.com/feed/',
];

const AEROSPACE_KEYWORDS = ['boeing', 'airbus', 'nasa', 'spacex', 'faa', 'icao', 'aviation', 'aerospace', 'aircraft', 'airline', 'satellite', 'rocket', 'space', 'flight'];

async function fetchRssFeed(url) {
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=20`;
  const res = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || []).map(item => ({
    id: item.guid || item.link,
    title: item.title,
    snippet: item.description?.replace(/<[^>]+>/g, '').slice(0, 200),
    url: item.link,
    source_name: data.feed?.title || new URL(url).hostname,
    published_at: item.pubDate,
    matched_entities: AEROSPACE_KEYWORDS.filter(kw =>
      (item.title + ' ' + (item.description || '')).toLowerCase().includes(kw)
    ).slice(0, 3),
  }));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const results = await Promise.allSettled(RSS_FEEDS.map(fetchRssFeed));
    const items = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .filter(item => item.matched_entities.length > 0)
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
      .slice(0, 30);

    return Response.json({ items });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});