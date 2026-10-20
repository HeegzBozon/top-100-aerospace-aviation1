import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { escapeHtml, SITE_ORIGIN, PUBLIC_STATUSES } from "../../shared/seoProfile.ts";

// Public prerender endpoint for the /Top100Women2025/:year/:month/:slug deep-link
// route. Returns a full static HTML page with nominee-specific Open Graph and
// Twitter Card meta tags so social crawlers (LinkedIn, X, Facebook) that do not
// execute JavaScript still see the correct share preview — the nominee's
// deterministically composed OG card image, name, and description.
//
// The page is noindex (the canonical profile lives at /profiles/:id) but the OG
// tags are present so the share preview renders correctly. Visible body content
// is minimal — a name, headline, and a link to the full profile — since the
// purpose is social preview, not indexable content.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const u = new URL(req.url);
    let slug = u.searchParams.get("slug");
    if (!slug) {
      const body = await req.json().catch(() => ({}));
      slug = body?.slug;
    }
    if (!slug) return new Response("Not found", { status: 404 });

    const { items } = await base44.asServiceRole.entities.Nominee.filter(
      { public_slug: slug },
      { limit: 1, fields: ["id", "name", "description", "og_card_url", "avatar_url", "title", "professional_role", "company", "organization", "country", "status"] }
    );
    const n = items?.[0];
    if (!n) return new Response("Not found", { status: 404 });
    if (!PUBLIC_STATUSES.includes(n.status || "active")) {
      return new Response("Not found", { status: 404 });
    }

    const origin = SITE_ORIGIN;
    const deepLinkUrl = `${origin}/Top100Women2025/2025/12/${encodeURIComponent(slug)}/index.html`;
    const canonical = `${origin}/profiles/${n.id}`;
    const name = escapeHtml(n.name);
    const headline = [n.title || n.professional_role, n.company || n.organization]
      .filter(Boolean)
      .map(escapeHtml)
      .join(" · ");
    const ogTitle = `${name} — TOP 100 Women in Aerospace & Aviation 2025`;
    const ogDescription = escapeHtml(
      (n.description || `Verified honoree on the TOP 100 Aerospace & Aviation. We don't rank. We measure.`).slice(0, 160)
    );
    const ogImage = n.og_card_url || n.avatar_url || "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${ogTitle}</title>
<meta name="description" content="${ogDescription}">
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="profile">
<meta property="og:title" content="${escapeHtml(ogTitle)}">
<meta property="og:description" content="${ogDescription}">
<meta property="og:url" content="${deepLinkUrl}">
${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}">` : ""}
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(ogTitle)}">
<meta name="twitter:description" content="${ogDescription}">
${ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}">` : ""}
<style>
  body{font-family:Georgia,'Times New Roman',serif;background:#faf8f5;color:#16293f;margin:0;line-height:1.6}
  .wrap{max-width:680px;margin:0 auto;padding:48px 24px 80px;text-align:center}
  .discipline{font-size:.75rem;color:#c9a87c;font-weight:600;letter-spacing:.16em;text-transform:uppercase;margin-bottom:12px}
  h1{font-size:2.2rem;margin:0 0 8px;color:#1e3a5a}
  .headline{font-size:1.05rem;color:#1e3a5a;font-family:system-ui,sans-serif;font-weight:500;margin-bottom:6px}
  .meta{font-size:.8rem;color:#1e3a5a99;text-transform:uppercase;letter-spacing:.12em;margin-top:10px}
  .cta{display:inline-block;margin-top:28px;padding:12px 28px;background:#1e3a5a;color:#faf8f5;text-decoration:none;border-radius:8px;font-family:system-ui,sans-serif;font-weight:600;letter-spacing:.04em}
  footer{margin-top:40px;font-size:.8rem;color:#1e3a5a80}
</style>
</head>
<body>
<div class="wrap">
  <div class="discipline">TOP 100 Women in Aerospace &amp; Aviation — 2025</div>
  <h1>${name}</h1>
  ${headline ? `<div class="headline">${headline}</div>` : ""}
  ${n.country ? `<div class="meta">${escapeHtml(n.country)}</div>` : ""}
  <a class="cta" href="${canonical}">View full profile</a>
  <footer><p>TOP 100 Aerospace &amp; Aviation — the verified reputation graph for aerospace and aviation. We don't rank; we measure.</p></footer>
</div>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}