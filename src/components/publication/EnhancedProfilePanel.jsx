import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import FlowerButton from './FlowerButton';
import {
  X, Star, Globe, Briefcase,
  Linkedin, Instagram, ExternalLink, Share2, Sparkles,
  ChevronRight, ChevronLeft, Users, Quote, Rocket, Heart,
  Play, Pause
} from 'lucide-react';

// ─── Brand tokens ───────────────────────────────────────────────────────────
const b = {
  navy:      '#1e3a5a',
  navyMid:   '#2a4f7c',
  navyDark:  '#0f1f35',
  sky:       '#4a90b8',
  gold:      '#c9a87c',
  goldLight: '#e8d4b8',
  goldDeep:  '#a07840',
  rose:      '#d4a090',
  cream:     '#faf8f5',
  sand:      '#f0e6d6',
};

const WREATH_URL = 'https://media.base44.com/images/public/68996845be6727838fdb822e/fa0298ddb_Gemini_Generated_Image_s3pahzs3pahzs3pa-removebg-preview.png';

// ─── Rank helper ─────────────────────────────────────────────────────────────
function getRankColor(rank) {
  if (rank === 1) return { text: '#FFD700', sub: '#B8860B', glow: 'rgba(255,215,0,0.35)' };
  if (rank === 2) return { text: '#C8C8C8', sub: '#909090', glow: 'rgba(200,200,200,0.25)' };
  if (rank === 3) return { text: '#CD7F32', sub: '#8B5A00', glow: 'rgba(205,127,50,0.30)' };
  if (rank <= 10) return { text: b.goldLight, sub: b.gold, glow: `${b.gold}40` };
  return { text: 'rgba(255,255,255,0.85)', sub: b.sky, glow: `${b.sky}30` };
}

// ─── Dot-pattern SVG ─────────────────────────────────────────────────────────
function DotPattern({ opacity = 0.06, id = 'dots' }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="none" style={{ opacity }}>
        <defs>
          <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}

// ─── Slide progress bar ───────────────────────────────────────────────────────
function SlideProgress({ total, current, onGo }) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-3">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          aria-label={`Go to slide ${i + 1}`}
          onClick={() => onGo(i)}
          className="rounded-full transition-all duration-500"
          style={{
            width:   i === current ? 28 : 6,
            height:  6,
            background: i === current
              ? `linear-gradient(90deg,${b.gold},${b.rose})`
              : i < current ? `${b.gold}60` : `${b.navy}20`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Persistent chrome ────────────────────────────────────────────────────────
function ModalChrome({ rank, onClose }) {
  const { text, sub, glow } = getRankColor(rank);
  return (
    <>
      <button
        onClick={onClose}
        aria-label="Close profile"
        className="absolute top-3.5 right-3.5 z-30 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/50"
        style={{ background: 'rgba(0,0,0,0.4)', color: 'white' }}
      >
        <X className="w-4 h-4" />
      </button>
      {/* Editorial rank number */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
        className="absolute top-2 left-4 z-30 flex flex-col leading-none"
        style={{ filter: `drop-shadow(0 2px 12px ${glow})` }}
      >
        <span
          className="font-black tabular-nums"
          style={{
            fontSize: 44,
            lineHeight: 1,
            color: text,
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: '-0.03em',
          }}
        >
          {rank}
        </span>
        <span
          className="text-[9px] font-black tracking-[0.2em] uppercase mt-0.5"
          style={{ color: sub }}
        >
          {rank === 1 ? 'Gold' : rank === 2 ? 'Silver' : rank === 3 ? 'Bronze' : rank <= 10 ? 'Top 10' : 'Honoree'}
        </span>
      </motion.div>
    </>
  );
}

// ─── Shared share CTA ────────────────────────────────────────────────────────
function ShareCTA({ nominee, onClose, onShare, compact = false }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); if (onShare) { onClose(); onShare(nominee); } }}
      className={`w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-sm text-white transition-all hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] ${compact ? 'py-2.5 px-4' : 'py-3.5 px-6'}`}
      style={{ background: `linear-gradient(135deg,${b.goldDeep},${b.rose},${b.gold})`, backgroundSize: '200%' }}
    >
      <Share2 className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      Share Her Achievement
    </button>
  );
}

