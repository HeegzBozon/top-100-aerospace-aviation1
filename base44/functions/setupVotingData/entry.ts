import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return new Response('Admin access required', { status: 403 });
        }

        // Create a sample season if none exists
        const existingSeasons = await base44.entities.Season.list();
        let activeSeason;
        
        if (existingSeasons.length === 0) {
            activeSeason = await base44.entities.Season.create({
                name: "Q1 2025 Recognition",
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
                status: "active",
                description: "Quarterly recognition voting season"
            });
        } else {
            // Ensure at least one season is active
            const activeSeasons = existingSeasons.filter(s => s.status === 'active');
            if (activeSeasons.length === 0) {
                activeSeason = await base44.entities.Season.update(existingSeasons[0].id, {
                    status: 'active'
                });
            } else {
                activeSeason = activeSeasons[0];
            }
        }

        // Create sample nominees if fewer than 2 exist
        const existingNominees = await base44.entities.Nominee.list();
        const activeNominees = existingNominees.filter(n => n.status === 'active');
        
        if (activeNominees.length < 2) {
            const sampleNominees = [
                {
                    name: "Alex Johnson",
                    title: "Senior Engineer",
                    company: "Tech Corp",
                    description: "Outstanding contributions to system architecture",
                    nominated_by: user.email,
                    status: "active"
                },
                {
                    name: "Sarah Chen",
                    title: "Product Manager", 
                    company: "Innovation Labs",
                    description: "Exceptional leadership in product development",
                    nominated_by: user.email,
                    status: "active"
                },
                {
                    name: "Michael Rodriguez",
                    title: "UX Designer",
                    company: "Creative Studio",
                    description: "Revolutionary user experience designs",
                    nominated_by: user.email,
                    status: "active"
                }
            ];

            for (const nominee of sampleNominees) {
                await base44.entities.Nominee.create(nominee);
            }
        }

        // Get final counts
        const finalSeasons = await base44.entities.Season.filter({ status: 'active' });
        const finalNominees = await base44.entities.Nominee.filter({ status: 'active' });

        return new Response(JSON.stringify({
            success: true,
            message: "Voting data setup completed",
            data: {
                activeSeasons: finalSeasons.length,
                activeNominees: finalNominees.length,
                seasonName: activeSeason.name
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