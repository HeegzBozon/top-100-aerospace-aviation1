export const ARCHIVE_VOLUMES = [
  { seasonId: '6a6b70136ccb7c358f77dd7f', year: '2021', volume: 'Volume I', title: 'TOP 100 Aviation & Aerospace Professionals', note: 'The Volume of Record', path: '/volume-one-top100' },
  { seasonId: '696aec2d99297cdbe96ee71e', year: '2021', volume: 'Volume I · Component', title: 'Women in Aerospace & Aviation', note: 'Season 1', path: '/volume-one' },
  { seasonId: '6a6b699d7b16a7017ce0c3c0', year: '2021', volume: 'Volume I · Component', title: 'Men in Aerospace & Aviation', note: 'Season 1', path: '/volume-one-men' },
  { seasonId: '6a6b7954c924445e2599968d', year: '2022', volume: 'Volume II', title: 'TOP 100 Aviation & Aerospace Professionals', note: 'The Volume of Record', path: '/volume-two-top100' },
  { seasonId: '6a6b756e5c6a4773130e2511', year: '2022', volume: 'Volume II · Component', title: 'Women in Aerospace & Aviation', note: 'Season 2', path: '/volume-two-women' },
  { seasonId: '6a6b77cb2f46f1f0cae76d75', year: '2022', volume: 'Volume II · Component', title: 'Men in Aerospace & Aviation', note: 'Season 2', path: '/volume-two-men' },
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