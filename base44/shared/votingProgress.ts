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

// The ladder is stated in completed sets, because a set is the unit an Analyst actually
// performs: four records, one order, one review. A set is ten points of experience, so a
// rung always falls on a whole number of sets and a Fellow can read their standing in the
// currency they work in rather than in points.
//
// Taking the first review up confers the office: an Analyst is what the ballot makes of
// whoever serves it, not something climbed into. The rungs above it name the experience
// that accumulates behind the office, and the last of them — Principal Analyst — is the
// full flight: one thousand seven hundred and four sets measured.
export const PRINCIPAL_SETS = 1704;

export const LEVELS = [
  { level: 1, name: 'Analyst', sets: 0 },
  { level: 2, name: 'Senior Analyst', sets: 120 },
  { level: 3, name: 'Lead Analyst', sets: 400 },
  { level: 4, name: 'Principal Analyst', sets: PRINCIPAL_SETS },
].map((step) => ({ ...step, at: step.sets * XP_PER_SET }));

// The interim marks. Four named levels over a thousand sets would be a grind, so the house
// names the ground between them: a mark every few sets early on, widening as the work
// deepens, and the last of them standing on the Principal threshold itself. Each one is
// recognition only — it confers no office and is never read by measurement.
export const SET_MILESTONES = [
  1, 3, 6, 10, 15, 25, 40, 60, 85, 115, 150,
  190, 240, 300, 400, 520, 660, 820, 1000, 1250, 1704,
];
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

// The next interim mark ahead of a count, and how far through the stretch to it the Fellow
// already stands. The measure at the head of the set reads from this, so the bar moves on
// the small increments rather than waiting out a whole named level.
export function nextMilestoneFor(setsCompleted) {
  const done = Math.max(0, Number(setsCompleted) || 0);
  const ahead = SET_MILESTONES.find((n) => n > done);
  if (!ahead) return null;
  const behind = [...SET_MILESTONES].reverse().find((n) => n <= done) || 0;
  return {
    sets: ahead,
    key: `sets_${ahead}`,
    label: `${ahead} set${ahead === 1 ? '' : 's'}`,
    to_next: ahead - done,
    progress: ahead > behind ? (done - behind) / (ahead - behind) : 0,
  };
}

// Record one accepted contribution. Called only after the vote itself has been
// written, so a failed ballot never moves the ladder.
export async function recordContribution(service, opts) {
  const { fellow_email, fellow_name, season_id, cohort_key, action, is_test } = opts || {};
  if (!fellow_email || !season_id || !action) {
    return { recorded: false, reason: 'Missing fellow, season, or action.' };
  }
  // A walkthrough of the ballot is recorded, but in its own lane: a test never moves the
  // Fellow's own xp, and a tester never mistakes their rehearsal for a contribution. One
  // row carries both lanes so the ballot stays one record per Fellow per season.
  const test = Boolean(is_test);

  // Experience is earned by completed sets and by nothing else: a saved ballot is its own
  // duty, recorded in its own figure, and never moves the ladder.
  const isSet = action === 'anchor_set';
  const xpGain = isSet ? XP_PER_SET : 0;

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

  // The Fellow's own lane, and the tester's. Only one of them moves.
  const priorXp = record?.xp || 0;
  const sets = (record?.sets_completed || 0) + (!test && isSet ? 1 : 0);
  const ballots = (record?.ballots_saved || 0) + (!test && !isSet ? 1 : 0);
  const comparisons = (record?.comparisons_recorded || 0) + (!test && isSet ? 7 : 0);
  const xp = priorXp + (test ? 0 : xpGain);

  const priorTestXp = record?.test_xp || 0;
  const testXp = priorTestXp + (test ? xpGain : 0);
  const testSets = (record?.test_sets_completed || 0) + (test && isSet ? 1 : 0);
  const testComparisons = (record?.test_comparisons_recorded || 0) + (test && isSet ? 7 : 0);

  const cohortKeys = new Set(record?.cohort_keys || []);
  if (cohort_key) cohortKeys.add(cohort_key);

  // The lane this call moved: its level, its count, its milestones.
  const before = levelFor(test ? priorTestXp : priorXp);
  const after = levelFor(test ? testXp : xp);
  // A tester's milestones are read off their own count, never written over the Fellow's.
  const fellowEarned = milestonesFor(sets, ballots);
  const earned = test ? milestonesFor(testSets, 0) : fellowEarned;
  const priorMilestones = test
    ? milestonesFor(record?.test_sets_completed || 0, 0)
    : record?.milestones || [];
  const fresh = earned.filter((m) => !priorMilestones.includes(m));

  const payload = {
    fellow_email,
    fellow_name: fellow_name || record?.fellow_name || null,
    season_id,
    cohort_keys: Array.from(cohortKeys),
    xp,
    level: levelFor(xp).level,
    level_name: levelFor(xp).name,
    sets_completed: sets,
    ballots_saved: ballots,
    comparisons_recorded: comparisons,
    test_xp: testXp,
    test_sets_completed: testSets,
    test_comparisons_recorded: testComparisons,
    milestones: fellowEarned,
    last_action: isSet ? 'anchor_set' : 'ranked_ballot',
    last_action_at: new Date().toISOString(),
  };

  const saved = record
    ? await service.entities.VotingContribution.update(record.id, payload)
    : await service.entities.VotingContribution.create(payload);

  return {
    recorded: true,
    is_test: test,
    progress: {
      ...after,
      sets_completed: test ? testSets : sets,
      ballots_saved: test ? 0 : ballots,
      comparisons_recorded: test ? testComparisons : comparisons,
      milestones: earned,
    },
    xp_gained: xpGain,
    leveled_up: after.level > before.level,
    new_milestones: fresh.map((key) => {
      const found = ALL_MILESTONES.find((m) => m.key === key);
      return { key, label: found?.label || key };
    }),
    record_id: saved?.id || null,
  };
}