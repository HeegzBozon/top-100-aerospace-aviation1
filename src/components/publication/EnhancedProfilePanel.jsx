import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Crown, Medal, Star, Award, Globe, Briefcase,
  Linkedin, Instagram, ExternalLink, Share2, Sparkles,
  ChevronRight, ChevronLeft, Users, Quote, Rocket, Heart
} from 'lucide-react';

// ─── Brand tokens ───────────────────────────────────────────────────────────
const b = {
  navy:      '#1e3a5a',
  navyMid:   '#2a4f7c',
  sky:       '#4a90b8',
  gold:      '#c9a87c',
  goldLight: '#e8d4b8',
  rose:      '#d4a090',
  cream:     '#faf8f5',
  sand:      '#f0e6d6',
};

const WREATH_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/90f4fd33a_Gemini_Generated_Image_s3pahzs3pahzs3pa.png';

// ─── Rank helper ─────────────────────────────────────────────────────────────
function getRankInfo(rank) {
  if (rank === 1) return { icon: Crown, label: '#1 — Gold',   bg: 'linear-gradient(135deg,#FFD700,#FFA500)', dark: true  };
  if (rank === 2) return { icon: Medal, label: '#2 — Silver', bg: 'linear-gradient(135deg,#C0C0C0,#A8A8A8)', dark: true  };
  if (rank === 3) return { icon: Medal, label: '#3 — Bronze', bg: 'linear-gradient(135deg,#CD7F32,#B87333)', dark: false };
  if (rank <= 10) return { icon: Star,  label: `#${rank} — Top 10`, bg: `linear-gradient(135deg,${b.navy},${b.sky})`, dark: false };
  return { icon: Award, label: `#${rank}`, bg: `linear-gradient(135deg,${b.navy},${b.sky})`, dark: false };
}

