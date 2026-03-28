/**
 * Query the Aerospace Talent Graph for contributors to a specific program
 * Returns verified honorees and engineers who contributed
 * 
 * @param {string} programId - Program identifier
 * @param {number} limit - Max number of contributors (default: 5)
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { programId, limit = 5 } = await req.json();

    if (!programId) {
      return Response.json({ error: 'programId required' }, { status: 400 });
    }

    // Query Nominee entity for contributors to this program
    // Look for nominees with this program in their career_history or professional_role
    const nominees = await base44.entities.Nominee.filter(
      {
        // Match nominees who have listed this program
        $or: [
          { 'career_history': { $elemMatch: { company_name: { $regex: programId, $options: 'i' } } } },
          { 'affiliations': { $in: [programId] } },
          { 'organization': programId },
        ],
      },
      '-updated_date',
      limit
    ).catch(() => []);

    // Map to contributor format with verification status
    const contributors = nominees.map(nominee => ({
      id: nominee.id,
      name: nominee.name,
      avatar_url: nominee.avatar_url || nominee.photo_url,
      role: nominee.professional_role || nominee.title,
      contribution_dates: nominee.career_history?.[0]
        ? `${nominee.career_history[0].start_date || '?'} - ${nominee.career_history[0].end_date || 'Present'}`
        : null,
      verified_status: nominee.verified_status || 'unverified',
      peer_verified: nominee.verified_status === 'fully_verified' || nominee.verified_status === 'self_verified',
      impact_summary: nominee.impact_summary,
    }));

    return Response.json({ contributors });
  } catch (error) {
    console.error('[queryTalentGraphContributors]', error);
    return Response.json({ error: error.message, contributors: [] }, { status: 500 });
  }
});