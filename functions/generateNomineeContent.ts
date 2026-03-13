import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { nominee_id } = await req.json();
        if (!nominee_id) {
            return new Response(JSON.stringify({ success: false, error: 'nominee_id is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const nominees = await base44.asServiceRole.entities.Nominee.filter({ id: nominee_id }, null, 1);
        if (!nominees || nominees.length === 0) {
            return new Response(JSON.stringify({ success: false, error: 'Nominee not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const nominee = nominees[0];

        const context = [
            `Professional Role: ${nominee.professional_role || nominee.title || 'Professional'}`,
            `Company: ${nominee.company || nominee.organization || 'their organization'}`,
            `Industry: ${nominee.industry || 'their industry'}`,
            `Country: ${nominee.country || 'their region'}`,
            nominee.description ? `Description: ${nominee.description}` : '',
            nominee.achievements ? `Achievements: ${nominee.achievements}` : '',
            nominee.nomination_reason ? `Nomination Reason: ${nominee.nomination_reason}` : '',
            nominee.linkedin_follow_reason ? `LinkedIn Follow Reason: ${nominee.linkedin_follow_reason}` : '',
            nominee.linkedin_proudest_achievement ? `Proudest Achievement: ${nominee.linkedin_proudest_achievement}` : ''
        ].filter(Boolean).join('\n');

        const prompt = `You are Lt. Perry, a skilled biographer. Create both a six-word story and professional bio for this nominee.

CRITICAL: Do NOT include the nominee's personal name. Use "this professional", "the nominee", "this leader" instead. You MAY include company names.

${context}

Create:
1. A six-word story capturing their essence
2. A 150-200 word professional bio highlighting their impact and achievements

Format as JSON with "six_word_story" and "bio" fields.`;

        const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    six_word_story: { type: "string" },
                    bio: { type: "string" }
                },
                required: ["six_word_story", "bio"]
            }
        });

        if (!aiResult || !aiResult.six_word_story || !aiResult.bio) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'AI failed to generate valid content' 
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        await base44.asServiceRole.entities.Nominee.update(nominee_id, {
            six_word_story: aiResult.six_word_story,
            bio: aiResult.bio
        });

        return new Response(JSON.stringify({
            success: true,
            data: {
                six_word_story: aiResult.six_word_story,
                bio: aiResult.bio
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error in generateNomineeContent:', error);
        
        const isRateLimitError = error.message && error.message.toLowerCase().includes('rate limit');
        
        return new Response(JSON.stringify({
            success: false,
            error: isRateLimitError ? 'Rate limit exceeded. Please wait a moment before trying again.' : (error.message || 'Unknown error occurred')
        }), {
            status: isRateLimitError ? 429 : 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});