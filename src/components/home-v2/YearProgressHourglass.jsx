import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

function getYearProgress() {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1).getTime();
  const end = new Date(year + 1, 0, 1).getTime();
  const elapsed = now.getTime() - start;
  const total = end - start;
  const p = Math.min(Math.max(elapsed / total, 0), 1);
  const dayOfYear = Math.floor(elapsed / 86400000) + 1;
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return { p, dayOfYear, totalDays: isLeap ? 366 : 365, year };
}

export default function YearProgressHourglass() {
  const [data, setData] = useState(getYearProgress);

  useEffect(() => {
    const t = setInterval(() => setData(getYearProgress()), 80);
    return () => clearInterval(t);
  }, []);

  const percent = useMemo(() => data.p * 100, [data.p]);
  const topFill = 1 - data.p; // sand remaining up top
  const bottomFill = data.p; // sand accumulated below

  const sandDots = useMemo(() => Array.from({ length: 5 }, (_, i) => i), []);

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-[#c9a87c]/25 bg-[#07111f]/50 backdrop-blur-xl shadow-[0_0_40px_rgba(201,168,124,0.10)]">
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Hourglass visual */}
        <div className="relative h-[72px] w-[56px] shrink-0">
          <svg viewBox="0 0 56 72" className="h-full w-full drop-shadow-[0_0_10px_rgba(201,168,124,0.35)]">
            <defs>
              <clipPath id="yp-top">
                <polygon points="6,4 50,4 33,34 23,34" />
              </clipPath>
              <clipPath id="yp-bot">
                <polygon points="23,38 33,38 50,68 6,68" />
              </clipPath>
              <linearGradient id="yp-sand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8cf9e" />
                <stop offset="100%" stopColor="#c9a87c" />
              </linearGradient>
            </defs>

            {/* Hourglass frame */}
            <path
              d="M6 4 H50 L33 34 V38 L50 68 H6 L23 38 V34 Z"
              fill="none"
              stroke="#c9a87c"
              strokeWidth="1.6"
              strokeLinejoin="round"
              opacity="0.85"
            />

            {/* Top sand — depletes as year progresses */}
            <g clipPath="url(#yp-top)">
              <rect
                x="4"
                y="4"
                width="48"
                height={Math.max(30 * topFill, 0)}
                fill="url(#yp-sand)"
              />
            </g>

            {/* Bottom sand — accumulates as year progresses */}
            <g clipPath="url(#yp-bot)">
              <rect
                x="4"
                y={68 - Math.max(30 * bottomFill, 0)}
                width="48"
                height={Math.max(30 * bottomFill, 0)}
                fill="url(#yp-sand)"
              />
            </g>
          </svg>

          {/* Falling sand stream */}
          {data.p > 0.001 && data.p < 0.999 && (
            <div className="pointer-events-none absolute left-1/2 top-[46px] -translate-x-1/2">
              {sandDots.map((i) => (
                <motion.span
                  key={i}
                  className="absolute h-[2px] w-[2px] rounded-full bg-[#e8cf9e]"
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: [0, 18], opacity: [0, 1, 0] }}
                  transition={{
                    duration: 0.7,
                    repeat: Infinity,
                    delay: i * 0.14,
                    ease: 'easeIn',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Progress + meta */}
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c9a87c]">{data.year} Year Progress</span>
            </div>
            <span className="text-2xl font-bold tabular-nums text-white sm:text-3xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {percent.toFixed(2)}<span className="text-base text-[#c9a87c]">%</span>
            </span>
          </div>

          {/* Track */}
          <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-white/5">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #a38965, #c9a87c 30%, #e8cf9e 50%, #c9a87c 70%, #a38965)',
                backgroundSize: '300% 100%',
                boxShadow: '0 0 14px rgba(201,168,124,0.55)',
              }}
              initial={false}
              animate={{ width: `${percent}%`, backgroundPositionX: ['0%', '300%'] }}
              transition={{
                width: { duration: 0.12, ease: 'linear' },
                backgroundPositionX: { duration: 6, repeat: Infinity, ease: 'linear' },
              }}
            >
              {/* Seamless sand sheen — travels fully off-screen before looping */}
              <motion.div
                className="absolute inset-y-0 left-0 w-[40%] rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }}
                animate={{ x: ['-40%', '260%'] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>

          <div className="mt-1.5 flex items-center justify-between text-[10px] font-semibold text-white/45">
            <span>Jan 1</span>
            <span className="text-white/70">
              Day <span className="tabular-nums text-[#c9a87c]">{data.dayOfYear}</span> of {data.totalDays}
            </span>
            <span>Dec 31</span>
          </div>
        </div>
      </div>
    </div>
  );
}