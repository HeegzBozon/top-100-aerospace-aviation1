import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';
import { assertVotingOpen } from '../../shared/votingWindow.ts';
import { recordContribution } from '../../shared/votingProgress.ts';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), { 
                status: 401, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const { season_id, ballot } = await req.json();
        
        if (!season_id || !Array.isArray(ballot)) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'season_id and ballot array are required' 
            }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        // Remove empty entries and ensure we have valid nominee IDs
        const cleanBallot = ballot.filter(id => id && typeof id === 'string');

        // A ballot is only written into a window that is open. Clearing a ballot stays
        // allowed at any time — withdrawing your own ranking is never a vote.
        if (cleanBallot.length > 0) {
            const gate = await assertVotingOpen(base44.asServiceRole, season_id);
            if (!gate.ok) {
                return new Response(JSON.stringify({
                    success: false,
                    error: gate.reason,
                    code: 'voting_closed',
                }), {
                    status: gate.code || 409,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }
        
        // Check if user already has a ranked vote for this season
        const existingVote = await base44.entities.RankedVote.filter({ 
            season_id, 
            voter_email: user.email 
        });

        if (cleanBallot.length === 0) {
            // User wants to clear their ballot - delete existing vote if it exists
            if (existingVote.length > 0) {
                await base44.entities.RankedVote.delete(existingVote[0].id);
                return new Response(JSON.stringify({ 
                    success: true, 
                    message: 'Ranked vote cleared successfully',
                    ballot_length: 0
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } else {
                // No existing vote and empty ballot - nothing to do
                return new Response(JSON.stringify({ 
                    success: true, 
                    message: 'No changes to save',
                    ballot_length: 0
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        const isNewVote = existingVote.length === 0;
        const priorLength = existingVote[0]?.ballot?.length || 0;
        
        if (existingVote.length > 0) {
            // Update existing vote
            await base44.entities.RankedVote.update(existingVote[0].id, {
                ballot: cleanBallot
            });
        } else {
            // Create new vote
            await base44.entities.RankedVote.create({
                season_id,
                voter_email: user.email,
                ballot: cleanBallot
            });
        }

        // Notify all admins about new reputation vote (only for new votes, not updates)
        if (isNewVote) {
            try {
                const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
                await Promise.all(admins.map(admin => 
                    base44.asServiceRole.entities.Notification.create({
                        user_email: admin.email,
                        title: '⭐ New Reputation Vote',
                        message: `${user.full_name || user.email} submitted a ranked ballot with ${cleanBallot.length} choices`,
                        type: 'info',
                        action_url: '/admin'
                    })
                ));
            } catch (notifError) {
                console.error('Failed to create admin notifications:', notifError);
            }
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: 'Ranked vote saved successfully',
            ballot_length: cleanBallot.length,
            progress: (isNewVote || cleanBallot.length > priorLength)
                ? await recordContribution(base44.asServiceRole, {
                    fellow_email: user.email,
                    fellow_name: user.full_name || null,
                    season_id,
                    cohort_key: null,
                    action: 'ranked_ballot',
                }).catch(() => null)
                : null
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Save ranked vote error:', error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: error.message || 'Unknown error occurred while saving ballot'
        }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
});