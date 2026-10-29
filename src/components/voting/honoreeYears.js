// A candidate who has already stood in a closed volume is a returning honoree, and the
// institution's own record says so: the archive. Nothing here is a hand-kept flag — the
// badge is read from the seasons a person is a member of, and only the volumes whose
// windows have already closed count. The cohort counting now never badges.

function seasonYear(season) {
  const name = String(season?.name || '');
  const fromName = name.match(/(?:19|20)\d{2}/);
  if (fromName) return fromName[0];
  const end = season?.end_date || season?.voting_end;
  if (end) {
    const parsed = new Date(end);
    if (!Number.isNaN(parsed.getTime())) return String(parsed.getUTCFullYear());
  }
  return '';
}

// Map of closed season id → the year it is remembered by.
export function buildHonoreeYearIndex(seasons = [], activeSeasonId = '') {
  const index = new Map();
  const now = Date.now();
  for (const season of seasons) {
    if (!season?.id || season.id === activeSeasonId || season.is_group) continue;
    const end = season.end_date || season.voting_end;
    const ended = end ? new Date(end).getTime() < now : false;
    const closed = ended || ['archived', 'completed', 'rollover'].includes(season.status);
    if (!closed) continue;
    const year = seasonYear(season);
    if (year) index.set(season.id, year);
  }
  return index;
}

// The years a candidate has already been honoured in, most recent first.
export function honoreeYears(nominee, yearIndex) {
  if (!yearIndex || yearIndex.size === 0) return [];
  const seasonIds = new Set();
  if (nominee?.season_id) seasonIds.add(nominee.season_id);
  for (const id of nominee?.season_ids || []) if (id) seasonIds.add(id);
  // The master record keeps its membership index and archive appearances beside the
  // flat fields; a person whose volumes were merged in is only legible through them.
  const raw = nominee?.raw_nomination_data || {};
  for (const entry of raw.season_participation || []) {
    if (entry?.season_id && entry.status !== 'rejected') seasonIds.add(entry.season_id);
  }
  for (const entry of raw.archive_appearances || []) {
    if (entry?.season_id) seasonIds.add(entry.season_id);
  }

  const years = new Set();
  for (const id of seasonIds) {
    const year = yearIndex.get(id);
    if (year) years.add(year);
  }
  return [...years].sort().reverse();
}