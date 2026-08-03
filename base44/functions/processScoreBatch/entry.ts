import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';
import { runProcessBatch } from '../../shared/scoreBatch.ts';

// This allows the function to be called directly via an endpoint if needed for debugging.
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { season_id, batch_index } = await req.json();

  if (season_id === undefined || batch_index === undefined) {
    return new Response(JSON.stringify({ success: false, error: 'season_id and batch_index are required' }), { status: 400 });
  }

  try {
    const result = await runProcessBatch(base44.asServiceRole, season_id, batch_index);
    return new Response(JSON.stringify({ success: true, ...result }));
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
});