// ─── Divider line ─────────────────────────────────────────────────────────────
function GoldDivider() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right,transparent,${b.gold}60)` }} />
      <div className="w-1 h-1 rounded-full" style={{ background: b.gold }} />
      <div className="h-px flex-1" style={{ background: `linear-gradient(to left,transparent,${b.gold}60)` }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Hero: Full-bleed photo, wreath, name, six-word story
// ═══════════════════════════════════════════════════════════════════════════
function Slide1({ nominee, onClose, onShare }) {
  const photo = nominee.avatar_url || nominee.photo_url;

  return (
    <div className="relative flex flex-col h-full" style={{ background: b.navyDark }}>

      {/* ── Full-bleed hero zone ── */}
      <div className="relative overflow-hidden" style={{ height: '64%' }}>

        {/* Blurred background photo */}
        {photo
          ? <img src={photo} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover object-top scale-110"
              style={{ filter: 'blur(18px) brightness(0.28) saturate(1.6)' }} />
          : <div className="absolute inset-0" style={{ background: `linear-gradient(160deg,${b.navyMid},${b.sky}80)` }} />
        }

        {/* Brand overlay */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(170deg,${b.navyDark}ee 0%,${b.navy}bb 40%,${b.navyMid}66 80%,transparent 100%)` }} />
        <DotPattern opacity={0.05} id="s1dots" />

        {/* Subtle radial gold glow behind wreath */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle,${b.gold}18 0%,transparent 70%)` }} />

        {/* Wreath + headshot medallion */}
        <div className="absolute inset-0 flex items-end justify-center pb-0">
          <div className="relative w-80 h-80">
            {/* Photo fills wreath center */}
            <div className="absolute inset-[11%] rounded-full overflow-hidden"
              style={{ boxShadow: `0 0 0 3px ${b.gold}90, 0 0 0 6px ${b.gold}25, 0 16px 48px rgba(0,0,0,0.8)` }}>
              {photo
                ? <img src={photo} alt={nominee.name} className="w-full h-full object-cover object-top" />
                : <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-white"
                    style={{ background: `linear-gradient(135deg,${b.navyMid},${b.navy})` }}>
                    {nominee.name?.charAt(0)}
                  </div>
              }
            </div>
            {/* Wreath on top */}
            <img src={WREATH_URL} alt="" aria-hidden
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              style={{ filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.6)) saturate(1.1)' }} />
          </div>
        </div>

        {/* Fade to navy at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-28"
          style={{ background: `linear-gradient(to top,${b.navyDark} 0%,transparent 100%)` }} />
      </div>

      {/* ── Text zone ── */}
      <div className="relative z-10 px-6 pb-5 pt-3 flex flex-col gap-3" style={{ background: b.navyDark }}>

        {/* Publication line */}
        <div className="flex items-center gap-2">
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right,${b.gold}70,transparent)` }} />
          <span className="text-[9px] font-black tracking-[0.22em] uppercase" style={{ color: b.gold }}>
            TOP 100 Women in Aerospace · 2025
          </span>
          <div className="h-px flex-1" style={{ background: `linear-gradient(to left,${b.gold}70,transparent)` }} />
        </div>

        {/* Name */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-[28px] font-bold text-white leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}>
            {nominee.name}
          </h2>
          {(nominee.title || nominee.professional_role) && (
            <p className="text-xs font-semibold mt-0.5 tracking-wide" style={{ color: b.goldLight }}>
              {nominee.title || nominee.professional_role}
              {nominee.company && <span style={{ color: 'rgba(255,255,255,0.4)' }}> · {nominee.company}</span>}
            </p>
          )}
        </motion.div>

        {/* Six-word story */}
        {nominee.six_word_story && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            className="flex items-start gap-2.5 px-4 py-3 rounded-2xl"
            style={{ background: `linear-gradient(135deg,${b.gold}18,${b.rose}12)`, border: `1px solid ${b.gold}35` }}>
            <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: b.gold }} />
            <p className="italic text-sm leading-snug font-medium" style={{ color: b.goldLight }}>
              "{nominee.six_word_story}"
            </p>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <ShareCTA nominee={nominee} onClose={onClose} onShare={onShare} />
        </motion.div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 2 — Story: Bio, context, following