// ─── Dot-pattern SVG (reusable) ───────────────────────────────────────────
function DotPattern({ opacity = 0.08, id = 'dots' }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="none" style={{ opacity }}>
        <defs>
          <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.2" fill="white" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}

// ─── Slide dot indicators ─────────────────────────────────────────────────
function SlideDots({ total, current, onGo }) {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          aria-label={`Go to slide ${i + 1}`}
          onClick={() => onGo(i)}
          className="rounded-full transition-all duration-300"
          style={{
            width:  i === current ? 20 : 7,
            height: 7,
            background: i === current
              ? `linear-gradient(90deg,${b.gold},${b.rose})`
              : `${b.navy}30`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Persistent chrome (close + rank badge) ───────────────────────────────
function ModalChrome({ rank, onClose }) {
  const { icon: RIcon, label, bg, dark } = getRankInfo(rank);
  return (
    <>
      <button
        onClick={onClose}
        aria-label="Close profile"
        className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'rgba(0,0,0,0.35)', color: 'white' }}
      >
        <X className="w-5 h-5" />
      </button>
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
        className="absolute top-4 left-4 z-30 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-lg"
        style={{ background: bg, color: dark ? b.navy : 'white' }}
      >
        <RIcon className="w-3.5 h-3.5" />
        {label}
      </motion.div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Attention: Full-bleed hero, name, six-word story
// ═══════════════════════════════════════════════════════════════════════════
function Slide1({ nominee }) {
  const photo = nominee.avatar_url || nominee.photo_url;

  return (
    <div className="relative flex flex-col h-full" style={{ background: b.navy }}>
      {/* Hero photo */}
      <div className="relative overflow-hidden" style={{ height: '52%' }}>
        {photo
          ? <img src={photo} alt={nominee.name} className="absolute inset-0 w-full h-full object-cover object-top" />
          : <div className="absolute inset-0" style={{ background: `linear-gradient(160deg,${b.navyMid},${b.sky})` }} />
        }
        {/* Layered overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${b.navy} 0%, transparent 50%)` }} />
        <DotPattern opacity={0.06} id="s1dots" />

      </div>

      {/* Bottom text block */}
      <div className="relative z-10 px-7 pb-4 pt-0">
        {/* Wreath + circular photo sitting at the boundary */}
        <div className="flex justify-center -mt-16 mb-3">
          <div className="relative w-32 h-32">
            <img src={WREATH_URL} alt="" className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10" />
            <div className="absolute inset-[14%] rounded-full overflow-hidden border-2 border-white/30 shadow-xl z-0"
              style={{ background: b.goldLight }}>
              {photo
                ? <img src={photo} alt={nominee.name} className="w-full h-full object-cover object-top" />
                : <div className="w-full h-full flex items-center justify-center text-3xl font-bold"
                    style={{ color: b.navy, background: b.goldLight }}>{nominee.name?.charAt(0)}</div>
              }
            </div>
          </div>
        </div>

        {/* Publication badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right,${b.gold},transparent)` }} />
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: b.gold }}>
            TOP 100 Women in Aerospace 2025
          </span>
          <div className="h-px flex-1" style={{ background: `linear-gradient(to left,${b.gold},transparent)` }} />
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold text-white leading-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
        >
          {nominee.name}
        </motion.h2>

        {(nominee.title || nominee.professional_role) && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-1 text-sm font-medium"
            style={{ color: b.goldLight }}
          >
            {nominee.title || nominee.professional_role}
            {nominee.company && <span style={{ color: 'rgba(255,255,255,0.5)' }}> · {nominee.company}</span>}
          </motion.p>
        )}

        {nominee.six_word_story && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-3 px-4 py-3 rounded-2xl flex items-start gap-2"
            style={{ background: `linear-gradient(135deg,${b.gold}22,${b.rose}18)`, border: `1px solid ${b.gold}30` }}
          >
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color: b.gold }} />
            <p className="italic text-sm leading-snug text-white/90">"{nominee.six_word_story}"</p>
          </motion.div>
        )}

        <SlideShareButton onClose={onClose} onShare={onShare} nominee={nominee} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 2 — Interest: Story / bio, context tags
// ═══════════════════════════════════════════════════════════════════════════
function Slide2({ nominee }) {
  const bio = nominee.bio || nominee.description;

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: b.cream }}>
      {/* Gradient header strip */}
      <div className="relative px-7 pt-12 pb-6" style={{ background: `linear-gradient(160deg,${b.navy} 0%,${b.navyMid} 60%,${b.sky}80 100%)` }}>
        <DotPattern opacity={0.07} id="s2dots" />
        <p className="relative z-10 text-xs font-bold tracking-[0.18em] uppercase mb-1" style={{ color: b.gold }}>Her Story</p>
        <h3 className="relative z-10 text-xl font-bold text-white leading-snug" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {nominee.name}
        </h3>
      </div>

      <div className="px-7 py-6 space-y-5 flex-1">
        {/* Context tags */}
        <div className="flex flex-wrap gap-2">
          {nominee.country && (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: `${b.sky}18`, color: b.sky }}>
              <Globe className="w-3 h-3" />{nominee.country}
            </span>
          )}
          {nominee.industry && (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: `${b.navy}12`, color: b.navy }}>
              <Briefcase className="w-3 h-3" />{nominee.industry}
            </span>
          )}
          {nominee.discipline && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: `${b.gold}22`, color: b.gold }}>
              {nominee.discipline.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {/* Bio */}
        {bio && (
          <div className="relative">
            <Quote className="w-8 h-8 mb-2" style={{ color: `${b.gold}40` }} />
            <p className="text-sm leading-relaxed" style={{ color: `${b.navy}cc` }}>{bio}</p>
          </div>
        )}

        {/* Social following stats */}
        {nominee.social_stats?.linkedin_followers > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: `linear-gradient(135deg,${b.sand},${b.goldLight}60)` }}>
            <Users className="w-5 h-5" style={{ color: b.gold }} />
            <div>
              <p className="text-xs font-bold" style={{ color: b.navy }}>
                {Number(nominee.social_stats.linkedin_followers).toLocaleString()} LinkedIn followers
              </p>
              <p className="text-[10px]" style={{ color: `${b.navy}70` }}>Aerospace & aviation community</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 3 — Desire: Why follow, proudest achievement
// ═══════════════════════════════════════════════════════════════════════════
function Slide3({ nominee }) {
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: b.cream }}>
      {/* Header */}
      <div className="relative px-7 pt-12 pb-6" style={{ background: `linear-gradient(160deg,${b.rose}cc,${b.gold}aa)` }}>
        <DotPattern opacity={0.08} id="s3dots" />
        <p className="relative z-10 text-xs font-bold tracking-[0.18em] uppercase mb-1 text-white/70">What Sets Her Apart</p>
        <h3 className="relative z-10 text-xl font-bold text-white leading-snug" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Impact &amp; Influence
        </h3>
      </div>

      <div className="px-7 py-6 space-y-5 flex-1">
        {/* Why follow */}
        {nominee.linkedin_follow_reason && (
          <div className="p-5 rounded-2xl border" style={{ background: `linear-gradient(135deg,${b.gold}12,${b.goldLight}30)`, borderColor: `${b.gold}35` }}>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: b.gold }}>Why Follow Her</p>
            <p className="text-sm leading-relaxed" style={{ color: b.navy }}>{nominee.linkedin_follow_reason}</p>
          </div>
        )}

        {/* Proudest achievement */}
        {nominee.linkedin_proudest_achievement && (
          <div className="p-5 rounded-2xl border" style={{ background: `linear-gradient(135deg,${b.rose}12,${b.sand}40)`, borderColor: `${b.rose}30` }}>
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-4 h-4" style={{ color: b.rose }} />
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: b.rose }}>Proudest Achievement</p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: b.navy }}>{nominee.linkedin_proudest_achievement}</p>
          </div>
        )}

        {/* Nomination reason fallback */}
        {!nominee.linkedin_follow_reason && !nominee.linkedin_proudest_achievement && nominee.nomination_reason && (
          <div className="p-5 rounded-2xl border" style={{ background: `linear-gradient(135deg,${b.gold}12,${b.goldLight}30)`, borderColor: `${b.gold}35` }}>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: b.gold }}>Nominated For</p>
            <p className="text-sm leading-relaxed" style={{ color: b.navy }}>{nominee.nomination_reason}</p>
          </div>
        )}

        {/* Spotlight badges */}
        {(nominee.rising_star_count > 0 || nominee.rock_star_count > 0 || nominee.north_star_count > 0) && (
          <div className="flex flex-wrap gap-2">
            {nominee.rising_star_count > 0 && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1"
                style={{ background: `${b.sky}20`, color: b.sky }}>
                <Star className="w-3 h-3" /> Rising Star ×{nominee.rising_star_count}
              </span>
            )}
            {nominee.rock_star_count > 0 && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1"
                style={{ background: `${b.gold}22`, color: b.gold }}>
                <Sparkles className="w-3 h-3" /> Rock Star ×{nominee.rock_star_count}
              </span>
            )}
            {nominee.north_star_count > 0 && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1"
                style={{ background: `${b.rose}22`, color: b.rose }}>
                <Heart className="w-3 h-3" /> North Star ×{nominee.north_star_count}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 4 — Action: Connect, share, follow
// ═══════════════════════════════════════════════════════════════════════════
function Slide4({ nominee, onClose, onShare }) {
  const socials = [
    nominee.linkedin_profile_url && { href: nominee.linkedin_profile_url, icon: Linkedin, label: 'Connect on LinkedIn', bg: '#0077B5' },
    nominee.instagram_url       && { href: nominee.instagram_url,       icon: Instagram,    label: 'Follow on Instagram', bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' },
    nominee.website_url         && { href: nominee.website_url,         icon: ExternalLink,  label: 'Visit Website',       bg: b.navyMid },
  ].filter(Boolean);

  return (
    <div className="flex flex-col h-full" style={{ background: b.cream }}>
      {/* Header */}
      <div className="relative px-7 pt-12 pb-6 overflow-hidden" style={{ background: `linear-gradient(160deg,${b.navy},${b.navyMid})` }}>
        <DotPattern opacity={0.08} id="s4dots" />
        {/* Rose-gold accent glow */}
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle,${b.rose}40,transparent 70%)` }} />
        <p className="relative z-10 text-xs font-bold tracking-[0.18em] uppercase mb-1" style={{ color: b.gold }}>Take Action</p>
        <h3 className="relative z-10 text-xl font-bold text-white leading-snug" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Support {nominee.name?.split(' ')[0]}
        </h3>
      </div>

      <div className="px-7 py-6 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Social CTA links */}
          {socials.map(({ href, icon: Icon, label, bg }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-5 py-4 rounded-2xl text-white font-semibold text-sm transition-all hover:scale-[1.02] hover:shadow-lg"
              style={{ background: bg }}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
              <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
            </a>
          ))}

          {/* Share achievement */}
          <button
            onClick={(e) => { e.stopPropagation(); if (onShare) { onClose(); onShare(nominee); } }}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{ background: `linear-gradient(135deg,${b.gold},${b.rose})`, color: 'white' }}
          >
            <Share2 className="w-5 h-5 shrink-0" />
            Share This Achievement
            <ChevronRight className="w-4 h-4 ml-auto opacity-70" />
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-[10px] mt-6" style={{ color: `${b.navy}50` }}>
          TOP 100 Women in Aerospace &amp; Aviation · 2025 Edition
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Root component
// ═══════════════════════════════════════════════════════════════════════════
const SLIDES = [Slide1, Slide2, Slide3, Slide4];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0 }),
};

export default function EnhancedProfilePanel({ nominee, rank, onClose, onShare }) {
  const [slide, setSlide] = useState(0);
  const [dir, setDir] = useState(1);

  const goTo = useCallback((i) => {
    setDir(i > slide ? 1 : -1);
    setSlide(i);
  }, [slide]);

  const next = useCallback(() => { if (slide < SLIDES.length - 1) goTo(slide + 1); }, [slide, goTo]);
  const prev = useCallback(() => { if (slide > 0) goTo(slide - 1); }, [slide, goTo]);

  if (!nominee) return null;

  const SlideComponent = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

        <motion.div
          initial={{ scale: 0.92, y: 28, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 28, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-md w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          style={{ height: 'min(88vh, 680px)', background: b.cream }}
        >
          {/* Persistent chrome */}
          <ModalChrome rank={rank} onClose={onClose} />

          {/* Slide content */}
          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence custom={dir} mode="wait">
              <motion.div
                key={slide}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                className="absolute inset-0"
              >
                <SlideComponent nominee={nominee} rank={rank} onClose={onClose} onShare={onShare} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom nav bar */}
          <div
            className="flex items-center justify-between px-4 py-2 border-t"
            style={{ background: b.cream, borderColor: `${b.navy}10` }}
          >
            <button
              onClick={prev}
              disabled={slide === 0}
              aria-label="Previous slide"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
              style={{ background: slide === 0 ? 'transparent' : `${b.navy}10`, color: b.navy }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <SlideDots total={SLIDES.length} current={slide} onGo={goTo} />

            <button
              onClick={next}
              disabled={isLast}
              aria-label="Next slide"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
              style={{ background: isLast ? 'transparent' : `linear-gradient(135deg,${b.gold},${b.rose})`, color: 'white' }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}