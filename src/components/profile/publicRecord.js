// Is the visitor looking at a public record?
//
// This mirrors the gate the record's own SEO already applies — a public status and at
// least one substantive field — and is read for one decision only: whether the foot of
// the page may carry the house's invitation. It writes nothing, reorders nothing, and is
// never consulted by profile SEO, the prerender, discovery or ranking.
const PUBLIC_STATUSES = ['active', 'approved', 'winner', 'finalist'];

export function isPublicRecord(profiles) {
  const nominee = profiles?.nominee;
  if (!nominee) return false;
  if (!PUBLIC_STATUSES.includes(nominee.status || 'active')) return false;
  return Boolean(
    (nominee.description && nominee.description.trim()) ||
      (nominee.bio && nominee.bio.trim()) ||
      (nominee.bio_extended && nominee.bio_extended.trim()) ||
      (Array.isArray(nominee.career_history) && nominee.career_history.length > 0) ||
      (Array.isArray(nominee.education) && nominee.education.length > 0) ||
      (Array.isArray(nominee.skills) && nominee.skills.length > 0) ||
      (nominee.editorial_article && nominee.article_status === 'published')
  );
}