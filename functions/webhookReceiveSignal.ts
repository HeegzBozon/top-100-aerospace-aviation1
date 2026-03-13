import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Webhook endpoint to receive signals from external integrations
 * Requires X-Signal-Key header for authentication
 * 
 * POST body:
 * {
 *   nominee_id: string,
 *   headline: string,
 *   evidence_links: string[],
 *   source_name: string,
 *   signal_type: "patent" | "publication" | "media_mention" | "citation",
 *   signal_date: ISO string,
 *   confidence: "A" | "B" | "C",
 *   tags?: string[],
 *   lens_mode?: string[]
 * }
 */
Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Signal-Key',
      },
    });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Auth via webhook key
    const webhookKey = req.headers.get('X-Signal-Key');
    const expectedKey = Deno.env.get('SIGNAL_WEBHOOK_KEY');

    if (!webhookKey || webhookKey !== expectedKey) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();

    // Validate required fields
    const required = [
      'nominee_id',
      'headline',
      'evidence_links',
      'source_name',
      'signal_type',
      'signal_date',
      'confidence',
    ];
    for (const field of required) {
      if (!payload[field]) {
        return Response.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const base44 = createClientFromRequest(req);

    // Create signal card
    const signal = await base44.asServiceRole.entities.SignalCard.create({
      nominee_id: payload.nominee_id,
      headline: payload.headline,
      evidence_links: payload.evidence_links,
      source_name: payload.source_name,
      signal_type: payload.signal_type,
      signal_date: payload.signal_date,
      confidence: payload.confidence,
      tags: payload.tags || [],
      lens_mode: payload.lens_mode || [],
    });

    return Response.json(
      {
        status: 'success',
        message: 'Signal received and created',
        signal_id: signal.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
});