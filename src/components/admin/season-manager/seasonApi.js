import { Season } from '@/entities/Season';

const DATE_FIELDS = ['start_date', 'end_date', 'nomination_start', 'nomination_end', 'voting_start', 'voting_end'];

const inheritDates = (src) => Object.fromEntries(DATE_FIELDS.map((f) => [f, src[f]]));

const cohortRecord = (group, c) => ({
  name: `${c.label} · ${group.name}`,
  ...inheritDates(group),
  status: 'planning',
  parent_season_id: group.id,
  cohort_key: c.key,
  cohort_label: c.label,
});

export async function createSeasonWithCohorts({ name, theme, dates, cohorts }) {
  const group = await Season.create({ name, theme, ...dates, status: 'planning', is_group: true });
  await Promise.all(cohorts.map((c) => Season.create(cohortRecord(group, c))));
  return group;
}

export const addCohort = (group, cohort) => Season.create(cohortRecord(group, cohort));

// Groups existing seasons under a new parent. Nominee season_id values are untouched —
// only the grouping fields on each member season are written. Archived seasons are refused.
export async function nestSeasons({ name, members }) {
  if (members.some((m) => m.season.status === 'archived')) throw new Error('Archived seasons are immutable and cannot be regrouped.');
  const pick = (field, latest) => {
    const vals = members.map((m) => m.season[field]).filter(Boolean).sort();
    return latest ? vals[vals.length - 1] : vals[0];
  };
  const group = await Season.create({
    name,
    is_group: true,
    status: 'planning',
    start_date: pick('start_date'),
    end_date: pick('end_date', true),
    nomination_start: pick('nomination_start') || pick('start_date'),
    nomination_end: pick('nomination_end', true) || pick('end_date', true),
    voting_start: pick('voting_start') || pick('start_date'),
    voting_end: pick('voting_end', true) || pick('end_date', true),
  });
  await Promise.all(members.map((m) => Season.update(m.season.id, {
    parent_season_id: group.id,
    cohort_key: m.key,
    cohort_label: m.label,
  })));
  return group;
}