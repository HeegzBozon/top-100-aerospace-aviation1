import { useState, useEffect } from 'react';
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

export function LaunchWidgetCompact() {
  const [launches, setLaunches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUpcomingLaunches({ limit: 3 })
      .then(res => {
        const items = res?.data?.launches ?? [];
        setLaunches(items);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="text-[10px] text-slate-600 font-mono animate-pulse">LOADING</span>
      </div>
    );
  }

  if (!launches.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="text-[10px] text-slate-600 font-mono">NO LAUNCHES</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-1 overflow-hidden">
      {launches.map((launch, i) => (
        <LaunchRow key={launch.id || i} launch={launch} />
      ))}
    </div>
  );
}

function LaunchRow({ launch }) {
  const countdown = useCountdown(launch?.net);
  const name = launch.name?.split('|')[0]?.trim() ?? 'Unknown';
  const provider = launch.launch_service_provider?.name ?? '';
  const isGo = launch.status?.abbrev === 'Go';

  return (
    <div className="flex items-center gap-2 px-1 py-0.5 rounded bg-slate-900/60 shrink-0">
      <span className="text-sm leading-none">🚀</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-mono text-white truncate leading-none">{name}</p>
        {provider && (
          <p className="text-[9px] text-slate-500 truncate">{provider}</p>
        )}
      </div>
      <div className="shrink-0 text-right">
        {countdown.past ? (
          <span className="text-[9px] text-green-400 font-mono">LAUNCHED</span>
        ) : (
          <span className="text-[10px] font-mono tabular-nums text-blue-300">
            T-{countdown.days > 0 ? `${countdown.days}d ` : ''}{String(countdown.hours).padStart(2,'0')}:{String(countdown.mins).padStart(2,'0')}
          </span>
        )}
        {isGo && <span className="ml-1 text-[9px] text-green-400 font-mono">GO</span>}
      </div>
    </div>
  );
}
