import { motion } from 'framer-motion';
import { MODES } from './chamberModes';

// The "Hub-and-Spoke" filter — Explore / Participate / Accelerate / Consult.
// Replaces flat type chips with the four pillars of the aerospace chamber.
export default function ChamberModeRail({ mode, setMode, ritual, setRitual }) {
  const active = MODES.find((m) => m.key === mode) || MODES[0];

  return (
    <div className="w-full">
      {/* Mode switch */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {MODES.map((m) => {
          const isActive = m.key === mode;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`relative rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-all ${
                isActive ? 'text-[#07111f]' : 'border border-white/15 bg-white/5 text-white/55 hover:text-white'
              }`}
              style={isActive ? { background: `linear-gradient(135deg, ${m.accent}, #d8b98d)` } : {}}
            >
              {m.key}
            </button>
          );
        })}
      </div>

      {/* Active mode tagline */}
      <motion.p
        key={mode}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mt-3 max-w-xl text-center text-[11px] font-medium leading-5 text-white/45"
      >
        <span className="text-[#c9a87c]">{active.tag}.</span> {active.blurb}
      </motion.p>

      {/* Ritual refinement chips */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setRitual('All')}
          className={`rounded-full px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
            ritual === 'All' || !ritual ? 'bg-white/15 text-white' : 'border border-white/10 text-white/40 hover:text-white/70'
          }`}
        >
          All {active.key}
        </button>
        {active.rituals.map((r) => (
          <button
            key={r}
            onClick={() => setRitual(r)}
            className={`rounded-full px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
              ritual === r ? 'bg-[#c9a87c] text-[#07111f]' : 'border border-white/10 text-white/50 hover:text-white'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}