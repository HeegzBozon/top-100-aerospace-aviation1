import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gather user's core profile data
    const userData = {
      export_date: new Date().toISOString(),
      export_version: '1.0',
      profile: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        app_role: user.app_role,
        handle: user.handle,
        avatar_url: user.avatar_url,
        headline: user.headline,
        bio: user.bio,
        location: user.location,
        industry_role: user.industry_role,
        expertise_tags: user.expertise_tags,
        created_date: user.created_date,
      },
      social_links: {
        linkedin_url: user.linkedin_url,
        twitter_url: user.twitter_url,
        instagram_url: user.instagram_url,
        tiktok_url: user.tiktok_url,
        youtube_url: user.youtube_url,
        website_url: user.website_url,
      },
      social_stats: user.social_stats || {},
      scores: {
        aura_score: user.aura_score,
        starpower_score: user.starpower_score,
        stardust_points: user.stardust_points,
        clout: user.clout,
        hype_score: user.hype_score,
        hype_level: user.hype_level,
      },
      engagement: {
        shares_count: user.shares_count,
        referrals_count: user.referrals_count,
        nominations_made: user.nominations_made,
        votes_influenced: user.votes_influenced,
        weekly_engagement_streak: user.weekly_engagement_streak,
        hype_missions_completed: user.hype_missions_completed,
        achievements_unlocked: user.achievements_unlocked,
      },
      exchange_credits: {
        xc_balance: user.xc_balance,
        xc_escrowed: user.xc_escrowed,
        xc_lifetime_earned: user.xc_lifetime_earned,
        xc_lifetime_spent: user.xc_lifetime_spent,
      },
      settings: {
        theme_mode: user.theme_mode,
        onboarding_completed: user.onboarding_completed,
        is_service_provider: user.is_service_provider,
      },
    };

    // Fetch related entities
    const [
      achievements,
      nominations,
      pairwiseVotes,
      rankedVotes,
      endorsements,
      tipEntries,
    ] = await Promise.all([
      base44.entities.Achievement.filter({ user_email: user.email }).catch(() => []),
      base44.entities.Nomination.filter({ created_by: user.email }).catch(() => []),
      base44.entities.PairwiseVote.filter({ voter_email: user.email }).catch(() => []),
      base44.entities.RankedVote.filter({ voter_email: user.email }).catch(() => []),
      base44.entities.Endorsement.filter({ endorser_email: user.email }).catch(() => []),
      base44.entities.TipEntry.filter({ author_email: user.email }).catch(() => []),
    ]);

    userData.related_data = {
      achievements: achievements.map(a => ({
        type: a.type,
        title: a.title,
        points: a.points,
        created_date: a.created_date,
      })),
      nominations_submitted: nominations.length,
      pairwise_votes_cast: pairwiseVotes.length,
      ranked_votes_cast: rankedVotes.length,
      endorsements_given: endorsements.length,
      tips_authored: tipEntries.map(t => ({
        title: t.title,
        category: t.category,
        created_date: t.created_date,
      })),
    };

    const jsonData = JSON.stringify(userData, null, 2);
    const filename = `user_data_${user.email.replace('@', '_at_')}_${new Date().toISOString().split('T')[0]}.json`;

    return new Response(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});