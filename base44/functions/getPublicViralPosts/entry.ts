import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Public endpoint — enumerates every Fellow whose Top Viral Post has been
// featured (viral_post_featured === true), for the /viralpost2026 series index.
// Returns only public fields + a byline joined from the claimed Nominee.
// Sorted by impressions, descending (most-liked first).
function parseImpressions(s) {
  if (!s) return 0;
  const m = String(s).toLowerCase().match(/([\d.,]+)\s*([km])?/);
  if (!m) return 0;
  let n = parseFloat(m[1].replace(/,/g, ''));
  if (m[2] === 'k') n *= 1e3;
  if (m[2] === 'm') n *= 1e6;
  return Math.round(n);
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const users = await base44.asServiceRole.entities.User.filter({ viral_post_featured: true });
    const featured = (users || []).filter((u) => u.viral_post_link && u.viral_post_slug);

    // Resolve each Fellow's claimed Nominee for the byline. Featured count is
    // small and bounded, so one nominee query per user is acceptable.
    const posts = [];
    for (const u of featured) {
      let nominee = null;
      try {
        if (u.id) {
          const noms = await base44.asServiceRole.entities.Nominee.filter({ claimed_by_user_id: u.id });
          nominee = noms && noms[0];
        }
      } catch {}
      posts.push({
        slug: u.viral_post_slug,
        nominee_id: nominee ? nominee.id : null,
        nominee_name: nominee ? nominee.name : (u.full_name || ''),
        nominee_title: nominee ? (nominee.title || nominee.professional_role || '') : '',
        nominee_company: nominee ? (nominee.company || nominee.organization || '') : '',
        nominee_avatar_url: nominee ? (nominee.avatar_url || '') : (u.avatar_url || ''),
        impressions: u.viral_post_impressions || '',
        impressions_value: parseImpressions(u.viral_post_impressions),
        takeaway: u.viral_post_takeaway || '',
        screenshot_url: u.viral_post_screenshot_url || '',
        viral_post_link: u.viral_post_link
      });
    }

    posts.sort((a, b) => b.impressions_value - a.impressions_value);

    return Response.json({ posts });
  } catch (error) {
    return Response.json({ error: error.message, posts: [] }, { status: 500 });
  }
}