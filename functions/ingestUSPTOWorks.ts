import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchTerms = ['aerospace', 'spacecraft', 'satellite'], limit = 50 } = await req.json();
    const createdWorks = [];
    const createdCredits = [];
    const errors = [];

    const nominees = await base44.asServiceRole.entities.Nominee.filter(
      { status: 'active' },
      '-updated_date',
      1000
    );

    for (const term of searchTerms) {
      try {
        const response = await fetch(
          `https://patentsview.org/api/patents/query?q={"text_any":"${encodeURIComponent(term)}"}&f=["patent_number","patent_title","inventors","filing_date"]&s=[{"patent_number":"asc"}]&per_page=${limit}`
        );
        const data = await response.json();

        if (data.patents) {
          for (const patent of data.patents) {
            // Create Work entity
            const work = await base44.asServiceRole.entities.Work.create({
              title: patent.patent_title,
              work_type: 'patent',
              description: `US Patent ${patent.patent_number}`,
              publication_date: patent.filing_date,
              source_url: `https://patents.google.com/patent/${patent.patent_number}`,
              publisher: 'USPTO',
              topics: ['innovation', 'patent'],
              domain_ids: [],
              organization_id: null,
              citation_count: 0,
              media_mention_count: 0,
              community_votes: 0,
              verification_status: 'ai_inferred',
              data_source: 'USPTO PatentsView',
              external_id: patent.patent_number
            });

            createdWorks.push(work);

            // Create WorkCredit for each inventor
            const inventors = patent.inventors || [];
            for (const inventor of inventors) {
              const nomineeMatch = nominees.find(n =>
                n.name?.toLowerCase().includes(inventor.inventor_name?.toLowerCase()) ||
                inventor.inventor_name?.toLowerCase().includes(n.name?.toLowerCase())
              );

              if (nomineeMatch) {
                const credit = await base44.asServiceRole.entities.WorkCredit.create({
                  work_id: work.id,
                  nominee_id: nomineeMatch.id,
                  organization_id: null,
                  role: 'Inventor',
                  contribution_type: 'inventor',
                  domain_ids: [],
                  contribution_summary: `Co-invented "${work.title}"`,
                  evidence_urls: [work.source_url],
                  verification_status: 'ai_inferred',
                  confidence_score: 0.8
                });
                createdCredits.push(credit);
              }
            }
          }
        }
      } catch (err) {
        errors.push({ term, error: err.message });
      }
    }

    base44.analytics.track({
      eventName: 'work_ingestion_uspto',
      properties: { works_created: createdWorks.length, credits_created: createdCredits.length, errors: errors.length }
    });

    return Response.json({
      works_created: createdWorks.length,
      credits_created: createdCredits.length,
      errors
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});