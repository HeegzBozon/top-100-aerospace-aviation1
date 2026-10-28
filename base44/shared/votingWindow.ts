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

// The season a ballot is actually written into. A group season is only ever a wrapper —
// it holds no nominees — so a ballot named against one is recorded in the open cohort
// beneath it. Written with the ballot, not with the tally: a ballot filed on a group
// resolves to no nominees at all, and the measure loses the vote entirely.
export async function resolveRecordingSeason(service, seasonId, { nomineeIds = [], now = new Date() } = {}) {
  if (!seasonId) return null;
  const season = await service.entities.Season
    .get(seasonId)
    .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
  if (!season) return null;
  if (!season.is_group) return season.id;

  const { cohorts } = await resolveCohorts(service, now);
  const under = cohorts.filter((c) => c.parent_season_id === season.id && c.open);
  if (!under.length) return null;
  if (under.length === 1 || !nomineeIds.length) return under[0].id;

  // A group names several cohorts at once, so the ballot's own subjects decide which one
  // is counting: a vote belongs to the cohort the people in it stand in. Read record by
  // record — a batch filter named on the record's own id answers empty from the
  // service role, which would quietly file the ballot against the wrong cohort.
  const subjects = (
    await Promise.all(
      nomineeIds
        .filter(Boolean)
        .slice(0, 10)
        .map((id) => service.entities.Nominee.get(id).catch(() => null))
    )
  ).filter(Boolean);

  const tally = new Map();
  for (const n of subjects) {
    const ids = Array.isArray(n.season_ids) && n.season_ids.length ? n.season_ids : [n.season_id];
    for (const id of ids) {
      if (under.some((c) => c.id === id)) tally.set(id, (tally.get(id) || 0) + 1);
    }
  }
  const best = [...tally.entries()].sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : under[0].id;
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