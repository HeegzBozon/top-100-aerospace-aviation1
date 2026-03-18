import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchTerms = ['aerospace', 'spaceflight', 'satellite'], limit = 50 } = await req.json();
    const createdWorks = [];
    const createdCredits = [];
    const errors = [];

    // Fetch active nominees and organizations for matching
    const nominees = await base44.asServiceRole.entities.Nominee.filter(
      { status: 'active' },
      '-updated_date',
      1000
    );

    const organizations = await base44.asServiceRole.entities.Organization.filter(
      { is_active: true },
      '-updated_date',
      500
    );

    for (const term of searchTerms) {
      try {
        const response = await fetch(
          `https://api.openalex.org/works?filter=display_name.search:${encodeURIComponent(term)}&per-page=${limit}&sort=publication_date:desc`
        );
        const data = await response.json();

        if (data.results) {
          for (const openAlexWork of data.results) {
            // Create Work entity
            const work = await base44.asServiceRole.entities.Work.create({
              title: openAlexWork.display_name,
              work_type: 'paper',
              description: openAlexWork.abstract_inverted_index ? 'Research paper' : 'Academic publication',
              publication_date: openAlexWork.publication_date,
              source_url: openAlexWork.id,
              publisher: openAlexWork.primary_location?.institution?.display_name || 'Unknown',
              topics: openAlexWork.topics?.slice(0, 5).map(t => t.display_name) || [],
              domain_ids: [],
              organization_id: openAlexWork.primary_location?.institution?.id || null,
              citation_count: openAlexWork.cited_by_count || 0,
              media_mention_count: 0,
              community_votes: 0,
              verification_status: 'ai_inferred',
              data_source: 'OpenAlex',
              external_id: openAlexWork.id
            });

            createdWorks.push(work);

            // Create WorkCredit for each author
            const authors = openAlexWork.authorships?.map(a => a.author?.display_name).filter(Boolean) || [];
            for (const authorName of authors) {
              const nomineeMatch = nominees.find(n =>
                n.name?.toLowerCase().includes(authorName?.toLowerCase()) ||
                authorName?.toLowerCase().includes(n.name?.toLowerCase())
              );

              if (nomineeMatch) {
                const credit = await base44.asServiceRole.entities.WorkCredit.create({
                  work_id: work.id,
                  nominee_id: nomineeMatch.id,
                  organization_id: work.organization_id,
                  role: 'Author',
                  contribution_type: 'author',
                  domain_ids: [],
                  contribution_summary: `Co-authored "${work.title}"`,
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
      eventName: 'work_ingestion_openalex',
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