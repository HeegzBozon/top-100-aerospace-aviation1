// The record's artifacts — the institutional objects a candidate has produced or
// appears in. One row per kind, composed only from what the record actually holds, so
// the file never promises a document that does not exist.
//
// To put a new artifact in front of a voter (a mini-doc, a filed issue, a press kit),
// add one entry to ARTIFACT_KINDS and nothing else changes: the panel renders whatever
// this list returns, in this order.
const ARTIFACT_KINDS = [
  // The archived volumes the person stood in. The same badge the card wears, opened.
  ({ volumes }) => volumes.map((volume) => ({
    key: `volume-${volume.seasonId}`,
    label: `${volume.year} Volume`,
    detail: volume.rank != null ? `Measured No. ${volume.rank} of 100` : 'On record',
    to: `/archive/${volume.seasonId}`,
  })),

  // Their staged post in the Top Viral Posts Series.
  ({ nominee }) => (nominee.viral_post_slug
    ? [{
        key: 'viral-post',
        label: 'Top Viral Posts Series',
        detail: nominee.viral_post_impressions || nominee.viral_post_takeaway || 'A post on record',
        to: `/viralpost2026/featured/${nominee.viral_post_slug}`,
      }]
    : []),

  // The editorial written about them, once it is published.
  ({ nominee }) => (nominee.editorial_article && nominee.article_status === 'published'
    ? [{ key: 'editorial', label: 'The editorial', detail: 'Published in the record' }]
    : []),

  // The record itself, opened at its canonical address.
  ({ nominee }) => (nominee.id
    ? [{ key: 'record', label: 'The public record', detail: 'The full profile in the directory', to: `/profiles/${nominee.id}` }]
    : []),
];

export function buildArtifacts({ nominee = {}, volumes = [] } = {}) {
  const ctx = { nominee, volumes: Array.isArray(volumes) ? volumes : [] };
  return ARTIFACT_KINDS.flatMap((kind) => {
    try {
      return kind(ctx) || [];
    } catch {
      return [];
    }
  }).filter((a) => a && a.label);
}