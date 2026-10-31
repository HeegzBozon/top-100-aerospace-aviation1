import { B } from '@/components/fellow-home/fellowHomeConfig';

export const INQUIRY_FILTERS = [
  { key: 'all', label: 'All', query: {} },
  { key: 'new', label: 'New', query: { status: 'new' } },
  { key: 'open', label: 'In progress', query: { status: { $in: ['opened', 'responded'] } } },
  { key: 'done', label: 'Closed', query: { status: { $in: ['closed', 'declined'] } } },
];

// The inbox's sorting tabs: one tap narrows the desk to where each enquiry stands.
export default function InquiryFilters({ active, counts, onChange }) {
  return (
    <div className="mt-3 flex gap-1.5 overflow-x-auto">
      {INQUIRY_FILTERS.map((f) => {
        const on = f.key === active;
        return (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            className="flex-none rounded-full px-3 py-1.5 text-[10.5px] font-semibold tracking-[0.06em] transition"
            style={on ? { background: B.navy, color: '#FAF8F5' } : { border: `1px solid ${B.border}`, color: B.navy, background: '#fff' }}
          >
            {f.label}{counts?.[f.key] ? ` · ${counts[f.key]}` : ''}
          </button>
        );
      })}
    </div>
  );
}