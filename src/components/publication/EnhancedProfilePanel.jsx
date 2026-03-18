import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Crown, Medal, Star, Award, Globe, Building2, Briefcase,
  Linkedin, Instagram, ExternalLink, Share2, Sparkles, MessageSquareQuote, Users
} from 'lucide-react';

const brand = {
  navy: '#1e3a5a',
  sky: '#4a90b8',
  gold: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

const WREATH_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/90f4fd33a_Gemini_Generated_Image_s3pahzs3pahzs3pa.png';

function getRankInfo(rank) {
  if (rank === 1) return { icon: Crown, label: '#1 — Gold', bg: 'linear-gradient(135deg, #FFD700, #FFA500)', textDark: true };
  if (rank === 2) return { icon: Medal, label: '#2 — Silver', bg: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)', textDark: true };
  if (rank === 3) return { icon: Medal, label: '#3 — Bronze', bg: 'linear-gradient(135deg, #CD7F32, #B87333)', textDark: false };
  if (rank <= 10) return { icon: Star, label: `#${rank} — Top 10`, bg: `linear-gradient(135deg, ${brand.navy}, ${brand.sky})`, textDark: false };
  return { icon: Award, label: `#${rank}`, bg: `linear-gradient(135deg, ${brand.navy}, ${brand.sky})`, textDark: false };
}

function HeroSection({ nominee, rank, onClose }) {
  const rankInfo = getRankInfo(rank);
  const RankIcon = rankInfo.icon;
  const photo = nominee.avatar_url || nominee.photo_url;

  return (
    <div className="relative h-56 md:h-72 overflow-hidden rounded-t-3xl">
      {/* Full-bleed photo or gradient fallback */}
      {photo ? (
        <img
          src={photo}
          alt={nominee.name}
          className="absolute inset-0 w-full h-full object-cover object-top scale-105"
        />
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${brand.navy}, ${brand.sky})` }} />
      )}

      {/* Gradient overlay — stronger at bottom for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      {/* Dot pattern accent */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="none">
          <defs>
            <pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#dots)" />
        </svg>
      </div>

      {/* Rank badge — top left */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
        className="absolute top-4 left-4 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-lg"
        style={{ background: rankInfo.bg, color: rankInfo.textDark ? brand.navy : 'white' }}
      >
        <RankIcon className="w-3.5 h-3.5" />
        {rankInfo.label}
      </motion.div>

      {/* Close button — top right */}
      <button
        onClick={onClose}
        aria-label="Close profile"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Name + title overlay at bottom of hero */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-lg"
        >
          {nominee.name}
        </motion.h2>
        {(nominee.title || nominee.professional_role) && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-sm mt-0.5 font-medium drop-shadow"
            style={{ color: brand.goldLight }}
          >
            {nominee.title || nominee.professional_role}
            {nominee.company && <span className="text-white/60"> · {nominee.company}</span>}
          </motion.p>
        )}
      </div>
    </div>
  );
}

function StatsStrip({ nominee }) {
  const stats = [
    nominee.country && { icon: Globe, label: nominee.country },
    nominee.industry && { icon: Briefcase, label: nominee.industry },
    nominee.social_stats?.linkedin_followers && {
      icon: Users,
      label: `${(nominee.social_stats.linkedin_followers / 1000).toFixed(0)}k LinkedIn`,
    },
  ].filter(Boolean);

  if (!stats.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b" style={{ borderColor: `${brand.navy}10`, background: `${brand.sky}08` }}>
      {stats.map(({ icon: Icon, label }, i) => (
        <span key={i} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: `${brand.navy}10`, color: brand.navy }}>
          <Icon className="w-3 h-3" style={{ color: brand.sky }} />
          {label}
        </span>
      ))}
      <span className="ml-auto text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full"
        style={{ background: `${brand.gold}20`, color: brand.gold }}>
        <Award className="w-3 h-3 inline mr-1" />
        TOP 100 Women 2025
      </span>
    </div>
  );
}

function WhyFollowCard({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="mx-6 mt-5 p-4 rounded-2xl border"
      style={{ background: `linear-gradient(135deg, ${brand.gold}12, ${brand.goldLight}20)`, borderColor: `${brand.gold}30` }}
    >
      <div className="flex items-start gap-3">
        <MessageSquareQuote className="w-4 h-4 mt-0.5 shrink-0" style={{ color: brand.gold }} />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: brand.gold }}>Why Follow</p>
          <p className="text-sm leading-relaxed" style={{ color: brand.navy }}>{text}</p>
        </div>
      </div>
    </motion.div>
  );
}

function SocialLinks({ nominee }) {
  const links = [
    nominee.linkedin_profile_url && { href: nominee.linkedin_profile_url, icon: Linkedin, bg: '#0077B5', label: 'LinkedIn' },
    nominee.instagram_url && { href: nominee.instagram_url, icon: Instagram, bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', label: 'Instagram' },
    nominee.website_url && { href: nominee.website_url, icon: ExternalLink, bg: brand.navy, label: 'Website' },
  ].filter(Boolean);

  if (!links.length) return null;

  return (
    <div className="flex items-center gap-2.5 px-6 mt-5">
      {links.map(({ href, icon: Icon, bg, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 hover:shadow-lg"
          style={{ background: bg }}
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}
    </div>
  );
}

export default function EnhancedProfilePanel({ nominee, rank, onClose, onShare }) {
  if (!nominee) return null;

  const whyFollow = nominee.linkedin_follow_reason || nominee.six_word_story;
  const bio = nominee.bio || nominee.description;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

        <motion.div
          initial={{ scale: 0.92, y: 24, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 24, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-lg w-full max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col"
          style={{ background: brand.cream }}
        >
          <HeroSection nominee={nominee} rank={rank} onClose={onClose} />

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1">
            <StatsStrip nominee={nominee} />

            <SocialLinks nominee={nominee} />

            {whyFollow && (
              nominee.linkedin_follow_reason
                ? <WhyFollowCard text={nominee.linkedin_follow_reason} />
                : (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="mx-6 mt-5 p-4 rounded-2xl text-center"
                    style={{ background: `linear-gradient(135deg, ${brand.gold}10, ${brand.goldLight}20)` }}
                  >
                    <Sparkles className="w-4 h-4 mx-auto mb-1.5" style={{ color: brand.gold }} />
                    <p className="italic text-base font-medium" style={{ color: brand.navy }}>"{nominee.six_word_story}"</p>
                  </motion.div>
                )
            )}

            {bio && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="px-6 mt-5 pb-2"
              >
                <p className="text-sm leading-relaxed" style={{ color: `${brand.navy}cc` }}>{bio}</p>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="px-6 py-6 mt-2 border-t flex justify-center"
              style={{ borderColor: `${brand.navy}10` }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); if (onShare) { onClose(); onShare(nominee); } }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105 hover:shadow-xl"
                style={{ background: brand.navy, color: 'white' }}
              >
                <Share2 className="w-4 h-4" />
                Share This Achievement
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}