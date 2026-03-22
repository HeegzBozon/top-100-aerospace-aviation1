import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const CATEGORY_FEEDS = {
  aerospace: [
    'https://www.flightglobal.com/rss/news',
    'https://simpleflying.com/feed/',
    'https://aviationweek.com/rss.xml',
  ],
  space: [
    'https://www.nasaspaceflight.com/feed/',
    'https://spacenews.com/feed/',
    'https://www.space.com/feeds/all',
  ],
  defense: [
    'https://www.defensenews.com/rss/news/',
    'https://breakingdefense.com/feed/',
  ],
  geopolitics: [
    'https://www.bbc.co.uk/news/world/rss.xml',
    'https://feeds.reuters.com/reuters/worldNews',
  ],
};

async function fetchFeed(url, category) {
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=15`;
  const res = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || []).map(item => ({
    id: item.guid || item.link,
    title: item.title,
    link: item.link,
    source: data.feed?.title || new URL(url).hostname,
    published_at: item.pubDate,
    location_name: null,
    threat: { level: category === 'defense' || category === 'geopolitics' ? 2 : 1 },
  }));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const categories = {};
    await Promise.all(
      Object.entries(CATEGORY_FEEDS).map(async ([category, feeds]) => {
        const results = await Promise.allSettled(feeds.map(url => fetchFeed(url, category)));
        const items = results
          .filter(r => r.status === 'fulfilled')
          .flatMap(r => r.value)
          .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
          .slice(0, 20);
        categories[category] = { items };
      })
    );

    return Response.json({ categories });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});