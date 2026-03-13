import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const createdWorks = [];
    const createdCredits = [];
    const errors = [];

    const nominees = await base44.asServiceRole.entities.Nominee.filter(
      { status: 'active' },
      '-updated_date',
      1000
    );

    try {
      const response = await fetch('https://api.spacedevs.com/2.0.0/news/?limit=100');
      const data = await response.json();

      if (data.results) {
        for (const article of data.results) {
          const articleText = `${article.title} ${article.summary || ''}`.toLowerCase();

          // Create Work entity for media mention
          const work = await base44.asServiceRole.entities.Work.create({
            title: article.title,
            work_type: 'media',
            description: article.summary || 'Aerospace news mention',
            publication_date: article.published_at,
            source_url: article.url,
            publisher: article.news_site || 'Unknown',
            topics: ['aerospace', 'news', 'media'],
            domain_ids: [],
            organization_id: null,
            citation_count: 0,
            media_mention_count: 1,
            community_votes: 0,
            verification_status: 'ai_inferred',
            data_source: 'SpaceDevs SNAPI',
            external_id: article.url
          });

          createdWorks.push(work);

          // Create WorkCredit for mentioned nominees
          for (const nominee of nominees) {
            if (
              articleText.includes(nominee.name?.toLowerCase()) ||
              articleText.includes(nominee.company?.toLowerCase()) ||
              (nominee.organization_history?.some(org => articleText.includes(org.toLowerCase())))
            ) {
              const credit = await base44.asServiceRole.entities.WorkCredit.create({
                work_id: work.id,
                nominee_id: nominee.id,
                organization_id: null,
                role: 'Mentioned',
                contribution_type: 'contributor',
                domain_ids: [],
                contribution_summary: `Featured in aerospace news: "${work.title}"`,
                evidence_urls: [work.source_url],
                verification_status: 'ai_inferred',
                confidence_score: 0.7
              });
              createdCredits.push(credit);
              break; // One credit per article
            }
          }
        }
      }
    } catch (err) {
      errors.push({ source: 'SpaceDevs SNAPI', error: err.message });
    }

    base44.analytics.track({
      eventName: 'work_ingestion_spacenews',
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