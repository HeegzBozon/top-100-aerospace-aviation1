import { ShieldCheck, Users } from 'lucide-react';

// Which reading is on the glass.
//
// The monitor holds two ledgers of the same room: the community's own record, and the
// internal sets an administrator cast while walking the flow. They are never mixed — a
// baseline is only a baseline if nothing else is weighing inside it — so the operator has
// to be able to see which one they are standing in, and to change it, without opening a
// menu. Both counts are carried at all times, so the reading that is not on the glass is
// still legible from the one that is.
export default function ReadingSwitch({ mode, onMode, live = 0, test = 0 }) {
  const readings = [
    { key: 'live', label: 'Community', note: 'cast by Fellows', count: live, icon: Users },
    { key: 'internal', label: 'Test', note: 'admin sets, never scored', count: test, icon: ShieldCheck },
  ];

  return (
    <div role="group" aria-label="Which reading of the ledger" className="flex items-stretch gap-1.5">
      {readings.map((reading) => {
        const active = mode === reading.key;
        const Icon = reading.icon;
        return (
          <button
            key={reading.key}
            type="button"
            onClick={() => onMode(reading.key)}
            aria-pressed={active}
            className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left transition-colors ${
              active
                ? 'border-editorial-copper bg-editorial-navy'
                : 'border-editorial-navy/10 bg-white hover:border-editorial-copper/50'
            }`}
          >
            <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-editorial-gold' : 'text-editorial-navy/35'}`} />
            <span className="min-w-0 flex-1">
              <span
                className={`block truncate text-[9.5px] font-bold uppercase leading-tight tracking-[0.16em] ${
                  active ? 'text-editorial-cream' : 'text-editorial-navy'
                }`}
              >
                {reading.label}
              </span>
              <span
                className={`block truncate text-[7.5px] uppercase tracking-[0.1em] ${
                  active ? 'text-editorial-cream/60' : 'text-editorial-navy/40'
                }`}
              >
                {reading.note}
              </span>
            </span>
            <span
              className={`shrink-0 font-heading text-[13px] leading-none tabular-nums ${
                active ? 'text-editorial-cream' : 'text-editorial-navy/70'
              }`}
            >
              {(Number(reading.count) || 0).toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
}