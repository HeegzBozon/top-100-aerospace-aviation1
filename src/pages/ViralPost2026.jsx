import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { TrendingUp, ArrowLeft, ExternalLink, ChevronRight, Loader2, Inbox, AlertCircle, Quote as QuoteIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STUDIO_PATH = '/Profile?studio=open&ref=viralpost2026';
const NAVY = '#1e3a5a';
const NAVY_DEEP = '#16293f';
const GOLD = '#c9a87c';
const COPPER = '#b87333';
const CREAM = '#faf8f5';
const SAND = '#f0e9df';

export default function ViralPost2026() {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['publicViralPosts2026'],
    queryFn: async () => {
      const r = await base44.functions.invoke('getPublicViralPosts', {});
      const body = r && typeof r === 'object' && 'data' in r ? r.data : r;
      return body?.posts || [];
    },
  });

  useEffect(() => {
    base44.analytics.track({ eventName: 'viralpost2026_index_view' });
  }, []);

  // SEO — indexable CollectionPage.
  useEffect(() => {
    const title = 'Most Liked Posts Series · 2026 | TOP 100 Aerospace & Aviation';
    const desc = 'The featured top viral LinkedIn posts of TOP 100 Aerospace & Aviation Fellows — the Most Liked Posts Series, 2026 volume.';
    const canonical = `${window.location.origin}/viralpost2026`;
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
    document.title = title;
    upsert('meta', { name: 'description', content: desc });
    upsert('link', { rel: 'canonical', href: canonical });
    upsert('meta', { property: 'og:title', content: title });
    upsert('meta', { property: 'og:description', content: desc });
    upsert('meta', { property: 'og:type', content: 'website' });
    upsert('meta', { property: 'og:url', content: canonical });
    return () => { created.forEach((el) => el.parentNode && el.parentNode.removeChild(el)); };
  }, []);

  const openStudio = async () => {
    base44.analytics.track({ eventName: 'viralpost2026_index_add_clicked' });
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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: NAVY_DEEP, color: CREAM }}>
        <AlertCircle className="w-10 h-10 mb-4" style={{ color: COPPER }} />
        <h1 className="font-serif text-2xl font-bold mb-2">Couldn't load the series.</h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(250,248,245,0.65)' }}>{error?.message || 'Please try again shortly.'}</p>
        <Link to="/" className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>Return Home</Link>
      </div>
    );
  }

  const posts = data || [];

  return (
    <div className="min-h-screen" style={{ background: CREAM, color: NAVY }}>
      {/* MASTHEAD */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY_DEEP} 0%, ${NAVY} 70%, transparent 100%)` }} />
        <div className="relative max-w-5xl mx-auto px-6 md:px-10 pt-12 pb-16 text-center">
          <nav className="flex items-center justify-center gap-1.5 mb-8 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'rgba(250,248,245,0.6)' }}>
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" style={{ color: GOLD }} />
            <span style={{ color: GOLD }}>Media Center</span>
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
            Most Liked Posts Series
          </div>

          <h1 className="font-serif text-4xl md:text-6xl font-bold leading-[1.05] mb-5" style={{ color: CREAM }}>
            The 2026 Volume
          </h1>
          <p className="font-serif text-lg md:text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(250,248,245,0.82)' }}>
            Featured top-performing LinkedIn posts from the Fellows of TOP 100 Aerospace &amp; Aviation — measured by reach, curated by editorial.
          </p>
        </div>
      </header>

      {/* INDEX */}
      <section className="max-w-5xl mx-auto px-6 md:px-10 -mt-8 relative z-10 pb-16">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-2xl border" style={{ borderColor: 'rgba(30,58,90,0.14)' }}>
            <Inbox className="w-10 h-10 mb-4" style={{ color: GOLD }} />
            <h2 className="font-serif text-2xl font-bold mb-3" style={{ color: NAVY }}>The 2026 Series Opens Soon</h2>
            <p className="text-sm max-w-md mb-8" style={{ color: 'rgba(30,58,90,0.6)' }}>
              No Fellow posts have been featured in this volume yet. When the first “Most Liked Post” is featured, it appears here.
            </p>
            <Button onClick={openStudio} className="rounded-full px-7 h-11 font-semibold" style={{ background: NAVY, color: CREAM }}>
              Add my own Viral Post
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((p) => {
              const byline = [p.nominee_title, p.nominee_company]
                .filter((v) => v && v.toLowerCase() !== 'not found' && v.toLowerCase() !== 'n/a')
                .join(' · ');
              const takeaway = (p.takeaway || '').replace(/\s+/g, ' ').trim();
              const snippet = takeaway.length > 180 ? takeaway.slice(0, 177).trim() + '…' : takeaway;
              return (
                <Link
                  key={p.slug}
                  to={`/viralpost2026/featured/${p.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border flex flex-col transition-all hover:shadow-lg"
                  style={{ borderColor: 'rgba(30,58,90,0.14)' }}
                >
                  {/* Screenshot or masthead */}
                  {p.screenshot_url ? (
                    <div className="relative h-44 overflow-hidden" style={{ background: NAVY }}>
                      <img src={p.screenshot_url} alt={`${p.nominee_name} — top LinkedIn post`} className="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(22,41,63,0.85) 100%)' }} />
                      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-serif text-xl font-bold leading-tight truncate" style={{ color: CREAM }}>{p.nominee_name}</h3>
                          {byline && <p className="text-xs truncate mt-0.5" style={{ color: GOLD }}>{byline}</p>}
                        </div>
                        {p.impressions && (
                          <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider" style={{ background: 'rgba(184,115,51,0.9)', color: CREAM }}>
                            <TrendingUp className="w-3 h-3" /> {p.impressions}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 flex items-center gap-4" style={{ background: NAVY }}>
                      {p.nominee_avatar_url ? (
                        <img src={p.nominee_avatar_url} alt={p.nominee_name} className="w-14 h-14 rounded-full object-cover border-2 shrink-0" style={{ borderColor: GOLD }} />
                      ) : (
                        <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 shrink-0 font-serif text-lg" style={{ borderColor: GOLD, color: CREAM }}>{(p.nominee_name || '✦').slice(0, 1)}</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-serif text-xl font-bold leading-tight truncate" style={{ color: CREAM }}>{p.nominee_name}</h3>
                        {byline && <p className="text-xs truncate mt-0.5" style={{ color: GOLD }}>{byline}</p>}
                      </div>
                      {p.impressions && (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider" style={{ background: 'rgba(184,115,51,0.9)', color: CREAM }}>
                          <TrendingUp className="w-3 h-3" /> {p.impressions}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Takeaway */}
                  <div className="p-6 flex-1 flex flex-col">
                    {snippet ? (
                      <div className="flex gap-2 flex-1">
                        <QuoteIcon className="shrink-0 mt-1" style={{ color: GOLD, width: 16, height: 16 }} />
                        <p className="font-serif text-base leading-relaxed" style={{ color: 'rgba(30,58,90,0.85)' }}>{snippet}</p>
                      </div>
                    ) : (
                      <p className="text-sm italic" style={{ color: 'rgba(30,58,90,0.45)' }}>Read the full post and the Fellow's reflections.</p>
                    )}
                    <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold" style={{ color: NAVY }}>
                      Read the feature
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: COPPER }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Archive link — the 2022 prior volume */}
        <div className="mt-10 text-center">
          <Link to="/viralpost2022" className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline" style={{ color: 'rgba(30,58,90,0.7)' }}>
            View the 2022 Volume
            <ChevronRight className="w-4 h-4" style={{ color: COPPER }} />
          </Link>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="border-t" style={{ borderColor: 'rgba(30,58,90,0.12)', background: SAND }}>
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-20 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-5" style={{ color: NAVY }}>Have a post that moved the community?</h2>
          <p className="font-serif text-lg leading-relaxed mb-8" style={{ color: 'rgba(30,58,90,0.8)' }}>
            TOP 100 Aerospace &amp; Aviation is a verified reputation graph — measuring contribution, verification, and reach across a global directory of Fellows. Submit your most-liked post and join the record.
          </p>
          <Button onClick={openStudio} className="rounded-full px-8 h-12 font-semibold" style={{ background: NAVY, color: CREAM }}>
            Add my own Viral Post
          </Button>
        </div>
      </section>
    </div>
  );
}