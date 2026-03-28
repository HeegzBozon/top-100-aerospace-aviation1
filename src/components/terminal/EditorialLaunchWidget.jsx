import { useState, useEffect } from 'react';
import { getUpcomingLaunches } from '@/functions/getUpcomingLaunches';
import { format, parseISO, formatDistanceToNow, isPast } from 'date-fns';
import { Rocket, Clock, Radio, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import LaunchDetailModal from '@/components/home/LaunchDetailModal';

export default function EditorialLaunchWidget() {
  const [launches, setLaunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getUpcomingLaunches({ limit: 5 })
      .then(res => {
        const payload = res?.data;
        setLaunches(payload?.launches || payload?.results || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="rounded-2xl overflow-hidden border flex flex-col"
      style={{ borderColor: 'rgba(30,58,90,0.1)' }}
    >
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b shrink-0"
        style={{
          background: 'linear-gradient(90deg, rgba(30,58,90,0.06) 0%, rgba(201,168,124,0.08) 100%)',
          borderColor: 'rgba(30,58,90,0.08)',
        }}
      >
        <Rocket className="w-3.5 h-3.5" style={{ color: '#d4a574' }} />
        <span
          className="text-xs font-bold tracking-wide"
          style={{ color: '#1e3a5a', fontFamily: "var(--brand-font-serif, 'Playfair Display', Georgia, serif)" }}
        >
          Launch Schedule
        </span>
        <div className="flex-1" />
        <Link to="/LaunchParty" className="flex items-center gap-0.5 text-[10px] hover:opacity-70 transition-opacity" style={{ color: '#c9a87c' }}>
          All <ArrowRight className="w-2.5 h-2.5" />
        </Link>
      </div>
      <div className="flex-1 divide-y" style={{ background: '#faf8f5', divideColor: 'rgba(30,58,90,0.06)' }}>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#c9a87c' }} />
          </div>
        ) : launches.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: 'rgba(30,58,90,0.4)' }}>No upcoming launches</p>
        ) : (
          launches.map(launch => {
            const net = launch.net ? parseISO(launch.net) : null;
            const isGo = launch.status?.abbrev === 'Go';
            const provider = launch.launch_service_provider?.abbrev || '';
            const hasStream = (launch.vidURLs?.length ?? 0) > 0;
            return (
              <button
                key={launch.id}
                onClick={() => setSelected(launch)}
                className="w-full text-left px-4 py-2.5 hover:bg-white/80 transition-colors group flex items-center gap-3"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${isGo ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[12px] font-semibold truncate group-hover:opacity-80" style={{ color: '#1e3a5a' }}>
                      {launch.mission?.name || launch.name}
                    </p>
                    {hasStream && (
                      <span className="flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 shrink-0 font-semibold">
                        <Radio className="w-2 h-2" /> LIVE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {provider && <span className="text-[9px] font-mono" style={{ color: 'rgba(30,58,90,0.4)' }}>{provider}</span>}
                    {net && (
                      <span className="flex items-center gap-0.5 text-[9px]" style={{ color: '#c9a87c' }}>
                        <Clock className="w-2 h-2" />
                        {isPast(net) ? 'Launched' : formatDistanceToNow(net, { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
      <LaunchDetailModal launch={selected} onClose={() => setSelected(null)} />
    </div>
  );
}