import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Periodically sync news feeds for nominee mentions
 * Integrates with existing news scanning logic
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Fetch active nominees
    const nominees = await base44.asServiceRole.entities.Nominee.filter(
      { status: 'active' },
      null,
      1000
    );

    let created = 0;
    const results = [];

    for (const nominee of nominees) {
      try {
        if (!nominee.name) continue;

        // Fetch from Google News API (requires API key)
        const newsApiKey = Deno.env.get('NEWS_API_KEY');
        if (!newsApiKey) {
          results.push({ nominee_id: nominee.id, status: 'skipped', message: 'No NEWS_API_KEY' });
          continue;
        }

        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(nominee.name)}&sortBy=publishedAt&language=en&pageSize=20`,
          {
            headers: { 'X-Api-Key': newsApiKey },
          }
        );

        if (!response.ok) {
          results.push({ nominee_id: nominee.id, status: 'error', message: 'News API error' });
          continue;
        }

        const data = await response.json();
        const articles = data.articles || [];

        if (articles.length === 0) {
          results.push({ nominee_id: nominee.id, status: 'no_results' });
          continue;
        }

        // Check for existing mentions
        const existingMentions = await base44.asServiceRole.entities.HonoreeMention.filter(
          { nominee_id: nominee.id },
          null,
          1000
        );

        const existingUrls = new Set(existingMentions.map(m => m.article_url));

        // Create new mentions
        for (const article of articles) {
          if (existingUrls.has(article.url)) continue;

          try {
            await base44.asServiceRole.entities.HonoreeMention.create({
              nominee_id: nominee.id,
              nominee_name: nominee.name,
              article_id: Math.random(),
              article_url: article.url,
              article_title: article.title,
              article_summary: article.description || '',
              news_site: article.source.name,
              image_url: article.urlToImage || '',
              published_at: article.publishedAt,
              scanned_at: new Date().toISOString(),
              confidence: 'C',
              source_name: 'Google News',
            });
            created++;
          } catch (err) {
            console.error('Mention creation error:', err);
          }
        }

        results.push({
          nominee_id: nominee.id,
          status: 'processed',
          articles_found: articles.length,
          mentions_created: articles.length,
        });
      } catch (error) {
        results.push({ nominee_id: nominee.id, status: 'error', error: error.message });
      }
    }

    return Response.json({
      status: 'success',
      nominees_scanned: nominees.length,
      mentions_created: created,
      results,
    });
  } catch (error) {
    return Response.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
});