// Generates the static share page for every Top 100 Women honoree.
//
// Social crawlers (LinkedIn, X, Facebook) read raw HTML and never execute
// JavaScript, so the SPA route /Top100Women2025/2025/12/<slug> cannot carry
// honoree-specific meta tags on its own. Each honoree therefore gets a real
// HTML file at that exact path, the same approach already used for
// /ground-control and /governance.
//
// Data comes from the snapshot in public/data/honorees.json. Runs automatically
// before every build via the "prebuild" script in package.json.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SNAPSHOT = path.join(ROOT, "public/data/honorees.json");
const OUT_ROOT = path.join(ROOT, "public/Top100Women2025/2025/12");
const ORIGIN = "https://top100aero.space";
const YEAR = 2025;

const esc = (s) => String(s ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const cap = (s, n) => {
  const t = String(s ?? "").replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
};

// Point social crawlers straight at the bytes. The app's own file URL answers with a
// 302 to the media host, and some crawlers (and most preview caches) handle that worse
// than a direct URL, so both the /files/mp/public/ and /files/public/ shapes are
// rewritten to the host that actually serves the image. URLs already on that host are
// returned untouched.
const directMedia = (url) => String(url ?? "").replace(
  /^https:\/\/base44\.app\/api\/apps\/([^/]+)\/files\/(?:mp\/)?public\/[^/]+\//,
  "https://media.base44.com/images/public/$1/"
);

function renderPage(h) {
  const title = `${h.name} — Top 100 Women in Aerospace & Aviation ${YEAR}`;
  const description = cap(
    h.description || "Verified honoree on the TOP 100 Aerospace & Aviation. We don't rank. We measure.",
    160
  );
  const headline = [h.title, h.company].filter(Boolean).join(" · ");
  const deepLink = `${ORIGIN}/Top100Women2025/${YEAR}/12/${h.slug}/index.html`;
  const canonical = `${ORIGIN}/profiles/${h.id}`;
  const image = directMedia(h.card || h.photo);

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: h.name,
    url: canonical,
    ...(h.title ? { jobTitle: h.title } : {}),
    ...(h.company ? { worksFor: { "@type": "Organization", name: h.company } } : {}),
    ...(h.country ? { address: { "@type": "PostalAddress", addressCountry: h.country } } : {}),
    ...(h.photo ? { image: directMedia(h.photo) } : {}),
    ...(description ? { description } : {}),
  };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, follow" />
<link rel="canonical" href="${canonical}" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />

<meta property="og:type" content="profile" />
<meta property="og:url" content="${deepLink}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
${image ? `<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${esc(`${h.name} — Top 100 Women in Aerospace & Aviation ${YEAR}`)}" />` : ""}
<meta property="og:site_name" content="TOP 100 Aerospace &amp; Aviation" />
<meta property="og:locale" content="en_US" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
${image ? `<meta name="twitter:image" content="${esc(image)}" />` : ""}

<script type="application/ld+json">${JSON.stringify(person)}</script>
<style>
  :root{--navy:#1e3a5a;--gold:#c9a87c;--copper:#b87333;--cream:#faf8f5}
  *{box-sizing:border-box}
  body{margin:0;background:var(--cream);color:#16293f;font-family:Georgia,"Times New Roman",serif;line-height:1.65}
  .wrap{max-width:820px;margin:0 auto;padding:56px 24px 80px}
  .kicker{font-family:system-ui,-apple-system,sans-serif;font-size:.72rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--copper);margin:0 0 14px}
  h1{font-size:clamp(2rem,5vw,2.9rem);line-height:1.1;color:var(--navy);margin:0 0 10px}
  .headline{font-family:system-ui,-apple-system,sans-serif;font-size:1rem;font-weight:600;color:var(--navy);margin:0 0 6px}
  .meta{font-family:system-ui,-apple-system,sans-serif;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(30,58,90,.6);margin:0 0 30px}
  img.card{display:block;width:100%;height:auto;border-radius:10px;box-shadow:0 18px 48px rgba(15,31,53,.24)}
  blockquote{margin:32px 0 0;padding-left:20px;border-left:3px solid var(--gold);font-style:italic;font-size:1.18rem;color:var(--navy)}
  .bio{font-family:system-ui,-apple-system,sans-serif;font-size:1rem;color:rgba(22,41,63,.86);margin:26px 0 0}
  .cta{display:inline-block;margin-top:34px;padding:14px 30px;border-radius:8px;background:var(--copper);color:#fff;text-decoration:none;font-family:system-ui,-apple-system,sans-serif;font-weight:700;letter-spacing:.03em}
  .alt{display:inline-block;margin:34px 0 0 18px;font-family:system-ui,-apple-system,sans-serif;font-size:.9rem;color:var(--navy)}
  footer{margin-top:52px;padding-top:20px;border-top:1px solid rgba(201,168,124,.5);font-family:system-ui,-apple-system,sans-serif;font-size:.8rem;color:rgba(30,58,90,.65)}
  footer a{color:var(--navy)}
  @media(max-width:560px){.alt{display:block;margin:18px 0 0}}
</style>
</head>
<body>
<div class="wrap">
  <p class="kicker">Top 100 Women in Aerospace &amp; Aviation — ${YEAR}</p>
  <h1>${esc(h.name)}</h1>
  ${headline ? `<p class="headline">${esc(headline)}</p>` : ""}
  ${h.country ? `<p class="meta">${esc(h.country)}</p>` : ""}
  ${image ? `<img class="card" src="${esc(image)}" width="1200" height="630" alt="${esc(`${h.name} — Top 100 Women in Aerospace & Aviation ${YEAR}`)}" />` : ""}
  ${h.story ? `<blockquote>&ldquo;${esc(h.story)}&rdquo;</blockquote>` : ""}
  ${h.description ? `<p class="bio">${esc(h.description)}</p>` : ""}
  <a class="cta" href="${canonical}">View the verified profile</a>
  <a class="alt" href="${ORIGIN}/Top100Women2025">Explore the ${YEAR} publication</a>
  <footer>
    <p>TOP 100 Aerospace &amp; Aviation — the verified reputation graph for aerospace and aviation. We don't rank; we measure.</p>
  </footer>
</div>
</body>
</html>
`;
}

function main() {
  if (!fs.existsSync(SNAPSHOT)) {
    console.log("[honoree-pages] no snapshot at public/data/honorees.json — skipping");
    return;
  }

  const honorees = JSON.parse(fs.readFileSync(SNAPSHOT, "utf8"));
  const seen = new Set();
  let written = 0;

  for (const h of honorees) {
    const slug = String(h.slug || "").trim();
    if (!slug || !/^[a-z0-9-]+$/.test(slug) || seen.has(slug)) continue;
    seen.add(slug);
    const dir = path.join(OUT_ROOT, slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), renderPage(h), "utf8");
    written++;
  }

  console.log(`[honoree-pages] wrote ${written} honoree page(s) to public/Top100Women2025/${YEAR}/12/`);
}

main();