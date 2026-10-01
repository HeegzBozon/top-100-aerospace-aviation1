import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Linkedin, MapPin, Users, Mail, Quote, ArrowRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { ARCHIVE_VOLUMES, getArchiveAppearance, buildHonoreeSlug, parseHonoreeParam } from '@/components/archive/archiveVolumes';
import ShareBar from '@/components/viral-post/ShareBar';

const NAVY = '#1e3a5a';
const NAVY_DEEP = '#0b2542';
const GOLD = '#c9a87c';
const COPPER = '#b87333';
const CREAM = '#faf8f5';
const SITE = 'https://top100aero.space';

// The 2021 Volume of Record — the immutable publication this route renders.
const EDITION_2021 = ARCHIVE_VOLUMES.find(
  (v) => v.year === '2021' && v.note === 'The Volume of Record'
);

function setMeta(sel, attr, val) {
  let el = document.querySelector(sel);
  if (!el) {
    el = document.createElement('meta');
    document.head.appendChild(el);
  }
  el.setAttribute(attr, val);
}
function setLink(sel, attr, val) {
  let el = document.querySelector(sel);
  if (!el) {
    el = document.createElement('link');
    document.head.appendChild(el);
  }
  el.setAttribute(attr, val);
}

function Block({ label, children }) {
  if (!children) return null;
  return (
    <section>
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] mb-2" style={{ color: GOLD }}>{label}</p>
      <p className="text-[15px] leading-[1.75] whitespace-pre-line" style={{ color: `${NAVY}E6`, fontFamily: 'Montserrat, system-ui, sans-serif' }}>{children}</p>
    </section>
  );
}

