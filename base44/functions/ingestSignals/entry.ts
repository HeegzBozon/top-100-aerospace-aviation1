import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

const API_CONFIG = {
    OPENALEX_URL: 'https://api.openalex.org/works',
    USPTO_URL: 'https://developer.uspto.gov/ibd-api/v1/patent/search',
};

Deno.serve(async (req) => {
    try {
        const body = await req.json();
        const { source, query, limit = 10 } = body;

        let signals = [];
        if (source === 'openalex') {
            signals = await fetchResearch(query, limit);
        } else if (source === 'uspto') {
            signals = await fetchPatents(query, limit);
        } else {
            return Response.json({ error: 'Unsupported source' }, { status: 400 });
        }

        // Trigger matching engine
        const matchResult = await base44.functions.invoke('matchSignalsToUsers', {
            action: 'match_signals',
            signals
        });

        return Response.json({
            success: true,
            source,
            signals_found: signals.length,
            match_report: matchResult.results
        });

    } catch (error) {
        console.error('Ingestion error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function fetchResearch(query, limit) {
    // Mocking OpenAlex response
    // In production, this would use fetch(API_CONFIG.OPENALEX_URL + '?search=' + encodeURIComponent(query))
    return [
        {
            title: `Advancements in ${query} Propulsion`,
            type: 'research',
            author_name: 'Sarah Chen', // Mocking a known nominee
            institution: 'SpaceX',
            publication_date: '2024-01-15',
            abstract: 'A breakthrough study on high-efficiency plasma thrusters...',
            source: 'OpenAlex',
            external_url: 'https://openalex.org/W123456789'
        }
    ];
}

async function fetchPatents(query, limit) {
    // Mocking USPTO response
    return [
        {
            title: `${query} Containment System`,
            type: 'patent',
            author_name: 'Dr. Marcus Wright',
            institution: 'Lockheed Martin',
            publication_date: '2023-11-20',
            summary: 'Novel magnetic confinement for aerospace applications.',
            source: 'USPTO',
            external_url: 'https://patents.google.com/patent/US9876543'
        }
    ];
}