// ═══════════════════════════════════════════════════════════════════════════
function Slide2({ nominee, onClose, onShare }) {
  const bio = nominee.bio || nominee.description;
  const photo = nominee.avatar_url || nominee.photo_url;
  const [bioExpanded, setBioExpanded] = useState(false);
  const BIO_THRESHOLD = 180; // chars before we truncate
  const isLongBio = bio && bio.length > BIO_THRESHOLD;
  const displayBio = isLongBio && !bioExpanded ? bio.slice(0, BIO_THRESHOLD).trimEnd() + '…' : bio;

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: b.cream }}>

      {/* Cinematic header */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(160deg,${b.navyDark} 0%,${b.navy} 55%,${b.navyMid} 100%)`, minHeight: 110 }}>
        <DotPattern opacity={0.06} id="s2dots" />
        {photo && (
          <img src={photo} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover object-top opacity-10"
            style={{ filter: 'blur(8px) saturate(1.4)' }} />
        )}
        <div className="relative z-10 px-7 pt-12 pb-5">
          <p className="text-[10px] font-black tracking-[0.22em] uppercase mb-1" style={{ color: b.gold }}>Her Story</p>
          <h3 className="text-2xl font-bold text-white leading-snug"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {nominee.name}
          </h3>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6"
          style={{ background: `linear-gradient(to top,${b.cream},transparent)` }} />
      </div>

      <div className="px-6 py-5 space-y-4 flex-1">

        {/* Context chips */}
        <div className="flex flex-wrap gap-2">
          {nominee.country && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full"
              style={{ background: `${b.sky}15`, color: b.sky, border: `1px solid ${b.sky}25` }}>
              <Globe className="w-3 h-3" />{nominee.country}
            </span>
          )}
          {nominee.industry && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full"
              style={{ background: `${b.navy}0d`, color: b.navy, border: `1px solid ${b.navy}20` }}>
              <Briefcase className="w-3 h-3" />{nominee.industry}
            </span>
          )}
          {nominee.discipline && (
            <span className="text-[11px] font-bold px-3 py-1.5 rounded-full"
              style={{ background: `${b.gold}18`, color: b.goldDeep, border: `1px solid ${b.gold}30` }}>
              {nominee.discipline.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        <GoldDivider />

        {/* Bio with large decorative quote */}
        {bio && (
          <div className="relative pl-5 border-l-2" style={{ borderColor: `${b.gold}50` }}>
            <Quote className="w-6 h-6 mb-1.5" style={{ color: `${b.gold}50` }} />
            <p className="text-sm leading-relaxed" style={{ color: `${b.navy}cc` }}>{displayBio}</p>
            {isLongBio && (
              <button
                onClick={() => setBioExpanded(v => !v)}
                className="mt-2 text-xs font-bold tracking-wide transition-opacity hover:opacity-70"
                style={{ color: b.goldDeep }}
              >
                {bioExpanded ? 'Show less ↑' : 'Read more ↓'}
              </button>
            )}
          </div>
        )}

        {/* LinkedIn following */}
        {nominee.social_stats?.linkedin_followers > 0 && (
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
            style={{ background: `linear-gradient(135deg,${b.sand},${b.goldLight}50)`, border: `1px solid ${b.gold}25` }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: `linear-gradient(135deg,${b.gold},${b.goldDeep})` }}>
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: b.navy }}>
                {Number(nominee.social_stats.linkedin_followers).toLocaleString()}
                <span className="font-normal text-xs ml-1" style={{ color: `${b.navy}70` }}>LinkedIn followers</span>
              </p>
              <p className="text-[10px]" style={{ color: `${b.navy}55` }}>Aerospace & aviation community</p>
            </div>
          </div>
        )}

        <ShareCTA nominee={nominee} onClose={onClose} onShare={onShare} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 3 — Impact: Why follow, achievements, spotlights
// ═══════════════════════════════════════════════════════════════════════════
function Slide3({ nominee, onClose, onShare }) {
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: b.cream }}>

      {/* Header — warm rose-gold gradient */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(160deg,#8B3A3A,${b.rose}cc,${b.gold}99)`, minHeight: 110 }}>
        <DotPattern opacity={0.07} id="s3dots" />
        <div className="relative z-10 px-7 pt-12 pb-5">
          <p className="text-[10px] font-black tracking-[0.22em] uppercase mb-1 text-white/60">What Sets Her Apart</p>
          <h3 className="text-2xl font-bold text-white leading-snug"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Impact & Influence
          </h3>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6"
          style={{ background: `linear-gradient(to top,${b.cream},transparent)` }} />
      </div>

      <div className="px-6 py-5 space-y-4 flex-1">

        {/* Why follow */}
        {nominee.linkedin_follow_reason && (
          <div className="p-4 rounded-2xl"
            style={{ background: `linear-gradient(135deg,${b.gold}0f,${b.goldLight}28)`, border: `1px solid ${b.gold}30` }}>
            <p className="text-[10px] font-black tracking-[0.18em] uppercase mb-2" style={{ color: b.goldDeep }}>Why Follow Her</p>
            <p className="text-sm leading-relaxed" style={{ color: b.navy }}>{nominee.linkedin_follow_reason}</p>
          </div>
        )}

        {/* Proudest achievement */}
        {nominee.linkedin_proudest_achievement && (
          <div className="p-4 rounded-2xl"
            style={{ background: `linear-gradient(135deg,${b.rose}0f,${b.sand}35)`, border: `1px solid ${b.rose}28` }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${b.rose},#a05040)` }}>
                <Rocket className="w-3 h-3 text-white" />
              </div>
              <p className="text-[10px] font-black tracking-[0.18em] uppercase" style={{ color: '#a05040' }}>Proudest Achievement</p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: b.navy }}>{nominee.linkedin_proudest_achievement}</p>
          </div>
        )}

        {/* Nomination fallback */}
        {!nominee.linkedin_follow_reason && !nominee.linkedin_proudest_achievement && nominee.nomination_reason && (
          <div className="p-4 rounded-2xl"
            style={{ background: `linear-gradient(135deg,${b.gold}0f,${b.goldLight}28)`, border: `1px solid ${b.gold}30` }}>
            <p className="text-[10px] font-black tracking-[0.18em] uppercase mb-2" style={{ color: b.goldDeep }}>Nominated For</p>
            <p className="text-sm leading-relaxed" style={{ color: b.navy }}>{nominee.nomination_reason}</p>
          </div>
        )}

        {/* Spotlight badges */}
        {(nominee.rising_star_count > 0 || nominee.rock_star_count > 0 || nominee.north_star_count > 0) && (
          <div className="flex flex-wrap gap-2">
            {nominee.rising_star_count > 0 && (
              <span className="text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"
                style={{ background: `${b.sky}15`, color: b.sky, border: `1px solid ${b.sky}30` }}>
                <Star className="w-3 h-3" /> Rising Star ×{nominee.rising_star_count}
              </span>
            )}
            {nominee.rock_star_count > 0 && (
              <span className="text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"
                style={{ background: `${b.gold}15`, color: b.goldDeep, border: `1px solid ${b.gold}30` }}>
                <Sparkles className="w-3 h-3" /> Rock Star ×{nominee.rock_star_count}
              </span>
            )}
            {nominee.north_star_count > 0 && (
              <span className="text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"
                style={{ background: `${b.rose}15`, color: '#a05050', border: `1px solid ${b.rose}30` }}>
                <Heart className="w-3 h-3" /> North Star ×{nominee.north_star_count}
              </span>
            )}
          </div>
        )}

        <ShareCTA nominee={nominee} onClose={onClose} onShare={onShare} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 4 — Action: Connect, follow, share
