import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const { action, signals } = body;

        if (action === 'match_signals') {
            const results = await performMatching(signals);
            return new Response(JSON.stringify({ success: true, results }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });

    } catch (error) {
        console.error('Matching service error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});

async function performMatching(signals) {
    const report = { matched_people: 0, matched_startups: 0, signals_processed: signals.length };

    // 1. Fetch all reference data (Alumni and Startups)
    const [nominees, startups] = await Promise.all([
        base44.entities.Nominee.list(),
        base44.entities.StartupProfile.list()
    ]);

    // Create lookup maps
    const emailToNominee = new Map(nominees.map(n => [n.nominee_email?.toLowerCase(), n]));
    const nameToNominee = new Map(nominees.map(n => [n.name?.toLowerCase(), n]));
    const companyToStartup = new Map(startups.map(s => [s.company_name?.toLowerCase(), s]));

    for (const signal of signals) {
        let matchedUserId = null;
        let matchedStartupId = null;

        // TIER 1: Exact Match (ID or Email)
        if (signal.author_email) {
            const nominee = emailToNominee.get(signal.author_email.toLowerCase());
            if (nominee) matchedUserId = nominee.id;
        }

        // TIER 2: Name & Affiliation Match
        if (!matchedUserId && signal.author_name) {
            const nominee = nameToNominee.get(signal.author_name.toLowerCase());
            // Double check with company/org if available
            if (nominee && signal.institution && nominee.company?.toLowerCase() === signal.institution.toLowerCase()) {
                matchedUserId = nominee.id;
            }
        }

        // TIER 3: Startup Affiliation
        if (signal.company_name) {
            const startup = companyToStartup.get(signal.company_name.toLowerCase());
            if (startup) matchedStartupId = startup.id;
        } else if (matchedUserId) {
            // Link signal to the user's startup if they are a founder
            const user = emailToNominee.get(nominees.find(n => n.id === matchedUserId)?.nominee_email?.toLowerCase());
            if (user && user.company) {
                const startup = companyToStartup.get(user.company.toLowerCase());
                if (startup) matchedStartupId = startup.id;
            }
        }

        // Record the signal
        if (matchedUserId || matchedStartupId) {
            await base44.entities.IntelligenceSignal.create({
                ...signal,
                matched_user_id: matchedUserId,
                matched_startup_id: matchedStartupId,
                verified_at: new Date().toISOString(),
                status: 'matched'
            });

            if (matchedUserId) report.matched_people++;
            if (matchedStartupId) report.matched_startups++;

            // Update Startup/Nominee readiness or signal count
            if (matchedStartupId) {
                await updateStartupStats(matchedStartupId);
            }
        }
    }

    return report;
}

async function updateStartupStats(startupId) {
    const signals = await base44.entities.IntelligenceSignal.filter({ matched_startup_id: startupId });
    const patentCount = signals.filter(s => s.type === 'patent').length;
    const researchCount = signals.filter(s => s.type === 'research').length;

    // Simple readiness score logic
    const readinessScore = Math.min(100, (patentCount * 10) + (researchCount * 5));

    await base44.entities.StartupProfile.update(startupId, {
        patent_count: patentCount,
        research_count: researchCount,
        readiness_score: readinessScore
    });
}
