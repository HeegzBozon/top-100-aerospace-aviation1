
import { createClient } from 'npm:@base44/sdk@0.1.0';
import Papa from 'npm:papaparse';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

// Batch processing helper
const processBatch = async (items, batchSize, processor) => {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResult = await processor(batch);
        results.push(...(Array.isArray(batchResult) ? batchResult : [batchResult]));
    }
    return results;
};

const handleCsvBootstrap = async (fileContent, season_id, report) => {
    const { data: records } = Papa.parse(fileContent, { header: true, skipEmptyLines: true });

    const nomineesToCreate = [];
    for (const record of records) {
        if (!record.name || !record.email) {
            report.nominees.errors++;
            report.nominees.error_details.push(`Skipped: ${record.name || 'Unknown'} - missing name or email`);
            continue;
        }

        // Convert pipe-separated strings back to arrays
        const achievements = record.achievements ? record.achievements.split('|').filter(Boolean) : [];
        const additionalLinks = record.additional_links ? record.additional_links.split('|').filter(Boolean) : [];

        // Calculate total spotlights
        const risingStarCount = parseInt(record.rising_star_count) || 0;
        const rockStarCount = parseInt(record.rock_star_count) || 0;
        const superStarCount = parseInt(record.super_star_count) || 0;
        const northStarCount = parseInt(record.north_star_count) || 0;
        const totalSpotlights = risingStarCount + rockStarCount + superStarCount + northStarCount;

        const nomineePayload = {
            name: record.name,
            nominee_email: record.email,
            title: record.title || '',
            company: record.organization || record.company || '',
            description: record.nomination_reason || record.description || '',
            bio: record.bio || '',
            linkedin_profile_url: record.linkedin_url || '',
            avatar_url: record.photo_url || record.avatar_url || '',
            website_url: record.website_url || '',
            additional_links: additionalLinks,
            season_id: season_id,
            status: 'active',
            elo_rating: parseFloat(record.eloScore || record.nominee_elo_rating) || 1200,
            borda_score: parseFloat(record.bordaScore) || 0,
            starpower_score: parseFloat(record.finalScore) || 0,
            direct_vote_count: parseInt(record.directVoteScore || record.nominee_direct_vote_count) || 0,
            total_wins: parseInt(record.totalWins || record.nominee_wins) || 0,
            total_losses: parseInt(record.totalLosses || record.nominee_losses) || 0,
            win_percentage: parseFloat(record.winPercentage) || 0,
            rising_star_count: risingStarCount,
            rock_star_count: rockStarCount,
            super_star_count: superStarCount,
            north_star_count: northStarCount,
            total_spotlights: totalSpotlights,
            endorsement_score: parseFloat(record.endorsement_score) || 0,
            nominated_by: record.nominated_by || 'imported@v1.com',
        };

        nomineesToCreate.push(nomineePayload);
    }

    // Process in batches of 20
    if (nomineesToCreate.length > 0) {
        await processBatch(nomineesToCreate, 20, async (batch) => {
            await base44.entities.Nominee.bulkCreate(batch);
            return batch;
        });
        report.nominees.imported = nomineesToCreate.length;
    }
    
    return report;
};

