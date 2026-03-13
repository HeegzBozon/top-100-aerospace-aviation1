import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Discipline normalization factors (accounts for field size, visibility, etc.)
const DISCIPLINE_FACTORS = {
  'space_rd': 1.0,
  'commercial_aviation': 0.95,
  'defense': 0.90, // Often classified work = lower visibility
  'manufacturing': 0.85,
  'operations': 0.80, // Behind-the-scenes roles
  'engineering': 0.95,
  'policy': 0.85,
  'entrepreneurship': 1.05 // Higher risk, reward normalization
};

// Career stage multipliers
const CAREER_STAGE_MULTIPLIERS = {
  'early': 1.2, // Boost for emerging talent
  'mid': 1.0,
  'senior': 0.95,
  'executive': 0.90 // Expected to have achievements
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { nominee_id } = await req.json();

    const nominees = await base44.asServiceRole.entities.Nominee.filter({ id: nominee_id });
    if (!nominees || nominees.length === 0) {
      return Response.json({ error: 'Nominee not found' }, { status: 404 });
    }
    const nominee = nominees[0];

    // Base score starts at 50 (neutral)
    let score = 50;

    // Apply discipline adjustment
    const discipline = nominee.discipline || 'engineering';
    const disciplineFactor = DISCIPLINE_FACTORS[discipline] || 1.0;
    score *= disciplineFactor;

    // Apply career stage adjustment
    const careerStage = nominee.trajectory_metrics?.career_stage || 'mid';
    const stageMultiplier = CAREER_STAGE_MULTIPLIERS[careerStage] || 1.0;
    score *= stageMultiplier;

    // Regional representation boost (underrepresented regions)
    const country = nominee.country || '';
    if (['Africa', 'Latin America', 'Southeast Asia'].some(region => country.includes(region))) {
      score *= 1.1; // 10% boost for underrepresented regions
    }

    // Gender diversity adjustment (aerospace is male-dominated)
    // Note: This would ideally come from profile data
    // For now, placeholder logic

    // Cap score at 0-100
    score = Math.max(0, Math.min(100, score));

    return Response.json({
      score: Math.round(score * 100) / 100,
      breakdown: {
        discipline,
        disciplineFactor,
        careerStage,
        stageMultiplier
      }
    });

  } catch (error) {
    console.error('Error calculating normalization layer:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});