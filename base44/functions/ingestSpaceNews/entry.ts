import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

async function fetchSpaceNewsApi() {
  const baseUrl = 'https://api.spaceflightnewsapi.net/v4/articles';
  
  try {
    const response = await fetch(`${baseUrl}/?limit=50&ordering=-published_at`, { timeout: 30000 });
    if (!response.ok) throw new Error(`Space News API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Space News API fetch error:', error.message);
    return { results: [] };
  }
}

function transformSpaceNewsArticle(article) {
  const keywords = [];
  
  // Extract keywords from title and summary
  const text = (article.title + ' ' + (article.summary || '')).toLowerCase();
  const commonKeywords = ['nasa', 'spacex', 'blue origin', 'artemis', 'starship', 'falcon', 'launch', 'spacecraft', 'mission', 'satellite', 'astronaut'];
  commonKeywords.forEach(kw => {
    if (text.includes(kw) && !keywords.includes(kw)) {
      keywords.push(kw);
    }
  });
  
  return {
    title: article.title || 'Untitled',
    url: article.url || '',
    source_name: article.news_site || 'Unknown',
    publish_date: article.published_at || new Date().toISOString(),
    language: 'en',
    summary: article.summary || article.title,
    sentiment_score: 0,
    program_ids: [],
    organization_ids: [],
    nominee_ids: [],
    keywords,
    data_source: 'spacenewsapi',
    is_featured: false
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // Only allow admin users to trigger ingestion
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Query Space News API
    const newsData = await fetchSpaceNewsApi();
    
    if (!newsData.results || newsData.results.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'No new articles found',
        count: 0 
      });
    }

    // Transform articles to NewsEvent format
    const newsEvents = newsData.results.map(transformSpaceNewsArticle);
    
    // Bulk create in Base44
    const created = await base44.entities.NewsEvent.bulkCreate(newsEvents);
    
    console.log(`Ingested ${created.length} news events from Space News API`);
    
    return Response.json({
      success: true,
      message: `Successfully ingested ${created.length} articles`,
      count: created.length
    });
    
  } catch (error) {
    console.error('ingestSpaceNews error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});