const handleJsonEnrich = async (fileContent, season_id, report) => {
    const parsedData = JSON.parse(fileContent);
    const sourceNominees = parsedData.data?.nominees || parsedData.nominees || [];
    const sourcePairwiseVotes = parsedData.data?.pairwise_votes || parsedData.pairwise_votes || [];
    const sourceRankedVotes = parsedData.data?.ranked_votes || parsedData.ranked_votes || [];

    // Get existing nominees
    const existingNominees = await base44.entities.Nominee.filter({ season_id });
    const emailToNomineeMap = new Map(existingNominees.map(n => [n.nominee_email.toLowerCase(), n]));
    const oldIdToNewNomineeMap = new Map();

    // Batch update nominees
    const updateOperations = [];
    for (const sourceNominee of sourceNominees) {
        if (!sourceNominee.email) continue;
        const existing = emailToNomineeMap.get(sourceNominee.email.toLowerCase());
        if (existing) {
            oldIdToNewNomineeMap.set(sourceNominee.id, existing);

            const totalSpotlights = (sourceNominee.rising_star_count || 0) + 
                                  (sourceNominee.rock_star_count || 0) + 
                                  (sourceNominee.super_star_count || 0) + 
                                  (sourceNominee.north_star_count || 0);
            
            const payload = {
                bio: sourceNominee.bio || existing.bio,
                website_url: sourceNominee.website_url || existing.website_url,
                elo_rating: sourceNominee.eloScore || sourceNominee.nominee_elo_rating || existing.elo_rating,
                borda_score: sourceNominee.bordaScore || existing.borda_score,
                starpower_score: sourceNominee.finalScore || existing.starpower_score,
                total_wins: sourceNominee.totalWins || existing.total_wins,
                total_losses: sourceNominee.totalLosses || existing.total_losses,
                win_percentage: sourceNominee.winPercentage || existing.win_percentage,
                rising_star_count: sourceNominee.rising_star_count || existing.rising_star_count,
                rock_star_count: sourceNominee.rock_star_count || existing.rock_star_count,
                super_star_count: sourceNominee.super_star_count || existing.super_star_count,
                north_star_count: sourceNominee.north_star_count || existing.north_star_count,
                total_spotlights: totalSpotlights,
            };
            
            updateOperations.push({ id: existing.id, data: payload });
        } else {
            report.nominees.errors++;
            report.nominees.error_details.push(`Nominee ${sourceNominee.email} not found in DB`);
        }
    }
    
    // Process updates in batches
    if (updateOperations.length > 0) {
        await processBatch(updateOperations, 15, async (batch) => {
            const promises = batch.map(op => base44.entities.Nominee.update(op.id, op.data));
            await Promise.all(promises);
            return batch;
        });
        report.nominees.updated = updateOperations.length;
    }

    // Import votes in smaller batches
    const pairwiseToCreate = [];
    for (const vote of sourcePairwiseVotes.slice(0, 1000)) { // Limit initial import
        const winner = oldIdToNewNomineeMap.get(vote.winner_id);
        const loser = oldIdToNewNomineeMap.get(vote.loser_id || (vote.nominee_a_id === vote.winner_id ? vote.nominee_b_id : vote.nominee_a_id));

        if (winner && loser && winner.id !== loser.id) {
            pairwiseToCreate.push({
                season_id: season_id,
                voter_email: 'imported@v1.com',
                winner_nominee_id: winner.id,
                loser_nominee_id: loser.id,
            });
        } else {
            report.pairwise_votes.errors++;
        }
    }
    
    if (pairwiseToCreate.length > 0) {
        await processBatch(pairwiseToCreate, 25, async (batch) => {
            await base44.entities.PairwiseVote.bulkCreate(batch);
            return batch;
        });
        report.pairwise_votes.imported = pairwiseToCreate.length;
    }

    // Import ranked votes in batches
    if (sourceRankedVotes && Array.isArray(sourceRankedVotes)) {
      const rankedToCreate = [];
      for (const vote of sourceRankedVotes) {
          const ballot = vote.ballot || [];
          if (vote.voter_email && ballot.length > 1) {
              // NOTE: This logic assumes the ballot contains CURRENT system nominee IDs.
              // Any ID reconciliation must happen before this file is generated and uploaded.
              rankedToCreate.push({
                  season_id: season_id,
                  voter_email: vote.voter_email,
                  ballot: ballot,
              });
          } else {
              report.ranked_votes.errors++;
              report.ranked_votes.error_details.push(`Skipped ballot for ${vote.voter_email || 'Unknown Voter'}: Missing voter email or ballot has less than 2 nominees.`);
          }
      }
      
      if (rankedToCreate.length > 0) {
          await processBatch(rankedToCreate, 25, async (batch) => {
              await base44.asServiceRole.entities.RankedVote.bulkCreate(batch);
              return batch;
          });
          report.ranked_votes.imported = rankedToCreate.length;
      }
    }

    return report;
};

Deno.serve(async (req) => {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { 
                status: 401, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }
        
        const token = authHeader.split(' ')[1];
        base44.auth.setToken(token);
        
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({ success: false, error: 'Admin access required' }), { 
                status: 403, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const { file_content, import_type, season_id } = await req.json();

        if (!season_id) {
            return new Response(JSON.stringify({ success: false, error: 'season_id is required' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const report = {
            nominees: { imported: 0, updated: 0, errors: 0, error_details: [] },
            pairwise_votes: { imported: 0, errors: 0, error_details: [] },
            ranked_votes: { imported: 0, errors: 0, error_details: [] },
        };
        
        let finalReport;
        if (import_type === 'csv_bootstrap') {
            finalReport = await handleCsvBootstrap(file_content, season_id, report);
        } else if (import_type === 'json_enrich') {
            finalReport = await handleJsonEnrich(file_content, season_id, report);
        } else {
            throw new Error(`Invalid import_type: ${import_type}`);
        }

        return new Response(JSON.stringify({ success: true, report: finalReport }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Universal Import Error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});
