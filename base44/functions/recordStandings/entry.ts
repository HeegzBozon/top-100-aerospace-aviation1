import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

Deno.serve(async (_req) => {
    // This function is intended to be run on a schedule (e.g., a cron job).
    // It doesn't require admin authentication if triggered by a trusted scheduler.
    // For manual triggering via UI in the future, auth should be re-added.
    
    try {
        console.log('Starting daily standings recording...');

        // 1. Find the active season
        const activeSeasons = await base44.entities.Season.filter({ status: 'active' });
        if (activeSeasons.length === 0) {
            return new Response(JSON.stringify({ message: 'No active season found. Exiting.' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        const activeSeason = activeSeasons[0];
        console.log(`Active season found: ${activeSeason.name} (ID: ${activeSeason.id})`);

        // 2. Get all active nominees for that season
        const nominees = await base44.entities.Nominee.filter({
            season_id: activeSeason.id,
            status: 'active'
        });

        if (nominees.length === 0) {
            return new Response(JSON.stringify({ message: 'No active nominees in this season. Exiting.' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        console.log(`Found ${nominees.length} active nominees.`);

        // 3. Sort nominees by starpower_score to determine rank
        const sortedNominees = nominees.sort((a, b) => (b.starpower_score || 0) - (a.starpower_score || 0));

        // 4. Make the process idempotent: delete any existing standings for today
        const today = new Date().toISOString().split('T')[0];
        const existingStandings = await base44.entities.Standing.filter({ date: today, season_id: activeSeason.id });

        if (existingStandings.length > 0) {
            console.log(`Deleting ${existingStandings.length} existing standings for today to prevent duplicates.`);
            await Promise.all(existingStandings.map(standing => base44.entities.Standing.delete(standing.id)));
        }

        // 5. Create new standing records for each nominee
        const standingRecords = sortedNominees.map((nominee, index) => ({
            nominee_id: nominee.id,
            season_id: activeSeason.id,
            date: today,
            rank: index + 1, // Rank is 1-based
            starpower_score: nominee.starpower_score || 0,
            elo_rating: nominee.elo_rating || 1200,
            borda_score: nominee.borda_score || 0,
        }));

        await base44.entities.Standing.bulkCreate(standingRecords);
        console.log(`Successfully created ${standingRecords.length} new standing records.`);

        return new Response(JSON.stringify({
            success: true,
            message: `Successfully recorded standings for ${standingRecords.length} nominees.`
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error recording daily standings:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});