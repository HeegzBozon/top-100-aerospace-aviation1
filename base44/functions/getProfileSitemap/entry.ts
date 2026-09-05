import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { isIndexable, escapeXml, SITE_ORIGIN } from "../../shared/seoProfile.ts";

// Public crawler endpoint. Emits a sitemap of all indexable public profile
// URLs with lastmod. No auth — served to Googlebot and AI crawlers.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const origin = SITE_ORIGIN;
    const nominees = await base44.asServiceRole.entities.Nominee.filter({}, "name", 1000);
    const rows = (nominees || [])
      .filter(isIndexable)
      .map((n) => {
        const lastmod = n.updated_date
          ? new Date(n.updated_date).toISOString().split("T")[0]
          : "";
        const loc = `${origin}/profiles/${escapeXml(n.id)}`;
        return (
          `  <url>\n    <loc>${loc}</loc>` +
          (lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "") +
          `\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
        );
      })
      .join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>`;
    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}