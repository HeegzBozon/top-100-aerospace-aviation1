import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }

        // Get or create an active season
        let activeSeasons = await base44.entities.Season.filter({ status: 'active' });
        let activeSeason;
        
        if (activeSeasons.length === 0) {
            // Create a new active season
            activeSeason = await base44.entities.Season.create({
                name: "TOP 100 - Q3 2025",
                description: "The official voting season for the third quarter of 2025.",
                start_date: "2025-07-01",
                end_date: "2025-09-30",
                status: "active"
            });
        } else {
            activeSeason = activeSeasons[0];
        }

        // Get all nominees and update them to be active and linked to the season
        const allNominees = await base44.entities.Nominee.list();
        const activeNominees = allNominees.filter(n => n.status === 'active' && n.season_id === activeSeason.id);
        
        if (activeNominees.length < 2) {
            // Create sample nominees if we don't have enough
            const sampleNominees = [
                {
                    name: "Eleanor Vance",
                    title: "Lead Data Scientist",
                    company: "QuantumLeap AI",
                    description: "Pioneered a new machine learning model that increased predictive accuracy by 25%.",
                    nominated_by: user.email,
                    nominee_email: "eleanor.vance@quantumleap.ai",
                    status: "active",
                    season_id: activeSeason.id,
                    category: "Technology",
                    country: "USA",
                    industry: "Artificial Intelligence"
                },
                {
                    name: "Kenji Tanaka",
                    title: "Chief Product Officer", 
                    company: "Synergy Hub",
                    description: "Successfully launched three major product lines, resulting in a 200% growth in user base.",
                    nominated_by: user.email,
                    nominee_email: "kenji.tanaka@synergyhub.com",
                    status: "active",
                    season_id: activeSeason.id,
                    category: "Leadership",
                    country: "Japan",
                    industry: "SaaS"
                },
                {
                    name: "Fatima Al-Jamil",
                    title: "Head of Sustainable Design",
                    company: "EcoBuild Innovations", 
                    description: "Developed a new sustainable building material that is now used in projects worldwide.",
                    nominated_by: user.email,
                    nominee_email: "fatima.aljamil@ecobuild.ae",
                    status: "active",
                    season_id: activeSeason.id,
                    category: "Innovation",
                    country: "UAE",
                    industry: "Construction"
                }
            ];

            for (const nominee of sampleNominees) {
                await base44.entities.Nominee.create(nominee);
            }
        } else {
            // Update existing nominees to link them to the active season
            for (const nominee of allNominees.slice(0, 5)) {
                await base44.entities.Nominee.update(nominee.id, {
                    status: 'active',
                    season_id: activeSeason.id
                });
            }
        }

        // Get final counts
        const finalActiveNominees = await base44.entities.Nominee.filter({ 
            status: 'active', 
            season_id: activeSeason.id 
        });

        return new Response(JSON.stringify({
            success: true,
            message: "Voting setup completed successfully",
            data: {
                seasonId: activeSeason.id,
                seasonName: activeSeason.name,
                activeNominees: finalActiveNominees.length
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Setup error:', error);
        return new Response(JSON.stringify({ 
            error: `Setup failed: ${error.message}` 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});