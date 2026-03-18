import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { source_user_id, target_user_id } = await req.json();

    if (!source_user_id || !target_user_id) {
      return Response.json({ error: 'Missing user IDs' }, { status: 400 });
    }

    if (source_user_id === target_user_id) {
      return Response.json({ error: 'Cannot merge user with itself' }, { status: 400 });
    }

    const sourceUser = await base44.asServiceRole.entities.User.get(source_user_id);
    const targetUser = await base44.asServiceRole.entities.User.get(target_user_id);

    if (!sourceUser || !targetUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Transfer all entity references
    const entityUpdates = [];

    // Nominees
    const nominees = await base44.asServiceRole.entities.Nominee.filter({ 
      nominated_by: sourceUser.email 
    });
    for (const nominee of nominees) {
      entityUpdates.push(
        base44.asServiceRole.entities.Nominee.update(nominee.id, {
          nominated_by: targetUser.email
        })
      );
    }

    // Claimed nominees
    const claimedNominees = await base44.asServiceRole.entities.Nominee.filter({
      claimed_by_user_email: sourceUser.email
    });
    for (const nominee of claimedNominees) {
      entityUpdates.push(
        base44.asServiceRole.entities.Nominee.update(nominee.id, {
          claimed_by_user_email: targetUser.email,
          claim_requested_by: nominee.claim_requested_by === sourceUser.email ? targetUser.email : nominee.claim_requested_by
        })
      );
    }

    // Pairwise Votes
    const pairwiseVotes = await base44.asServiceRole.entities.PairwiseVote.filter({
      voter_email: sourceUser.email
    });
    for (const vote of pairwiseVotes) {
      entityUpdates.push(
        base44.asServiceRole.entities.PairwiseVote.update(vote.id, {
          voter_email: targetUser.email
        })
      );
    }

    // Ranked Votes
    const rankedVotes = await base44.asServiceRole.entities.RankedVote.filter({
      voter_email: sourceUser.email
    });
    for (const vote of rankedVotes) {
      entityUpdates.push(
        base44.asServiceRole.entities.RankedVote.update(vote.id, {
          voter_email: targetUser.email
        })
      );
    }

    // Spotlight Votes
    const spotlightVotes = await base44.asServiceRole.entities.SpotlightVote.filter({
      voter_email: sourceUser.email
    });
    for (const vote of spotlightVotes) {
      entityUpdates.push(
        base44.asServiceRole.entities.SpotlightVote.update(vote.id, {
          voter_email: targetUser.email
        })
      );
    }

    // Endorsements
    const endorsements = await base44.asServiceRole.entities.Endorsement.filter({
      endorser_email: sourceUser.email
    });
    for (const endorsement of endorsements) {
      entityUpdates.push(
        base44.asServiceRole.entities.Endorsement.update(endorsement.id, {
          endorser_email: targetUser.email
        })
      );
    }

    // Achievements
    const achievements = await base44.asServiceRole.entities.Achievement.filter({
      user_email: sourceUser.email
    });
    for (const achievement of achievements) {
      entityUpdates.push(
        base44.asServiceRole.entities.Achievement.update(achievement.id, {
          user_email: targetUser.email
        })
      );
    }

    // TipEntry
    const tips = await base44.asServiceRole.entities.TipEntry.filter({
      author_email: sourceUser.email
    });
    for (const tip of tips) {
      entityUpdates.push(
        base44.asServiceRole.entities.TipEntry.update(tip.id, {
          author_email: targetUser.email
        })
      );
    }

    // Feedback
    const feedback = await base44.asServiceRole.entities.Feedback.filter({
      user_email: sourceUser.email
    });
    for (const fb of feedback) {
      entityUpdates.push(
        base44.asServiceRole.entities.Feedback.update(fb.id, {
          user_email: targetUser.email
        })
      );
    }

    // MeritSnapshot
    const merits = await base44.asServiceRole.entities.MeritSnapshot.filter({
      user_email: sourceUser.email
    });
    for (const merit of merits) {
      entityUpdates.push(
        base44.asServiceRole.entities.MeritSnapshot.update(merit.id, {
          user_email: targetUser.email
        })
      );
    }

    // FestivalStamp
    const stamps = await base44.asServiceRole.entities.FestivalStamp.filter({
      user_email: sourceUser.email
    });
    for (const stamp of stamps) {
      entityUpdates.push(
        base44.asServiceRole.entities.FestivalStamp.update(stamp.id, {
          user_email: targetUser.email
        })
      );
    }

    // Execute all updates
    await Promise.all(entityUpdates);

    // Merge numeric fields (stardust, scores, etc.)
    await base44.asServiceRole.entities.User.update(target_user_id, {
      stardust_points: (targetUser.stardust_points || 0) + (sourceUser.stardust_points || 0),
      insight_points: (targetUser.insight_points || 0) + (sourceUser.insight_points || 0),
      total_votes_cast: (targetUser.total_votes_cast || 0) + (sourceUser.total_votes_cast || 0)
    });

    // Delete source user
    await base44.asServiceRole.entities.User.delete(source_user_id);

    return Response.json({
      success: true,
      message: `Successfully merged ${sourceUser.email} into ${targetUser.email}`,
      merged_count: entityUpdates.length
    });

  } catch (error) {
    console.error('Merge error:', error);
    return Response.json({ 
      error: 'Merge failed', 
      details: error.message 
    }, { status: 500 });
  }
});