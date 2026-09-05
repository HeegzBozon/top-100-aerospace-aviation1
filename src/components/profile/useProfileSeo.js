import { useEffect } from 'react';

// Canonical site origin. Public profiles live at /profiles/:id.
const SITE = 'https://top100aero.space';
const DEFAULT_OG =
  'https://media.base44.com/images/public/68996845be6727838fdb822e/9ad98cbff_generated_image.png';
const HOME_TITLE =
  'TOP 100 Aerospace & Aviation | The Verified Reputation Graph for Aerospace';
const HOME_DESC =
  "The verified professional index for aerospace and aviation. Community nomination, blind voting, permanent record. We don't rank. We measure. 300+ Fellows across 40+ countries.";

const DISCIPLINE_LABELS = {
  space_rd: 'Space Research & Development',
  commercial_aviation: 'Commercial Aviation',
  defense: 'Defense Aerospace',
  manufacturing: 'Aerospace Manufacturing',
  operations: 'Flight Operations',
  engineering: 'Aerospace Engineering',
  policy: 'Space & Aviation Policy',
  entrepreneurship: 'Aerospace Entrepreneurship',
};

// Build a deterministic, unique meta description from structured fields so that
// sparse profiles never share a generic (duplicate) description.
function buildDescription(profile) {
  const name = profile?.name || profile?.full_name || 'This Fellow';
  const role = profile?.title || profile?.professional_role || '';
  const company = profile?.company || profile?.organization || '';
  const discipline = profile?.discipline ? DISCIPLINE_LABELS[profile.discipline] : '';
  const industry = profile?.industry || '';
  const country = profile?.country || '';

  const segments = [name];
  if (role) segments.push(role);
  if (company) segments.push(`at ${company}`);
  const head = segments.join(', ');

  const tailParts = [];
  if (discipline) tailParts.push(discipline);
  else if (industry) tailParts.push(industry);
  if (country) tailParts.push(`based in ${country}`);
  const tail = tailParts.length ? ` — ${tailParts.join(', ')}` : '';

  return `${head}${tail}. Verified Fellow profile on the TOP 100 Aerospace & Aviation reputation graph.`;
}

function uniqueArray(arr) {
  return Array.from(new Set((arr || []).filter(Boolean)));
}

