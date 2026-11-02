import { STAGES, BUNDLES } from './inboxFunnel';

// Funnels shaped to what a member came for. Each names its bundles per stage; the member's
// answers to the Directory's "Why" pick which ones they start with.
const PRESETS = [
  { key: 'deals', label: 'Business development', goal: 'deals', stages: { top: ['captured', 'introductions', 'referrals'], mid: ['demos', 'proposals'], bottom: ['deals'] } },
  { key: 'career', label: 'Career', goal: 'career', stages: { top: ['captured', 'introductions', 'referrals'], mid: ['proposals'], bottom: ['offers'] } },
  { key: 'connect', label: 'Network', goal: 'connect', stages: { top: ['captured', 'introductions'], mid: ['referrals', 'demos'], bottom: [] } },
  { key: 'events', label: 'Conferences', goal: 'events', stages: { top: ['captured', 'referrals'], mid: ['introductions', 'demos'], bottom: ['deals'] } },
  { key: 'recognize', label: 'Recognition', goal: 'recognize', stages: { top: ['nominations'], mid: ['referrals'], bottom: [] } },
];
export const WHOLE = { key: 'all', label: 'Whole pipeline', stages: Object.fromEntries(STAGES.map((s) => [s.key, s.bundles.map((b) => b.key)])) };

// Founders and executives start with business development even when they did not tick it.
export const defaultFunnels = (intel = {}) => {
  const goals = new Set(intel.goals || []);
  if (['founder', 'executive', 'enterprise'].includes(intel.stage)) goals.add('deals');
  if (intel.stage === 'student') goals.add('career');
  return [...PRESETS.filter((p) => goals.has(p.goal)), WHOLE];
};

// A funnel drawn as stages of bundles, in the institution's stage order.
export const stagesOf = (funnel) => STAGES.map((s) => ({
  ...s, bundles: (funnel.stages[s.key] || []).map((k) => BUNDLES.find((b) => b.key === k)).filter(Boolean),
}));