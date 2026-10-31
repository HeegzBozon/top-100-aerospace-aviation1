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

// Every closed volume a candidate is on the record as having stood in, most recent
// first, carrying the recorded position. A volume only badges once the archive holds an
// appearance entry for it: standing in a cohort is not the same as standing in the
// published volume, and a badge that cannot say where someone placed prints exactly
// that confusion on the card. The archive is the only authority here.
export function honoreeVolumes(nominee, yearIndex, byId) {
  if (!yearIndex || yearIndex.size === 0) return [];

  // The records that stand for this person: the row itself and whichever master it was
  // folded into. A superseded duplicate still renders as the candidate in the voting
  // pool, while the archive entry lives on the master, so the chain is read whole.
  const rows = [];
  const seen = new Set();
  let row = nominee;
  while (row?.id && !seen.has(row.id)) {
    seen.add(row.id);
    rows.push(row);
    const master = row.raw_nomination_data?.merged_into;
    row = master ? byId?.get(master) || null : null;
  }

  // The appearances index holds the volume's own title and the measured position.
  const filed = new Map();
  for (const source of rows) {
    for (const entry of source?.raw_nomination_data?.archive_appearances || []) {
      if (!entry?.season_id || filed.has(entry.season_id)) continue;
      filed.set(entry.season_id, {
        rank: typeof entry.rank === 'number' ? entry.rank : null,
        artifact: entry.artifact || '',
        volume: entry.volume || '',
        seasonName: entry.season_name || '',
      });
    }
  }

  // A membership entry can supply the position of an appearance filed without one. It
  // never introduces a volume of its own.
  for (const source of rows) {
    for (const entry of source?.raw_nomination_data?.season_participation || []) {
      const known = entry?.season_id ? filed.get(entry.season_id) : null;
      if (!known || known.rank != null || entry.status === 'rejected') continue;
      if (typeof entry.rank === 'number') filed.set(entry.season_id, { ...known, rank: entry.rank });
    }
  }

  const volumes = [];
  for (const [seasonId, detail] of filed) {
    const season = yearIndex.get(seasonId);
    if (!season) continue;
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