// Injects/updates <meta>, <title>, canonical, Open Graph, Twitter, and JSON-LD
// (Person + BreadcrumbList) for a public profile. Corrected from the legacy
// implementation: url is the canonical profile page (not personal site), sameAs
// aggregates all social profiles, hasCredential misuse removed in favor of
// alumniOf for education, and a BreadcrumbList is emitted for rich-result
// eligibility and AI entity context.
export default function useProfileSeo(profiles) {
  useEffect(() => {
    if (!profiles) return;
    const nominee = profiles.nominee;
    const user = profiles.user;
    // Prefer the nominee record (rich); fall back to Fellow user fields.
    const profile = nominee || user || {};
    const kind = nominee ? 'nominee' : 'fellow';

    const name = profile.name || profile.full_name || 'Aerospace Leader';
    const role = profile.title || profile.professional_role || '';
    const company = profile.company || profile.organization || '';
    const rawDesc = profile.description || profile.bio || '';
    const description = (rawDesc || buildDescription(profile)).slice(0, 200);
    const metaDesc = description.slice(0, 160);
    const image =
      profile.avatar_url || profile.photo_url || DEFAULT_OG;
    const canonical = `${SITE}${window.location.pathname}`;
    const pageTitle = `${name}${role ? ` — ${role}` : ''}${company ? ` at ${company}` : ''} | TOP 100 Aerospace & Aviation`;

    document.title = pageTitle;

    const setMeta = (sel, attr, val) => {
      let el = document.querySelector(sel);
      if (!el) {
        el = document.createElement('meta');
        document.head.appendChild(el);
      }
      el.setAttribute(attr, val);
    };
    const setLink = (sel, attr, val) => {
      let el = document.querySelector(sel);
      if (!el) {
        el = document.createElement('link');
        document.head.appendChild(el);
      }
      el.setAttribute(attr, val);
    };

    setMeta('meta[name="description"]', 'content', metaDesc);
    setMeta('meta[name="robots"]', 'content', 'index, follow, max-image-preview:large');
    setLink('link[rel="canonical"]', 'href', canonical);

    setMeta('meta[property="og:title"]', 'content', pageTitle);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonical);
    setMeta('meta[property="og:image"]', 'content', image);
    setMeta('meta[property="og:type"]', 'content', 'profile');
    setMeta('meta[property="og:site_name"]', 'content', 'TOP 100 Aerospace & Aviation');

    setMeta('meta[name="twitter:title"]', 'content', pageTitle);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:image"]', 'content', image);
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');

    // --- Person JSON-LD (cited by AI engines for entity disambiguation) ---
    const existingPerson = document.getElementById('profile-jsonld-person');
    if (existingPerson) existingPerson.remove();
    const existingCrumb = document.getElementById('profile-jsonld-breadcrumb');
    if (existingCrumb) existingCrumb.remove();

    const sameAs = uniqueArray([
      profile.linkedin_profile_url,
      profile.instagram_url,
      profile.tiktok_url,
      profile.youtube_url,
      profile.website_url,
      ...(Array.isArray(profile.additional_links) ? profile.additional_links : []),
    ]);

    const knowsAbout = uniqueArray([
      ...(Array.isArray(profile.skills) ? profile.skills : []),
      profile.industry,
      profile.discipline ? DISCIPLINE_LABELS[profile.discipline] : null,
    ]);

    const alumniOf = (Array.isArray(profile.education) ? profile.education : [])
      .map((e) => e?.institution_name && { '@type': 'Organization', name: e.institution_name })
      .filter(Boolean);

    const occupationName = role || profile.industry || (profile.discipline ? DISCIPLINE_LABELS[profile.discipline] : '');
    const hasOccupation = occupationName
      ? {
          '@type': 'Occupation',
          name: occupationName,
          occupationLocation: {
            '@type': 'Country',
            name: profile.country || 'Worldwide',
          },
        }
      : undefined;

    const personSchema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name,
      description,
      url: canonical,
      image,
      ...(role && { jobTitle: role }),
      ...(company && { worksFor: { '@type': 'Organization', name: company } }),
      ...(profile.country && { addressCountry: profile.country }),
      ...(profile.country && { nationality: { '@type': 'Country', name: profile.country } }),
      ...(knowsAbout.length && { knowsAbout }),
      ...(sameAs.length && { sameAs }),
      ...(hasOccupation && { hasOccupation }),
      ...(alumniOf.length && { alumniOf }),
      memberOf: {
        '@type': 'Organization',
        name: 'TOP 100 Aerospace & Aviation',
        url: SITE,
      },
    };

    const personScript = document.createElement('script');
    personScript.id = 'profile-jsonld-person';
    personScript.type = 'application/ld+json';
    personScript.textContent = JSON.stringify(personSchema);
    document.head.appendChild(personScript);

    // --- BreadcrumbList JSON-LD (rich-result + entity context) ---
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Directory',
          item: `${SITE}/Top100Women2025`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name,
          item: canonical,
        },
      ],
    };

    const crumbScript = document.createElement('script');
    crumbScript.id = 'profile-jsonld-breadcrumb';
    crumbScript.type = 'application/ld+json';
    crumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(crumbScript);

    // Cleanup — restore homepage defaults so meta doesn't leak across routes.
    return () => {
      document.title = HOME_TITLE;
      setMeta('meta[name="description"]', 'content', HOME_DESC);
      setMeta('meta[name="robots"]', 'content', 'index, follow');
      setLink('link[rel="canonical"]', 'href', `${SITE}/`);
      setMeta('meta[property="og:type"]', 'content', 'website');
      const p = document.getElementById('profile-jsonld-person');
      if (p) p.remove();
      const c = document.getElementById('profile-jsonld-breadcrumb');
      if (c) c.remove();
    };
  }, [profiles]);
}