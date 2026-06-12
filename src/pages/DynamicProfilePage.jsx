import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Loader2, MapPin, Globe, Linkedin,
  ExternalLink, Star, Shield, ArrowLeft, Instagram, Youtube
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// ── SEO / JSON-LD injection (unchanged logic, updated OG image fallback) ──────
function useProfileMeta(nominee) {
  useEffect(() => {
    if (!nominee) return;

    const name = nominee.name || 'Aerospace Leader';
    const title = nominee.title || nominee.professional_role || '';
    const company = nominee.company || nominee.organization || '';
    const description = nominee.description || nominee.bio || `${name} is recognized among the TOP 100 Aerospace & Aviation leaders worldwide.`;
    const image = nominee.avatar_url || nominee.photo_url || 'https://media.base44.com/images/public/68996845be6727838fdb822e/9ad98cbff_generated_image.png';
    const url = `https://top100aero.space/profiles/${nominee.id}`;
    const pageTitle = `${name}${title ? ` — ${title}` : ''}${company ? ` at ${company}` : ''} | TOP 100 Aerospace & Aviation`;

    document.title = pageTitle;

    const setMeta = (sel, attr, val) => {
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement('meta'); document.head.appendChild(el); }
      el.setAttribute(attr, val);
    };
    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
      el.setAttribute('href', href);
    };

    setMeta('meta[name="description"]', 'content', description.slice(0, 160));
    setMeta('meta[name="robots"]', 'content', 'index, follow');
    setLink('canonical', url);

    setMeta('meta[property="og:title"]', 'content', pageTitle);
    setMeta('meta[property="og:description"]', 'content', description.slice(0, 200));
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:image"]', 'content', image);
    setMeta('meta[property="og:type"]', 'content', 'profile');

    setMeta('meta[name="twitter:title"]', 'content', pageTitle);
    setMeta('meta[name="twitter:description"]', 'content', description.slice(0, 200));
    setMeta('meta[name="twitter:image"]', 'content', image);
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');

    const existingScript = document.getElementById('profile-jsonld');
    if (existingScript) existingScript.remove();

    const sameAs = [
      nominee.linkedin_profile_url,
      nominee.instagram_url,
      nominee.tiktok_url,
      nominee.youtube_url,
      nominee.website_url,
    ].filter(Boolean);

    const personSchema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name,
      description,
      url,
      image,
      ...(title && { jobTitle: title }),
      ...(company && { worksFor: { '@type': 'Organization', name: company } }),
      ...(nominee.country && { addressCountry: nominee.country }),
      ...(sameAs.length && { sameAs }),
      ...(nominee.skills?.length && { knowsAbout: nominee.skills }),
      ...(nominee.industry && { hasOccupation: { '@type': 'Occupation', name: nominee.industry } }),
      ...(nominee.career_history?.length && {
        hasCredential: nominee.career_history.slice(0, 5).map(r => ({
          '@type': 'EducationalOccupationalCredential',
          credentialCategory: r.role_title,
          recognizedBy: { '@type': 'Organization', name: r.company_name }
        }))
      }),
      memberOf: {
        '@type': 'Organization',
        name: 'TOP 100 Aerospace & Aviation',
        url: 'https://top100aero.space'
      }
    };

    const script = document.createElement('script');
    script.id = 'profile-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(personSchema);
    document.head.appendChild(script);

    return () => {
      document.title = 'TOP 100 Aerospace & Aviation | The Verified Reputation Graph for Aerospace';
      const s = document.getElementById('profile-jsonld');
      if (s) s.remove();
    };
  }, [nominee]);
}

// ── Verification badge ────────────────────────────────────────────────────────
function VerifiedBadge({ status }) {
  if (!status || status === 'unverified') return null;
  const labels = { self_verified: 'Self-Verified', partially_verified: 'Partially Verified', fully_verified: 'Fully Verified' };
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: 'rgba(201,168,124,0.15)', color: '#c9a87c', border: '1px solid rgba(201,168,124,0.3)' }}>
      <Shield className="w-3 h-3" /> {labels[status] || 'Verified'}
    </span>
  );
}

