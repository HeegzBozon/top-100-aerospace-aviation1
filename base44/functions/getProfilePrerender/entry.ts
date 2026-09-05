import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import {
  DISCIPLINE_LABELS,
  isIndexable,
  escapeHtml,
  SITE_ORIGIN,
} from "../../shared/seoProfile.ts";

// Public prerender endpoint. Returns a full, static HTML page for a single
// verified Fellow profile with embedded Person + BreadcrumbList JSON-LD and
// visible content. This is the AEO fix: non-JS AI crawlers (GPTBot, ClaudeBot,
// PerplexityBot, Applebot) get the content + structured data on first fetch
// instead of an empty SPA shell. Only public, governance-safe fields emitted.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const u = new URL(req.url);
    let nomineeId = u.searchParams.get("id");
    if (!nomineeId) {
      const body = await req.json().catch(() => ({}));
      nomineeId = body?.id;
    }
    if (!nomineeId) return new Response("Not found", { status: 404 });
    const n = await base44.asServiceRole.entities.Nominee.get(nomineeId);
    if (!n || !isIndexable(n)) return new Response("Not found", { status: 404 });

    const origin = SITE_ORIGIN;
    const canonical = `${origin}/profiles/${n.id}`;
    const name = escapeHtml(n.name);
    const headline = [n.title || n.professional_role, n.company || n.organization]
      .filter(Boolean)
      .map(escapeHtml)
      .join(" · ");
    // Title-bar headline is capped so a paragraph-length role doesn't bloat
    // <title> / og:title. The full headline still renders on-page below.
    const titleHeadline =
      headline.length > 80 ? headline.slice(0, 77) + "…" : headline;
    const description = escapeHtml(
      (n.description || n.bio || `Verified Fellow profile for ${n.name} on TOP 100 Aerospace & Aviation.`).slice(0, 160)
    );
    const disciplineLabel = n.discipline
      ? DISCIPLINE_LABELS[n.discipline] || n.industry || "Aerospace"
      : "Aerospace";
    const bioHtml = n.bio_extended
      ? escapeHtml(n.bio_extended)
      : n.bio
      ? escapeHtml(n.bio)
      : "";
    const editorial =
      n.article_status === "published" && n.editorial_article
        ? escapeHtml(n.editorial_article)
        : "";

    const sameAsArr = [
      n.linkedin_profile_url,
      n.instagram_url,
      n.tiktok_url,
      n.youtube_url,
      n.website_url,
    ].filter(Boolean);

    const personSchema: any = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: n.name,
      url: canonical,
    };
    if (n.title || n.professional_role) personSchema.jobTitle = n.title || n.professional_role;
    if (n.company || n.organization)
      personSchema.worksFor = { "@type": "Organization", name: n.company || n.organization };
    if (n.description || n.bio) personSchema.description = n.description || n.bio;
    if (n.avatar_url) personSchema.image = n.avatar_url;
    if (n.country) personSchema.address = { "@type": "PostalAddress", addressCountry: n.country };
    if (sameAsArr.length) personSchema.sameAs = sameAsArr;

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
        { "@type": "ListItem", position: 2, name: "Directory", item: `${origin}/Top100Women2025` },
        { "@type": "ListItem", position: 3, name: n.name, item: canonical },
      ],
    };

    const careerItems = (Array.isArray(n.career_history) ? n.career_history : [])
      .filter((c) => c && (c.company_name || c.role_title))
      .slice(0, 10)
      .map(
        (c) =>
          `<li><span class="role">${escapeHtml(c.role_title || "")}</span> at <span class="org">${escapeHtml(c.company_name || "")}</span></li>`
      )
      .join("");
    const educationItems = (Array.isArray(n.education) ? n.education : [])
      .filter((e) => e && (e.institution_name || e.degree))
      .slice(0, 5)
      .map(
        (e) =>
          `<li>${escapeHtml(e.degree || "")} ${escapeHtml(e.field_of_study || "")} — ${escapeHtml(e.institution_name || "")}</li>`
      )
      .join("");
    const skills = (Array.isArray(n.skills) ? n.skills : [])
      .slice(0, 20)
      .map((s) => `<span class="skill">${escapeHtml(s)}</span>`)
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name}${titleHeadline ? " — " + titleHeadline : ""} | TOP 100 Aerospace &amp; Aviation</title>
<meta name="description" content="${description}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="profile">
<meta property="og:title" content="${name}${titleHeadline ? " — " + titleHeadline : ""}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
${n.avatar_url ? `<meta property="og:image" content="${escapeHtml(n.avatar_url)}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(personSchema)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
<style>
  body{font-family:Georgia,'Times New Roman',serif;background:#faf8f5;color:#16293f;margin:0;line-height:1.6}
  .wrap{max-width:760px;margin:0 auto;padding:40px 20px 80px}
  header{border-bottom:1px solid #c9a87c33;padding-bottom:20px;margin-bottom:24px;overflow:hidden}
  h1{font-size:2rem;margin:0 0 6px;color:#1e3a5a}
  .headline{font-size:1.05rem;color:#1e3a5a;font-family:system-ui,sans-serif;font-weight:500}
  .meta{font-size:.8rem;color:#1e3a5a99;text-transform:uppercase;letter-spacing:.12em;margin-top:10px}
  section{margin:28px 0}
  h2{font-size:1.2rem;color:#1e3a5a;border-bottom:1px solid #1e3a5a14;padding-bottom:6px}
  .bio{white-space:pre-wrap}
  ul{padding-left:1.2em}
  .skill{display:inline-block;background:#efe7dc;color:#1e3a5a;border-radius:999px;padding:3px 12px;margin:2px;font-size:.85rem;font-family:system-ui,sans-serif}
  img.avatar{width:120px;height:120px;border-radius:999px;object-fit:cover;border:2px solid #c9a87c66;float:right;margin:0 0 16px 16px}
  .discipline{font-size:.75rem;color:#c9a87c;font-weight:600;letter-spacing:.16em;text-transform:uppercase}
  footer{margin-top:40px;font-size:.8rem;color:#1e3a5a80;border-top:1px solid #1e3a5a14;padding-top:16px}
  a{color:#1e3a5a}
</style>
</head>
<body>
<div class="wrap">
  <header>
    ${n.avatar_url ? `<img class="avatar" src="${escapeHtml(n.avatar_url)}" alt="${name}">` : ""}
    <div class="discipline">${escapeHtml(disciplineLabel)}</div>
    <h1>${name}</h1>
    ${headline ? `<div class="headline">${headline}</div>` : ""}
    ${n.country ? `<div class="meta">${escapeHtml(n.country)}</div>` : ""}
  </header>
  ${bioHtml ? `<section><h2>About</h2><p class="bio">${bioHtml}</p></section>` : ""}
  ${editorial ? `<section><h2>Editorial</h2><div class="bio">${editorial}</div></section>` : ""}
  ${careerItems ? `<section><h2>Career</h2><ul>${careerItems}</ul></section>` : ""}
  ${educationItems ? `<section><h2>Education</h2><ul>${educationItems}</ul></section>` : ""}
  ${skills ? `<section><h2>Expertise</h2>${skills}</section>` : ""}
  <footer>
    <p>Verified Fellow profile on TOP 100 Aerospace &amp; Aviation — the verified reputation graph for aerospace and aviation. We don't rank; we measure.</p>
    <p><a href="${origin}/Top100Women2025">View the full directory</a></p>
  </footer>
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