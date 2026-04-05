import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Rocket, Send, Award, Clock, CalendarDays, CheckCircle2, Circle, Loader } from 'lucide-react';
import { useConversation } from '@/components/contexts/ConversationContext';
import MissionControlAdminPanel from './MissionControlAdminPanel';

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
      <div className="text-3xl md:text-4xl font-bold text-white tabular-nums">{String(value).padStart(2, '0')}</div>
      <div className="text-[10px] md:text-xs text-white/50 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

const brand = {
  navy: '#1e3a5a',
  gold: '#c9a87c',
};

export default function MissionControlHeader() {
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const { channels, selectConversation } = useConversation();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const handleNominationsClick = () => {
    const nominationsChannel = channels.find(c => c.name?.toLowerCase() === 'nominations');
    if (nominationsChannel) {
      selectConversation(nominationsChannel);
    }
  };

  const { data: seasons = [] } = useQuery({
    queryKey: ['home-mc-seasons'],
    queryFn: () => base44.entities.Season.list('-created_date', 5),
  });

  useEffect(() => {
    if (!seasons.length || selectedSeasonId) return;
    const women2026 = seasons.find(s => s.name?.toLowerCase().includes('women') && s.name?.includes('2026'));
    const women = women2026 || seasons.find(s => s.name?.toLowerCase().includes('women'));
    setSelectedSeasonId(women?.id || seasons[0]?.id);
  }, [seasons]);

  const activeSeason = seasons.find(s => s.id === selectedSeasonId) || seasons[0];
  const countdown = useCountdown(activeSeason?.nomination_end);

  if (!activeSeason) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl" style={{ background: `linear-gradient(135deg, ${brand.navy} 0%, #0f1f33 100%)` }}>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: brand.gold }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-5" style={{ background: '#4a90b8' }} />

      <div className="relative z-10 px-4 md:px-6 py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">

          {/* ── Left column ── */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className="text-xs font-bold px-3 py-1" style={{ background: brand.gold, color: 'white' }}>
                <Rocket className="w-3 h-3 mr-1" />
                {activeSeason.name || 'Season'}
              </Badge>
              <Badge variant="outline" className="text-xs border-white/30 text-white/70">
                NOMINATIONS OPEN
              </Badge>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Mission Control
            </h2>
            <p className="text-white/60 text-sm md:text-base max-w-xl mb-6">
              {activeSeason.name || 'TOP 100'} — Driving nominations across 30+ countries to recognize aerospace excellence.
            </p>

            {/* Countdown */}
            {countdown && !countdown.past && (
              <div className="inline-flex items-center gap-4 md:gap-6 px-5 py-3 rounded-2xl mb-5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <div className="text-white/50 text-xs uppercase tracking-widest mr-2">
                  <Clock className="w-4 h-4 mb-1 mx-auto" />
                  Nominations Close
                </div>
                <CountdownUnit value={countdown.days} label="Days" />
                <span className="text-white/30 text-2xl font-light">:</span>
                <CountdownUnit value={countdown.hours} label="Hours" />
                <span className="text-white/30 text-2xl font-light">:</span>
                <CountdownUnit value={countdown.mins} label="Min" />
                <span className="text-white/30 text-2xl font-light">:</span>
                <CountdownUnit value={countdown.secs} label="Sec" />
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Button className="text-white font-semibold" style={{ background: brand.gold }} onClick={handleNominationsClick}>
                <Send className="w-4 h-4 mr-2" /> Submit Nomination
              </Button>
              <Link to="/Top100Women2025">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Award className="w-4 h-4 mr-2" /> View 2025 Index
                </Button>
              </Link>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="w-full md:w-72 shrink-0 flex flex-col gap-3">
            <SeasonSchedule season={activeSeason} />
          </div>

        </div>

        {/* ── Admin CRUD panel — visible to admins only ── */}
        {user?.role === 'admin' && (
          <MissionControlAdminPanel
            seasons={seasons}
            activeSeason={activeSeason}
            onSeasonChange={setSelectedSeasonId}
          />
        )}
      </div>
    </div>
  );
}

function SeasonSchedule({ season }) {
  const today = new Date();

  const phases = [
    { label: 'Nominations Open',  date: season.nomination_start },
    { label: 'Nominations Close', date: season.nomination_end },
    { label: 'Voting Opens',      date: season.voting_start },
    { label: 'Voting Closes',     date: season.voting_end },
    { label: 'Review & Editorial Phase', date: season.review_start },
    { label: 'Publication',              date: season.end_date },
  ].filter(p => p.date);

  if (!phases.length) return null;

  return (
    <div className="rounded-2xl px-5 py-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-4 h-4" style={{ color: brand.gold }} />
        <span className="text-xs font-bold uppercase tracking-widest text-white/60">{season.name || 'Season Schedule'}</span>
      </div>
      <div className="flex flex-col gap-3">
        {phases.map(({ label, date }) => {
          const d = new Date(date);
          const isPast = d < today;
          const isNow = phases.some(p => {
            const pd = new Date(p.date);
            return pd <= today;
          }) && !isPast ? false : false; // simplified: just past/future
          return (
            <div key={label} className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                {isPast
                  ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: brand.gold }} />
                  : <Circle className="w-3.5 h-3.5 shrink-0 text-white/30" />
                }
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isPast ? 'text-white/80' : 'text-white/40'}`}>{label}</span>
              </div>
              <span className={`text-sm font-semibold tabular-nums ml-5 ${isPast ? 'text-white' : 'text-white/50'}`}>
                {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}