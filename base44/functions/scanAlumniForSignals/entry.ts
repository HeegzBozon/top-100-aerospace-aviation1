import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// ─────────────────────────────────────────────────────────────────
// Confidence Scoring: 3-tier model
// ─────────────────────────────────────────────────────────────────

function scoreConfidence(nominee, article) {
  // A: Hard match (exact name + org match)
  if (
    nominee.name &&
    article.title &&
    article.summary &&
    (article.title.includes(nominee.name) || article.summary.includes(nominee.name))
  ) {
    const orgs = nominee.organization_history || [];
    if (orgs.some(org => article.title.includes(org) || article.summary.includes(org))) {
      return 'A';
    }
    // B: Strong match (name in article + company/domain match)
    if (nominee.company && (article.title.includes(nominee.company) || article.summary.includes(nominee.company))) {
      return 'B';
    }
  }

  // B: Name + org match
  if (nominee.name && (article.title.includes(nominee.name) || article.summary.includes(nominee.name))) {
    const orgs = nominee.organization_history || [];
    if (orgs.some(org => article.title.includes(org) || article.summary.includes(org))) {
      return 'B';
    }
  }

  // C: Fuzzy name match (requires review)
  if (nominee.name && (article.title.includes(nominee.name) || article.summary.includes(nominee.name))) {
    return 'C';
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────
// Fetch from SNAPI (SpaceDevs)
// ─────────────────────────────────────────────────────────────────

async function fetchSNAPIArticles(limit = 100) {
  try {
    const url = `https://api.thespacedevs.com/v4/articles/?limit=${limit}&ordering=-published_at`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.results || []).map(item => ({
      article_id: item.id,
      article_url: item.url,
      article_title: item.title || '',
      article_summary: item.summary || item.description || '',
      news_site: item.news_site || 'SNAPI',
      image_url: item.image_url || null,
      published_at: item.published_at || new Date().toISOString(),
      source_name: 'SNAPI'
    }));
  } catch (error) {
    console.error('Error fetching SNAPI articles:', error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────
// Fetch from Google News RSS (fallback + coverage boost)
// ─────────────────────────────────────────────────────────────────

async function fetchGoogleNewsRSS(query = 'aerospace space', limit = 50) {
  try {
    const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(feedUrl);
    if (!response.ok) return [];
    
    const text = await response.text();
    const items = [];
    
    // Minimal RSS parsing (Google News format)
    const itemRegex = /<item>[\s\S]*?<\/item>/g;
    const matches = text.match(itemRegex) || [];
    
    for (const itemStr of matches.slice(0, limit)) {
      const titleMatch = itemStr.match(/<title[^>]*>([^<]+)<\/title>/);
      const linkMatch = itemStr.match(/<link>([^<]+)<\/link>/);
      const descMatch = itemStr.match(/<description[^>]*>([^<]+)<\/description>/);
      const pubDateMatch = itemStr.match(/<pubDate[^>]*>([^<]+)<\/pubDate>/);
      
      if (titleMatch && linkMatch) {
        items.push({
          article_id: Math.random().toString(36).substr(2, 9),
          article_url: linkMatch[1],
          article_title: titleMatch[1],
          article_summary: descMatch ? descMatch[1] : titleMatch[1],
          news_site: 'Google News',
          image_url: null,
          published_at: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
          source_name: 'Google News RSS'
        });
      }
    }
    return items;
  } catch (error) {
    console.error('Error fetching Google News RSS:', error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────
// Main Handler
// ─────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only check
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all active nominees
    const nominees = await base44.entities.Nominee.filter({ status: 'active' }, null, 1000);
    if (!nominees || nominees.length === 0) {
      return Response.json({ message: 'No active nominees found', created: 0 });
    }

    // Fetch articles from both sources
    const snapiArticles = await fetchSNAPIArticles(50);
    const googleNewsArticles = await fetchGoogleNewsRSS('aerospace space', 30);
    const allArticles = [...snapiArticles, ...googleNewsArticles];

    if (allArticles.length === 0) {
      return Response.json({ message: 'No articles fetched', created: 0 });
    }

    // Match nominees to articles
    const createdMentions = [];
    const seenKeys = new Set();

    for (const article of allArticles) {
      for (const nominee of nominees) {
        const confidence = scoreConfidence(nominee, article);
        
        if (!confidence) continue;

        // Deduplicate by nominee_id + article_id + source_name
        const dedupeKey = `${nominee.id}|${article.article_id}|${article.source_name}`;
        if (seenKeys.has(dedupeKey)) continue;
        seenKeys.add(dedupeKey);

        try {
          // Check if mention already exists
          const existing = await base44.entities.HonoreeMention.filter({
            nominee_id: nominee.id,
            article_id: article.article_id,
            source_name: article.source_name
          }, null, 1);

          if (existing && existing.length > 0) continue;

          // Create new mention
          const mention = await base44.entities.HonoreeMention.create({
            nominee_id: nominee.id,
            nominee_name: nominee.name,
            article_id: parseInt(article.article_id) || 0,
            article_url: article.article_url,
            article_title: article.article_title,
            article_summary: article.article_summary,
            news_site: article.news_site,
            image_url: article.image_url,
            published_at: article.published_at,
            scanned_at: new Date().toISOString(),
            confidence: confidence,
            source_name: article.source_name
          });

          createdMentions.push({
            nominee_id: nominee.id,
            article_url: article.article_url,
            confidence: confidence
          });
        } catch (error) {
          console.error(`Failed to create mention for ${nominee.name}:`, error);
        }
      }
    }

    return Response.json({
      message: 'Scan complete',
      articles_fetched: allArticles.length,
      nominees_checked: nominees.length,
      mentions_created: createdMentions.length,
      details: createdMentions
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});