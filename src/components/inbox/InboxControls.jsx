import { STAGES } from './inboxFunnel';

const time = (i) => new Date(i.at || 0).getTime();
export const SORTS = [
  { key: 'newest', label: 'Newest', compare: (a, b) => time(b) - time(a) },
  { key: 'oldest', label: 'Oldest', compare: (a, b) => time(a) - time(b) },
  { key: 'you', label: 'Needs you', compare: (a, b) => (b.person ? 1 : 0) - (a.person ? 1 : 0) || time(b) - time(a) },
];
const VIEW_LABEL = { inbox: 'Inbox', pinned: 'Pinned', done: 'Done' };

const Field = ({ label, value, onChange, children }) => (
  <label className="min-w-0 flex-1">
    <span className="pd-label block" style={{ fontSize: 8.5 }}>{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ fontSize: 13 }}
      className="mt-0.5 w-full rounded border border-editorial-navy/20 bg-white px-1.5 py-1.5 font-body text-editorial-navy">
      {children}
    </select>
  </label>
);

// View, stage or category, and order — three selects in one row.
export default function InboxControls({ views, view, setView, sort, setSort, filter, setFilter }) {
  return (
    <div className="mb-3 flex gap-1.5 md:mb-4">
      <Field label="View" value={view} onChange={setView}>
        {views.map((v) => <option key={v} value={v}>{VIEW_LABEL[v]}</option>)}
      </Field>
      <Field label="Show" value={filter} onChange={setFilter}>
        <option value="all">Whole funnel</option>
        {filter.startsWith('mix:') && <option value={filter}>Custom metric</option>}
        {STAGES.map((s) => (
          <optgroup key={s.key} label={s.label}>
            <option value={s.key}>All of {s.label.toLowerCase()}</option>
            {s.bundles.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}
          </optgroup>
        ))}
      </Field>
      <Field label="Sort" value={sort} onChange={setSort}>
        {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
      </Field>
    </div>
  );
}