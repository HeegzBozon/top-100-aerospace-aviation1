import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { nominee_id } = await req.json();

    const nominees = await base44.asServiceRole.entities.Nominee.filter({ id: nominee_id });
    if (!nominees || nominees.length === 0) {
      return Response.json({ error: 'Nominee not found' }, { status: 404 });
    }
    const nominee = nominees[0];

    // Normalize ELO (1000-1600 range → 0-100)
    const eloNormalized = Math.max(0, Math.min(100, ((nominee.elo_rating || 1200) - 1000) / 6));

    // Normalize Borda (0-1000 range → 0-100)
    const bordaNormalized = Math.max(0, Math.min(100, (nominee.borda_score || 0) / 10));

    // Spotlight weighting (0-400 range → 0-100)
    const spotlightScore = (
      (nominee.north_star_count || 0) * 4 +
      (nominee.super_star_count || 0) * 3 +
      (nominee.rock_star_count || 0) * 2 +
      (nominee.rising_star_count || 0) * 1
    );
    const spotlightNormalized = Math.max(0, Math.min(100, spotlightScore / 4));

    // Profile completeness bonus (0-15 points)
    let completenessBonus = 0;
    if (nominee.bio && nominee.bio.length > 100) completenessBonus += 3;
    if (nominee.avatar_url) completenessBonus += 3;
    if (nominee.linkedin_profile_url) completenessBonus += 3;
    if (nominee.website_url) completenessBonus += 3;
    if (nominee.achievements) completenessBonus += 3;

    // Weighted average: ELO 40%, Borda 40%, Spotlights 15%, Completeness 5%
    const score = (
      eloNormalized * 0.40 +
      bordaNormalized * 0.40 +
      spotlightNormalized * 0.15 +
      completenessBonus * 0.05 / 0.15 * 100
    );

    return Response.json({
      score: Math.round(score * 100) / 100,
      breakdown: {
        elo: eloNormalized,
        borda: bordaNormalized,
        spotlights: spotlightNormalized,
        completeness: completenessBonus
      }
    });

  } catch (error) {
    console.error('Error calculating perception layer:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});