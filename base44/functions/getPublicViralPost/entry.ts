import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Public endpoint — serves a Fellow's featured Top Viral Post to signed-out
// visitors. The User entity is admin-only for list/filter, so the public
// profile deck can't resolve `user` client-side for unauthenticated viewers.
// This reads the claimed User with the service role and returns ONLY the
// public viral-post fields plus minimal byline data (never email, role, or
// any private data). Resolves by durable `viral_post_slug` or by nominee_id.
//
// Editorial fallback: a series entry staged directly on an honoree record
// (used when the Fellow hasn't claimed their profile) resolves the same way,
// so an unclaimed record's post still opens its feature page.
function postFromRecord(record) {
  if (!record || !record.viral_post_featured || !record.viral_post_link) return null;
  return {
    featured: true,
    viral_post_link: record.viral_post_link,
    viral_post_screenshot_url: record.viral_post_screenshot_url || '',
    viral_post_impressions: record.viral_post_impressions || '',
    viral_post_takeaway: record.viral_post_takeaway || '',
    viral_post_wisdom: '',
    nominee_id: record.id,
    nominee_name: record.name || '',
    nominee_title: record.title || record.professional_role || '',
    nominee_company: record.company || record.organization || '',
    nominee_avatar_url: record.avatar_url || '',
    nominee_discipline: record.discipline || ''
  };
}

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
      if (!user) {
        // Editorial fallback staged on the honoree record itself.
        const staged = await base44.asServiceRole.entities.Nominee.filter({ viral_post_slug: slug });
        return Response.json(postFromRecord(staged && staged[0]) || { featured: false });
      }
      const noms = await base44.asServiceRole.entities.Nominee.filter({ claimed_by_user_id: user.id });
      nominee = noms && noms[0];
    } else {
      const noms = await base44.asServiceRole.entities.Nominee.filter({ id: nomineeId });
      nominee = noms && noms[0];
      if (!nominee) return Response.json({ featured: false });
      if (!nominee.claimed_by_user_id) {
        // Unclaimed record: serve the editorial fallback when one is staged.
        return Response.json(postFromRecord(nominee) || { featured: false });
      }
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