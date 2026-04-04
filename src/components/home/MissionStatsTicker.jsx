import React, { useState, useEffect } from 'react';
import { Clock, Activity, Target } from 'lucide-react';

export default function MissionStatsTicker() {
  const [met, setMet] = useState(0);
  const [countdown, setCountdown] = useState(3600); // 1 hour to next milestone

  useEffect(() => {
    // Simulate Mission Elapsed Time (MET) starting from 48 hours ago
    const startTime = new Date().getTime() - 1000 * 60 * 60 * 48;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      setMet(Math.floor((now - startTime) / 1000));
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (d > 0) return `T+ ${d}d ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `T+ ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  
  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `T- ${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between px-4 py-3 gap-4">
      <div className="flex items-center gap-6 overflow-x-auto w-full scrollbar-hide">
        
        {/* Phase Label */}
        <div className="flex items-center gap-2 shrink-0">
          <Activity className="w-4 h-4 text-[#c9a87c] animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Current Phase</span>
            <span className="text-sm font-semibold text-slate-200">Translunar Injection</span>
          </div>
        </div>

        {/* Separator */}
        <div className="w-px h-8 bg-slate-800 hidden sm:block shrink-0"></div>

        {/* MET Counter */}
        <div className="flex items-center gap-2 shrink-0">
          <Clock className="w-4 h-4 text-sky-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mission Elapsed Time</span>
            <span className="text-sm font-mono font-bold text-sky-400">{formatTime(met)}</span>
          </div>
        </div>

        {/* Separator */}
        <div className="w-px h-8 bg-slate-800 hidden sm:block shrink-0"></div>

        {/* Milestone Countdown */}
        <div className="flex items-center gap-2 shrink-0">
          <Target className="w-4 h-4 text-emerald-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Next Milestone: Lunar Orbit</span>
            <span className="text-sm font-mono font-bold text-emerald-400">{formatCountdown(countdown)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}