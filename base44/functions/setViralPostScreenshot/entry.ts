import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Admin-only endpoint — attaches a screenshot URL to a Fellow's featured
// viral post. Resolves the User by durable `viral_post_slug` and writes the
// public URL to `viral_post_screenshot_url`. Used when a screenshot is
// supplied out-of-band (e.g. an admin-provided asset) rather than uploaded
// through the in-app ViralPostScreenshotEditor.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    let body = {};
    try { body = await req.json(); } catch (_) {}
    const { slug, screenshot_url } = body;
    if (!slug || !screenshot_url) {
      return Response.json({ error: 'slug and screenshot_url are required' }, { status: 400 });
    }

    const users = await base44.asServiceRole.entities.User.filter({ viral_post_slug: slug });
    const target = users && users[0];
    if (!target) return Response.json({ error: 'No user found for that viral_post_slug' }, { status: 404 });

    await base44.asServiceRole.entities.User.update(target.id, { viral_post_screenshot_url: screenshot_url });

    return Response.json({ ok: true, slug, screenshot_url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}