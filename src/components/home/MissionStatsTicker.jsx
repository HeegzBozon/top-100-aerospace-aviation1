import React, { useState, useEffect } from 'react';
import { Clock, Activity, Target, Loader2 } from 'lucide-react';
import { getUpcomingLaunches } from '@/functions/getUpcomingLaunches';

export default function MissionStatsTicker() {
  const [launch, setLaunch] = useState(null);
  const [timeDiff, setTimeDiff] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUpcomingLaunches({ limit: 1 })
      .then(res => {
        const nextLaunch = res?.data?.launches?.[0];
        if (nextLaunch) setLaunch(nextLaunch);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!launch?.net) return;
    
    const launchTime = new Date(launch.net).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      setTimeDiff(Math.floor((now - launchTime) / 1000));
    }, 1000);

    // Initial calculation
    const now = new Date().getTime();
    setTimeDiff(Math.floor((now - launchTime) / 1000));

    return () => clearInterval(interval);
  }, [launch]);

  const formatTime = (seconds) => {
    const isPast = seconds >= 0;
    const absSeconds = Math.abs(seconds);
    const d = Math.floor(absSeconds / (3600 * 24));
    const h = Math.floor((absSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((absSeconds % 3600) / 60);
    const s = absSeconds % 60;
    
    const sign = isPast ? 'T+' : 'T-';
    
    if (d > 0) return `${sign} ${d}d ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${sign} ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  
  if (loading) {
    return (
      <div className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-center px-4 py-3 min-h-[56px]">
        <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
      </div>
    );
  }

  if (!launch) return null;

  const isPast = timeDiff >= 0;

  return (
    <div className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between px-4 py-3 gap-4">
      <div className="flex items-center gap-6 overflow-x-auto w-full scrollbar-hide">
        
        {/* Phase Label */}
        <div className="flex items-center gap-2 shrink-0">
          <Activity className="w-4 h-4 text-[#c9a87c] animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Current Phase</span>
            <span className="text-sm font-semibold text-slate-200 truncate max-w-[200px]">{launch.status?.name || 'Scheduled'}</span>
          </div>
        </div>

        {/* Separator */}
        <div className="w-px h-8 bg-slate-800 hidden sm:block shrink-0"></div>

        {/* Time Counter */}
        <div className="flex items-center gap-2 shrink-0">
          <Clock className={`w-4 h-4 ${isPast ? 'text-sky-400' : 'text-amber-400'}`} />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{isPast ? 'Mission Elapsed Time' : 'Countdown to Launch'}</span>
            <span className={`text-sm font-mono font-bold ${isPast ? 'text-sky-400' : 'text-amber-400'}`}>{formatTime(timeDiff)}</span>
          </div>
        </div>

        {/* Separator */}
        <div className="w-px h-8 bg-slate-800 hidden sm:block shrink-0"></div>

        {/* Mission Name */}
        <div className="flex items-center gap-2 shrink-0">
          <Target className="w-4 h-4 text-emerald-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mission / Payload</span>
            <span className="text-sm font-mono font-bold text-emerald-400 truncate max-w-[250px]">{launch.mission?.name || launch.name.split('|')[1]?.trim() || launch.name}</span>
          </div>
        </div>

      </div>
    </div>
  );
}