import { useEffect, useMemo, useState } from 'react';

// Live countdown to a target date. Returns {days,hours,mins,secs,done}.
export function useCountdown(targetIso) {
  const target = useMemo(() => (targetIso ? new Date(targetIso).getTime() : null), [targetIso]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (target == null) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);

  if (target == null) return { days: 0, hours: 0, mins: 0, secs: 0, done: false };
  const diff = Math.max(target - now, 0);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    mins: Math.floor((diff / 60000) % 60),
    secs: Math.floor((diff / 1000) % 60),
    done: diff <= 0,
  };
}

export function pad(n) {
  return String(n).padStart(2, '0');
}