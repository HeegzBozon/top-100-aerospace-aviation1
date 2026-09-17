import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Public endpoint — serves a Fellow's featured Top Viral Post to signed-out
// visitors. The User entity is admin-only for list/filter, so the public
// profile deck can't resolve `user` client-side for unauthenticated viewers.
// This reads the claimed User with the service role and returns ONLY the
// public viral-post fields plus minimal byline data (never email, role, or
// any private data). Resolves by durable `viral_post_slug` or by nominee_id.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    let body = {};
    try { body = await req.json(); } catch (_) {}
    const slug = body.slug;
    const nomineeId = body.nominee_id;
    if (!slug && !nomineeId) return Response.json({ featured: false });

    let nominee = null;
    let user = null;

    if (slug) {
      const users = await base44.asServiceRole.entities.User.filter({ viral_post_slug: slug });
      user = users && users[0];
      if (!user) return Response.json({ featured: false });
      const noms = await base44.asServiceRole.entities.Nominee.filter({ claimed_by_user_id: user.id });
      nominee = noms && noms[0];
    } else {
      const noms = await base44.asServiceRole.entities.Nominee.filter({ id: nomineeId });
      nominee = noms && noms[0];
      if (!nominee || !nominee.claimed_by_user_id) return Response.json({ featured: false });
      const users = await base44.asServiceRole.entities.User.filter({ id: nominee.claimed_by_user_id });
      user = users && users[0];
    }

    if (!user || !user.viral_post_featured || !user.viral_post_link) {
      return Response.json({ featured: false });
    }

    return Response.json({
      featured: true,
      viral_post_link: user.viral_post_link,
      viral_post_screenshot_url: user.viral_post_screenshot_url || '',
      viral_post_impressions: user.viral_post_impressions || '',
      viral_post_takeaway: user.viral_post_takeaway || '',
      viral_post_wisdom: user.viral_post_wisdom || '',
      nominee_id: nominee ? nominee.id : null,
      nominee_name: nominee ? nominee.name : '',
      nominee_title: nominee ? (nominee.title || nominee.professional_role || '') : '',
      nominee_company: nominee ? (nominee.company || nominee.organization || '') : '',
      nominee_avatar_url: nominee ? (nominee.avatar_url || '') : '',
      nominee_discipline: nominee ? (nominee.discipline || '') : ''
    });
  } catch (error) {
    return Response.json({ error: error.message, featured: false }, { status: 500 });
  }
}