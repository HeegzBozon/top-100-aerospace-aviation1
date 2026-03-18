import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchTerms = ['aerospace', 'spacecraft', 'satellite'], limit = 50 } = await req.json();
    const createdSignals = [];
    const errors = [];

    const nominees = await base44.asServiceRole.entities.Nominee.filter(
      { status: 'active' },
      '-updated_date',
      1000
    );

    for (const term of searchTerms) {
      try {
        // Using PatentsView API (public, no key required)
        const response = await fetch(
          `https://patentsview.org/api/patents/query?q={"text_any":"${encodeURIComponent(term)}"}&f=["patent_number","patent_title","inventors","filing_date"]&s=[{"patent_number":"asc"}]&per_page=${limit}`
        );
        const data = await response.json();

        if (data.patents) {
          for (const patent of data.patents) {
            const inventors = patent.inventors || [];
            
            for (const inventor of inventors) {
              const nomineeMatch = nominees.find(n => 
                n.name?.toLowerCase().includes(inventor.inventor_name?.toLowerCase()) ||
                inventor.inventor_name?.toLowerCase().includes(n.name?.toLowerCase())
              );

              if (nomineeMatch) {
                const signal = await base44.asServiceRole.entities.SignalCard.create({
                  nominee_id: nomineeMatch.id,
                  headline: `Patent Filed: ${patent.patent_title}`,
                  evidence_links: [`https://patents.google.com/patent/${patent.patent_number}`],
                  source_name: 'USPTO PatentsView',
                  signal_type: 'patent',
                  signal_date: patent.filing_date || new Date().toISOString(),
                  confidence: 'A',
                  author_name: inventor.inventor_name,
                  author_bio: inventor.inventor_state || '',
                  organization: inventor.inventor_organization || '',
                  impact_metrics: { citation_count: 0, h_index: 0, views: 0 },
                  tags: ['innovation', 'patent'],
                  ai_summary: `${inventor.inventor_name} filed patent: "${patent.patent_title}" (${patent.patent_number})`,
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
      eventName: 'signal_ingestion_uspto',
      properties: { created: createdSignals.length, errors: errors.length }
    });

    return Response.json({ created: createdSignals.length, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});