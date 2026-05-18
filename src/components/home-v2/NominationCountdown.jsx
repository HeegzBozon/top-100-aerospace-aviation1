import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

const targetDate = new Date('2026-09-01T00:00:00');

function getTimeLeft() {
  const difference = Math.max(targetDate.getTime() - Date.now(), 0);
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function NominationCountdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const units = useMemo(() => [
    ['Days', timeLeft.days],
    ['Hours', timeLeft.hours],
    ['Mins', timeLeft.minutes],
    ['Secs', timeLeft.seconds],
  ], [timeLeft]);

  return (
    <div className="mt-7 max-w-2xl rounded-3xl border border-[#c9a87c]/30 bg-[#07111f]/60 backdrop-blur-xl shadow-[0_0_50px_rgba(201,168,124,0.15)]">
      {/* Header row */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/8">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c9a87c] animate-pulse" />
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c9a87c]">Nominations close</p>
        </div>
        <p className="text-xs font-semibold text-white/50">September 1, 2026</p>
      </div>

      {/* Countdown + CTA side by side */}
      <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
        {/* Timer blocks */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 flex-1">
          {units.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/8 px-1.5 py-2.5 text-center">
              <div className="text-lg font-bold text-white sm:text-2xl tabular-nums">{String(value).padStart(2, '0')}</div>
              <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">{label}</div>
            </div>
          ))}
        </div>

        {/* Nominate CTA */}
        <Link
          to="/nominate"
          className="group flex-shrink-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-center transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(201,168,124,0.5)]"
          style={{ background: 'linear-gradient(135deg, #c9a87c, #d4a96a)', minWidth: '90px' }}
        >
          <Star className="w-4 h-4 text-[#07111f]" />
          <span className="text-[11px] font-black uppercase tracking-widest text-[#07111f] leading-tight">Nominate<br />Now</span>
          <ArrowRight className="w-3 h-3 text-[#07111f] group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}