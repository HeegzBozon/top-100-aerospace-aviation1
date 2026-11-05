import { useEffect } from 'react';

// The directory is the one list page that carries the whole record, so it states
// itself to a crawler rather than inheriting the front door's tags: its own title,
// its own 152-character description, its own canonical, and structured data naming
// it a CollectionPage whose mainEntity is the list of Fellows it holds. That list is
// what lets an AI assistant answer "who is in the TOP 100 directory" with names and
// canonical profile URLs instead of nothing.
//
// Governance: only public, displayed fields are emitted — name, role, and the
// canonical /profiles/:id address. Never a score, a position, or a tier.

const SITE = 'https://top100aero.space';
const TITLE = 'The Verified Directory | TOP 100 Aerospace & Aviation';
const DESCRIPTION =
  "The verified directory of aerospace and aviation Fellows — engineers, pilots, scientists and founders across 40+ countries. We don't rank. We measure.";
const HOME_TITLE =
  'TOP 100 Aerospace & Aviation | The Verified Reputation Graph for Aerospace';
const HOME_DESC =
  "The verified professional index for aerospace and aviation. Community nomination, blind voting, a permanent record. We don't rank. We measure.";

export default function useDirectorySeo(nominees) {
  useEffect(() => {
    if (!nominees || nominees.length === 0) return;

    const canonical = `${SITE}/Top100Women2025`;
    document.title = TITLE;

    const setMeta = (sel, attr, val) => {
      let el = document.head.querySelector(sel);
      if (!el) {
        el = document.createElement('meta');
        document.head.appendChild(el);
      }
      el.setAttribute(attr, val);
    };
    const setLink = (sel, attr, val) => {
      let el = document.head.querySelector(sel);
      if (!el) {
        el = document.createElement('link');
        document.head.appendChild(el);
      }
      el.setAttribute(attr, val);
    };

    setMeta('meta[name="description"]', 'content', DESCRIPTION);
    setMeta('meta[name="robots"]', 'content', 'index, follow, max-image-preview:large');
    setLink('link[rel="canonical"]', 'href', canonical);
    setMeta('meta[property="og:title"]', 'content', TITLE);
    setMeta('meta[property="og:description"]', 'content', DESCRIPTION);
    setMeta('meta[property="og:url"]', 'content', canonical);
    setMeta('meta[property="og:type"]', 'content', 'website');
    setMeta('meta[name="twitter:title"]', 'content', TITLE);
    setMeta('meta[name="twitter:description"]', 'content', DESCRIPTION);

    // The first hundred Fellows, in the order the edition prints them. Capped so the
    // document stays a readable size; numberOfItems still states the whole record.
    const entries = nominees.slice(0, 100).map((n, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Person',
        name: n.name,
        url: `${SITE}/profiles/${n.id}`,
        ...(n.title && { jobTitle: n.title }),
        ...(n.company && { worksFor: { '@type': 'Organization', name: n.company } }),
      },
    }));

    const collectionSchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: TITLE,
      description: DESCRIPTION,
      url: canonical,
      isPartOf: {
        '@type': 'WebSite',
        name: 'TOP 100 Aerospace & Aviation',
        url: SITE,
      },
      publisher: {
        '@type': 'Organization',
        name: 'TOP 100 Aerospace & Aviation',
        url: SITE,
      },
      mainEntity: {
        '@type': 'ItemList',
        name: 'Verified Fellows in the TOP 100 Aerospace & Aviation directory',
        numberOfItems: nominees.length,
        itemListElement: entries,
      },
    };

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Directory', item: canonical },
      ],
    };

    const collectionScript = document.createElement('script');
    collectionScript.id = 'directory-jsonld-collection';
    collectionScript.type = 'application/ld+json';
    collectionScript.textContent = JSON.stringify(collectionSchema);
    document.head.appendChild(collectionScript);

    const crumbScript = document.createElement('script');
    crumbScript.id = 'directory-jsonld-breadcrumb';
    crumbScript.type = 'application/ld+json';
    crumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(crumbScript);

    // Leaving the list restores the front door's tags, so the next surface does not
    // inherit the directory's title or canonical.
    return () => {
      document.title = HOME_TITLE;
      setMeta('meta[name="description"]', 'content', HOME_DESC);
      setLink('link[rel="canonical"]', 'href', `${SITE}/`);
      const c = document.getElementById('directory-jsonld-collection');
      if (c) c.remove();
      const b = document.getElementById('directory-jsonld-breadcrumb');
      if (b) b.remove();
    };
  }, [nominees]);
}