export default function HonoreePublication() {
  const { slugId } = useParams();
  const navigate = useNavigate();
  const nomineeId = parseHonoreeParam(slugId).id;
  const [nominee, setNominee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    (async () => {
      try {
        const n = await base44.entities.Nominee.get(nomineeId);
        if (!active) return;
        if (!n?.id) { setNotFound(true); setLoading(false); return; }
        setNominee(n);
        setLoading(false);
      } catch {
        if (!active) return;
        setNotFound(true);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [nomineeId]);

  // Canonicalize: bare-ID or stale-slug requests replace to the slug+ID URL.
  useEffect(() => {
    if (loading || notFound || !nominee) return;
    const canonicalSlug = buildHonoreeSlug(nominee);
    if (slugId !== canonicalSlug) {
      navigate(`/honoree/2021/${canonicalSlug}`, { replace: true });
    }
  }, [loading, notFound, nominee, slugId, navigate]);

  const seasonId = EDITION_2021?.seasonId;
  const editionLabel = EDITION_2021?.volume || 'TOP 100 Aviation & Aerospace Professionals 2021';
  const appearance = nominee ? getArchiveAppearance(nominee, seasonId) : null;
  const rank = appearance?.rank ?? nominee?.raw_nomination_data?.rank;
  const name = nominee?.name || 'Honoree';
  const role = nominee?.professional_role || nominee?.title || '';
  const company = nominee?.company || nominee?.organization || '';
  const description = nominee?.description || nominee?.bio || '';
  const ogImage = nominee?.linkedin_proudest_screenshot_url || nominee?.avatar_url || '';
  const canonical = `${SITE}/honoree/2021/${nominee ? buildHonoreeSlug(nominee) : nomineeId}`;
  const pageTitle = `${name} — Rank #${rank}${rank ? '' : '—'} · ${editionLabel}`;
  const shareTitle = `${name} — Rank #${rank} of the ${editionLabel}`;
  const shareSummary = description.slice(0, 140);

  // Client-side meta for crawlers that execute JS and for in-app link state.
  useEffect(() => {
    if (loading || notFound) return;
    document.title = pageTitle;
    const metaDesc = (description || `${name} — verified Fellow of the TOP 100 Aerospace & Aviation reputation graph.`).slice(0, 160);
    setMeta('meta[name="description"]', 'content', metaDesc);
    setMeta('meta[name="robots"]', 'content', 'index, follow, max-image-preview:large');
    setLink('link[rel="canonical"]', 'href', canonical);
    setMeta('meta[property="og:title"]', 'content', pageTitle);
    setMeta('meta[property="og:description"]', 'content', metaDesc);
    setMeta('meta[property="og:url"]', 'content', canonical);
    if (ogImage) setMeta('meta[property="og:image"]', 'content', ogImage);
    setMeta('meta[property="og:type"]', 'content', 'article');
    setMeta('meta[property="og:site_name"]', 'content', 'TOP 100 Aerospace & Aviation');
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', pageTitle);
    setMeta('meta[name="twitter:description"]', 'content', metaDesc);
    if (ogImage) setMeta('meta[name="twitter:image"]', 'content', ogImage);

    return () => {
      document.title = 'TOP 100 Aerospace & Aviation | The Verified Reputation Graph for Aerospace';
    };
  }, [loading, notFound, pageTitle, description, canonical, ogImage, name]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREAM }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: NAVY }} />
      </div>
    );
  }

  if (notFound || !nominee) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: CREAM }}>
        <p className="text-sm uppercase tracking-[0.2em]" style={{ color: GOLD }}>Publication not found</p>
        <Link to="/archive/6a6b70136ccb7c358f77dd7f" className="text-sm underline" style={{ color: NAVY }}>Return to the 2021 edition</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: CREAM }}>
      {/* ── Masthead ── */}
      <header className="border-b" style={{ borderColor: `${NAVY}14` }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <Link to={`/archive/${seasonId}`} className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: NAVY }}>
              <ChevronLeft className="w-3.5 h-3.5" /> The 2021 Edition
            </Link>
            <ShareBar title={shareTitle} summary={shareSummary} />
          </div>
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.28em] text-center" style={{ color: COPPER }}>
            {editionLabel}
          </p>
          <div className="mt-3 h-px w-16 mx-auto" style={{ background: GOLD }} />
        </div>
      </header>

      {/* ── Cover ── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 pt-8 pb-10 text-center">
        {nominee.avatar_url && (
          <motion.img
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            src={nominee.avatar_url}
            alt={name}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover mx-auto"
            style={{ border: `3px solid ${GOLD}` }}
          />
        )}
        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: GOLD }}>
          {rank ? `Rank #${rank}` : 'Honoree'}
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl leading-tight" style={{ color: NAVY, fontFamily: 'Playfair Display, Georgia, serif' }}>
          {name}
        </h1>
        {(role || company) && (
          <p className="mt-2 text-sm" style={{ color: `${NAVY}99`, fontFamily: 'Montserrat, system-ui, sans-serif' }}>
            {[role, company && `at ${company}`].filter(Boolean).join(' ')}
          </p>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs" style={{ color: `${NAVY}99` }}>
          {nominee.country && <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{nominee.country}</span>}
          {nominee.social_stats?.linkedin_followers > 0 && (
            <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" />{nominee.social_stats.linkedin_followers.toLocaleString()} community</span>
          )}
          {nominee.linkedin_profile_url && (
            <a href={nominee.linkedin_profile_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline" style={{ color: NAVY }}>
              <Linkedin className="w-3.5 h-3.5" /> LinkedIn
            </a>
          )}
        </div>

        {/* Share line for non-native (desktop) — the mobile-native path is the ShareBar above */}
        <div className="mt-6 flex justify-center sm:hidden">
          <ShareBar title={shareTitle} summary={shareSummary} />
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <div className="h-px" style={{ background: `${NAVY}14` }} />
      </div>

      {/* ── Editorial body ── */}
      <article className="max-w-3xl mx-auto px-5 sm:px-8 py-10 space-y-8">
        {description && (
          <figure className="text-center">
            <Quote className="w-6 h-6 mx-auto mb-3" style={{ color: GOLD }} />
            <blockquote className="text-xl sm:text-2xl leading-snug" style={{ color: NAVY, fontFamily: 'Playfair Display, Georgia, serif' }}>
              {description.length > 220 ? `${description.slice(0, 217)}…` : description}
            </blockquote>
          </figure>
        )}

        <Block label="Who I Am">{nominee.bio}</Block>
        <Block label="What I Do">{role}</Block>
        <Block label="Why Follow">{nominee.linkedin_follow_reason}</Block>

        {nominee.linkedin_proudest_screenshot_url && (
          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] mb-2" style={{ color: GOLD }}>Proudest Post</p>
            <img
              src={nominee.linkedin_proudest_screenshot_url}
              alt={`${name}'s proudest LinkedIn post`}
              className="w-full rounded-lg border object-contain"
              style={{ borderColor: `${NAVY}14`, maxHeight: 520 }}
            />
          </section>
        )}
        <Block label={nominee.linkedin_proudest_screenshot_url ? 'The Story Behind It' : 'Proudest Post'}>
          {nominee.linkedin_proudest_achievement}
        </Block>

        {nominee.nominee_email && (
          <div className="flex items-center gap-2 text-xs" style={{ color: `${NAVY}99` }}>
            <Mail className="w-3.5 h-3.5" /> {nominee.nominee_email}
          </div>
        )}
      </article>

      {/* ── Colophon ── */}
      <footer className="border-t" style={{ borderColor: `${NAVY}14`, background: `${NAVY}08` }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 text-center space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: COPPER }}>{editionLabel}</p>
          <p className="text-xs max-w-md mx-auto leading-relaxed" style={{ color: `${NAVY}99`, fontFamily: 'Montserrat, system-ui, sans-serif' }}>
            An immutable record of the 2021 class. This publication is distinct from the living talent-graph profile.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to={`/profiles/${nominee.id}`}
              className="inline-flex items-center gap-2 px-5 h-10 rounded-full text-xs font-bold text-white transition-transform hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}
            >
              View living profile <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to={`/archive/${seasonId}`}
              className="inline-flex items-center gap-2 px-5 h-10 rounded-full text-xs font-bold border transition-colors"
              style={{ borderColor: COPPER, color: COPPER, background: 'transparent' }}
            >
              The full 2021 edition
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}