import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { getStandingsData } from '@/functions/getStandingsData';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const b = {
  navyDark:  '#0a1628',
  navy:      '#0f1f35',
  navyMid:   '#1e3a5a',
  navyLight: '#2a4f7c',
  sky:       '#4a90b8',
  gold:      '#c9a87c',
  goldLight: '#e8d4b8',
  goldDeep:  '#a07840',
  rose:      '#d4a090',
  cream:     '#faf8f5',
  sand:      '#f0e6d6',
};

// ─── Starfield background ──────────────────────────────────────────────────────
function StarfieldCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.3 + 0.05,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.alpha += s.speed * 0.02;
        const a = (Math.sin(s.alpha) + 1) / 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 212, 184, ${a * 0.7 + 0.1})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden
    />
  );
}

// ─── Individual credit card ────────────────────────────────────────────────────
function CreditCard({ nominee, index }) {
  const isSpecial = nominee.finalRank <= 3;
  const photo = nominee.avatar_url || nominee.photo_url;

  return (
    <div className="flex flex-col items-center py-14 md:py-20 px-6 relative">
      {/* Top rule */}
      <div
        className="w-px mb-10 md:mb-14"
        style={{
          height: 48,
          background: `linear-gradient(to bottom, transparent, ${b.gold}60)`,
        }}
      />

      {/* Rank badge */}
      <div
        className="mb-5 px-4 py-1 rounded-full text-[10px] font-black tracking-[0.25em] uppercase"
        style={{
          background: isSpecial
            ? `linear-gradient(135deg, ${b.goldDeep}, ${b.gold}, ${b.goldLight})`
            : `${b.navyLight}55`,
          color: isSpecial ? b.navy : `${b.goldLight}99`,
          border: isSpecial ? 'none' : `1px solid ${b.gold}25`,
          boxShadow: isSpecial ? `0 0 24px ${b.gold}40` : 'none',
        }}
      >
        {isSpecial ? `✦ #${nominee.finalRank} ✦` : `No. ${String(nominee.finalRank).padStart(3, '0')}`}
      </div>

      {/* Avatar */}
      {photo && (
        <div
          className="mb-6 rounded-full overflow-hidden flex-shrink-0"
          style={{
            width: isSpecial ? 96 : 72,
            height: isSpecial ? 96 : 72,
            boxShadow: isSpecial
              ? `0 0 0 2px ${b.gold}, 0 0 40px ${b.gold}40`
              : `0 0 0 1px ${b.gold}40`,
          }}
        >
          <img
            src={photo}
            alt={nominee.name}
            className="w-full h-full object-cover object-top"
          />
        </div>
      )}

      {/* Name */}
      <h2
        className="text-center font-light tracking-wide mb-2"
        style={{
          fontFamily: "'Georgia', 'Playfair Display', serif",
          fontSize: isSpecial ? 'clamp(1.6rem, 4vw, 2.8rem)' : 'clamp(1.1rem, 3vw, 1.8rem)',
          color: isSpecial ? b.goldLight : b.cream,
          textShadow: isSpecial ? `0 0 40px ${b.gold}60` : 'none',
        }}
      >
        {nominee.name}
      </h2>

      {/* Title / Company */}
      {(nominee.title || nominee.professional_role) && (
        <p
          className="text-center text-sm font-medium mb-1 tracking-wide"
          style={{ color: b.gold, opacity: 0.85 }}
        >
          {nominee.title || nominee.professional_role}
          {nominee.company && (
            <span style={{ color: `${b.goldLight}55`, fontWeight: 400 }}>
              {' · '}{nominee.company}
            </span>
          )}
        </p>
      )}

      {/* Country */}
      {nominee.country && (
        <p
          className="text-xs tracking-[0.18em] uppercase"
          style={{ color: `${b.sky}90` }}
        >
          {nominee.country}
        </p>
      )}

      {/* Six-word story for top 10 */}
      {nominee.finalRank <= 10 && nominee.six_word_story && (
        <p
          className="mt-4 text-sm italic text-center max-w-xs leading-relaxed"
          style={{ color: `${b.goldLight}70`, fontFamily: 'Georgia, serif' }}
        >
          "{nominee.six_word_story}"
        </p>
      )}

      {/* Bottom rule */}
      <div
        className="w-px mt-10 md:mt-14"
        style={{
          height: 48,
          background: `linear-gradient(to bottom, ${b.gold}40, transparent)`,
        }}
      />
    </div>
  );
}

