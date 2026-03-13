import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const createdSignals = [];
    const errors = [];

    const nominees = await base44.asServiceRole.entities.Nominee.filter(
      { status: 'active' },
      '-updated_date',
      1000
    );

    // Using SpaceDevs SNAPI (free, no auth)
    try {
      const response = await fetch('https://api.spacedevs.com/2.0.0/news/?limit=100');
      const data = await response.json();

      if (data.results) {
        for (const article of data.results) {
          const articleText = `${article.title} ${article.summary || ''}`.toLowerCase();

          for (const nominee of nominees) {
            if (
              articleText.includes(nominee.name?.toLowerCase()) ||
              articleText.includes(nominee.company?.toLowerCase()) ||
              (nominee.organization_history?.some(org => articleText.includes(org.toLowerCase())))
            ) {
              const signal = await base44.asServiceRole.entities.SignalCard.create({
                nominee_id: nominee.id,
                headline: article.title,
                evidence_links: [article.url],
                source_name: 'SpaceDevs SNAPI',
                signal_type: 'media_mention',
                signal_date: article.published_at || new Date().toISOString(),
                confidence: 'B',
                author_name: article.news_site || 'Unknown',
                author_bio: '',
                organization: article.news_site || '',
                impact_metrics: { citation_count: 0, h_index: 0, views: 0 },
                tags: ['aerospace', 'news', 'media'],
                ai_summary: article.summary || article.title,
                related_signal_ids: []
              });
              createdSignals.push(signal);
              break; // One signal per article
            }
          }
        }
      }
    } catch (err) {
      errors.push({ source: 'SpaceDevs SNAPI', error: err.message });
    }

    base44.analytics.track({
      eventName: 'signal_ingestion_spacenews',
      properties: { created: createdSignals.length, errors: errors.length }
    });

    return Response.json({ created: createdSignals.length, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});