import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { agencies = ['10', '11', '7030'], limit = 50 } = await req.json();
    const createdSignals = [];
    const errors = [];

    const nominees = await base44.asServiceRole.entities.Nominee.filter(
      { status: 'active' },
      '-updated_date',
      1000
    );

    // NASA (10), DoD (9), NSF (7030) agency codes
    for (const agency of agencies) {
      try {
        const response = await fetch(
          `https://api.usaspending.gov/api/v2/search/spending_by_award/?filter[]=award_type_codes[]=A&filter[]=agency_codes[]=${agency}&page=1&limit=${limit}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filters: {
                award_type_codes: ['A', 'B', 'C'],
                agency_codes: [agency]
              },
              page: 1,
              limit
            })
          }
        );

        const data = await response.json();

        if (data.results) {
          for (const award of data.results) {
            const awardText = `${award.recipient_name || ''} ${award.description || ''}`.toLowerCase();

            for (const nominee of nominees) {
              if (
                awardText.includes(nominee.name?.toLowerCase()) ||
                awardText.includes(nominee.company?.toLowerCase())
              ) {
                const signal = await base44.asServiceRole.entities.SignalCard.create({
                  nominee_id: nominee.id,
                  headline: `Awarded: ${award.description || 'Federal Contract/Grant'}`,
                  evidence_links: [`https://www.usaspending.gov/award/${award.award_id}`],
                  source_name: 'USAspending.gov',
                  signal_type: 'patent',
                  signal_date: award.date_signed || new Date().toISOString(),
                  confidence: 'B',
                  author_name: award.recipient_name || 'Unknown',
                  author_bio: '',
                  organization: award.recipient_name || '',
                  impact_metrics: { 
                    citation_count: 0,
                    h_index: 0,
                    views: 0,
                    funding_amount: award.total_obligated_amount || 0
                  },
                  tags: ['funding', 'government', 'aerospace'],
                  ai_summary: `${award.recipient_name} received federal funding`,
                  related_signal_ids: []
                });
                createdSignals.push(signal);
                break;
              }
            }
          }
        }
      } catch (err) {
        errors.push({ agency, error: err.message });
      }
    }

    base44.analytics.track({
      eventName: 'signal_ingestion_usaspending',
      properties: { created: createdSignals.length, errors: errors.length }
    });

    return Response.json({ created: createdSignals.length, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});