import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Send, Award, Clock, CalendarDays, CheckCircle2, Circle, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const brand = { navy: '#1e3a5a', gold: '#c9a87c' };

function useCountdown(targetDate) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!targetDate) return null;
  const diff = new Date(targetDate).getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, past: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
    past: false,
  };
}

function CountdownUnit({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-white tabular-nums">{String(value).padStart(2, '0')}</div>
      <div className="text-[9px] text-white/50 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

function MobileSeasonSchedule({ season }) {
  const today = new Date();
  const phases = [
    { label: 'Nominations Open', date: season.nomination_start },
    { label: 'Nominations Close', date: season.nomination_end },
    { label: 'Voting Opens', date: season.voting_start },
    { label: 'Voting Closes', date: season.voting_end },
    { label: 'Publication', date: season.end_date },
  ].filter(p => p.date);

  if (!phases.length) return null;

  return (
    <div className="mt-4 rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="w-3.5 h-3.5" style={{ color: brand.gold }} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Season Schedule</span>
      </div>
      <div className="grid grid-cols-2 gap-y-2 gap-x-4">
        {phases.map(({ label, date }) => {
          const d = new Date(date);
          const isPast = d < today;
          return (
            <div key={label} className="flex items-start gap-1.5">
              {isPast
                ? <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" style={{ color: brand.gold }} />
                : <Circle className="w-3 h-3 shrink-0 mt-0.5 text-white/25" />
              }
              <div>
                <p className={`text-[9px] font-bold uppercase tracking-wide leading-tight ${isPast ? 'text-white/70' : 'text-white/35'}`}>{label}</p>
                <p className={`text-xs font-semibold ${isPast ? 'text-white' : 'text-white/45'}`}>
                  {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MobileHomeHero({ onNominationsClick }) {
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
    <div
      className="mx-4 mt-4 mb-3 rounded-2xl overflow-hidden relative"
      style={{ background: `linear-gradient(135deg, ${brand.navy} 0%, #0f1f33 100%)` }}
    >
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: brand.gold }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-5 pointer-events-none" style={{ background: '#4a90b8' }} />

      <div className="relative z-10 px-5 py-5">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge className="text-[10px] font-bold px-2.5 py-0.5" style={{ background: brand.gold, color: 'white' }}>
            <Rocket className="w-2.5 h-2.5 mr-1" />
            {activeSeason.name || 'Season'}
          </Badge>
          <Badge variant="outline" className="text-[10px] border-white/25 text-white/65">
            NOMINATIONS OPEN
          </Badge>
        </div>

        {/* Title */}
        <h2
          className="text-2xl font-bold text-white leading-tight mb-1"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Mission Control
        </h2>
        <p className="text-white/55 text-xs mb-4 leading-relaxed">
          Recognizing aerospace excellence across 30+ countries.
        </p>

        {/* Countdown */}
        {countdown && !countdown.past && (
          <div
            className="inline-flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <div className="text-white/45 text-[9px] uppercase tracking-widest text-center">
              <Clock className="w-3 h-3 mb-0.5 mx-auto" />
              Closes
            </div>
            <CountdownUnit value={countdown.days} label="Days" />
            <span className="text-white/25 text-lg font-light">:</span>
            <CountdownUnit value={countdown.hours} label="Hrs" />
            <span className="text-white/25 text-lg font-light">:</span>
            <CountdownUnit value={countdown.mins} label="Min" />
            <span className="text-white/25 text-lg font-light">:</span>
            <CountdownUnit value={countdown.secs} label="Sec" />
          </div>
        )}

        {/* CTAs */}
        <div className="flex gap-2.5">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onNominationsClick}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm text-white shadow"
            style={{ background: brand.gold }}
          >
            <Send className="w-3.5 h-3.5" />
            Nominate
          </motion.button>
          <Link to="/Top100Women2025">
            <motion.button
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <Award className="w-3.5 h-3.5" />
              2025 Index
            </motion.button>
          </Link>
        </div>

        {/* Season Schedule */}
        <MobileSeasonSchedule season={activeSeason} />
      </div>
    </div>
  );
}