import { STAGES } from './inboxFunnel';

const WIDTH = ['w-full', 'w-[88%]', 'w-[76%]'];

// The dashboard drawn as a funnel: each stage a band narrower than the one above,
// each category a tile reading open, waiting on you, and done. A tile is a filter.
export default function InboxMetrics({ items, states, filter, onFilter }) {
  const now = Date.now();
  const read = (key) => {
    const mine = items.filter((i) => i.bundle === key);
    const done = mine.filter((i) => states[i.key]?.done).length;
    const waiting = mine.filter((i) => !states[i.key]?.done && i.person
      && !(states[i.key]?.snoozed_until && new Date(states[i.key].snoozed_until).getTime() > now)).length;
    return { open: mine.length - done, waiting, done };
  };
  return (
    <div className="mb-3 flex flex-col items-center gap-1 md:mb-4">
      {STAGES.map((s, i) => (
        <div key={s.key} className={`${WIDTH[i]} rounded border border-editorial-copper/30 bg-editorial-sand/50 p-1`}>
          <button onClick={() => onFilter(filter === s.key ? 'all' : s.key)}
            className={`mb-1 block w-full text-center text-[8.5px] font-bold uppercase tracking-[0.2em] ${filter === s.key ? 'text-editorial-copper' : 'text-editorial-label'}`}>
            {s.label}
          </button>
          <div className="flex gap-1">
            {s.bundles.map((b) => {
              const m = read(b.key);
              const on = filter === b.key;
              return (
                <button key={b.key} onClick={() => onFilter(on ? 'all' : b.key)}
                  className={`min-w-0 flex-1 rounded border px-1.5 py-1 text-center ${on ? 'border-editorial-copper bg-editorial-navy text-editorial-cream' : 'border-editorial-navy/15 bg-white text-editorial-navy'}`}>
                  <p className={`truncate text-[8px] font-bold uppercase tracking-[0.12em] ${on ? 'text-editorial-gold' : 'text-editorial-label'}`}>{b.label}</p>
                  <p className="font-heading text-lg leading-tight">{m.open}</p>
                  <p className={`truncate font-body text-[9px] ${on ? 'text-editorial-cream/70' : 'text-editorial-navy/60'}`}>{m.waiting} you · {m.done} done</p>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}