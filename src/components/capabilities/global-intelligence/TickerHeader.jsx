import { useState, useEffect } from 'react';
import { useMilitaryFlights, useConflictEvents, useNaturalDisasters, useCyberThreats, useAviationNews } from '@/lib/intelligence/hooks';

function TickerItem({ icon, value, label, color }) {
  return (
    <span className={`flex items-center gap-1 ${color}`}>
      <span>{icon}</span>
      <strong className="tabular-nums">{value}</strong>
      <span className="text-slate-500 hidden sm:inline">{label}</span>
    </span>
  );
}

function LiveClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="text-slate-400 tabular-nums text-[11px] shrink-0">
      {time.toUTCString().slice(17, 25)} UTC
    </span>
  );
}

function ScrollingTicker({ headlines }) {
  if (!headlines.length) return null;
  const text = headlines.join('  ·  ');
  return (
    <div className="overflow-hidden whitespace-nowrap flex-1 min-w-0">
      <span className="inline-block animate-marquee text-slate-400 text-[11px] font-mono">
        {text}
      </span>
    </div>
  );
}

export function TickerHeader() {
  const { data: flightData } = useMilitaryFlights();
  const { data: conflictData } = useConflictEvents();
  const { data: disasterData } = useNaturalDisasters();
  const { data: cyberData } = useCyberThreats();
  const { data: newsData } = useAviationNews();

  const flightCount = flightData?.flights?.length ?? '—';
  const conflictCount = conflictData?.events?.length ?? '—';
  const latestQuake = disasterData?.events?.find(e => e.type === 'earthquake');
  const kevCount = cyberData?.kevCount ?? cyberData?.kev?.length ?? '—';
  const headlines = newsData?.items?.slice(0, 10).map(i => i.title) ?? [];

  return (
    <div className="h-8 bg-[#050810] border-b border-slate-800 flex items-center px-3 gap-3 text-[11px] font-mono shrink-0 overflow-hidden">
      {/* Brand */}
      <span className="text-blue-400 font-bold tracking-widest shrink-0">GLOBAL INTEL</span>
      <div className="w-px h-4 bg-slate-700 shrink-0" />

      {/* Live pulse */}
      <span className="flex items-center gap-1.5 text-green-400 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        LIVE
      </span>
      <div className="w-px h-4 bg-slate-700 shrink-0" />

      {/* Stats */}
      <TickerItem icon="✈" value={flightCount} label="FLIGHTS" color="text-blue-300" />
      <TickerItem icon="⚔" value={conflictCount} label="CONFLICTS" color="text-red-400" />
      {latestQuake && (
        <TickerItem
          icon="🌋"
          value={`M${latestQuake.magnitude != null ? latestQuake.magnitude.toFixed(1) : '?'}`}
          label={latestQuake.place?.split(',').pop()?.trim() ?? ''}
          color="text-orange-400"
        />
      )}
      <TickerItem icon="🔴" value={kevCount} label="KEV" color="text-red-300" />

      <div className="w-px h-4 bg-slate-700 shrink-0" />

      {/* Scrolling headlines */}
      <ScrollingTicker headlines={headlines} />

      <div className="w-px h-4 bg-slate-700 shrink-0" />

      {/* Clock */}
      <LiveClock />
    </div>
  );
}
