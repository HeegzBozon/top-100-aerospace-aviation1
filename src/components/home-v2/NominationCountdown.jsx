import { useEffect, useMemo, useState } from 'react';

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
    ['Minutes', timeLeft.minutes],
    ['Seconds', timeLeft.seconds],
  ], [timeLeft]);

  return (
    <div className="mt-7 max-w-2xl rounded-3xl border border-[#c9a87c]/25 bg-[#07111f]/55 p-4 backdrop-blur-xl shadow-[0_0_40px_rgba(201,168,124,0.12)] sm:p-5">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c9a87c]">Nominations close</p>
        <p className="text-sm font-semibold text-white/70">September 1, 2026</p>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {units.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/10 px-2 py-3 text-center">
            <div className="text-xl font-bold text-white sm:text-3xl">{String(value).padStart(2, '0')}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}