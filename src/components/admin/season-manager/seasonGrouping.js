export const COHORT_PRESETS = [
  { key: 'women', label: 'Women' },
  { key: 'men', label: 'Men' },
  { key: 'angels', label: 'Angels' },
];

// Cohort keys that map to a NominationIntake.nomination_type track.
export const INTAKE_TRACKS = ['women', 'men', 'angels'];

const DONE = ['completed', 'archived'];
export const isDone = (s) => DONE.includes(s.status);

export const slugify = (v = '') => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

export function guessCohort(name = '') {
  const n = name.toLowerCase();
  if (/\bangels?\b/.test(n)) return COHORT_PRESETS[2];
  if (/\bwomen\b/.test(n)) return COHORT_PRESETS[0];
  if (/\bmen\b/.test(n)) return COHORT_PRESETS[1];
  return { key: '', label: '' };
}

export const cohortName = (s) => s.cohort_label || s.name;

export const isVotingConfigured = (s) => !s.voting_modes || Object.values(s.voting_modes).some(Boolean);

export function isScoringBalanced(s) {
  const c = s.scoring_config;
  if (!c || c.use_holistic_v3 === false) return true;
  const w = { perception_weight: 30, objective_weight: 30, sme_weight: 20, narrative_weight: 10, normalization_weight: 10, ...c };
  return w.perception_weight + w.objective_weight + w.sme_weight + w.narrative_weight + w.normalization_weight === 100;
}

export function groupSeasons(seasons = []) {
  const byParent = {};
  seasons.filter((s) => s.parent_season_id).forEach((c) => {
    (byParent[c.parent_season_id] ||= []).push(c);
  });
  const grouped = seasons.filter((s) => s.is_group).map((group) => ({
    group,
    cohorts: (byParent[group.id] || []).sort((a, b) => cohortName(a).localeCompare(cohortName(b))),
  }));
  const loose = seasons.filter((s) => !s.is_group && !s.parent_season_id);
  const groupIsPast = (g) => g.cohorts.length > 0 && g.cohorts.every(isDone);
  return {
    currentGroups: grouped.filter((g) => !groupIsPast(g)),
    pastGroups: grouped.filter(groupIsPast),
    looseCurrent: loose.filter((s) => !isDone(s)),
    loosePast: loose.filter(isDone),
  };
}