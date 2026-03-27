import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contactId, headline, message, company, position } = await req.json();

    if (!contactId || !message) {
      return Response.json({ error: 'contactId and message are required' }, { status: 400 });
    }

    // Use InvokeLLM to evaluate the message based on TIER-S rubric
    const evaluationPrompt = `You are an institutional alignment evaluator for TOP 100 Women in Aerospace. Score this LinkedIn message using the TIER-S Rubric on a 0-20 scale across four dimensions.

**Person Profile:**
- Headline: ${headline || 'Not provided'}
- Company: ${company || 'Not provided'}
- Position: ${position || 'Not provided'}

**Their Message:**
"${message}"

**Scoring Rubric:**

1. **Talent Graph Authority (0-5)**: Does this person/message increase our data asset's density?
   - 5 pts: VP/C-suite at SpaceX, NASA, Boeing offering verified program insights
   - 3 pts: Engineer from Tier 1 program claiming Flightography records
   - 1 pt: General professional with no specific program credits

2. **Institutional Revenue Potential (0-5)**: Does this align with our 7 revenue streams?
   - 5 pts: Direct sponsorship inquiry ($10K-$150K) or Strategic Residency
   - 3 pts: Interest in Visibility Accelerators or Project Builds
   - 1 pt: Generic "pick your brain" with no budget

3. **Ecosystem Gravity (0-5)**: Does this amplify our Global Stage prestige?
   - 5 pts: Tier 1 Media (WSJ, Aviation Week) or HypeSquad ambassador
   - 3 pts: TOP 100 Women nomination from credible peer
   - 1 pt: Generic praise or low-effort networking

4. **Rigor & Scalability (0-5)**: Can this be systematized?
   - 5 pts: Partnership proposal building repeatable Transformation System
   - 3 pts: Feedback on voting integrity or governance improvements
   - 1 pt: One-off request requiring manual labor

Return a JSON object with:
{
  "talent_graph_score": number (0-5),
  "institutional_revenue_score": number (0-5),
  "ecosystem_gravity_score": number (0-5),
  "rigor_scalability_score": number (0-5),
  "reasoning": "Clear explanation of each score and overall tier classification"
}`;

    const evaluation = await base44.integrations.Core.InvokeLLM({
      prompt: evaluationPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          talent_graph_score: { type: 'number' },
          institutional_revenue_score: { type: 'number' },
          ecosystem_gravity_score: { type: 'number' },
          rigor_scalability_score: { type: 'number' },
          reasoning: { type: 'string' }
        },
        required: ['talent_graph_score', 'institutional_revenue_score', 'ecosystem_gravity_score', 'rigor_scalability_score', 'reasoning']
      }
    });

    // Calculate total score and tier
    const totalScore = 
      evaluation.talent_graph_score + 
      evaluation.institutional_revenue_score + 
      evaluation.ecosystem_gravity_score + 
      evaluation.rigor_scalability_score;

    let tierClassification = 'C-Tier';
    if (totalScore >= 16) tierClassification = 'S-Tier';
    else if (totalScore >= 11) tierClassification = 'A-Tier';
    else if (totalScore >= 6) tierClassification = 'B-Tier';

    // Update the contact with triage scores
    const updated = await base44.entities.LinkedInContact.update(contactId, {
      triage_status: 'evaluated',
      tier_score: totalScore,
      tier_classification: tierClassification,
      talent_graph_score: evaluation.talent_graph_score,
      institutional_revenue_score: evaluation.institutional_revenue_score,
      ecosystem_gravity_score: evaluation.ecosystem_gravity_score,
      rigor_scalability_score: evaluation.rigor_scalability_score,
      triage_reasoning: evaluation.reasoning
    });

    return Response.json({
      success: true,
      contact: updated
    });
  } catch (error) {
    console.error('Evaluation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});