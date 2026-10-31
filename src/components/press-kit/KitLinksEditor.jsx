import { Plus, X } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { kitInputClass } from './KitField';

// Where a journalist is sent next. Only an address with a scheme is kept, so a printed
// link is always one that opens.
export default function KitLinksEditor({ rows, onChange }) {
  const set = (index, patch) => onChange(rows.map((row, n) => (n === index ? { ...row, ...patch } : row)));

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-bold uppercase tracking-[0.24em]" style={{ color: B.copper }}>
          Elsewhere
        </span>
        <button
          type="button"
          onClick={() => onChange([...rows, { label: '', url: '' }])}
          className="inline-flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-[0.18em]"
          style={{ color: B.navy }}
        >
          <Plus className="h-3 w-3" />
          Add link
        </button>
      </div>
      <p className="mt-1 text-[10px] leading-relaxed" style={{ color: B.muted }}>
        Profile, LinkedIn, website, published work. A line without an address is not printed.
      </p>

      <div className="mt-2.5 space-y-2.5">
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              value={row.label || ''}
              onChange={(event) => set(index, { label: event.target.value })}
              placeholder="LinkedIn"
              className={`${kitInputClass} w-28 shrink-0`}
              style={{ border: `1px solid ${B.border}`, color: B.navy }}
            />
            <input
              value={row.url || ''}
              onChange={(event) => set(index, { url: event.target.value })}
              placeholder="https://"
              inputMode="url"
              className={kitInputClass}
              style={{ border: `1px solid ${B.border}`, color: B.navy }}
            />
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, n) => n !== index))}
              aria-label="Remove link"
              className="shrink-0 rounded-md p-1.5"
              style={{ color: B.muted }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {!rows.length ? (
          <p className="text-[11px] italic" style={{ color: B.muted }}>
            No links yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}