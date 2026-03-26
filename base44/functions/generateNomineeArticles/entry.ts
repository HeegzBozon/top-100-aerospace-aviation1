import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { nominee_ids, season_id } = await req.json();
    
    if (!Array.isArray(nominee_ids) || nominee_ids.length === 0) {
      return Response.json({ error: 'nominee_ids required as non-empty array' }, { status: 400 });
    }

    // Fetch nominees to generate articles for
    const nominees = await Promise.all(
      nominee_ids.map(id => base44.asServiceRole.entities.Nominee.read(id))
    );

    const articles = [];

    for (const nominee of nominees) {
      try {
        // Call journalist agent to generate article
        const prompt = `You are an investigative aerospace journalist. Write a 1500-2000 word editorial spotlight article about ${nominee.name}, a nominee in the TOP 100 Aerospace & Aviation.

Profile Details:
- Role: ${nominee.professional_role || 'N/A'}
- Company: ${nominee.company || 'N/A'}
- Industry: ${nominee.industry || 'N/A'}
- Bio: ${nominee.bio || nominee.description || 'N/A'}
- LinkedIn: ${nominee.linkedin_profile_url || 'N/A'}
- Achievements: ${nominee.achievements || 'N/A'}

Write an engaging narrative that:
1. Opens with a compelling hook about their impact in aerospace
2. Traces their career arc and key milestones
3. Highlights specific technical, leadership, or innovation achievements
4. Connects their work to broader industry trends
5. Concludes with their vision for the future of aerospace

Format the article in clean markdown with H2 headers for each section.`;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt,
          model: 'claude_sonnet_4_6',
        });

        // Update nominee with article
        await base44.asServiceRole.entities.Nominee.update(nominee.id, {
          editorial_article: response,
          article_generated_at: new Date().toISOString(),
          article_status: 'draft',
        });

        articles.push({
          nominee_id: nominee.id,
          nominee_name: nominee.name,
          article: response,
          status: 'generated',
        });
      } catch (err) {
        articles.push({
          nominee_id: nominee.id,
          nominee_name: nominee.name,
          status: 'failed',
          error: err.message,
        });
      }
    }

    return Response.json({
      success: true,
      generated_count: articles.filter(a => a.status === 'generated').length,
      failed_count: articles.filter(a => a.status === 'failed').length,
      articles,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});