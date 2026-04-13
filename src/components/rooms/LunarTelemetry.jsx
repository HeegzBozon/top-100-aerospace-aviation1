import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Thermometer, Zap, Droplets, Wind, Shield } from 'lucide-react';

const SYSTEMS = [
  { id: 'o2', label: 'O₂ SUPPLY', icon: Wind, value: 98.2, unit: '%', color: '#22c55e', target: 99.5 },
  { id: 'pwr', label: 'POWER', icon: Zap, value: 847, unit: 'kW', color: '#c9a87c', target: 1000 },
  { id: 'h2o', label: 'H₂O RECYC', icon: Droplets, value: 94.7, unit: '%', color: '#4a90b8', target: 100 },
  { id: 'temp', label: 'HAB TEMP', icon: Thermometer, value: 21.3, unit: '°C', color: '#7ecda0', target: 22 },
  { id: 'rad', label: 'RAD SHIELD', icon: Shield, value: 99.1, unit: '%', color: '#a78bfa', target: 100 },
  { id: 'crew', label: 'CREW VITAL', icon: Activity, value: 100, unit: '%', color: '#34d399', target: 100 },
];

function TelemetryGauge({ system }) {
  const [val, setVal] = useState(system.value);

  useEffect(() => {
    const iv = setInterval(() => {
      setVal(v => {
        const delta = (Math.random() - 0.48) * 0.3;
        return Math.min(system.target, Math.max(system.value - 2, +(v + delta).toFixed(1)));
      });
    }, 2000 + Math.random() * 3000);
    return () => clearInterval(iv);
  }, [system.value, system.target]);

  const pct = (val / system.target) * 100;
  const Icon = system.icon;

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
      <div className="flex items-center gap-1">
        <Icon className="w-3 h-3" style={{ color: system.color }} />
        <span className="text-[9px] font-bold tracking-[0.15em] text-white/40 uppercase">{system.label}</span>
      </div>
      <div className="relative w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: system.color }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-sm font-mono font-bold text-white">{val}</span>
        <span className="text-[9px] text-white/30 font-mono">{system.unit}</span>
      </div>
    </div>
  );
}

export default function LunarTelemetry() {
  const [missionClock, setMissionClock] = useState('');

  useEffect(() => {
    // Mission elapsed time from a fictional launch
    const launchDate = new Date('2026-04-10T14:33:00Z');
    const tick = () => {
      const elapsed = Date.now() - launchDate.getTime();
      const days = Math.floor(elapsed / 86400000);
      const hours = Math.floor((elapsed % 86400000) / 3600000);
      const mins = Math.floor((elapsed % 3600000) / 60000);
      const secs = Math.floor((elapsed % 60000) / 1000);
      setMissionClock(`T+${days}d ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #050d1a 0%, #0a1526 100%)' }}>
      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(201,168,124,0.3) 2px, rgba(201,168,124,0.3) 3px)' }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Mission clock */}
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="text-[9px] font-bold tracking-[0.2em] text-[#c9a87c]/60 uppercase">Mission Elapsed</div>
              <div className="text-sm font-mono font-bold text-white tracking-wider">{missionClock}</div>
            </div>
            <div className="h-6 w-px bg-white/10 mx-2 hidden md:block" />
            <div className="hidden md:block">
              <div className="text-[9px] font-bold tracking-[0.2em] text-[#c9a87c]/60 uppercase">Status</div>
              <div className="text-[11px] font-bold text-emerald-400 tracking-wider">ALL SYSTEMS NOMINAL</div>
            </div>
          </div>

          {/* System gauges */}
          <div className="flex items-center gap-4 md:gap-6 overflow-x-auto scrollbar-hide">
            {SYSTEMS.map(s => (
              <TelemetryGauge key={s.id} system={s} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom border glow */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9a87c]/30 to-transparent" />
    </div>
  );
}