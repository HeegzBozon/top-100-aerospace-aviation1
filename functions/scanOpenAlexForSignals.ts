import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchTerms = ['aerospace', 'spaceflight', 'satellite'], limit = 50 } = await req.json();
    const createdSignals = [];
    const errors = [];

    // Fetch active nominees for matching
    const nominees = await base44.asServiceRole.entities.Nominee.filter(
      { status: 'active' },
      '-updated_date',
      1000
    );

    for (const term of searchTerms) {
      try {
        const response = await fetch(
          `https://api.openalex.org/works?filter=display_name.search:${encodeURIComponent(term)}&per-page=${limit}&sort=publication_date:desc`
        );
        const data = await response.json();

        if (data.results) {
          for (const work of data.results) {
            // Extract authors
            const authors = work.authorships?.map(a => a.author?.display_name).filter(Boolean) || [];
            
            for (const authorName of authors) {
              const nomineeMatch = nominees.find(n => 
                n.name?.toLowerCase().includes(authorName?.toLowerCase()) ||
                authorName?.toLowerCase().includes(n.name?.toLowerCase())
              );

              if (nomineeMatch) {
                const signal = await base44.asServiceRole.entities.SignalCard.create({
                  nominee_id: nomineeMatch.id,
                  headline: `Published: ${work.display_name}`,
                  evidence_links: [work.id],
                  source_name: 'OpenAlex',
                  signal_type: 'publication',
                  signal_date: work.publication_date || new Date().toISOString(),
                  confidence: 'A',
                  author_name: authorName,
                  author_bio: work.primary_location?.institution?.display_name || '',
                  organization: work.primary_location?.institution?.display_name || '',
                  impact_metrics: {
                    citation_count: work.cited_by_count || 0,
                    h_index: 0,
                    views: 0
                  },
                  tags: work.topics?.slice(0, 3).map(t => t.display_name) || [],
                  ai_summary: `${authorName} published "${work.display_name}" on ${work.publication_date}`,
                  related_signal_ids: []
                });
                createdSignals.push(signal);
              }
            }
          }
        }
      } catch (err) {
        errors.push({ term, error: err.message });
      }
    }

    base44.analytics.track({
      eventName: 'signal_ingestion_openalex',
      properties: { created: createdSignals.length, errors: errors.length }
    });

    return Response.json({ created: createdSignals.length, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});