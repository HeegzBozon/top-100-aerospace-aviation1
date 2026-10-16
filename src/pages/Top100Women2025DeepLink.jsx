import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PublicationBody from '@/components/publication/PublicationBody';

// Deep-link entry: /Top100Women2025/:year/:month/:slug
// Pre-opens the honoree profile panel on mount. The :year and :month segments
// are editorial path decoration (magazine date styling) and do not affect
// logic; only :slug resolves the honoree.
//
// SEO: this route is noindex (the canonical surface is /profiles/:id). A
// canonical link points crawlers to the honoree's canonical profile URL so
// the deep link never cannibalizes the indexable profile page.
export default function Top100Women2025DeepLink() {
  const { slug } = useParams();
  const [canonicalId, setCanonicalId] = useState(null);

  // Resolve slug → nominee id for the canonical URL (lightweight single query)
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await base44.entities.Nominee.filter(
          { public_slug: slug },
          { limit: 1, fields: ['id'] }
        );
        if (!cancelled && res?.items?.[0]?.id) setCanonicalId(res.items[0].id);
      } catch {
        // PublicationBody will still open the panel from its own loaded data
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  // noindex — set on mount, remove on unmount
  useEffect(() => {
    const noindex = document.createElement('meta');
    noindex.setAttribute('name', 'robots');
    noindex.setAttribute('data-deep-link', 'true');
    noindex.setAttribute('content', 'noindex, follow');
    document.head.appendChild(noindex);
    return () => noindex.remove();
  }, []);

  // canonical → /profiles/:id — set once the nominee is resolved
  useEffect(() => {
    if (!canonicalId) return;
    const canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('data-deep-link', 'true');
    canonical.setAttribute('href', `${window.location.origin}/profiles/${canonicalId}`);
    document.head.appendChild(canonical);
    return () => canonical.remove();
  }, [canonicalId]);

  return <PublicationBody initialSlug={slug} />;
}