import { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { getStandingsData } from '@/functions/getStandingsData';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// ─── Starfield background ──────────────────────────────────────────────────────
function StarfieldCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let stars = [];

    const seedStars = () => {
      stars = Array.from({ length: 220 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.2,
        alpha: Math.random(),
        speed: Math.random() * 0.3 + 0.05,
      }));
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      seedStars(); // re-seed so stars fill the new viewport
    };

    resize();
    window.addEventListener('resize', resize);

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
function CreditCard({ nominee }) {
  const isSpecial = nominee.finalRank <= 3;
  const photo = nominee.avatar_url || nominee.photo_url;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ margin: '-10% 0px -10% 0px', once: true }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="flex flex-col items-center py-14 md:py-20 px-6 relative"
    >
      {/* Top rule */}
      <div className="w-px h-12 mb-10 md:mb-14 bg-gradient-to-b from-transparent to-[#c9a87c60]" />

      {/* Rank badge */}
      <div className={[
        'mb-5 px-4 py-1 rounded-full text-[10px] font-black tracking-[0.25em] uppercase',
        isSpecial
          ? 'bg-gradient-to-br from-[#a07840] via-[#c9a87c] to-[#e8d4b8] text-[#0f1f35] shadow-[0_0_24px_#c9a87c40]'
          : 'bg-[#2a4f7c55] text-[#e8d4b899] border border-[#c9a87c25]',
      ].join(' ')}>
        {isSpecial ? `✦ #${nominee.finalRank} ✦` : `No. ${String(nominee.finalRank).padStart(3, '0')}`}
      </div>

      {/* Avatar */}
      {photo && (
        <div className={[
          'mb-6 rounded-full overflow-hidden flex-shrink-0',
          isSpecial
            ? 'w-24 h-24 ring-2 ring-[#c9a87c] shadow-[0_0_40px_#c9a87c40]'
            : 'w-18 h-18 ring-1 ring-[#c9a87c40]',
        ].join(' ')}>
          <img
            src={photo}
            alt={nominee.name}
            loading="lazy"
            className="w-full h-full object-cover object-top"
          />
        </div>
      )}

      {/* Name */}
      <h2
        className={[
          'text-center font-light tracking-wide mb-2',
          isSpecial ? 'text-[#e8d4b8] drop-shadow-[0_0_40px_#c9a87c60]' : 'text-[#faf8f5]',
        ].join(' ')}
        style={{
          fontFamily: "'Georgia', 'Playfair Display', serif",
          fontSize: isSpecial ? 'clamp(1.6rem, 4vw, 2.8rem)' : 'clamp(1.1rem, 3vw, 1.8rem)',
        }}
      >
        {nominee.name}
      </h2>

      {/* Title / Company */}
      {(nominee.title || nominee.professional_role) && (
        <p className="text-center text-sm font-medium mb-1 tracking-wide text-[#c9a87cda]">
          {nominee.title || nominee.professional_role}
          {nominee.company && (
            <span className="text-[#e8d4b840] font-normal"> · {nominee.company}</span>
          )}
        </p>
      )}

      {/* Country */}
      {nominee.country && (
        <p className="text-xs tracking-[0.18em] uppercase text-[#4a90b890]">
          {nominee.country}
        </p>
      )}

      {/* Six-word story for top 10 */}
      {nominee.finalRank <= 10 && nominee.six_word_story && (
        <p
          className="mt-4 text-sm italic text-center max-w-xs leading-relaxed text-[#e8d4b870]"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          "{nominee.six_word_story}"
        </p>
      )}

      {/* Bottom rule */}
      <div className="w-px h-12 mt-10 md:mt-14 bg-gradient-to-b from-[#c9a87c40] to-transparent" />
    </motion.div>
  );
}

