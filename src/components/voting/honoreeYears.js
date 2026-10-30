// A candidate who has already stood in a closed volume is a returning honoree, and the
// institution's own record says so: the archive. Nothing here is a hand-kept flag — the
// badge is read from the volumes a person is a member of, and only volumes whose windows
// have already closed count. The cohort counting now never badges.

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

// Map of closed season id → the year and name it is remembered by.
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
    if (year) index.set(season.id, { year, name: season.name || '' });
  }
  return index;
}

// Every closed volume a candidate appears in, most recent first, carrying the recorded
// position where the archive holds one — the volume, its position, and the season the
// archive route is filed under.
export function honoreeVolumes(nominee, yearIndex) {
  if (!yearIndex || yearIndex.size === 0) return [];

  const raw = nominee?.raw_nomination_data || {};
  const filed = new Map();

  // The appearances index holds the volume's own title and the measured position.
  for (const entry of raw.archive_appearances || []) {
    if (!entry?.season_id) continue;
    filed.set(entry.season_id, {
      rank: typeof entry.rank === 'number' ? entry.rank : null,
      artifact: entry.artifact || '',
      volume: entry.volume || '',
      seasonName: entry.season_name || '',
    });
  }

  // Membership index: a volume without an appearance entry still counts as stood in.
  for (const entry of raw.season_participation || []) {
    if (!entry?.season_id || entry.status === 'rejected') continue;
    const known = filed.get(entry.season_id) || {};
    if (known.rank == null && typeof entry.rank === 'number') {
      filed.set(entry.season_id, { ...known, rank: entry.rank });
    } else if (!filed.has(entry.season_id)) {
      filed.set(entry.season_id, known);
    }
  }

  const seasonIds = new Set([nominee?.season_id, ...(nominee?.season_ids || []), ...filed.keys()].filter(Boolean));

  const volumes = [];
  for (const seasonId of seasonIds) {
    const season = yearIndex.get(seasonId);
    if (!season) continue;
    const detail = filed.get(seasonId) || {};
    volumes.push({
      seasonId,
      year: season.year,
      seasonName: detail.seasonName || season.name,
      artifact: detail.artifact || '',
      volume: detail.volume || '',
      rank: detail.rank ?? null,
    });
  }

  volumes.sort((a, b) => b.year.localeCompare(a.year));
  return volumes;
}