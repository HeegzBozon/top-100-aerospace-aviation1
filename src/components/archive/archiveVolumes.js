export const ARCHIVE_VOLUMES = [
  // A volume is read as the flip book bound for it. `issueId` is the MagazineIssue the
  // volume is bound to — the TOP 100 Women 2025 edition is composed and reads now; the
  // earlier volumes are staged at the press as drafts, and the rack hands them to their
  // archive roster until they go to press. `path`/`livePath` stay as that fallback.
  // 2025 Women is the current live Volume (Season 3, status: rollover). Its order is
  // computed at runtime, not stored as finalized ranks, so the switcher routes it
  // to the live publication (livePath) rather than the immutable archive renderer.
  { seasonId: '68a4e3ee564cf684ff502a06', year: '2025', volume: 'Volume III', title: 'Women in Aerospace & Aviation', note: 'Season 3 — Live', livePath: '/Top100Women2025', issueId: '6ae068b36a73ba71ccabb3f7' },
  { seasonId: '6a6b70136ccb7c358f77dd7f', year: '2021', volume: 'TOP 100 Aviation & Aerospace Professionals 2021', title: 'TOP 100 Aviation & Aerospace Professionals', note: 'The Volume of Record', path: '/volume-one-top100', issueId: '6ae588ec81ec6a064209428f' },
  { seasonId: '696aec2d99297cdbe96ee71e', year: '2021', volume: 'TOP 100 Aviation & Aerospace Professionals 2021 · Component', title: 'Women in Aerospace & Aviation', note: 'Season 1', path: '/volume-one', issueId: '6ae588ec81ec6a0642094290' },
  { seasonId: '6a6b699d7b16a7017ce0c3c0', year: '2021', volume: 'TOP 100 Aviation & Aerospace Professionals 2021 · Component', title: 'Men in Aerospace & Aviation', note: 'Season 1', path: '/volume-one-men', issueId: '6ae588ec81ec6a0642094291' },
  { seasonId: '6a6b7954c924445e2599968d', year: '2022', volume: 'Volume II', title: 'TOP 100 Aviation & Aerospace Professionals', note: 'The Volume of Record', path: '/volume-two-top100', issueId: '6ae588ec81ec6a0642094292' },
  { seasonId: '6a6b756e5c6a4773130e2511', year: '2022', volume: 'Volume II · Component', title: 'Women in Aerospace & Aviation', note: 'Season 2', path: '/volume-two-women', issueId: '6ae588ec81ec6a0642094293' },
  { seasonId: '6a6b77cb2f46f1f0cae76d75', year: '2022', volume: 'Volume II · Component', title: 'Men in Aerospace & Aviation', note: 'Season 2', path: '/volume-two-men', issueId: '6ae588ec81ec6a0642094294' },
];

export const getVolumeIndex = (seasonId) =>
  ARCHIVE_VOLUMES.findIndex((v) => v.seasonId === seasonId);

export const ARCHIVE_SEASON_IDS = ARCHIVE_VOLUMES.map((v) => v.seasonId);

// Resolves a nominee's appearance (rank/volume) for a given archive season.
// After de-duplication, a single master nominee may carry appearances across
// multiple volumes via raw_nomination_data.archive_appearances.
export function getArchiveAppearance(nominee, seasonId) {
  const apps = nominee?.raw_nomination_data?.archive_appearances;
  if (Array.isArray(apps)) {
    const match = apps.find((a) => a.season_id === seasonId);
    if (match) return match;
  }
  if (nominee?.season_id === seasonId) {
    const r = nominee.raw_nomination_data || {};
    return { season_id: seasonId, rank: r.rank, volume: r.volume, artifact: r.artifact, source: r.source };
  }
  return null;
}

export const isArchiveNominee = (nominee) =>
  ARCHIVE_SEASON_IDS.includes(nominee?.season_id);

// ── Honoree publication slugs ──
// Canonical honoree URL is /honoree/<year>/<name-slug>-<id>. The trailing 24-hex
// id guarantees a deterministic Nominee.get(id) lookup (no scan, no collision);
// the slug prefix is what crawlers and humans read. Bare-ID or stale-slug
// requests are canonicalized client-side to the slug+ID form.
export function slugifyName(name) {
  return (name || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function buildHonoreeSlug(nominee) {
  const s = slugifyName(nominee?.name);
  const id = nominee?.id || '';
  return s ? `${s}-${id}` : id;
}

export function parseHonoreeParam(param) {
  const str = String(param || '');
  const m = str.match(/([a-f0-9]{24})$/i);
  if (!m) return { id: str, slug: '' };
  return { id: m[1], slug: str.slice(0, m.index).replace(/-+$/, '') };
}