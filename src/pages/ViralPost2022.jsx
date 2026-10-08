import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Quote as QuoteIcon, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { HONOREES, ordinal, slugify, LINKEDIN_PULSE_URL } from '@/components/viral-post-2022/honorees';

const STUDIO_PATH = '/Profile?studio=open&ref=viralpost2022';

const NAVY = '#1e3a5a';
const GOLD = '#c9a87c';
const COPPER = '#b87333';
const CREAM = '#faf8f5';
const SAND = '#f0e9df';

const HonoreeCard = ({ h }) => (
  <Link
    to={`/viralpost2022/featured/${slugify(h.name)}`}
    className="group relative bg-white border rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col"
    style={{ borderColor: 'rgba(30,58,90,0.14)' }}
  >
    {/* Rank ribbon */}
    <div
      className="absolute top-0 left-0 z-20 px-4 py-2 rounded-br-2xl"
      style={{ background: NAVY, color: CREAM }}
    >
      <span className="font-serif text-sm font-semibold tracking-widest uppercase">
        {ordinal(h.rank)}
      </span>
    </div>

    {/* Framed post screenshot — the original LinkedIn artifact */}
    <div
      className="flex items-center justify-center p-4 md:p-6 border-b"
      style={{ background: NAVY, borderColor: 'rgba(30,58,90,0.14)' }}
    >
      <img
        src={h.image}
        alt={`${h.name} — original LinkedIn post`}
        loading="lazy"
        className="w-full max-w-[260px] rounded-lg shadow-lg object-contain"
        style={{ maxHeight: 320 }}
      />
    </div>

    <div className="p-7 md:p-9 flex flex-col flex-1">
      <h3 className="font-serif text-xl md:text-2xl font-bold leading-tight mb-5" style={{ color: NAVY }}>
        {h.name}
      </h3>

      {/* Endorsement metric */}
      <div className="mb-5 pb-5 border-b" style={{ borderColor: 'rgba(30,58,90,0.12)' }}>
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-3xl md:text-4xl font-bold" style={{ color: COPPER }}>
            {h.endorsements}
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(30,58,90,0.6)' }}>
            Endorsements
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: 'rgba(30,58,90,0.75)' }}>
          {h.metric}
        </p>
      </div>

      {/* Pull quote */}
      <div className="flex gap-3 flex-1">
        <QuoteIcon className="shrink-0 mt-1" style={{ color: GOLD, width: 18, height: 18 }} />
        <p className="font-serif italic leading-relaxed text-[15px] md:text-base" style={{ color: 'rgba(30,58,90,0.85)' }}>
          {h.quote}
        </p>
      </div>

      <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold" style={{ color: NAVY }}>
        Read the feature
        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: COPPER }} />
      </div>
    </div>
  </Link>
);

export default function ViralPost2022() {
  const navigate = useNavigate();

  // Page-view tracking for the viral-post acquisition funnel.
  React.useEffect(() => {
    base44.analytics.track({ eventName: 'viralpost2022_view' });
  }, []);

  // Signed-in Fellows go straight to the Studio; visitors sign in first and
  // land back on the Studio when they return.
  const openStudio = async () => {
    base44.analytics.track({ eventName: 'viralpost2022_add_clicked' });
    try {
      const authed = await base44.auth.isAuthenticated();
      if (authed) {
        navigate(STUDIO_PATH);
        return;
      }
    } catch {}
    const returnUrl = `${window.location.origin}${STUDIO_PATH}`;
    base44.auth.redirectToLogin(returnUrl);
  };

  return (
    <div className="min-h-screen" style={{ background: CREAM, color: NAVY }}>
      {/* MASTHEAD */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY} 55%, transparent 100%)` }} />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 70% 60%, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }}
        />
        <div className="relative max-w-4xl mx-auto px-6 md:px-10 pt-14 pb-20 text-center">
          <nav className="flex items-center justify-center gap-1.5 mb-8 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'rgba(250,248,245,0.6)' }}>
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" style={{ color: GOLD }} />
            <span style={{ color: GOLD }}>Top Viral Posts</span>
          </nav>

          <Link to="/" className="inline-flex items-center mb-10">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ borderColor: 'rgba(201,168,124,0.5)', color: GOLD, background: 'rgba(201,168,124,0.08)' }}>
              <ArrowLeft className="w-3.5 h-3.5 mr-2" />
              TOP 100 Aerospace &amp; Aviation
            </span>
          </Link>

          <div className="inline-flex items-center gap-2 mb-6 text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: GOLD }}>
            <TrendingUp className="w-4 h-4" />
            Most-Reach Post · 2022
          </div>

          <h1 className="font-serif text-4xl md:text-6xl font-bold leading-[1.05] mb-6" style={{ color: CREAM }}>
            The Top 10 Aerospace &amp; Aviation<br className="hidden md:block" /> Professionals to Follow on LinkedIn
          </h1>

          <p className="font-serif text-lg md:text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(250,248,245,0.85)' }}>
            A 2022 feature that reached over three million people — the single most-viewed post in the early life of our community. These are the ten voices that carried it.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 text-sm" style={{ color: 'rgba(250,248,245,0.7)' }}>
            <span className="font-semibold" style={{ color: GOLD }}>By Matt Higa</span>
            <span>·</span>
            <span>Originally published on LinkedIn</span>
          </div>
        </div>
      </header>

      {/* ORIGIN NOTE */}
      <section className="max-w-3xl mx-auto px-6 md:px-10 -mt-8 relative z-10">
        <div className="bg-white border rounded-2xl p-7 md:p-10 shadow-sm" style={{ borderColor: 'rgba(30,58,90,0.14)' }}>
          <p className="font-serif text-lg leading-relaxed" style={{ color: 'rgba(30,58,90,0.85)' }}>
            One post. Over three million reached. In 2022 we asked the ten most-engaged aerospace and aviation professionals on LinkedIn a single question: <em className="not-italic font-semibold" style={{ color: NAVY }}>which of your posts performed best, and why?</em> Their answers became the most-shared feature in the early history of TOP 100. We republish it here — verbatim, in their own words — as a record of reach.
          </p>
        </div>
      </section>

      {/* THE TEN */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: COPPER }}>The Ranking</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3" style={{ color: NAVY }}>The Ten, by Reach</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {HONOREES.map((h) => (
            <HonoreeCard key={h.rank} h={h} />
          ))}
        </div>
      </section>

      {/* CLOSING */}
      <section className="border-t" style={{ borderColor: 'rgba(30,58,90,0.12)', background: SAND }}>
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-20 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-5" style={{ color: NAVY }}>
            From a Post to a Platform
          </h2>
          <p className="font-serif text-lg leading-relaxed mb-8" style={{ color: 'rgba(30,58,90,0.8)' }}>
            That 2022 post proved there was an audience for serious, human aerospace storytelling. Today, TOP 100 Aerospace &amp; Aviation is a verified reputation graph — measuring contribution, verification, and reach across a global directory of Fellows. The post is history. The measurement continues.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={openStudio}
              className="rounded-full px-8 h-12 font-semibold"
              style={{ background: NAVY, color: CREAM }}
            >
              Add my own Viral Post
            </Button>
            <a
              href={LINKEDIN_PULSE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="rounded-full px-8 h-12 font-semibold border-2" style={{ borderColor: NAVY, color: NAVY }}>
                View Original on LinkedIn
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}