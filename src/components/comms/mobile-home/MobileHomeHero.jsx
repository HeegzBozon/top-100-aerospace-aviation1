import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Send, Award, Clock, CalendarDays, CheckCircle2, Circle, Rocket, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const brand = { navy: '#1e3a5a', gold: '#c9a87c' };
const cardBg = `linear-gradient(135deg, ${brand.navy} 0%, #0f1f33 100%)`;
const CARD_HEIGHT = 160;

function useCountdown(targetDate) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!targetDate) return null;
  const diff = new Date(targetDate).getTime() - now.getTime();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  };
}

function CardShell({ children, onFlip, flipIcon }) {
  return (
    <div
      className="absolute inset-0 rounded-2xl overflow-hidden"
      style={{ background: cardBg }}
    >
      {/* Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: brand.gold }} />
      <div className="relative z-10 px-5 py-4 h-full flex flex-col">
        {children}
      </div>
      {/* Flip button */}
      <button
        onClick={onFlip}
        className="absolute top-3 right-3 p-1.5 rounded-lg z-20"
        style={{ background: 'rgba(255,255,255,0.1)' }}
      >
        {flipIcon}
      </button>
    </div>
  );
}

function FrontFace({ season, countdown, onFlip, onNominationsClick }) {
  return (
    <CardShell onFlip={onFlip} flipIcon={<CalendarDays className="w-3.5 h-3.5 text-white/50" />}>
      {/* Season label + title */}
      <div className="flex items-center gap-1.5 mb-1">
        <Rocket className="w-3 h-3 shrink-0" style={{ color: brand.gold }} />
        <span className="text-[10px] font-bold uppercase tracking-widest truncate" style={{ color: brand.gold }}>
          {season.name || 'Season 4'}
        </span>
      </div>
      <h2 className="text-lg font-bold text-white leading-tight mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        Mission Control
      </h2>

      {/* Compact countdown */}
      {countdown && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg mb-3 self-start" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Clock className="w-3 h-3 text-white/40 shrink-0" />
          <span className="text-xs font-mono font-bold text-white/80 tabular-nums">
            {String(countdown.days).padStart(2,'0')}d {String(countdown.hours).padStart(2,'0')}h {String(countdown.mins).padStart(2,'0')}m {String(countdown.secs).padStart(2,'0')}s
          </span>
        </div>
      )}

      {/* CTAs */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={onNominationsClick}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-xs text-white"
          style={{ background: brand.gold }}
        >
          <Send className="w-3 h-3" /> Nominate
        </button>
        <Link to="/Top100Women2025">
          <button
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-xs text-white"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            <Award className="w-3 h-3" /> 2025 Index
          </button>
        </Link>
      </div>
    </CardShell>
  );
}

function BackFace({ season, onFlip }) {
  const today = new Date();
  const phases = [
    { label: 'Nominations Open',  date: season.nomination_start },
    { label: 'Nominations Close', date: season.nomination_end },
    { label: 'Voting Opens',      date: season.voting_start },
    { label: 'Voting Closes',     date: season.voting_end },
    { label: 'Publication',       date: season.end_date },
  ].filter(p => p.date);

  return (
    <CardShell onFlip={onFlip} flipIcon={<RotateCcw className="w-3.5 h-3.5 text-white/50" />}>
      <div className="flex items-center gap-2 mb-2">
        <CalendarDays className="w-3.5 h-3.5 shrink-0" style={{ color: brand.gold }} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Season Schedule</span>
      </div>
      <div className="flex flex-col gap-1.5 overflow-hidden">
        {phases.map(({ label, date }) => {
          const d = new Date(date);
          const isPast = d < today;
          return (
            <div key={label} className="flex items-center gap-2">
              {isPast
                ? <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: brand.gold }} />
                : <Circle className="w-3 h-3 shrink-0 text-white/25" />
              }
              <span className={`text-[11px] flex-1 truncate ${isPast ? 'text-white/75' : 'text-white/35'}`}>{label}</span>
              <span className={`text-[11px] font-semibold tabular-nums shrink-0 ${isPast ? 'text-white' : 'text-white/40'}`}>
                {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

export default function MobileHomeHero({ onNominationsClick }) {
  const [flipped, setFlipped] = useState(false);
  const [selectedSeasonId, setSelectedSeasonId] = useState('');

  const { data: seasons = [] } = useQuery({
    queryKey: ["mobile-home-seasons"],
    queryFn: () => base44.entities.Season.list("-created_date", 5),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!seasons.length || selectedSeasonId) return;
    const s4 = seasons.find(s => s.name?.toLowerCase().includes('season 4'));
    setSelectedSeasonId(s4?.id || seasons[0]?.id);
  }, [seasons]);

  const activeSeason = seasons.find(s => s.id === selectedSeasonId) || seasons[0];
  const countdown = useCountdown(activeSeason?.nomination_end);

  if (!activeSeason) return null;

  return (
    <div className="mx-4 mt-4 mb-3 relative" style={{ height: CARD_HEIGHT }}>
      <AnimatePresence mode="wait">
        {!flipped ? (
          <motion.div
            key="front"
            className="absolute inset-0"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <FrontFace
              season={activeSeason}
              countdown={countdown}
              onFlip={() => setFlipped(true)}
              onNominationsClick={onNominationsClick}
            />
          </motion.div>
        ) : (
          <motion.div
            key="back"
            className="absolute inset-0"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <BackFace
              season={activeSeason}
              onFlip={() => setFlipped(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}