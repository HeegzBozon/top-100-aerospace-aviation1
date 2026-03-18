import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
        }

        const { season_id } = await req.json();
        
        if (!season_id) {
            return Response.json({ error: 'season_id required' }, { status: 400 });
        }

        // Get all nominees for the season
        const nominees = await base44.asServiceRole.entities.Nominee.filter({ season_id });
        
        if (nominees.length === 0) {
            return Response.json({ error: 'No nominees found for this season' }, { status: 404 });
        }

        const allTags = [];
        let processed = 0;

        for (const nominee of nominees) {
            try {
                const profile = `
Name: ${nominee.name}
Title: ${nominee.title || 'N/A'}
Company: ${nominee.company || 'N/A'}
Industry: ${nominee.industry || 'N/A'}
Country: ${nominee.country || 'N/A'}
Bio: ${nominee.bio || nominee.description || 'N/A'}
Professional Role: ${nominee.professional_role || 'N/A'}
Category: ${nominee.category || 'N/A'}
Discipline: ${nominee.discipline || 'N/A'}
Achievements: ${nominee.achievements || 'N/A'}
                `.trim();

                const response = await base44.integrations.Core.InvokeLLM({
                    prompt: `Analyze this aerospace/aviation professional's profile and extract exactly 5 highly specific, searchable keywords/tags that capture their expertise, specialization, and unique attributes. 

Rules:
- Focus on technical skills, domains, technologies, and specializations
- Be specific (e.g., "Propulsion Systems" not just "Engineering")
- Include industry sectors, technologies, career stages
- Avoid generic terms like "Leader" or "Expert"
- Return only the tags, one per line

Profile:
${profile}`,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            tags: {
                                type: "array",
                                items: { type: "string" },
                                minItems: 5,
                                maxItems: 5
                            },
                            categories: {
                                type: "array",
                                items: { 
                                    type: "string",
                                    enum: ["skill", "industry", "achievement", "attribute", "technology", "geography"]
                                },
                                minItems: 5,
                                maxItems: 5
                            }
                        }
                    }
                });

                if (response.tags && response.categories) {
                    for (let i = 0; i < response.tags.length; i++) {
                        allTags.push({
                            nominee_id: nominee.id,
                            tag_name: response.tags[i],
                            category: response.categories[i],
                            suggested_by: user.email,
                            status: 'approved',
                            upvotes: 0
                        });
                    }
                }

                processed++;
                
                // Small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`Error processing nominee ${nominee.id}:`, error);
            }
        }

        // Bulk create all tags
        if (allTags.length > 0) {
            await base44.asServiceRole.entities.NomineeTag.bulkCreate(allTags);
        }

        return Response.json({
            success: true,
            processed,
            total_nominees: nominees.length,
            tags_generated: allTags.length
        });

    } catch (error) {
        console.error('Tag generation error:', error);
        return Response.json({ 
            error: error.message || 'Tag generation failed' 
        }, { status: 500 });
    }
});