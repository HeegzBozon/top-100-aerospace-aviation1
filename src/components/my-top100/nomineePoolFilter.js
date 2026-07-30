import { ARCHIVE_SEASON_IDS } from '@/components/archive/archiveVolumes';

// Historical archive volumes (Seasons 1 & 2 — women, men, combined) live in the
// Nominee collection but should NOT clutter the active nomination/voting pool.
// They remain fully visible on the /archive/:seasonId pages.

export const isArchiveNominee = (nominee) =>
  ARCHIVE_SEASON_IDS.includes(nominee?.season_id);

// Strip archive records out of a fetched nominee list to get the active pool.
export const filterPoolNominees = (list) =>
  (list || []).filter((nominee) => !isArchiveNominee(nominee));