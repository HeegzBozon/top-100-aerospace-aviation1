import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Static Fellow benchmark archetypes by sector (MVP — Matthew to refine)
const BENCHMARKS = {
  'C-01': { altitude: 13.2, velocity: 14.8, payload: 12.6, range: 11.4, resilience: 14.1, maneuver: 13.7 },
  'C-02': { altitude: 14.5, velocity: 10.2, payload: 13.8, range: 13.1, resilience: 12.4, maneuver: 11.9 },
};

const STAT_NAMES = {
  altitude: 'ALTITUDE', velocity: 'VELOCITY', payload: 'PAYLOAD',
  range: 'RANGE', resilience: 'RESILIENCE', maneuver: 'MANEUVER',
};

function buildDebriefPrompt({ classification, campaignId, stats, choices, bossRoll }) {
  const benchmark = BENCHMARKS[campaignId] || BENCHMARKS['C-01'];
  const statLines = Object.entries(stats)
    .map(([k, v]) => `${STAT_NAMES[k]}: ${v} (Fellow avg: ${benchmark[k]?.toFixed(1)})`)
    .join('\n');

  const sortedStats = Object.entries(stats).sort((a, b) => b[1] - a[1]);
  const topTwo = sortedStats.slice(0, 2).map(([k]) => STAT_NAMES[k]).join(' and ');
  const bottomTwo = sortedStats.slice(-2).map(([k]) => STAT_NAMES[k]).join(' and ');

  const choiceHistory = (choices || [])
    .map(c => `Scene ${c.sceneId}: chose "${c.choiceKey}"`)
    .join('; ');

  const bossLine = bossRoll?.outcome
    ? `Roll: d20(${bossRoll.diceResult}) + ${bossRoll.modifier} = ${bossRoll.total} → ${bossRoll.outcome.replace('_', ' ')}`
    : 'Boss roll: not recorded';

  return `You are a senior executive coach writing a Flight Debrief report for a TOP 100 Aerospace & Aviation flight simulation player. Write as a direct, experienced aerospace executive coach — not a therapist, not HR. Name strengths and weaknesses by their real impact. Every development recommendation must be specific and actionable, not generic.

PLAYER PROFILE: ${classification}
CAMPAIGN: ${campaignId}
STATS vs FELLOW BENCHMARK:
${statLines}

CHOICE HISTORY: ${choiceHistory || 'Not available'}
BOSS MOMENT: ${bossLine}

Write a coaching report with exactly these seven sections, using these exact headings:

## Your Profile
What the ${classification} classification means at a career level. Not a stat dump — a career narrative.

## Signature Strengths
Interpret ${topTwo} as career assets with specific aerospace context examples. Be direct.

## Blind Spots
Interpret ${bottomTwo} as real development gaps. Name the actual career impact of these gaps. Do not soften.

## Decision Fingerprint
3 behavioral patterns extracted from the choice history. Be specific to the actual choices made.

## The Boss Moment Read
Interpret the Boss Moment roll result (${bossLine}). What does it signal about how this person operates under maximum pressure? This is the most important section — do not be generic.

## Fellow Benchmark
Compare their stat profile to the TOP 100 Fellows cohort. Use plain numbers. State the highest-leverage gap explicitly: e.g. "Fellows in this archetype average RANGE 13.1. Yours is X. That gap is your highest-leverage development target."

## Your Next Mission
3 specific development actions ranked by highest leverage. Each must be specific enough to calendar: not "expand your network" but "request informational interviews with two Flight Directors at NASA JSC before Q3." Name real organizations, real roles, real timelines.

Rules:
- Target length: 900-1,200 words total
- First-person coaching voice ("Your ALTITUDE score...")  
- Never use the words: journey, empower, authentic, passion, impactful
- Aerospace-authentic throughout
- The Boss Moment section must be the most substantive section`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { stripe_session_id } = body;

    if (!stripe_session_id) {
      return Response.json({ error: 'stripe_session_id required' }, { status: 400 });
    }

    // Verify payment with Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(stripe_session_id);
    if (checkoutSession.payment_status !== 'paid') {
      return Response.json({ error: 'Payment not confirmed' }, { status: 402 });
    }

    const meta = checkoutSession.metadata;
    const stats = JSON.parse(meta.stats || '{}');
    const choices = JSON.parse(meta.choices || '[]');
    const bossRoll = JSON.parse(meta.boss_roll || '{}');

    const prompt = buildDebriefPrompt({
      classification: meta.classification,
      campaignId: meta.campaign_id,
      stats,
      choices,
      bossRoll,
    });

    const report = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
    });

    const reportText = typeof report === 'string' ? report : String(report);

    // Send via email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: meta.email,
      from_name: 'TOP 100 Aerospace & Aviation',
      subject: `Your Flight Debrief: ${meta.classification}`,
      body: `Hi ${meta.name || 'Pilot'},\n\nYour Flight Debrief report is ready.\n\n---\n\n${reportText}\n\n---\n\nTOP 100 Aerospace & Aviation\ntop100aero.space`,
    });

    return Response.json({ success: true, report: reportText });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});