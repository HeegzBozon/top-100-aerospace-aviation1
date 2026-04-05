import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Rocket, Send, Award, Clock, CalendarDays, CheckCircle2, Circle, Loader, ChevronRight } from 'lucide-react';
import { useConversation } from '@/components/contexts/ConversationContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

function Top100WomenRail() {
  const [carouselApi, setCarouselApi] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const { data: women, isLoading } = useQuery({
    queryKey: ['top-100-women-2025-rail'],
    queryFn: async () => {
      const data = await base44.entities.Nominee.filter({ status: 'winner' }, '', 200);
      return data;
    }
  });

  const shuffledWomen = women ? [...women].sort(() => 0.5 - Math.random()) : [];

  useEffect(() => {
    if (!carouselApi || isHovered) return;
    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [carouselApi, isHovered]);

  if (!isLoading && shuffledWomen.length === 0) return null;

  return (
    <div 
      className="w-full border-t border-white/10 pt-4 pb-4 bg-black/20 mt-auto relative z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-3 px-4 md:px-6">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 tracking-wider uppercase">
          <Award className="w-4 h-4 text-[#c9a87c]" />
          Top 100 Women 2025
        </h4>
        <Link to="/Top100Women2025" className="text-[10px] text-[#c9a87c] hover:text-white font-semibold uppercase tracking-wider flex items-center transition-colors">
          View All <ChevronRight className="w-3 h-3 ml-1" />
        </Link>
      </div>

      <Carousel 
        setApi={setCarouselApi}
        opts={{ loop: true, align: "start" }}
        className="w-full"
      >
        <CarouselContent className="-ml-3 px-4 md:px-6">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <CarouselItem key={i} className="pl-3 basis-auto">
                <div className="w-[220px] rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3 w-3/4 bg-white/10" />
                      <Skeleton className="h-2 w-1/2 bg-white/10" />
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))
          ) : shuffledWomen?.map((woman) => (
            <CarouselItem key={woman.id} className="pl-3 basis-auto">
              <a 
                href={`/ProfileView?id=${woman.id}`}
                className="block w-[220px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#c9a87c]/50 p-3 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={woman.avatar_url || woman.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(woman.name)}&background=1e3a5a&color=c9a87c`} 
                    alt={woman.name}
                    className="w-10 h-10 rounded-full object-cover border border-white/20 group-hover:border-[#c9a87c] transition-colors shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-slate-100 truncate group-hover:text-white transition-colors">{woman.name}</h5>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{woman.title || woman.company || 'Aerospace Leader'}</p>
                  </div>
                </div>
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

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
      <div className="text-xl md:text-2xl font-bold text-white tabular-nums">{String(value).padStart(2, '0')}</div>
      <div className="text-[8px] md:text-[10px] text-white/50 uppercase tracking-wider mt-0.5">{label}</div>
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
    <div className="relative overflow-hidden rounded-3xl h-full flex flex-col" style={{ background: `linear-gradient(135deg, ${brand.navy} 0%, #0f1f33 100%)` }}>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: brand.gold }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-5" style={{ background: '#4a90b8' }} />

      <div className="relative z-10 px-4 md:px-6 py-4 md:py-5 flex-1">
        <div className="flex flex-col md:flex-row gap-5 md:gap-6">

          {/* ── Left column ── */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className="text-[10px] md:text-xs font-bold px-2.5 py-0.5" style={{ background: brand.gold, color: 'white' }}>
                <Rocket className="w-3 h-3 mr-1" />
                TOP 100 WOMEN
              </Badge>
              <Badge className="text-[10px] md:text-xs font-bold px-2.5 py-0.5" style={{ background: '#8f2a58', color: 'white' }}>
                TOP 100 ANGELS
              </Badge>
              <Badge className="text-[10px] md:text-xs font-bold px-2.5 py-0.5" style={{ background: '#4a90b8', color: 'white' }}>
                TOP 100 MEN
              </Badge>
              <Badge variant="outline" className="text-[10px] md:text-xs border-white/30 text-white/70 py-0.5">
                NOMINATIONS OPEN
              </Badge>
            </div>

            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Top 100 Women, Angels, and Men in Aerospace and Aviation 2026
            </h2>
            <p className="text-white/60 text-xs md:text-sm max-w-xl mb-4">
              Driving nominations across 30+ countries to recognize excellence, leadership, and impactful investment in the aerospace and aviation sectors.
            </p>

            {/* Countdown */}
            {countdown && !countdown.past && (
              <div className="inline-flex items-center gap-3 md:gap-4 px-4 py-2 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <div className="text-white/50 text-[10px] uppercase tracking-widest mr-1">
                  <Clock className="w-3 h-3 mb-0.5 mx-auto" />
                  Nominations Close
                </div>
                <CountdownUnit value={countdown.days} label="Days" />
                <span className="text-white/30 text-xl font-light">:</span>
                <CountdownUnit value={countdown.hours} label="Hours" />
                <span className="text-white/30 text-xl font-light">:</span>
                <CountdownUnit value={countdown.mins} label="Min" />
                <span className="text-white/30 text-xl font-light">:</span>
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

      </div>
      
      <Top100WomenRail />
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
    <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex flex-col gap-2">
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