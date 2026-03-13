import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Generate AI narrative summary for signals
 * Uses InvokeLLM to create human-readable impact narratives
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

    const unsummarizedSignals = await base44.asServiceRole.entities.SignalCard.filter(
      { ai_summary: { $eq: null } },
      '-signal_date',
      50
    );

    let summarizedCount = 0;
    const results = [];

    for (const signal of unsummarizedSignals) {
      try {
        // Build prompt from signal data
        const prompt = `Generate a 1-2 sentence narrative summary of this impact signal:
Signal Type: ${signal.signal_type}
Headline: ${signal.headline}
Source: ${signal.source_name}
Date: ${new Date(signal.signal_date).toLocaleDateString()}
Tags: ${signal.tags?.join(', ') || 'N/A'}

Create a concise, professional narrative that captures the significance of this achievement.`;

        const summary = await base44.integrations.Core.InvokeLLM({
          prompt,
        });

        await base44.asServiceRole.entities.SignalCard.update(signal.id, {
          ai_summary: typeof summary === 'string' ? summary : summary.toString(),
        });

        summarizedCount++;
        results.push({ signal_id: signal.id, status: 'summarized' });
      } catch (err) {
        console.error('Summarization error:', err);
        results.push({ signal_id: signal.id, status: 'error', error: err.message });
      }
    }

    return Response.json({
      status: 'success',
      processed: unsummarizedSignals.length,
      summarized: summarizedCount,
      results,
    });
  } catch (error) {
    return Response.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
});