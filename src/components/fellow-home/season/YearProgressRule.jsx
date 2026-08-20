import { useEffect, useState } from 'react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

function read() {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1).getTime();
  const end = new Date(year + 1, 0, 1).getTime();
  const elapsed = now.getTime() - start;
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return {
    year,
    percent: Math.min(Math.max(elapsed / (end - start), 0), 1) * 100,
    dayOfYear: Math.floor(elapsed / 86400000) + 1,
    totalDays: isLeap ? 366 : 365,
  };
}

export default function YearProgressRule({ accent }) {
  const [data, setData] = useState(read);

  useEffect(() => {
    const t = setInterval(() => setData(read()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: B.muted }}>
          {data.year} elapsed
        </p>
        <span
          className="text-2xl leading-none tabular-nums"
          style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
        >
          {data.percent.toFixed(1)}
          <span className="text-sm" style={{ color: accent }}>%</span>
        </span>
      </div>

      <div className="h-[3px] w-full rounded-full" style={{ background: `${B.navy}12` }}>
        <div className="h-full rounded-full" style={{ width: `${data.percent}%`, background: accent }} />
      </div>

      <p className="mt-2 text-[10px] font-semibold" style={{ color: B.muted }}>
        Day <span className="tabular-nums" style={{ color: B.navy }}>{data.dayOfYear}</span> of {data.totalDays}
      </p>
    </div>
  );
}