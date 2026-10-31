const time = (i) => new Date(i.at || 0).getTime();
export const SORTS = [
  { key: 'newest', label: 'Newest', compare: (a, b) => time(b) - time(a) },
  { key: 'oldest', label: 'Oldest', compare: (a, b) => time(a) - time(b) },
  { key: 'you', label: 'Needs you', compare: (a, b) => (b.person ? 1 : 0) - (a.person ? 1 : 0) || time(b) - time(a) },
];

const chip = (on) => `shrink-0 rounded-full border px-2.5 py-1 font-body md:px-3 text-[11px] font-semibold uppercase tracking-[0.12em] ${on ? 'border-editorial-navy bg-editorial-navy text-editorial-cream' : 'border-editorial-navy/20 text-editorial-navy'}`;

// The sub-inbox controls: which pile (Inbox / Pinned / Done), which category, and the order.
export default function InboxControls({ views, view, setView, sort, setSort, bundles, filter, setFilter }) {
  return (
    <div className="mb-3 space-y-2 md:mb-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {views.map((v) => <button key={v} onClick={() => setView(v)} className={chip(view === v)}>{v}</button>)}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort"
          className="rounded border border-editorial-navy/20 bg-white px-2 py-1 font-body text-xs text-editorial-navy" style={{ fontSize: 12 }}>
          {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1">
        <button onClick={() => setFilter('all')} className={chip(filter === 'all')}>All</button>
        {bundles.map((b) => <button key={b.key} onClick={() => setFilter(b.key)} className={chip(filter === b.key)}>{b.label}</button>)}
      </div>
    </div>
  );
}