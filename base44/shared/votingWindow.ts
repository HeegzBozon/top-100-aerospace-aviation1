// One answer to "is voting open right now", used by every function that accepts a
// ballot. The window lives on the Season record itself, so opening voting is a data
// change and never a code change: a cohort with status voting_open whose dates contain
// today is votable, and nothing else is.
//
// A group season (is_group) groups cohorts and holds no nominees; a ballot is recorded
// against the cohort the nominee belongs to, and a group is votable when any of its
// cohorts is.

const VOTABLE_STATUSES = ['active', 'approved', 'winner', 'finalist'];

export function windowState(season, now = new Date()) {
  if (!season) return { open: false, statusOpen: false, withinWindow: false };
  const start = season.voting_start ? new Date(season.voting_start) : null;
  const end = season.voting_end ? new Date(season.voting_end) : null;
  const statusOpen = season.status === 'voting_open';
  const withinWindow =
    (!start || Number.isNaN(start.getTime()) || start <= now) &&
    (!end || Number.isNaN(end.getTime()) || end >= now);
  return {
    open: statusOpen && withinWindow,
    statusOpen,
    withinWindow,
    start: season.voting_start || null,
    end: season.voting_end || null,
  };
}

// Every season a ballot can be cast in, and why it is (or is not) open.
export async function resolveCohorts(service, now = new Date()) {
  const seasons = await service.entities.Season.list('-created_date', 200);
  const cohorts = (seasons || []).filter((s) => !s.is_group);
  const groups = (seasons || []).filter((s) => s.is_group);

  const resolved = cohorts.map((cohort) => {
    const state = windowState(cohort, now);
    const parent = groups.find((g) => g.id === cohort.parent_season_id) || null;
    return {
      id: cohort.id,
      name: cohort.name,
      cohort_key: cohort.cohort_key || null,
      cohort_label: cohort.cohort_label || cohort.name,
      status: cohort.status || null,
      parent_season_id: cohort.parent_season_id || null,
      parent_name: parent?.name || null,
      open: state.open,
      status_open: state.statusOpen,
      within_window: state.withinWindow,
      voting_start: state.start,
      voting_end: state.end,
    };
  });

  return {
    cohorts: resolved,
    groups: groups.map((g) => ({
      id: g.id,
      name: g.name,
      status: g.status || null,
      ...windowState(g, now),
    })),
    open: resolved.filter((c) => c.open),
  };
}

// The gate every ballot passes through. Returns the season the ballot is recorded
// against, or a reason it cannot be.
export async function assertVotingOpen(service, seasonId, now = new Date()) {
  if (!seasonId) return { ok: false, reason: 'No season was named for this ballot.' };

  const season = await service.entities.Season
    .get(seasonId)
    .catch((e) => (e.status === 404 ? null : Promise.reject(e)));

  if (!season) return { ok: false, reason: 'That season no longer exists.', code: 404 };

  const state = windowState(season, now);

  if (season.is_group) {
    // A group is a wrapper: it is votable while any cohort under it is.
    const { cohorts } = await resolveCohorts(service, now);
    const under = cohorts.filter((c) => c.parent_season_id === season.id);
    const openOne = under.find((c) => c.open);
    if (!state.open && !openOne) {
      return { ok: false, reason: closedReason(season, state), code: 409 };
    }
    return { ok: true, season, votable_until: state.end };
  }

  if (!state.open) {
    return { ok: false, reason: closedReason(season, state), code: 409 };
  }
  return { ok: true, season, votable_until: state.end };
}

function closedReason(season, state) {
  if (!state.statusOpen) {
    return `Balloting is not open for ${season.name || 'this cohort'} right now.`;
  }
  return `The ballot for ${season.name || 'this cohort'} is closed.`;
}

// A nominee stands in a ballot when they belong to the season being voted on and
// have not been rejected. The master record's participation index spans seasons;
// legacy records without one fall back to their own season and status.
export function isVotableNominee(nominee, seasonId) {
  if (!nominee) return false;
  const parts = nominee.raw_nomination_data?.season_participation;
  if (Array.isArray(parts) && parts.length) {
    return parts.some((p) => p && p.status && p.status !== 'rejected');
  }
  const inSeason =
    nominee.season_id === seasonId ||
    (Array.isArray(nominee.season_ids) && nominee.season_ids.includes(seasonId));
  return inSeason && VOTABLE_STATUSES.includes(nominee.status);
}