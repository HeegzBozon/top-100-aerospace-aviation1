import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Use reliable RSS feeds that work with rss2json free tier
const RSS_FEEDS = [
  { url: 'https://www.aviationtoday.com/feed/', source: 'Aviation Today' },
  { url: 'https://simpleflying.com/feed/', source: 'Simple Flying' },
  { url: 'https://theaircurrent.com/feed/', source: 'The Air Current' },
  { url: 'https://aviationweek.com/rss/content/aviation-week-space-technology', source: 'Aviation Week' },
  { url: 'https://spacenews.com/feed/', source: 'SpaceNews' },
  { url: 'https://www.nasaspaceflight.com/feed/', source: 'NASASpaceFlight' },
];

const KEYWORDS = ['boeing', 'airbus', 'nasa', 'spacex', 'faa', 'aviation', 'aerospace', 'aircraft', 'airline', 'satellite', 'rocket', 'space', 'launch', 'flight', 'pilot', 'military', 'defense'];

async function fetchFeed({ url, source }) {
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=15&api_key=public`;
  const res = await fetch(apiUrl, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) return [];
  const data = await res.json();
  if (data.status !== 'ok') return [];
  return (data.items || []).map(item => {
    const fullText = ((item.title || '') + ' ' + (item.description || '')).toLowerCase();
    const matched = KEYWORDS.filter(kw => fullText.includes(kw));
    return {
      id: item.guid || item.link,
      title: item.title,
      snippet: item.description?.replace(/<[^>]+>/g, '').trim().slice(0, 200),
      url: item.link,
      source_name: data.feed?.title || source,
      published_at: item.pubDate,
      matched_entities: [...new Set(matched)].slice(0, 4),
    };
  }).filter(i => i.matched_entities.length > 0);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const results = await Promise.allSettled(RSS_FEEDS.map(fetchFeed));
    const items = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
      .slice(0, 30);

    return Response.json({ items });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});