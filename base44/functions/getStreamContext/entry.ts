/**
 * GET /api/v1/tv/streams/{stream_id}/context
 * Fetch flightography context for a stream
 * 
 * System Logic:
 * 1. Look up the stream
 * 2. Find linked program(s) via StreamProgramBinding
 * 3. Query Flightography ledger for verified contributors to that program
 * 
 * Performance: Indexed queries on stream_id -> program_id -> nominee (verified)
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Extract stream_id from URL (assuming format: /api/v1/tv/streams/{stream_id}/context)
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const streamId = pathParts[5]; // Index of stream_id in /api/v1/tv/streams/{streamId}/context

    if (!streamId) {
      return Response.json(
        { error: 'stream_id required in path' },
        { status: 400 }
      );
    }

    // Fetch the stream
    const stream = await base44.asServiceRole.entities.Stream.filter(
      { id: streamId }
    ).then(results => results[0]);

    if (!stream) {
      return Response.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    // Fetch program bindings for this stream
    const bindings = await base44.asServiceRole.entities.StreamProgramBinding.filter(
      { stream_id: streamId, is_active: true },
      'created_date',
      10
    );

    if (bindings.length === 0) {
      return Response.json({
        stream: {
          id: stream.id,
          title: stream.title,
        },
        program: null,
        verified_contributors: [],
      });
    }

    const primaryBinding = bindings[0];

    // Query verified contributors to this program
    // Look for Nominees with career_history matching the program
    const contributors = await base44.asServiceRole.entities.Nominee.filter(
      {
        $or: [
          // Match by career history company/organization
          { 'career_history': { $elemMatch: { company_name: primaryBinding.program_name } } },
          // Match by affiliations
          { 'affiliations': { $in: [primaryBinding.program_name, primaryBinding.program_id] } },
          // Match by organization field
          { 'organization': primaryBinding.program_name },
        ],
        // Only verified/self-verified profiles
        'verified_status': { $in: ['self_verified', 'fully_verified', 'partially_verified'] },
      },
      '-updated_date',
      8
    ).catch(() => []);

    // Map to flightography response format
    const verifiedContributors = contributors.map(contributor => {
      const careerEntry = contributor.career_history?.find(
        entry => entry.company_name === primaryBinding.program_name
      ) || contributor.career_history?.[0];

      return {
        person_id: contributor.id,
        name: contributor.name,
        role: contributor.professional_role || contributor.title || 'Contributor',
        subsystem: careerEntry?.description || contributor.industry || 'Aerospace',
        status: contributor.verified_status === 'fully_verified' ? 'Peer Verified' : 'Self Verified',
        avatar_url: contributor.avatar_url || contributor.photo_url,
        profile_url: `/profiles/${contributor.id}`,
      };
    });

    // Build response
    const response = {
      stream: {
        id: stream.id,
        title: stream.title,
        category: stream.category,
      },
      program: {
        program_id: primaryBinding.program_id,
        name: primaryBinding.program_name,
        organization: primaryBinding.organization,
      },
      verified_contributors: verifiedContributors,
      total_contributors: verifiedContributors.length,
    };

    // Set cache headers (2 minutes for context—changes when contributions update)
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=120',
      'ETag': `context-${streamId}-${Date.now().toString().slice(-4)}`,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('[getStreamContext]', error);
    return Response.json(
      { error: error.message, verified_contributors: [] },
      { status: 500 }
    );
  }
});