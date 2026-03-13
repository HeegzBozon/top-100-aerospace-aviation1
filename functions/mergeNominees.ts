import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const serviceRoleClient = base44.asServiceRole;

    // Auth check
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { primaryNomineeId, secondaryNomineeIds, mergeOptions } = await req.json();

    if (!primaryNomineeId || !secondaryNomineeIds || secondaryNomineeIds.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Primary nominee ID and secondary nominee IDs are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch all nominees to merge
    const allNomineeIds = [primaryNomineeId, ...secondaryNomineeIds];
    const nominees = await serviceRoleClient.entities.Nominee.filter({
      id: { $in: allNomineeIds }
    });

    if (nominees.length !== allNomineeIds.length) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Some nominees could not be found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const primaryNominee = nominees.find(n => n.id === primaryNomineeId);
    const secondaryNominees = nominees.filter(n => n.id !== primaryNomineeId);

    if (!primaryNominee) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Primary nominee not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Prepare merged data
    const mergedData = { ...primaryNominee };

    // Merge email addresses
    if (mergeOptions.keepAllEmails) {
      const allEmails = new Set([
        primaryNominee.nominee_email,
        ...(primaryNominee.secondary_emails || []),
        ...secondaryNominees.map(n => n.nominee_email).filter(Boolean),
        ...secondaryNominees.flatMap(n => n.secondary_emails || [])
      ]);
      allEmails.delete(primaryNominee.nominee_email); // Remove primary email from secondary list
      mergedData.secondary_emails = Array.from(allEmails);
    }

    // Merge scores
    if (mergeOptions.mergeScores) {
      const scoreFields = [
        'elo_rating', 'borda_score', 'community_elo_rating', 'nominee_elo_rating',
        'community_borda_score', 'nominee_borda_score', 'community_direct_score',
        'nominee_direct_score', 'direct_vote_count', 'starpower_score', 'total_spotlights',
        'rising_star_count', 'rock_star_count', 'super_star_count', 'north_star_count',
        'total_wins', 'total_losses', 'pairwise_appearance_count', 'endorsement_score', 'clout'
      ];

      for (const field of scoreFields) {
        const totalScore = secondaryNominees.reduce((sum, nominee) => {
          return sum + (nominee[field] || 0);
        }, primaryNominee[field] || 0);
        
        if (totalScore > 0) {
          mergedData[field] = totalScore;
        }
      }

      // Recalculate win percentage if we have win/loss data
      if (mergedData.total_wins && mergedData.total_losses) {
        const totalGames = mergedData.total_wins + mergedData.total_losses;
        mergedData.win_percentage = totalGames > 0 ? (mergedData.total_wins / totalGames) * 100 : 0;
      }
    }

    // Combine text fields
    if (mergeOptions.combineAchievements) {
      const textFields = ['bio', 'achievements', 'description', 'nomination_reason'];
      
      for (const field of textFields) {
        const allText = [
          primaryNominee[field],
          ...secondaryNominees.map(n => n[field])
        ].filter(Boolean);
        
        if (allText.length > 1) {
          mergedData[field] = allText.join('\n\n--- MERGED ---\n\n');
        }
      }
    }

    // Keep best photo
    if (mergeOptions.keepBestPhoto) {
      const allPhotos = [
        primaryNominee.photo_url,
        primaryNominee.avatar_url,
        ...secondaryNominees.map(n => n.photo_url).filter(Boolean),
        ...secondaryNominees.map(n => n.avatar_url).filter(Boolean)
      ].filter(Boolean);
      
      // Prefer photo_url over avatar_url, and use the first valid one
      const bestPhoto = allPhotos.find(url => url && url.includes('photo')) || allPhotos[0];
      if (bestPhoto) {
        mergedData.photo_url = bestPhoto;
        if (!mergedData.avatar_url) {
          mergedData.avatar_url = bestPhoto;
        }
      }
    }

    // Fill in missing fields from secondary nominees
    const fieldsToFill = ['title', 'company', 'country', 'industry', 'linkedin_profile_url', 'professional_role'];
    for (const field of fieldsToFill) {
      if (!mergedData[field]) {
        const valueFromSecondary = secondaryNominees.find(n => n[field])?.[field];
        if (valueFromSecondary) {
          mergedData[field] = valueFromSecondary;
        }
      }
    }

    // Transfer votes and endorsements if requested
    if (mergeOptions.preserveVotes) {
      try {
        // Update PairwiseVotes
        const winnerVotes = await serviceRoleClient.entities.PairwiseVote.filter({
          winner_nominee_id: { $in: secondaryNomineeIds }
        });
        const loserVotes = await serviceRoleClient.entities.PairwiseVote.filter({
          loser_nominee_id: { $in: secondaryNomineeIds }
        });

        for (const vote of winnerVotes) {
          await serviceRoleClient.entities.PairwiseVote.update(vote.id, {
            winner_nominee_id: primaryNomineeId
          });
        }

        for (const vote of loserVotes) {
          await serviceRoleClient.entities.PairwiseVote.update(vote.id, {
            loser_nominee_id: primaryNomineeId
          });
        }

        // Update Endorsements
        const endorsements = await serviceRoleClient.entities.Endorsement.filter({
          nominee_id: { $in: secondaryNomineeIds }
        });

        for (const endorsement of endorsements) {
          await serviceRoleClient.entities.Endorsement.update(endorsement.id, {
            nominee_id: primaryNomineeId
          });
        }

        // Update SpotlightVotes
        const spotlightVotes = await serviceRoleClient.entities.SpotlightVote.filter({
          nominee_id: { $in: secondaryNomineeIds }
        });

        for (const vote of spotlightVotes) {
          await serviceRoleClient.entities.SpotlightVote.update(vote.id, {
            nominee_id: primaryNomineeId
          });
        }

        // Update RankedVotes (if they contain nominee references)
        // Note: This is more complex as RankedVotes store arrays of nominee IDs
        const rankedVotes = await serviceRoleClient.entities.RankedVote.list();
        for (const vote of rankedVotes) {
          let needsUpdate = false;
          const updatedBallot = vote.ballot.map(nomineeId => {
            if (secondaryNomineeIds.includes(nomineeId)) {
              needsUpdate = true;
              return primaryNomineeId;
            }
            return nomineeId;
          });

          if (needsUpdate) {
            // Remove duplicates and update
            const uniqueBallot = [...new Set(updatedBallot)];
            await serviceRoleClient.entities.RankedVote.update(vote.id, {
              ballot: uniqueBallot
            });
          }
        }

      } catch (voteError) {
        console.error('Error transferring votes:', voteError);
        // Don't fail the entire merge if vote transfer fails
      }
    }

    // Update the primary nominee with merged data
    await serviceRoleClient.entities.Nominee.update(primaryNomineeId, mergedData);

    // Delete secondary nominees
    for (const secondaryId of secondaryNomineeIds) {
      await serviceRoleClient.entities.Nominee.delete(secondaryId);
    }

    const updatedPrimaryNominee = await serviceRoleClient.entities.Nominee.filter({ id: primaryNomineeId });

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully merged ${secondaryNomineeIds.length} nominee${secondaryNomineeIds.length > 1 ? 's' : ''} into ${primaryNominee.name}.`,
      mergedNominee: updatedPrimaryNominee[0]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error merging nominees:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'An unexpected error occurred during the merge'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});