// ═══════════════════════════════════════════════════════════════════════════
function Slide4({ nominee, onClose, onShare, onNextNominee, hasNextNominee, onPrevNominee, hasPrevNominee }) {
  const socials = [
    nominee.linkedin_profile_url && { href: nominee.linkedin_profile_url, icon: Linkedin, label: 'Connect on LinkedIn', bg: 'linear-gradient(135deg,#0077B5,#005f8e)' },
    nominee.instagram_url        && { href: nominee.instagram_url,        icon: Instagram, label: 'Follow on Instagram', bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' },
    nominee.website_url          && { href: nominee.website_url,          icon: ExternalLink, label: 'Visit Website',    bg: `linear-gradient(135deg,${b.navyMid},${b.navy})` },
  ].filter(Boolean);

  return (
    <div className="flex flex-col h-full" style={{ background: b.cream }}>

      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(160deg,${b.navyDark},${b.navy} 70%,${b.navyMid})`, minHeight: 110 }}>
        <DotPattern opacity={0.06} id="s4dots" />
        {/* Rose glow top-right */}
        <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle,${b.rose}35,transparent 70%)` }} />
        {/* Gold glow bottom-left */}
        <div className="absolute -left-6 bottom-0 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle,${b.gold}20,transparent 70%)` }} />
        <div className="relative z-10 px-7 pt-12 pb-5">
          <p className="text-[10px] font-black tracking-[0.22em] uppercase mb-1" style={{ color: b.gold }}>Take Action</p>
          <h3 className="text-2xl font-bold text-white leading-snug"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Support {nominee.name?.split(' ')[0]}
          </h3>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6"
          style={{ background: `linear-gradient(to top,${b.cream},transparent)` }} />
      </div>

      <div className="px-6 py-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">

          {socials.map(({ href, icon: Icon, label, bg }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-5 py-4 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] shadow-sm"
              style={{ background: bg }}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
              <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
            </a>
          ))}

          <ShareCTA nominee={nominee} onClose={onClose} onShare={onShare} />

          {/* Honoree navigation teasers */}
          <div className="flex gap-2">
            {hasPrevNominee && (
              <motion.button
                onClick={onPrevNominee}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl"
                style={{
                  background: `linear-gradient(135deg,${b.navy}0a,${b.sky}12)`,
                  border: `1px dashed ${b.sky}40`,
                }}
              >
                <ChevronLeft className="w-3.5 h-3.5" style={{ color: b.sky }} />
                <span className="text-xs font-black" style={{ color: b.sky }}>Prev</span>
              </motion.button>
            )}
            {hasNextNominee && (
              <motion.button
                onClick={onNextNominee}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex-1 flex items-center justify-between px-5 py-3.5 rounded-2xl"
                style={{
                  background: `linear-gradient(135deg,${b.navy}08,${b.gold}10)`,
                  border: `1px dashed ${b.gold}40`,
                }}
              >
                <span className="text-xs font-bold tracking-wide" style={{ color: `${b.navy}80` }}>
                  Continue
                </span>
                <motion.span
                  className="flex items-center gap-1 text-xs font-black"
                  style={{ color: b.goldDeep }}
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </motion.span>
              </motion.button>
            )}
          </div>
        </div>

        <p className="text-center text-[9px] font-semibold tracking-[0.15em] uppercase mt-5"
          style={{ color: `${b.navy}40` }}>
          TOP 100 Women in Aerospace &amp; Aviation · 2025 Edition
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Root
// ═══════════════════════════════════════════════════════════════════════════
const SLIDES = [Slide1, Slide2, Slide3, Slide4];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? '55%' : '-55%', opacity: 0, scale: 0.97 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit:  (dir) => ({ x: dir > 0 ? '-55%' : '55%', opacity: 0, scale: 0.97 }),
};

