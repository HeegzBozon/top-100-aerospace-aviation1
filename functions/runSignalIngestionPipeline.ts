import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const results = {
      openalex: { created: 0, errors: 0 },
      uspto: { created: 0, errors: 0 },
      spacenews: { created: 0, errors: 0 },
      usaspending: { created: 0, errors: 0 },
      mapSignals: { created: 0, errors: 0 }
    };

    // Run all ingestion functions in parallel
    const ingestionPromises = [
      base44.asServiceRole.functions.invoke('scanOpenAlexForSignals', {
        searchTerms: ['aerospace', 'spaceflight', 'satellite', 'orbital', 'launch'],
        limit: 100
      }).then(res => { results.openalex = res; }),
      
      base44.asServiceRole.functions.invoke('scanUSPTOForSignals', {
        searchTerms: ['aerospace', 'spacecraft', 'satellite', 'propulsion'],
        limit: 100
      }).then(res => { results.uspto = res; }),
      
      base44.asServiceRole.functions.invoke('scanSpaceNewsForSignals', {}).then(res => { 
        results.spacenews = res; 
      }),
      
      base44.asServiceRole.functions.invoke('scanUSAspendingForSignals', {
        agencies: ['10', '9', '7030'],
        limit: 100
      }).then(res => { results.usaspending = res; })
    ];

    await Promise.all(ingestionPromises);

    // After signals are created, trigger the mapping function
    try {
      const mapResult = await base44.asServiceRole.functions.invoke('mapSignalsToContributions', {});
      results.mapSignals = mapResult;
    } catch (err) {
      results.mapSignals = { error: err.message };
    }

    base44.analytics.track({
      eventName: 'signal_ingestion_pipeline_completed',
      properties: {
        total_created: Object.values(results).reduce((sum, r) => sum + (r.created || 0), 0),
        total_errors: Object.values(results).reduce((sum, r) => sum + (r.errors || 0), 0)
      }
    });

    return Response.json({ results, timestamp: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});