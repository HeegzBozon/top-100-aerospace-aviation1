import { useEffect, useState } from 'react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

const target = new Date('2026-09-01T00:00:00');

const read = () => {
  const d = Math.max(target.getTime() - Date.now(), 0);
  return [
    ['Days', Math.floor(d / 86400000)],
    ['Hours', Math.floor((d / 3600000) % 24)],
    ['Mins', Math.floor((d / 60000) % 60)],
    ['Secs', Math.floor((d / 1000) % 60)],
  ];
};

export default function SeasonCountdown({ accent }) {
  const [units, setUnits] = useState(read);

  useEffect(() => {
    const t = setInterval(() => setUnits(read()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: B.muted }}>
          Nominations close
        </p>
        <p className="text-[11px] font-semibold" style={{ color: accent }}>September 1, 2026</p>
      </div>

      <div className="flex items-baseline gap-3">
        {units.map(([label, value], i) => (
          <div key={label} className="flex items-baseline gap-3">
            {i > 0 && <span className="text-xl leading-none" style={{ color: `${B.navy}30` }}>:</span>}
            <div className="text-center">
              <div
                className="text-3xl sm:text-4xl leading-none tabular-nums"
                style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
              >
                {String(value).padStart(2, '0')}
              </div>
              <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em]" style={{ color: B.muted }}>
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}