// ─── Opening title card ────────────────────────────────────────────────────────
function OpeningCard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-24 px-6 relative z-10">
      {/* Radial gold glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${b.gold}18 0%, transparent 70%)`,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="text-center relative z-10"
      >
        {/* Overline */}
        <p
          className="text-[10px] tracking-[0.45em] uppercase mb-8 font-medium"
          style={{ color: b.gold }}
        >
          The Orbital Edition · 2025
        </p>

        {/* Gold rule */}
        <div
          className="mx-auto mb-8"
          style={{
            width: 80,
            height: 1,
            background: `linear-gradient(to right, transparent, ${b.gold}, transparent)`,
          }}
        />

        {/* Main title */}
        <h1
          className="font-light leading-tight mb-4"
          style={{
            fontFamily: "'Georgia', 'Playfair Display', serif",
            fontSize: 'clamp(2.4rem, 8vw, 5.5rem)',
            color: b.cream,
            letterSpacing: '-0.01em',
          }}
        >
          TOP 100
        </h1>
        <h2
          className="font-light mb-8"
          style={{
            fontFamily: "'Georgia', 'Playfair Display', serif",
            fontSize: 'clamp(1rem, 3vw, 1.8rem)',
            color: b.goldLight,
            letterSpacing: '0.18em',
          }}
        >
          Women in Aerospace &amp; Aviation
        </h2>

        {/* Gold rule */}
        <div
          className="mx-auto mb-10"
          style={{
            width: 80,
            height: 1,
            background: `linear-gradient(to right, transparent, ${b.gold}, transparent)`,
          }}
        />

        <p
          className="text-xs tracking-[0.3em] uppercase"
          style={{ color: `${b.sky}90` }}
        >
          Scroll to reveal the honorees
        </p>

        {/* Scroll indicator */}
        <motion.div
          className="mt-12 flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className="w-px h-16"
            style={{
              background: `linear-gradient(to bottom, ${b.gold}80, transparent)`,
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Closing card ──────────────────────────────────────────────────────────────
function ClosingCard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-24 px-6 relative z-10">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${b.rose}15 0%, transparent 70%)`,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="text-center relative z-10 max-w-xl"
      >
        <div
          className="mx-auto mb-8"
          style={{
            width: 80,
            height: 1,
            background: `linear-gradient(to right, transparent, ${b.gold}, transparent)`,
          }}
        />

        <p
          className="text-[10px] tracking-[0.45em] uppercase mb-6 font-medium"
          style={{ color: b.gold }}
        >
          Fin
        </p>

        <h2
          className="font-light mb-6"
          style={{
            fontFamily: "'Georgia', serif",
            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
            color: b.cream,
          }}
        >
          To the Women Who<br />Reached for the Stars.
        </h2>

        <p
          className="text-sm leading-relaxed mb-12"
          style={{ color: `${b.goldLight}70` }}
        >
          These 100 leaders represent a generation of vision, courage, and excellence
          at the frontier of aerospace and aviation. Their orbits inspire millions.
        </p>

        <div
          className="mx-auto mb-12"
          style={{
            width: 80,
            height: 1,
            background: `linear-gradient(to right, transparent, ${b.gold}60, transparent)`,
          }}
        />

        <p
          className="text-[10px] tracking-[0.3em] uppercase mb-2"
          style={{ color: `${b.goldLight}50` }}
        >
          TOP 100 Aerospace &amp; Aviation · The Orbital Edition · 2025
        </p>

        <Link
          to={createPageUrl('Top100Women2025')}
          className="inline-flex items-center gap-2 mt-10 px-7 py-3 rounded-full text-sm font-semibold tracking-wider uppercase transition-all hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${b.goldDeep}, ${b.gold})`,
            color: b.navy,
            boxShadow: `0 0 28px ${b.gold}35`,
          }}
        >
          View Full Publication
        </Link>
      </motion.div>
    </div>
  );
}

// ─── Controls overlay ──────────────────────────────────────────────────────────
function Controls({ isPlaying, onToggle, onRestart, progress }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3"
    >
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-full backdrop-blur-xl"
        style={{
          background: `${b.navyDark}cc`,
          border: `1px solid ${b.gold}30`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Back to publication */}
        <Link
          to={createPageUrl('Top100Women2025')}
          className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110"
          style={{ color: `${b.goldLight}70` }}
          aria-label="Back"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>

        <div
          className="w-px h-5"
          style={{ background: `${b.gold}30` }}
        />

        {/* Restart */}
        <button
          onClick={onRestart}
          className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110"
          style={{ color: `${b.goldLight}70` }}
          aria-label="Restart"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${b.goldDeep}, ${b.gold})`,
            color: b.navy,
          }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          <div
            className="w-24 h-1 rounded-full overflow-hidden"
            style={{ background: `${b.navyLight}80` }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress * 100}%`,
                background: `linear-gradient(to right, ${b.gold}, ${b.rose})`,
              }}
            />
          </div>
        </div>

        <div
          className="w-px h-5"
          style={{ background: `${b.gold}30` }}
        />

        {/* Scroll hint */}
        <span
          className="text-[10px] tracking-wider uppercase hidden sm:block"
          style={{ color: `${b.goldLight}50` }}
        >
          Scroll freely
        </span>
      </div>
    </motion.div>
  );
}

