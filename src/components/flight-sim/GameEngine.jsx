import { base44 } from '@/api/base44Client';

function getStatModifier(statValue) {
  return Math.floor((statValue - 10) / 2);
}

function rollD20() {
  return Math.floor(Math.random() * 20) + 1;
}

function getOutcome(total) {
  if (total <= 5) return 'critical_fail';
  if (total <= 10) return 'fail';
  if (total <= 16) return 'success';
  return 'critical_success';
}

function buildChoiceHistory(choices, campaign) {
  return choices.slice(-6).map(c => {
    const scene = campaign.scenes.find(s => s.id === c.sceneId);
    const choice = scene?.choices?.find(ch => ch.key === c.choiceKey);
    return `${scene?.title || c.sceneId}: ${choice?.label || c.choiceKey}`;
  }).join('. ');
}

function buildStatsString(stats) {
  return Object.entries(stats)
    .map(([k, v]) => `${k.toUpperCase()}:${v}`)
    .join(' ');
}

async function generateSceneContent(session, scene, priorChoiceKey, rollResult) {
  const { campaign, stats, choices } = session;
  const priorScene = campaign.scenes[campaign.scenes.findIndex(s => s.id === scene.id) - 1];
  const priorChoice = priorScene?.choices?.find(c => c.key === priorChoiceKey);
  const choiceHistory = buildChoiceHistory(choices, campaign);
  const statsStr = buildStatsString(stats);

  const prompt = `You are the narrative engine for Flight Simulator, a career simulation game set in aerospace and aviation. Your outputs are 2-3 paragraph scene continuations. Write in first-person present tense. Be aerospace-accurate. Do not use the word "journey". Do not use generic empowerment language.

CAMPAIGN: ${campaign.id}: ${campaign.title} — ${campaign.archetype}
SCENE: ${scene.title}
PLAYER PRIOR CHOICE: ${priorChoice?.label || priorChoiceKey}
STATS: ${statsStr}
${rollResult ? `ROLL: ${rollResult.total} — ${rollResult.outcome.replace('_', ' ')}` : ''}
PRIOR BEATS: ${choiceHistory || 'First scene'}
SETTING: ${campaign.setting}

Continue the scene. First-person, present tense. 2–3 paragraphs. Maintain aerospace accuracy. End at a natural decision point — do NOT include the choices themselves, just build to the moment.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: null,
  });
  return typeof response === 'string' ? response : String(response);
}

async function generateBossOutcome(session, scene, rollResult) {
  const { campaign, stats, choices } = session;
  const choiceHistory = buildChoiceHistory(choices, campaign);
  const statsStr = buildStatsString(stats);
  const outcomeLabel = rollResult.outcome.replace('_', ' ');

  const isCriticalSuccess = rollResult.outcome === 'critical_success';

  const prompt = `You are the narrative engine for Flight Simulator, a career simulation game set in aerospace and aviation. Write in first-person present tense. Be aerospace-accurate. Do not use the word "journey". Do not use generic empowerment language.

CAMPAIGN: ${campaign.id}: ${campaign.title} — ${campaign.archetype}
SCENE: ${scene.title} (BOSS MOMENT)
ROLL RESULT: ${rollResult.diceResult} + ${rollResult.modifier} modifier = ${rollResult.total} — ${outcomeLabel}
STATS: ${statsStr}
PRIOR BEATS: ${choiceHistory}

Generate the Boss Moment outcome. 2–3 paragraphs. First-person present tense.${isCriticalSuccess ? ' Include a specific detail honoring a real woman in aerospace or aviation who made a moment like this possible — authentic, not invented.' : ''} ${rollResult.outcome === 'critical_fail' || rollResult.outcome === 'fail' ? 'Include a recovery path — this is a career simulator, not a punishment game.' : ''} Make it feel genuinely consequential. This is the defining moment of the campaign.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: 'claude_sonnet_4_6',
    response_json_schema: null,
  });
  return typeof response === 'string' ? response : String(response);
}

async function saveSession(session, playerInfo, flightProfile, diceResult) {
  try {
    await base44.entities.GameSession.create({
      campaign_id: session.campaignId,
      player_name: playerInfo?.name || '',
      player_email: playerInfo?.email || '',
      player_consent: playerInfo?.consent || false,
      choices: session.choices,
      stats: session.stats,
      boss_roll_dice: diceResult?.diceResult || 0,
      boss_roll_modifier: diceResult?.modifier || 0,
      boss_roll_total: diceResult?.total || 0,
      boss_roll_outcome: diceResult?.outcome || '',
      flight_profile_classification: flightProfile?.classification || '',
      flight_profile_ecosystem_role: flightProfile?.ecosystemRole || '',
      completed_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Session save failed (non-blocking):', e.message);
  }
}

function executeDiceRoll(session, scene) {
  const stats = session.stats;
  const rollStats = scene.rollStats || [];
  const primaryStat = rollStats[0] ? stats[rollStats[0]] || 10 : 10;
  const secondaryStat = rollStats[1] ? stats[rollStats[1]] || 10 : 10;
  const avgStat = Math.round((primaryStat + secondaryStat) / 2);
  const modifier = getStatModifier(avgStat);
  const diceResult = rollD20();
  const total = diceResult + modifier;
  const outcome = getOutcome(total);
  return { diceResult, modifier, total, outcome, rollStats };
}

const GameEngine = {
  generateSceneContent,
  generateBossOutcome,
  saveSession,
  executeDiceRoll,
  getOutcome,
};

export default GameEngine;