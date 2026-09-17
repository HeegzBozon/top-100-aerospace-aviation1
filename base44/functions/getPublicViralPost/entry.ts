import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Public endpoint — serves a Fellow's featured Top Viral Post to signed-out
// visitors. The User entity is admin-only for list/filter, so the public
// profile deck can't resolve `user` client-side for unauthenticated viewers.
// This reads the claimed User with the service role and returns ONLY the
// public viral-post fields (never email, role, or any private data).
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    let body = {};
    try { body = await req.json(); } catch (_) {}
    const nomineeId = body.nominee_id;
    if (!nomineeId) return Response.json({ featured: false });

    const nomineeArr = await base44.asServiceRole.entities.Nominee.filter({ id: nomineeId });
    const nominee = nomineeArr && nomineeArr[0];
    if (!nominee) return Response.json({ featured: false });

    const claimedId = nominee.claimed_by_user_id;
    if (!claimedId) return Response.json({ featured: false });

    const userArr = await base44.asServiceRole.entities.User.filter({ id: claimedId });
    const user = userArr && userArr[0];
    if (!user || !user.viral_post_featured || !user.viral_post_link) {
      return Response.json({ featured: false });
    }

    return Response.json({
      featured: true,
      viral_post_link: user.viral_post_link,
      viral_post_screenshot_url: user.viral_post_screenshot_url || '',
      viral_post_impressions: user.viral_post_impressions || '',
      viral_post_takeaway: user.viral_post_takeaway || '',
      viral_post_wisdom: user.viral_post_wisdom || ''
    });
  } catch (error) {
    return Response.json({ error: error.message, featured: false }, { status: 500 });
  }
}