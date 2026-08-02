import { Link } from 'react-router-dom';
import { RadioTower, ArrowRight } from 'lucide-react';

const NAVY = '#07111f';
const NAVY_MID = '#1e3a5a';
const GOLD = '#c9a87c';
const GOLD_LIGHT = '#e8d4b8';
const CREAM = '#faf8f5';

export default function GroundControlFlagship() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>Flagship</span>
        <div className="h-px flex-1" style={{ background: `${GOLD}30` }} />
      </div>

      <div
        className="grid overflow-hidden rounded-3xl md:grid-cols-2"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_MID} 100%)`, border: `1px solid ${GOLD}25` }}
      >
        {/* Visual */}
        <div className="relative min-h-[260px] md:min-h-full">
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: `radial-gradient(circle at 50% 50%, ${GOLD}18 0%, transparent 60%)` }}
          />
          {/* concentric radar rings */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: `${80 + i * 70}px`,
                height: `${80 + i * 70}px`,
                border: `1px solid ${GOLD}${i === 0 ? 'aa' : '33'}`,
              }}
            />
          ))}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <RadioTower className="h-12 w-12" style={{ color: GOLD }} />
          </div>
        </div>

        {/* Copy */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ background: `${GOLD}18`, color: GOLD_LIGHT }}>
            Now Boarding
          </span>
          <h2 className="text-3xl md:text-4xl font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ground Control
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            The business communication platform built for aerospace shops. Channels, mission briefs, and real-time coordination — purpose-built for the people who build, fly, and service the machines.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              to="/ground-control"
              className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] transition-all hover:brightness-105"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: NAVY }}
            >
              Explore Ground Control
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <span
              className="inline-flex items-center rounded-full px-4 py-3 text-xs font-semibold text-white/50"
              style={{ border: `1px solid ${GOLD}30` }}
            >
              Software · Cohort access
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}