// ─── Data loader ───────────────────────────────────────────────────────────────
async function loadNominees() {
  let allSeasons = [];
  try {
    allSeasons = await base44.entities.Season.list('-created_date', 50);
  } catch { allSeasons = []; }

  const season3 = allSeasons.find(s => s.name?.includes('Season 3'));
  const activeSeason = allSeasons.find(s =>
    ['completed', 'voting_open', 'active'].includes(s.status)
  );
  const selectedSeasonId = season3?.id || activeSeason?.id || allSeasons[0]?.id;

  if (!selectedSeasonId) return [];

  // Fetch standings + full nominee data in parallel
  const [standingsResp, allNominees] = await Promise.all([
    getStandingsData({ season: selectedSeasonId, sort: 'aura', dir: 'desc', page: 1, limit: 200 })
      .catch(() => null),
    base44.entities.Nominee.filter({ season_id: selectedSeasonId, status: 'active' }, '-aura_score', 200)
      .catch(() => []),
  ]);

  const standingsRows = standingsResp?.data?.standings?.rows || [];

  // Build a rank map from standings
  const rankMap = new Map();
  standingsRows.forEach((n, idx) => {
    rankMap.set(n.nomineeId, { finalRank: idx + 1, aura_score: n.aura, name: n.nomineeName, avatar_url: n.avatarUrl, title: n.title, company: n.company, country: n.country });
  });

  // Merge full nominee data with rank
  const fullNomineeMap = new Map(allNominees.map(n => [n.id, n]));

  // Build merged list — prefer full nominee data, fill gaps from standings
  const merged = [];
  rankMap.forEach((rankData, id) => {
    const full = fullNomineeMap.get(id) || {};
    merged.push({
      ...rankData,
      ...full,
      id,
      finalRank: rankData.finalRank,
      aura_score: rankData.aura_score,
      avatar_url: full.avatar_url || full.photo_url || rankData.avatar_url,
    });
  });

  // If no standings data, fall back to full nominees sorted by aura_score
  if (merged.length === 0) {
    allNominees
      .sort((a, b) => (b.aura_score || 0) - (a.aura_score || 0))
      .slice(0, 100)
      .forEach((n, i) => merged.push({ ...n, finalRank: i + 1 }));
  }

  return merged.slice(0, 100);
}

// ─── Auto-scroll hook ──────────────────────────────────────────────────────────
function useAutoScroll(isPlaying, speed = 0.8) {
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const scroll = () => {
      window.scrollBy(0, speed);
      rafRef.current = requestAnimationFrame(scroll);
    };
    rafRef.current = requestAnimationFrame(scroll);

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isPlaying, speed]);
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function RollingCredits() {
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useAutoScroll(isPlaying);

  // Track scroll progress
  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      if (max > 0) setProgress(window.scrollY / max);
      // Pause auto-scroll at the end
      if (window.scrollY >= max - 10) setIsPlaying(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleRestart = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsPlaying(false);
  }, []);

  // Start playing once user scrolls past the opening card
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 80 && !isPlaying) {
        // don't auto-start — let the user click play
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isPlaying]);

  useEffect(() => {
    loadNominees()
      .then(setNominees)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: b.navyDark }}
      >
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <div
            className="w-px h-16 mx-auto mb-6"
            style={{ background: `linear-gradient(to bottom, transparent, ${b.gold}, transparent)` }}
          />
          <p
            className="text-[10px] tracking-[0.5em] uppercase"
            style={{ color: b.gold }}
          >
            Loading
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen"
      style={{ background: `linear-gradient(to bottom, ${b.navyDark} 0%, ${b.navy} 30%, ${b.navyDark} 100%)` }}
    >
      {/* Persistent starfield */}
      <StarfieldCanvas />

      {/* Ambient side gradients */}
      <div
        className="fixed inset-y-0 left-0 w-32 pointer-events-none z-10"
        style={{ background: `linear-gradient(to right, ${b.navyDark}cc, transparent)` }}
      />
      <div
        className="fixed inset-y-0 right-0 w-32 pointer-events-none z-10"
        style={{ background: `linear-gradient(to left, ${b.navyDark}cc, transparent)` }}
      />

      {/* Top fade */}
      <div
        className="fixed top-0 left-0 right-0 h-40 pointer-events-none z-20"
        style={{ background: `linear-gradient(to bottom, ${b.navyDark}, transparent)` }}
      />

      {/* Bottom fade */}
      <div
        className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-20"
        style={{ background: `linear-gradient(to top, ${b.navyDark}, transparent)` }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Opening title */}
        <OpeningCard />

        {/* Divider */}
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-4">
            <div className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${b.gold}50)` }} />
            <div className="w-1 h-1 rounded-full" style={{ background: b.gold }} />
            <div className="h-px w-20" style={{ background: `linear-gradient(to left, transparent, ${b.gold}50)` }} />
          </div>
        </div>

        {/* All honoree credit cards */}
        {nominees.map((nominee, idx) => (
          <CreditCard key={nominee.id} nominee={nominee} index={idx} />
        ))}

        {/* Closing */}
        <ClosingCard />

        {/* Bottom spacer */}
        <div className="h-40" />
      </div>

      {/* Controls */}
      <Controls
        isPlaying={isPlaying}
        onToggle={() => setIsPlaying(p => !p)}
        onRestart={handleRestart}
        progress={progress}
      />
    </div>
  );
}