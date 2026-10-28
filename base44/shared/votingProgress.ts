// Persistent contribution progress.
//
// Until now the ballot counted sets in component state: close the tab and the work
// was gone. This records it against the Fellow and the season, so the ladder carries
// across sessions and devices.
//
// Progress is feedback, never measurement. Nothing here is read by discovery,
// ranking, or scoring — the record exists so a Fellow can see the work they have put
// in, not so the institution can weigh them differently for it.

export const XP_PER_SET = 10;
export const XP_PER_BALLOT = 25;

// The ladder. Thresholds are cumulative xp.
export const LEVELS = [
  { level: 1, name: 'Observer', at: 0 },
  { level: 2, name: 'Analyst', at: 60 },
  { level: 3, name: 'Reviewer', at: 160 },
  { level: 4, name: 'Senior Reviewer', at: 340 },
  { level: 5, name: 'Committee Member', at: 640 },
  { level: 6, name: 'Committee Chair', at: 1100 },
  { level: 7, name: 'Fellow of the Committee', at: 1800 },
];

// Sets-completed milestones, and the ballot milestone.
export const SET_MILESTONES = [1, 5, 15, 30, 60, 100];
export const BALLOT_MILESTONE = 'ballot_saved';

export function levelFor(xp) {
  const total = Math.max(0, Number(xp) || 0);
  let current = LEVELS[0];
  for (const step of LEVELS) {
    if (total >= step.at) current = step;
  }
  const next = LEVELS.find((s) => s.at > total) || null;
  const span = next ? next.at - current.at : 0;
  const into = total - current.at;
  return {
    level: current.level,
    name: current.name,
    xp: total,
    next_level: next?.level || null,
    next_name: next?.name || null,
    next_at: next?.at || null,
    to_next: next ? next.at - total : 0,
    progress: next ? Math.min(1, span ? into / span : 0) : 1,
  };
}

export function milestonesFor(setsCompleted, ballotsSaved) {
  const earned = SET_MILESTONES
    .filter((n) => setsCompleted >= n)
    .map((n) => `sets_${n}`);
  if (ballotsSaved > 0) earned.push(BALLOT_MILESTONE);
  return earned;
}

// Every milestone the ladder defines, so a surface can draw the ones still ahead.
export const ALL_MILESTONES = [
  ...SET_MILESTONES.map((n) => ({ key: `sets_${n}`, sets: n, label: `${n} set${n === 1 ? '' : 's'}` })),
  { key: BALLOT_MILESTONE, sets: null, label: 'Ballot submitted' },
];

// Record one accepted contribution. Called only after the vote itself has been
// written, so a failed ballot never moves the ladder.
export async function recordContribution(service, opts) {
  const { fellow_email, fellow_name, season_id, cohort_key, action } = opts || {};
  if (!fellow_email || !season_id || !action) {
    return { recorded: false, reason: 'Missing fellow, season, or action.' };
  }

  const isSet = action === 'anchor_set';
  const xpGain = isSet ? XP_PER_SET : XP_PER_BALLOT;

  let record = null;
  try {
    const found = await service.entities.VotingContribution.filter({
      fellow_email,
      season_id,
    });
    record = found?.[0] || null;
  } catch {
    record = null;
  }

  const priorXp = record?.xp || 0;
  const sets = (record?.sets_completed || 0) + (isSet ? 1 : 0);
  const ballots = (record?.ballots_saved || 0) + (isSet ? 0 : 1);
  const comparisons = (record?.comparisons_recorded || 0) + (isSet ? 7 : 0);
  const xp = priorXp + xpGain;

  const cohortKeys = new Set(record?.cohort_keys || []);
  if (cohort_key) cohortKeys.add(cohort_key);

  const before = levelFor(priorXp);
  const after = levelFor(xp);
  const earned = milestonesFor(sets, ballots);
  const priorMilestones = record?.milestones || [];
  const fresh = earned.filter((m) => !priorMilestones.includes(m));

  const payload = {
    fellow_email,
    fellow_name: fellow_name || record?.fellow_name || null,
    season_id,
    cohort_keys: Array.from(cohortKeys),
    xp,
    level: after.level,
    level_name: after.name,
    sets_completed: sets,
    ballots_saved: ballots,
    comparisons_recorded: comparisons,
    milestones: earned,
    last_action: isSet ? 'anchor_set' : 'ranked_ballot',
    last_action_at: new Date().toISOString(),
  };

  const saved = record
    ? await service.entities.VotingContribution.update(record.id, payload)
    : await service.entities.VotingContribution.create(payload);

  return {
    recorded: true,
    progress: { ...after, sets_completed: sets, ballots_saved: ballots, milestones: earned },
    xp_gained: xpGain,
    leveled_up: after.level > before.level,
    new_milestones: fresh.map((key) => {
      const found = ALL_MILESTONES.find((m) => m.key === key);
      return { key, label: found?.label || key };
    }),
    record_id: saved?.id || null,
  };
}