import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Send, Award, Clock, CalendarDays, CheckCircle2, Circle, Rocket, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

const brand = { navy: '#1e3a5a', gold: '#c9a87c' };
const cardBg = `linear-gradient(135deg, ${brand.navy} 0%, #0f1f33 100%)`;

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

// Compact inline countdown: "12d 04h 33m 07s"
function InlineCountdown({ countdown }) {
  if (!countdown) return null;
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <Clock className="w-3 h-3 text-white/40 shrink-0" />
      <span className="text-xs font-mono font-bold text-white/80 tabular-nums">
        {String(countdown.days).padStart(2,'0')}d{' '}
        {String(countdown.hours).padStart(2,'0')}h{' '}
        {String(countdown.mins).padStart(2,'0')}m{' '}
        {String(countdown.secs).padStart(2,'0')}s
      </span>
    </div>
  );
}

// Back face: season schedule
function SeasonScheduleBack({ season, onFlip }) {
  const today = new Date();
  const phases = [
    { label: 'Nominations Open',  date: season.nomination_start },
    { label: 'Nominations Close', date: season.nomination_end },
    { label: 'Voting Opens',      date: season.voting_start },
    { label: 'Voting Closes',     date: season.voting_end },
    { label: 'Publication',       date: season.end_date },
  ].filter(p => p.date);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative" style={{ background: cardBg }}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: brand.gold }} />
      <div className="relative z-10 px-5 py-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5" style={{ color: brand.gold }} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Season Schedule</span>
          </div>
          <button onClick={onFlip} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <RotateCcw className="w-3.5 h-3.5 text-white/50" />
          </button>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          {phases.map(({ label, date }) => {
            const d = new Date(date);
            const isPast = d < today;
            return (
              <div key={label} className="flex items-center gap-2">
                {isPast
                  ? <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: brand.gold }} />
                  : <Circle className="w-3 h-3 shrink-0 text-white/25" />
                }
                <span className={`text-xs flex-1 ${isPast ? 'text-white/75' : 'text-white/35'}`}>{label}</span>
                <span className={`text-xs font-semibold tabular-nums ${isPast ? 'text-white' : 'text-white/40'}`}>
                  {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Front face: mission control CTA
function MissionFront({ season, countdown, onFlip, onNominationsClick }) {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative" style={{ background: cardBg }}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: brand.gold }} />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full blur-3xl opacity-5 pointer-events-none" style={{ background: '#4a90b8' }} />

      <div className="relative z-10 px-5 py-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Rocket className="w-3 h-3" style={{ color: brand.gold }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: brand.gold }}>
                {season.name || 'Season 4'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Mission Control
            </h2>
          </div>
          <button onClick={onFlip} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors mt-0.5">
            <CalendarDays className="w-3.5 h-3.5 text-white/40" />
          </button>
        </div>

        {/* Compact countdown */}
        {countdown && (
          <div className="mb-3">
            <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">Nominations close in</p>
            <InlineCountdown countdown={countdown} />
          </div>
        )}

        {/* CTAs */}
        <div className="flex gap-2">
          <button
            onClick={onNominationsClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-xs text-white shadow"
            style={{ background: brand.gold }}
          >
            <Send className="w-3 h-3" />
            Nominate
          </button>
          <Link to="/Top100Women2025">
            <button
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-xs text-white"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)' }}
            >
              <Award className="w-3 h-3" />
              2025 Index
            </button>
          </Link>
        </div>
      </div>
    </div>
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
    <div className="mx-4 mt-4 mb-3 card-flip-container" style={{ height: 148 }}>
      <div className={`card-flip-inner ${flipped ? 'flipped' : ''}`}>
        <div className="card-flip-front">
          <MissionFront
            season={activeSeason}
            countdown={countdown}
            onFlip={() => setFlipped(true)}
            onNominationsClick={onNominationsClick}
          />
        </div>
        <div className="card-flip-back">
          <SeasonScheduleBack
            season={activeSeason}
            onFlip={() => setFlipped(false)}
          />
        </div>
      </div>
    </div>
  );
}