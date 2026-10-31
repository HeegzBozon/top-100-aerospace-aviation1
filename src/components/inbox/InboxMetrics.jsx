// The dashboard across the head of the Inbox: one instrument per category, reading
// what is open, what is waiting on you, and what is done. A tile is also a filter.
export default function InboxMetrics({ bundles, items, states, filter, onFilter }) {
  const now = Date.now();
  const read = (key) => {
    const mine = items.filter((i) => i.bundle === key);
    const done = mine.filter((i) => states[i.key]?.done).length;
    const open = mine.length - done;
    const waiting = mine.filter((i) => !states[i.key]?.done && i.person
      && !(states[i.key]?.snoozed_until && new Date(states[i.key].snoozed_until).getTime() > now)).length;
    return { open, waiting, done };
  };
  return (
    <div className="-mx-2.5 mb-3 flex snap-x gap-1.5 overflow-x-auto px-2.5 md:mx-0 md:mb-4 md:grid md:grid-cols-5 md:px-0">
      {bundles.map((b) => {
        const m = read(b.key);
        const on = filter === b.key;
        return (
          <button key={b.key} onClick={() => onFilter(on ? 'all' : b.key)}
            className={`w-[92px] shrink-0 snap-start rounded border px-2 py-1.5 text-left md:w-auto md:py-2 transition-colors ${on ? 'border-editorial-copper bg-editorial-navy text-editorial-cream' : 'border-editorial-navy/15 bg-white text-editorial-navy'}`}>
            <p className={`text-[8.5px] font-bold uppercase tracking-[0.18em] ${on ? 'text-editorial-gold' : 'text-editorial-label'}`}>{b.label}</p>
            <p className="mt-0.5 font-heading text-xl leading-none md:text-2xl">{m.open}</p>
            <p className={`mt-1 font-body text-[10px] ${on ? 'text-editorial-cream/70' : 'text-editorial-navy/60'}`}>
              {m.waiting} on you · {m.done} done
            </p>
          </button>
        );
      })}
    </div>
  );
}