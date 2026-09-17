import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Quote as QuoteIcon, ExternalLink, ChevronRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STUDIO_PATH = '/Profile?studio=open&ref=viralpost2026';
const NAVY = '#1e3a5a';
const NAVY_DEEP = '#16293f';
const GOLD = '#c9a87c';
const COPPER = '#b87333';
const CREAM = '#faf8f5';
const SAND = '#f0e9df';

export default function ViralPost2026Featured() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['publicViralPostBySlug', slug],
    queryFn: async () => {
      const r = await base44.functions.invoke('getPublicViralPost', { slug });
      return r && typeof r === 'object' && 'data' in r ? r.data : r;
    },
    enabled: !!slug,
  });

  // Acquisition-funnel page-view tracking.
  useEffect(() => {
    base44.analytics.track({ eventName: 'viralpost2026_view', properties: { slug } });
  }, [slug]);

  // SEO — indexable article: title, description, canonical, OG, Article JSON-LD.
  useEffect(() => {
    if (!data?.featured) return;
    const name = data.nominee_name || 'Featured Fellow';
    const title = `${name}'s Top Viral Post — Most Liked Posts Series`;
    const desc = data.viral_post_takeaway
      ? data.viral_post_takeaway.replace(/\s+/g, ' ').trim().slice(0, 155)
      : `The featured top viral post of ${name} in the Most Liked Posts Series, TOP 100 Aerospace & Aviation.`;
    const canonical = `${window.location.origin}/viralpost2026/featured/${slug}`;
    const img = data.viral_post_screenshot_url || '';
    const created = [];

    const upsert = (tag, attrs) => {
      const sel = tag === 'meta'
        ? `meta[${attrs.name ? `name="${attrs.name}"` : `property="${attrs.property}"`}]`
        : `${tag}[rel="${attrs.rel}"]`;
      let el = document.head.querySelector(sel);
      const isNew = !el;
      if (!el) { el = document.createElement(tag); }
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      document.head.appendChild(el);
      if (isNew) created.push(el);
    };

    document.title = `${title} | TOP 100 Aerospace & Aviation`;
    upsert('meta', { name: 'description', content: desc });
    upsert('link', { rel: 'canonical', href: canonical });
    upsert('meta', { property: 'og:title', content: title });
    upsert('meta', { property: 'og:description', content: desc });
    upsert('meta', { property: 'og:type', content: 'article' });
    upsert('meta', { property: 'og:url', content: canonical });
    if (img) upsert('meta', { property: 'og:image', content: img });
    upsert('meta', { name: 'twitter:card', content: 'summary_large_image' });

    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: desc,
      image: img ? [img] : undefined,
      author: { '@type': 'Person', name, url: data.nominee_id ? `${window.location.origin}/profiles/${data.nominee_id}` : undefined },
      publisher: { '@type': 'Organization', name: 'TOP 100 Aerospace & Aviation' },
      mainEntityOfPage: canonical,
      url: canonical
    });
    document.head.appendChild(ld);
    created.push(ld);

    return () => { created.forEach((el) => el.parentNode && el.parentNode.removeChild(el)); };
  }, [data, slug]);

  // Signed-in Fellows go straight to the Studio; visitors sign in first and
  // land back on the Studio when they return.
  const openStudio = async () => {
    base44.analytics.track({ eventName: 'viralpost2026_add_clicked' });
    try {
      const authed = await base44.auth.isAuthenticated();
      if (authed) { navigate(STUDIO_PATH); return; }
    } catch {}
    base44.auth.redirectToLogin(`${window.location.origin}${STUDIO_PATH}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY_DEEP }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: GOLD }} />
      </div>
    );
  }

  if (!data || !data.featured) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: NAVY_DEEP, color: CREAM }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ border: `1px solid ${GOLD}33` }}>
          <TrendingUp className="w-9 h-9" style={{ color: `${GOLD}99` }} />
        </div>
        <h1 className="font-serif text-3xl font-bold mb-3">No Featured Post at This Address</h1>
        <p className="mb-8 text-sm max-w-md" style={{ color: 'rgba(250,248,245,0.65)' }}>
          This Most Liked Posts Series entry isn't published yet, or the link has moved.
        </p>
        <Link to="/" className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>Return Home</Link>
      </div>
    );
  }

  const name = data.nominee_name || 'Featured Fellow';
  const byline = [data.nominee_title, data.nominee_company]
    .filter((v) => v && v.toLowerCase() !== 'not found' && v.toLowerCase() !== 'n/a')
    .join(' · ');
  const profileUrl = data.nominee_id ? `/profiles/${data.nominee_id}` : '/';

  return (
    <div className="min-h-screen" style={{ background: CREAM, color: NAVY }}>
      {/* MASTHEAD */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY_DEEP} 0%, ${NAVY} 60%, transparent 100%)` }} />
        <div className="relative max-w-4xl mx-auto px-6 md:px-10 pt-12 pb-20 text-center">
          {/* Breadcrumbs */}
          <nav className="flex items-center justify-center gap-1.5 mb-8 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'rgba(250,248,245,0.6)' }}>
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" style={{ color: GOLD }} />
            <span>Most Liked Posts · 2026</span>
            <ChevronRight className="w-3 h-3" style={{ color: GOLD }} />
            <span style={{ color: GOLD }}>{name}</span>
          </nav>

          <Link to="/" className="inline-flex items-center mb-8">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ borderColor: 'rgba(201,168,124,0.5)', color: GOLD, background: 'rgba(201,168,124,0.08)' }}>
              <ArrowLeft className="w-3.5 h-3.5 mr-2" />
              TOP 100 Aerospace &amp; Aviation
            </span>
          </Link>

          <div className="inline-flex items-center gap-2 mb-6 text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: GOLD }}>
            <TrendingUp className="w-4 h-4" />
            Most Liked Posts Series · 2026
          </div>

          <h1 className="font-serif text-4xl md:text-6xl font-bold leading-[1.05] mb-6" style={{ color: CREAM }}>
            {name}'s Top Viral Post
          </h1>

          {byline && (
            <p className="font-serif text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-2" style={{ color: 'rgba(250,248,245,0.85)' }}>
              {byline}
            </p>
          )}
          <div className="mt-5 flex items-center justify-center gap-3 text-sm" style={{ color: 'rgba(250,248,245,0.7)' }}>
            <span>Originally published on LinkedIn</span>
            <span>·</span>
            <span style={{ color: GOLD }}>Featured in the Most Liked Posts Series</span>
          </div>
        </div>
      </header>

      {/* THE POST */}
      <section className="max-w-3xl mx-auto px-6 md:px-10 -mt-10 relative z-10 pb-16">
        <article className="bg-white border rounded-2xl overflow-hidden shadow-sm" style={{ borderColor: 'rgba(30,58,90,0.14)' }}>
          {/* Framed post screenshot — the original LinkedIn artifact */}
          {data.viral_post_screenshot_url && (
            <div className="flex items-center justify-center p-5 md:p-8 border-b" style={{ background: NAVY, borderColor: 'rgba(30,58,90,0.14)' }}>
              <img
                src={data.viral_post_screenshot_url}
                alt={`${name} — original LinkedIn post`}
                className="w-full max-w-[420px] rounded-lg shadow-lg object-contain"
                style={{ maxHeight: 460 }}
              />
            </div>
          )}

          <div className="p-7 md:p-10">
            {/* Impressions */}
            {data.viral_post_impressions && (
              <div className="mb-8 pb-8 border-b" style={{ borderColor: 'rgba(30,58,90,0.12)' }}>
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-4xl md:text-5xl font-bold" style={{ color: COPPER }}>
                    {data.viral_post_impressions}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(30,58,90,0.6)' }}>
                    Impressions
                  </span>
                </div>
              </div>
            )}

            {/* Takeaway */}
            {data.viral_post_takeaway && (
              <div className="mb-8">
                <p className="font-serif text-lg leading-relaxed whitespace-pre-line" style={{ color: 'rgba(30,58,90,0.85)' }}>
                  {data.viral_post_takeaway}
                </p>
              </div>
            )}

            {/* Wisdom pull-quote */}
            {data.viral_post_wisdom && (
              <div className="flex gap-3 mb-2">
                <QuoteIcon className="shrink-0 mt-1" style={{ color: GOLD, width: 20, height: 20 }} />
                <p className="font-serif italic leading-relaxed text-lg md:text-xl" style={{ color: NAVY }}>
                  {data.viral_post_wisdom}
                </p>
              </div>
            )}
          </div>
        </article>

        {/* Profile link */}
        <div className="mt-6 text-center">
          <Link to={profileUrl} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: NAVY }}>
            View {name}'s full profile
            <ChevronRight className="w-4 h-4" style={{ color: COPPER }} />
          </Link>
        </div>
      </section>

      {/* CLOSING CTAs — mirror /viralpost2022 */}
      <section className="border-t" style={{ borderColor: 'rgba(30,58,90,0.12)', background: SAND }}>
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-20 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-5" style={{ color: NAVY }}>
            From a Post to a Platform
          </h2>
          <p className="font-serif text-lg leading-relaxed mb-8" style={{ color: 'rgba(30,58,90,0.8)' }}>
            TOP 100 Aerospace &amp; Aviation is a verified reputation graph — measuring contribution, verification, and reach across a global directory of Fellows. Share your own most-liked post and join the record.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={openStudio}
              className="rounded-full px-8 h-12 font-semibold"
              style={{ background: NAVY, color: CREAM }}
            >
              Add my own Viral Post
            </Button>
            <a href={data.viral_post_link} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-full px-8 h-12 font-semibold border-2" style={{ borderColor: NAVY, color: NAVY }}>
                View Original on LinkedIn
                <ExternalLink className="w-3.5 h-3.5 ml-2 opacity-70" />
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}