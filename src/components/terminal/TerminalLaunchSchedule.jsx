import { useState, useEffect, useCallback } from 'react';
import { getUpcomingLaunches } from '@/functions/getUpcomingLaunches';
import { format, parseISO, formatDistanceToNow, isPast } from 'date-fns';
import { Rocket, Clock, MapPin, Radio, Loader2 } from 'lucide-react';
import LaunchDetailModal from '@/components/home/LaunchDetailModal';

export function TerminalLaunchSchedule() {
  const [launches, setLaunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getUpcomingLaunches({ limit: 8 })
      .then(res => {
        const payload = res?.data;
        setLaunches(payload?.launches || payload?.results || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!launches.length) {
    return <p className="text-[10px] text-slate-600 font-mono text-center py-4">No upcoming launches</p>;
  }

  return (
    <>
      <div className="space-y-0.5">
        {launches.map(launch => {
          const net = launch.net ? parseISO(launch.net) : null;
          const status = launch.status?.abbrev || '';
          const isGo = status === 'Go';
          const provider = launch.launch_service_provider?.abbrev || '';
          const hasStream = (launch.vidURLs?.length ?? 0) > 0;

          return (
            <button
              key={launch.id}
              onClick={() => setSelected(launch)}
              className="w-full text-left px-2 py-1.5 hover:bg-slate-800/60 transition-colors rounded group"
            >
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isGo ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                <Rocket className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="text-[11px] text-slate-200 truncate flex-1 group-hover:text-white">
                  {launch.mission?.name || launch.name}
                </span>
                {hasStream && (
                  <span className="flex items-center gap-0.5 text-[9px] px-1 py-0.5 rounded bg-red-600/60 text-white shrink-0">
                    <Radio className="w-2 h-2" /> LIVE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 ml-5 mt-0.5">
                {provider && <span className="text-[9px] text-slate-500 font-mono">{provider}</span>}
                {net && (
                  <span className="text-[9px] text-slate-500 font-mono flex items-center gap-0.5">
                    <Clock className="w-2 h-2" />
                    {isPast(net) ? 'Launched' : formatDistanceToNow(net, { addSuffix: true })}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <LaunchDetailModal launch={selected} onClose={() => setSelected(null)} />
    </>
  );
}