// ─── Opening title card ────────────────────────────────────────────────────────
function OpeningCard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-24 px-6 relative z-10">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,#c9a87c18_0%,transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="text-center relative z-10"
      >
        <p className="text-[10px] tracking-[0.45em] uppercase mb-8 font-medium text-[#c9a87c]">
          The Orbital Edition · 2025
        </p>

        <div className="mx-auto mb-8 w-20 h-px bg-gradient-to-r from-transparent via-[#c9a87c] to-transparent" />

        <h1
          className="font-light leading-tight mb-4 text-[#faf8f5]"
          style={{
            fontFamily: "'Georgia', 'Playfair Display', serif",
            fontSize: 'clamp(2.4rem, 8vw, 5.5rem)',
            letterSpacing: '-0.01em',
          }}
        >
          TOP 100
        </h1>
        <h2
          className="font-light mb-8 text-[#e8d4b8]"
          style={{
            fontFamily: "'Georgia', 'Playfair Display', serif",
            fontSize: 'clamp(1rem, 3vw, 1.8rem)',
            letterSpacing: '0.18em',
          }}
        >
          Women in Aerospace &amp; Aviation
        </h2>

        <div className="mx-auto mb-10 w-20 h-px bg-gradient-to-r from-transparent via-[#c9a87c] to-transparent" />

        <p className="text-xs tracking-[0.3em] uppercase text-[#4a90b890]">
          Scroll to reveal the honorees
        </p>

        <motion.div
          className="mt-12 flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-px h-16 bg-gradient-to-b from-[#c9a87c80] to-transparent" />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Closing card ──────────────────────────────────────────────────────────────