// ── Aura score ring ───────────────────────────────────────────────────────────
function AuraRing({ score }) {
  if (!score) return null;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl"
        style={{ background: 'conic-gradient(#c9a87c 0% 100%, rgba(201,168,124,0.1) 0%)', color: '#c9a87c', border: '3px solid rgba(201,168,124,0.3)' }}>
        {Math.round(score)}
      </div>
      <span className="text-white/40 text-[10px] uppercase tracking-widest">Aura</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DynamicProfilePage() {
  const { nomineeId } = useParams();
  const navigate = useNavigate();
  const [nominee, setNominee] = useState(null);
  const [adjacentIds, setAdjacentIds] = useState({ prev: null, next: null });
  const [loading, setLoading] = useState(true);

  useProfileMeta(nominee);

  useEffect(() => {
    const loadNominee = async () => {
      try {
        const data = await base44.entities.Nominee.get(nomineeId);
        setNominee(data);
        const allNominees = await base44.entities.Nominee.list('-created_date', 1000);
        const idx = allNominees.findIndex(n => n.id === nomineeId);
        setAdjacentIds({
          prev: idx > 0 ? allNominees[idx - 1].id : null,
          next: idx < allNominees.length - 1 ? allNominees[idx + 1].id : null,
        });
      } catch (err) {
        console.error('Failed to load nominee:', err);
      } finally {
        setLoading(false);
      }
    };
    loadNominee();
  }, [nomineeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#07111f' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#c9a87c' }} />
      </div>
    );
  }

  if (!nominee) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#07111f' }}>
        <div className="text-center">
          <p className="text-white/50 mb-4">Profile not found</p>
          <Link to="/" className="text-[#c9a87c] underline text-sm">Back to Directory</Link>
        </div>
      </div>
    );
  }

  const title = nominee.title || nominee.professional_role || '';
  const company = nominee.company || nominee.organization || '';
  const photo = nominee.avatar_url || nominee.photo_url;

  return (
    <div className="min-h-screen" style={{ background: '#07111f' }}>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Background radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,168,124,0.10) 0%, transparent 70%)' }} />

        {/* Top nav bar */}
        <div className="relative z-10 px-6 pt-6 pb-0">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <Link to="/Top100Women2025"
              className="text-xs font-bold uppercase tracking-widest transition-colors"
              style={{ color: '#c9a87c' }}>
              TOP 100 Directory
            </Link>
          </div>
        </div>

        {/* Profile hero */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-7"
          >
            {/* Avatar */}
            <div className="shrink-0">
              {photo ? (
                <img src={photo} alt={nominee.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover"
                  style={{ border: '2px solid rgba(201,168,124,0.4)' }} />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center text-3xl font-bold"
                  style={{ background: 'rgba(201,168,124,0.12)', color: '#c9a87c', border: '2px solid rgba(201,168,124,0.25)' }}>
                  {nominee.name?.charAt(0)}
                </div>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <VerifiedBadge status={nominee.verified_status} />
                {nominee.aura_rank_name && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {nominee.aura_rank_name}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {nominee.name}
              </h1>
              {(title || company) && (
                <p className="text-white/60 text-base mb-3">
                  {title}{title && company ? ' · ' : ''}{company}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                {nominee.country && (
                  <span className="flex items-center gap-1.5 text-white/40 text-sm">
                    <MapPin className="w-3.5 h-3.5" /> {nominee.country}
                  </span>
                )}
                {nominee.industry && (
                  <span className="flex items-center gap-1.5 text-white/40 text-sm">
                    <Star className="w-3.5 h-3.5" /> {nominee.industry}
                  </span>
                )}
              </div>

              {/* Social links */}
              <div className="flex items-center gap-3 mt-4">
                {nominee.linkedin_profile_url && (
                  <a href={nominee.linkedin_profile_url} target="_blank" rel="noopener noreferrer"
                    className="text-white/30 hover:text-[#c9a87c] transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {nominee.instagram_url && (
                  <a href={nominee.instagram_url} target="_blank" rel="noopener noreferrer"
                    className="text-white/30 hover:text-[#c9a87c] transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {nominee.youtube_url && (
                  <a href={nominee.youtube_url} target="_blank" rel="noopener noreferrer"
                    className="text-white/30 hover:text-[#c9a87c] transition-colors">
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
                {nominee.website_url && (
                  <a href={nominee.website_url} target="_blank" rel="noopener noreferrer"
                    className="text-white/30 hover:text-[#c9a87c] transition-colors">
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Aura score */}
            {nominee.aura_score > 0 && <AuraRing score={nominee.aura_score} />}
          </motion.div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 pb-20 space-y-10">

        {/* About */}
        {(nominee.description || nominee.bio) && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl p-7"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#c9a87c' }}>About</h2>
            {nominee.description && <p className="text-white/80 leading-relaxed mb-3">{nominee.description}</p>}
            {nominee.bio && <p className="text-white/55 leading-relaxed text-sm">{nominee.bio}</p>}
          </motion.section>
        )}

        {/* Impact summary */}
        {nominee.impact_summary && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-7"
            style={{ background: 'rgba(201,168,124,0.06)', border: '1px solid rgba(201,168,124,0.2)' }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#c9a87c' }}>Impact Summary</h2>
            <p className="text-white/75 leading-relaxed">{nominee.impact_summary}</p>
          </motion.section>
        )}

        {/* Editorial article */}
        {nominee.editorial_article && nominee.article_status === 'published' && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-7"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: '#c9a87c' }}>Spotlight Article</h2>
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-white/70 prose-strong:text-white prose-a:text-[#c9a87c]">
              <ReactMarkdown>{nominee.editorial_article}</ReactMarkdown>
            </div>
          </motion.section>
        )}

        {/* Skills */}
        {nominee.skills?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-7"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#c9a87c' }}>Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {nominee.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-full text-xs font-medium text-white/70"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {skill}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {/* Career history */}
        {nominee.career_history?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-7"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: '#c9a87c' }}>Career History</h2>
            <div className="space-y-5">
              {nominee.career_history.map((role, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="mt-1.5 shrink-0">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#c9a87c' }} />
                  </div>
                  <div className="flex-1 pb-5 border-b border-white/5 last:border-0 last:pb-0">
                    <p className="text-white font-semibold text-sm">{role.role_title}</p>
                    <p className="text-white/55 text-sm">{role.company_name}</p>
                    {role.start_date && (
                      <p className="text-white/30 text-xs mt-0.5">
                        {role.start_date} – {role.end_date || 'Present'}
                      </p>
                    )}
                    {role.description && (
                      <p className="mt-2 text-white/50 text-xs leading-relaxed">{role.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Affiliations */}
        {nominee.affiliations?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-7"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#c9a87c' }}>Affiliations</h2>
            <div className="flex flex-wrap gap-2">
              {nominee.affiliations.map((aff, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-full text-xs font-medium text-white/70"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {aff}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {/* Six-word story */}
        {nominee.six_word_story && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-7 text-center"
            style={{ background: 'rgba(201,168,124,0.06)', border: '1px solid rgba(201,168,124,0.15)' }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#c9a87c' }}>Six-Word Story</p>
            <p className="text-white text-xl font-bold italic"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              "{nominee.six_word_story}"
            </p>
          </motion.div>
        )}

        {/* CTA — nominate or view directory */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl p-7 text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">TOP 100 Aerospace &amp; Aviation</p>
          <p className="text-white/70 text-sm mb-5 max-w-sm mx-auto">
            Know someone who belongs in this directory? Nominations are open year-round.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/nominate"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-[#07111f]"
              style={{ background: 'linear-gradient(135deg, #c9a87c, #d4b88c)' }}>
              Nominate Someone
            </Link>
            <Link to="/Top100Women2025"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white border border-white/20 hover:border-[#c9a87c]/40 transition-all">
              View Full Directory <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── PREV / NEXT ───────────────────────────────────────────── */}
      <div className="border-t px-6 py-6" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(`/profiles/${adjacentIds.prev}`)}
            disabled={!adjacentIds.prev}
            className="flex items-center gap-2 text-sm font-medium text-white/40 hover:text-white disabled:opacity-20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <Link to="/Top100Women2025" className="text-xs text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest">
            Directory
          </Link>
          <button
            onClick={() => navigate(`/profiles/${adjacentIds.next}`)}
            disabled={!adjacentIds.next}
            className="flex items-center gap-2 text-sm font-medium text-white/40 hover:text-white disabled:opacity-20 transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}