export default function EnhancedProfilePanel({ nominee, rank, onClose, onShare, onNextNominee, hasNextNominee, onPrevNominee, hasPrevNominee }) {
  const [slide, setSlide] = useState(0);
  const [dir, setDir] = useState(1);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUserEmail(u?.email ?? null)).catch(() => {});
  }, []);

  useEffect(() => {
    setSlide(0);
    setDir(1);
  }, [nominee?.id]);

  const goTo = useCallback((i) => {
    setDir(i > slide ? 1 : -1);
    setSlide(i);
  }, [slide]);

  const next = useCallback(() => { if (slide < SLIDES.length - 1) goTo(slide + 1); }, [slide, goTo]);
  const prev = useCallback(() => { if (slide > 0) goTo(slide - 1); }, [slide, goTo]);

  if (!nominee) return null;

  const SlideComponent = SLIDES[slide];
  const isFirst = slide === 0;
  const isLast  = slide === SLIDES.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" />

        {/* Card */}
        <motion.div
          initial={{ scale: 0.94, y: 32, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.94, y: 32, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
          style={{ height: 'min(92vh, 700px)', background: b.cream }}
        >
          {/* Persistent chrome */}
          <ModalChrome rank={rank} onClose={onClose} />

          {/* Slide viewport */}
          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence custom={dir} mode="wait">
              <motion.div
                key={slide}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', damping: 32, stiffness: 340 }}
                className="absolute inset-0"
              >
                <SlideComponent nominee={nominee} rank={rank} onClose={onClose} onShare={onShare} onNext={next} onNextNominee={onNextNominee} hasNextNominee={hasNextNominee} onPrevNominee={onPrevNominee} hasPrevNominee={hasPrevNominee} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom nav */}
          <div className="flex flex-col px-3 pb-3 pt-1"
            style={{ background: b.cream, borderTop: `1px solid ${b.navy}08` }}>
            {/* Flower reaction */}
            <div className="flex justify-center pb-1">
              <FlowerButton nominee={nominee} currentUserEmail={currentUserEmail} />
            </div>
            {/* Slide controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={prev}
                disabled={isFirst}
                aria-label="Previous slide"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-20 hover:scale-110 active:scale-95"
                style={{ background: isFirst ? 'transparent' : `${b.navy}0d`, color: b.navy }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <SlideProgress total={SLIDES.length} current={slide} onGo={goTo} />

              {isLast && hasNextNominee ? (
                <motion.button
                  onClick={onNextNominee}
                  aria-label="Next honoree"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex items-center gap-1 px-3 py-2 rounded-full text-[11px] font-black tracking-wide"
                  style={{
                    background: `linear-gradient(135deg,${b.gold},${b.rose})`,
                    color: 'white',
                    boxShadow: `0 4px 12px ${b.gold}40`,
                  }}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </motion.button>
              ) : isFirst && hasPrevNominee ? (
                <motion.button
                  onClick={onPrevNominee}
                  aria-label="Previous honoree"
                  animate={{ x: [0, -4, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex items-center gap-1 px-3 py-2 rounded-full text-[11px] font-black tracking-wide"
                  style={{
                    background: `linear-gradient(135deg,${b.navyMid},${b.sky})`,
                    color: 'white',
                    boxShadow: `0 4px 12px ${b.sky}40`,
                  }}
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </motion.button>
              ) : (
                <button
                  onClick={next}
                  disabled={isLast}
                  aria-label="Next slide"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-20 hover:scale-110 active:scale-95"
                  style={{
                    background: isLast ? 'transparent' : `linear-gradient(135deg,${b.gold},${b.rose})`,
                    color: 'white',
                    boxShadow: isLast ? 'none' : `0 4px 12px ${b.gold}40`
                  }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}