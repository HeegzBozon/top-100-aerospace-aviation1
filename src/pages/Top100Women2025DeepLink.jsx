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
  const [nominee, setNominee] = useState(null);

  // Resolve slug → nominee for canonical URL + OG meta tags
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await base44.entities.Nominee.filter(
          { public_slug: slug },
          { limit: 1, fields: ['id', 'name', 'description', 'og_card_url', 'avatar_url', 'title', 'company', 'country'] }
        );
        if (!cancelled && res?.items?.[0]) setNominee(res.items[0]);
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
    if (!nominee?.id) return;
    const canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('data-deep-link', 'true');
    canonical.setAttribute('href', `${window.location.origin}/profiles/${nominee.id}`);
    document.head.appendChild(canonical);
    return () => canonical.remove();
  }, [nominee?.id]);

  // OG + Twitter meta tags — nominee-specific, for social share previews
  useEffect(() => {
    if (!nominee) return;
    const ogTitle = `${nominee.name} — TOP 100 Women in Aerospace & Aviation 2025`;
    const ogDesc = nominee.description || `Verified honoree on the TOP 100 Aerospace & Aviation. We don't rank. We measure.`;
    const ogImage = nominee.og_card_url || nominee.avatar_url;
    const ogUrl = `${window.location.origin}/Top100Women2025/2025/12/${slug}`;

    const tags = [
      ['property', 'og:title', ogTitle],
      ['property', 'og:description', ogDesc],
      ['property', 'og:url', ogUrl],
      ['property', 'og:image', ogImage],
      ['property', 'og:type', 'profile'],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:title', ogTitle],
      ['name', 'twitter:description', ogDesc],
      ['name', 'twitter:image', ogImage],
    ];

    const els = tags.map(([attr, key, content]) => {
      const el = document.createElement('meta');
      el.setAttribute(attr, key);
      el.setAttribute('data-deep-link', 'true');
      el.setAttribute('content', content);
      document.head.appendChild(el);
      return el;
    });

    return () => els.forEach(el => el.remove());
  }, [nominee, slug]);

  return <PublicationBody initialSlug={slug} />;
}