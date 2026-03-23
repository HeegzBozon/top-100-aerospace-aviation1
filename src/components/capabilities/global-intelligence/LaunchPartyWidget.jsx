import { useState, useEffect } from 'react';
import { Rocket, Clock, Loader2, AlertCircle, ArrowRight, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getUpcomingLaunches } from '@/functions/getUpcomingLaunches';

function useCountdown(targetDate) {
  const [parts, setParts] = useState({ days: 0, hours: 0, mins: 0, secs: 0, past: false });

  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setParts({ days: 0, hours: 0, mins: 0, secs: 0, past: true });
        return;
      }
      setParts({
        days:  Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins:  Math.floor((diff % 3600000) / 60000),
        secs:  Math.floor((diff % 60000) / 1000),
        past:  false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return parts;
}

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center min-w-[36px]">
      <span className="text-base font-bold text-[#1e3a5a] tabular-nums leading-none">
        {String(value ?? 0).padStart(2, '0')}
      </span>
      <span className="text-[10px] text-[#1e3a5a]/50 uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

export function LaunchPartyWidget() {
  const [launch, setLaunch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const countdown = useCountdown(launch?.net);

  useEffect(() => {
    getUpcomingLaunches({ limit: 1 })
      .then(res => {
        const next = res?.data?.launches?.[0];
        if (next) setLaunch(next);
        else setIsError(true);
      })
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <Card className="border-[#1e3a5a]/10 bg-gradient-to-br from-[#0f1d2d] to-[#1e3a5a]">
        <CardContent className="flex items-center justify-center py-6 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#c9a87c]" />
          <span className="text-sm text-white/60">Loading next launch…</span>
        </CardContent>
      </Card>
    );
  }

  if (isError || !launch) {
    return (
      <Card className="border-red-200/40 bg-red-50/10">
        <CardContent className="flex items-center justify-center py-6 gap-2 text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Could not load launch data</span>
        </CardContent>
      </Card>
    );
  }

  const providerName = launch.launch_service_provider?.name || launch.rocket?.configuration?.name || 'Unknown Provider';
  const launchName   = launch.name?.split('|')[0]?.trim() || 'Upcoming Launch';
  const locationName = launch.pad?.location?.name || launch.pad?.name || null;
  const isGo         = launch.status?.abbrev === 'Go';
  const hasStream    = launch.vidURLs?.length > 0;

  return (
    <Card
      className="overflow-hidden border-[#c9a87c]/30 shadow-md"
      aria-label="Next upcoming rocket launch"
    >
      {/* Hero image strip */}
      <div className="relative h-32 sm:h-40 bg-gradient-to-br from-[#0f1d2d] to-[#1e3a5a] overflow-hidden">
        {launch.image ? (
          <img
            src={launch.image}
            alt={launchName}
            className="w-full h-full object-cover opacity-50"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Rocket className="w-12 h-12 text-[#c9a87c]/20" aria-hidden="true" />
          </div>
        )}

        {/* Overlaid gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1d2d]/90 via-[#0f1d2d]/40 to-transparent" />

        {/* Tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-[#c9a87c] text-[#1e3a5a] uppercase">
            🚀 Launch Party
          </span>
          {isGo && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/90 text-white">
              GO
            </span>
          )}
          {hasStream && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600/90 text-white animate-pulse">
              LIVE
            </span>
          )}
        </div>

        {/* Countdown */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              {countdown.past ? 'Launched / Underway' : 'T-minus'}
            </p>
            {!countdown.past && (
              <div className="flex items-center gap-3">
                <CountdownUnit value={countdown.days}  label="d" />
                <CountdownUnit value={countdown.hours} label="h" />
                <CountdownUnit value={countdown.mins}  label="m" />
                <CountdownUnit value={countdown.secs}  label="s" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <CardContent className="p-4 space-y-3 bg-white">
        <div>
          <p className="text-xs font-semibold text-[#c9a87c] truncate">{providerName}</p>
          <h3 className="text-sm font-bold text-[#1e3a5a] leading-snug mt-0.5 line-clamp-2">{launchName}</h3>
        </div>

        {locationName && (
          <div className="flex items-center gap-1.5 text-xs text-[#1e3a5a]/50">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{locationName}</span>
          </div>
        )}

        {launch.mission?.description && (
          <p className="text-xs text-slate-500 line-clamp-2">{launch.mission.description}</p>
        )}

        <Link to="/LaunchParty" aria-label="Open full Launch Party page">
          <Button
            size="sm"
            className="w-full min-h-[44px] bg-[#1e3a5a] hover:bg-[#1e3a5a]/90 text-[#c9a87c] font-semibold text-xs"
          >
            <Rocket className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            Open Launch Party
            <ArrowRight className="w-3.5 h-3.5 ml-auto" aria-hidden="true" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}