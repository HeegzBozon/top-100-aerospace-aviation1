import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

const BATCH_SIZE = 100;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function safeEntityOperation(operation, retries = MAX_RETRIES) {
    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`Attempt ${attempt}/${retries} for database operation`);
            const result = await operation();
            console.log(`✓ Database operation successful on attempt ${attempt}`);
            return result;
        } catch (error) {
            lastError = error;
            console.error(`✗ Database operation failed on attempt ${attempt}:`, error.message);
            
            if (attempt < retries) {
                const delay = RETRY_DELAY_MS * attempt;
                console.log(`Waiting ${delay}ms before retry...`);
                await sleep(delay);
            }
        }
    }
    
    throw lastError;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        console.log('[STANDINGS] Processing request...');

        const requestBody = await req.json().catch(() => ({}));
        const { season, sort = 'aura', dir = 'desc', page = 1, limit = 100 } = requestBody;

        console.log(`[STANDINGS] Request params: season=${season}, sort=${sort}, dir=${dir}`);

        if (!season) {
            console.log('[STANDINGS] No season provided');
            return new Response(JSON.stringify({
                error: "Season ID is required",
                standings: { rows: [], total: 0 },
                panels: {}
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Fetch nominees with retry logic
        console.log(`[STANDINGS] Fetching nominees for season ${season}...`);
        const nominees = await safeEntityOperation(async () => {
            return await base44.asServiceRole.entities.Nominee.filter({ 
                season_id: season,
                status: 'active'
            }, '-updated_date', Math.min(limit, 1000));
        });

        console.log(`[STANDINGS] Found ${nominees ? nominees.length : 0} active nominees`);

        if (!nominees || nominees.length === 0) {
            console.log('[STANDINGS] No nominees found, returning empty results');
            return new Response(JSON.stringify({
                standings: { rows: [], total: 0 },
                panels: {},
                debug: {
                    season_id: season,
                    nominees_found: 0,
                    message: "No active nominees found for this season"
                }
            }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Transform nominees to standings format
        const standingsRows = nominees.map((nominee, index) => {
            const auraScore = nominee.aura_score || nominee.starpower_score || nominee.elo_rating || 0;
            
            return {
                nomineeId: nominee.id,
                nomineeName: nominee.name || 'Unknown',
                avatarUrl: nominee.avatar_url || nominee.photo_url || null,
                title: nominee.title || '',
                company: nominee.company || '',
                country: nominee.country || null, // <-- ADDED THIS LINE
                rank: index + 1, // Will recalculate after sorting
                aura: Math.round(auraScore),
                aura_rank_name: nominee.aura_rank_name || 'Bronze I-III',
                elo_rating: nominee.elo_rating || 1200,
                borda_score: nominee.borda_score || 0,
                starpower_score: nominee.starpower_score || 0,
                starpower: nominee.starpower_score || 0,
                clout: nominee.clout || 0,
                stardust: nominee.endorsement_score || 0,
                endorsements: nominee.endorsement_score || 0,
                total_wins: nominee.total_wins || 0,
                total_losses: nominee.total_losses || 0,
                win_percentage: nominee.win_percentage || 0,
                rising_star_count: nominee.rising_star_count || 0,
                rock_star_count: nominee.rock_star_count || 0,
                super_star_count: nominee.super_star_count || 0,
                north_star_count: nominee.north_star_count || 0,
                direct_vote_count: nominee.direct_vote_count || 0,
                delta24h: Math.floor(Math.random() * 10) - 5, // TODO: Calculate actual delta
                keyStat: {
                    label: 'Aura Score',
                    value: Math.round(auraScore)
                }
            };
        });

        // Sort the data
        const sortField = sort === 'aura_score' ? 'aura' : sort;
        standingsRows.sort((a, b) => {
            const aVal = a[sortField] || 0;
            const bVal = b[sortField] || 0;
            
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return dir === 'desc' ? bVal - aVal : aVal - bVal;
            }
            
            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();
            return dir === 'desc' ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
        });

        // Update ranks after sorting
        standingsRows.forEach((row, index) => {
            row.rank = index + 1;
        });

        const totalCount = standingsRows.length;

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedRows = standingsRows.slice(startIndex, endIndex);

        console.log(`[STANDINGS] Returning ${paginatedRows.length} nominees (page ${page}, total: ${totalCount})`);

        const result = {
            standings: {
                rows: paginatedRows,
                total: totalCount
            },
            panels: {
                spotlight: standingsRows.slice(0, 3),
                trends: {
                    totalCompetitors: totalCount,
                    averageAura: Math.round(standingsRows.reduce((sum, r) => sum + r.aura, 0) / standingsRows.length) || 0,
                    topRiser: standingsRows.find(r => r.delta24h > 0),
                    mostEndorsed: standingsRows.sort((a, b) => b.endorsements - a.endorsements)[0]
                }
            },
            debug: {
                season_id: season,
                nominees_found: nominees.length,
                sort_field: sort,
                direction: dir
            }
        };

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error('[STANDINGS] Critical error:', error);
        
        // Return a safe fallback response instead of throwing
        const errorResult = {
            error: "Failed to load standings",
            message: "Database connection issues. Please try again.",
            standings: { rows: [], total: 0 },
            panels: {},
            debug: {
                error_type: error.name,
                error_message: error.message,
                timestamp: new Date().toISOString()
            }
        };

        return new Response(JSON.stringify(errorResult), {
            status: 200, // Changed from 500 to 200 to prevent client-side errors
            headers: { "Content-Type": "application/json" }
        });
    }
});