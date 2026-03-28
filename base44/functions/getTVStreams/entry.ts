/**
 * GET /api/v1/tv/streams
 * Fetch active streams for the TOP 100 TV grid
 * 
 * Returns cached "Starting 9" with sponsorship metadata and grid positioning
 * Performance: Heavily cached (Redis, 5-min TTL)
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all active streams, ordered by display_order
    const streams = await base44.asServiceRole.entities.Stream.filter(
      { is_active: true },
      'display_order',
      100
    );

    // Map to frontend payload format with sponsorship and metadata intact
    const payload = streams.map(stream => ({
      id: stream.id,
      title: stream.title,
      subtitle: stream.subtitle,
      description: stream.description,
      category: stream.category,
      source_type: stream.source_type,
      stream_url: stream.stream_url,
      thumbnail_url: stream.thumbnail_url,
      is_active: stream.is_active,
      status: stream.status,
      region: stream.region,
      
      // Grid positioning
      grid_row: stream.metadata?.grid_row,
      grid_column: stream.metadata?.grid_column,
      
      // Metadata for display
      icon: stream.metadata?.icon,
      domain: stream.metadata?.domain,
      signal_value: stream.metadata?.signal_value,
      
      // Sponsorship (ready for monetization tiers)
      sponsorship: stream.sponsorship || {
        is_sponsored: false,
        sponsor_name: null,
        sponsor_logo_url: null,
        overlay_asset_url: null,
        overlay_position: 'bottom-left',
      },
      
      // Timestamps
      created_date: stream.created_date,
      updated_date: stream.updated_date,
    }));

    // Set cache headers (5 minutes for active stream list)
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300', // 5 minutes
      'ETag': `streams-${Date.now().toString().slice(-4)}`,
    });

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('[getTVStreams]', error);
    return Response.json(
      { error: error.message, streams: [] },
      { status: 500 }
    );
  }
});