function ClosingCard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-24 px-6 relative z-10">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,#d4a09015_0%,transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="text-center relative z-10 max-w-xl"
      >
        <div className="mx-auto mb-8 w-20 h-px bg-gradient-to-r from-transparent via-[#c9a87c] to-transparent" />

        <p className="text-[10px] tracking-[0.45em] uppercase mb-6 font-medium text-[#c9a87c]">
          Fin
        </p>

        <h2
          className="font-light mb-6 text-[#faf8f5]"
          style={{
            fontFamily: "'Georgia', serif",
            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
          }}
        >
          To the Women Who<br />Reached for the Stars.
        </h2>

        <p className="text-sm leading-relaxed mb-12 text-[#e8d4b870]">
          These 100 leaders represent a generation of vision, courage, and excellence
          at the frontier of aerospace and aviation. Their orbits inspire millions.
        </p>

        <div className="mx-auto mb-12 w-20 h-px bg-gradient-to-r from-transparent via-[#c9a87c60] to-transparent" />

        <p className="text-[10px] tracking-[0.3em] uppercase mb-2 text-[#e8d4b850]">
          TOP 100 Aerospace &amp; Aviation · The Orbital Edition · 2025
        </p>

        <Link
          to="/Top100Women2025"
          className="inline-flex items-center gap-2 mt-10 px-7 py-3 rounded-full text-sm font-semibold tracking-wider uppercase transition-all hover:scale-105 bg-gradient-to-br from-[#a07840] to-[#c9a87c] text-[#0f1f35] shadow-[0_0_28px_#c9a87c35]"
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
      <div className="flex items-center gap-3 px-5 py-3 rounded-full backdrop-blur-xl bg-[#0a1628cc] border border-[#c9a87c30] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">

        <Link
          to="/Top100Women2025"
          className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110 text-[#e8d4b870]"
          aria-label="Back to publication"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>

        <div className="w-px h-5 bg-[#c9a87c30]" />

        <button
          onClick={onRestart}
          className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110 text-[#e8d4b870]"
          aria-label="Restart"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onToggle}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-110 bg-gradient-to-br from-[#a07840] to-[#c9a87c] text-[#0f1f35]"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-24 h-1 rounded-full overflow-hidden bg-[#2a4f7c80]">
            <div
              className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-[#c9a87c] to-[#d4a090]"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        <div className="w-px h-5 bg-[#c9a87c30]" />

        <span className="text-[10px] tracking-wider uppercase hidden sm:block text-[#e8d4b850]">
          Scroll freely
        </span>
      </div>
    </motion.div>
  );
}

// ─── Data loader ───────────────────────────────────────────────────────────────
// Uses getStandingsData (which already computes aura rankings server-side).
// Avoids fetching 10k RankedVote records client-side.
async function loadNominees(signal) {
  let allSeasons = [];
  try {
    allSeasons = await base44.entities.Season.list('-created_date', 50);
  } catch { allSeasons = []; }

  if (signal?.aborted) return [];

  const season3 = allSeasons.find(s => s.name?.includes('Season 3'));
  const activeSeason = allSeasons.find(s =>
    ['completed', 'voting_open', 'active'].includes(s.status)
  );
  const selectedSeasonId = season3?.id || activeSeason?.id || allSeasons[0]?.id;
  if (!selectedSeasonId) return [];

  let standingsRows = [];
  try {
    const response = await getStandingsData({
      season: selectedSeasonId,
      sort: 'aura',
      dir: 'desc',
      page: 1,
      limit: 1000,
    });
    standingsRows = response?.data?.standings?.rows || [];
  } catch { /* silent */ }

  if (signal?.aborted) return [];

  // Take top 100 from standings (already sorted by aura desc server-side)
  const top100Rows = standingsRows.slice(0, 100).map((n, i) => ({
    id: n.nomineeId,
    name: n.nomineeName,
    avatar_url: n.avatarUrl || n.photo_url,
    title: n.title,
    company: n.company,
    country: n.country,
    aura_score: n.aura,
    finalRank: i + 1,
  }));

  if (!top100Rows.length) return [];

  // Hydrate with full nominee records (six_word_story, professional_role, etc.)
  let fullNominees = [];
  try {
    const top100Ids = new Set(top100Rows.map(r => r.id));
    fullNominees = (await base44.entities.Nominee.list('-created_date', 1000))
      .filter(n => top100Ids.has(n.id));
  } catch { /* silent */ }

  if (signal?.aborted) return [];

  const fullMap = new Map(fullNominees.map(n => [n.id, n]));

  return top100Rows.map(r => ({
    ...r,
    ...(fullMap.get(r.id) || {}),
    finalRank: r.finalRank,
    avatar_url: fullMap.get(r.id)?.avatar_url || fullMap.get(r.id)?.photo_url || r.avatar_url,
  }));
}

// ─── Auto-scroll hook ──────────────────────────────────────────────────────────
function useAutoScroll(isPlaying, setIsPlaying, speed = 0.8) {
  const rafRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // Pause on user-initiated scroll
  useEffect(() => {
    const onUserScroll = () => {
      if (!isPlayingRef.current) return;
      setIsPlaying(false);
    };
    window.addEventListener('wheel', onUserScroll, { passive: true });
    window.addEventListener('touchmove', onUserScroll, { passive: true });
    return () => {
      window.removeEventListener('wheel', onUserScroll);
      window.removeEventListener('touchmove', onUserScroll);
    };
  }, [setIsPlaying]);

  // RAF scroll loop
  useEffect(() => {
    const cancel = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    if (!isPlaying) { cancel(); return; }

    const scroll = () => {
      if (!isPlayingRef.current) { cancel(); return; }
      const max = document.body.scrollHeight - window.innerHeight;
      if (window.scrollY >= max - 4) {
        setIsPlaying(false);
        cancel();
        return;
      }
      window.scrollBy(0, speed);
      rafRef.current = requestAnimationFrame(scroll);
    };

    rafRef.current = requestAnimationFrame(scroll);
    return cancel;
  }, [isPlaying, speed, setIsPlaying]);
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function RollingCredits() {
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useAutoScroll(isPlaying, setIsPlaying);

  // Throttled scroll progress — gate updates via RAF to avoid 60 re-renders/sec
  useEffect(() => {
    let rafPending = false;
    const onScroll = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        const max = document.body.scrollHeight - window.innerHeight;
        if (max > 0) setProgress(window.scrollY / max);
        rafPending = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleRestart = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadNominees(controller.signal)
      .then(data => { if (!controller.signal.aborted) setNominees(data); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1628]">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <div className="w-px h-16 mx-auto mb-6 bg-gradient-to-b from-transparent via-[#c9a87c] to-transparent" />
          <p className="text-[10px] tracking-[0.5em] uppercase text-[#c9a87c]">
            Loading
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1f35] to-[#0a1628]">
      <StarfieldCanvas />

      {/* Ambient side gradients */}
      <div className="fixed inset-y-0 left-0 w-32 pointer-events-none z-10 bg-gradient-to-r from-[#0a1628cc] to-transparent" />
      <div className="fixed inset-y-0 right-0 w-32 pointer-events-none z-10 bg-gradient-to-l from-[#0a1628cc] to-transparent" />

      {/* Top fade */}
      <div className="fixed top-0 left-0 right-0 h-40 pointer-events-none z-20 bg-gradient-to-b from-[#0a1628] to-transparent" />

      {/* Bottom fade */}
      <div className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-20 bg-gradient-to-t from-[#0a1628] to-transparent" />

      <div className="relative z-10 max-w-2xl mx-auto">
        <OpeningCard />

        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-4">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#c9a87c50]" />
            <div className="w-1 h-1 rounded-full bg-[#c9a87c]" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#c9a87c50]" />
          </div>
        </div>

        {nominees.map(nominee => (
          <CreditCard key={nominee.id} nominee={nominee} />
        ))}

        <ClosingCard />

        <div className="h-40" />
      </div>

      <Controls
        isPlaying={isPlaying}
        onToggle={() => setIsPlaying(p => !p)}
        onRestart={handleRestart}
        progress={progress}
      />
    </div>
  );
}