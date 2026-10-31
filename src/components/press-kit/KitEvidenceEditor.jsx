import { Plus, X } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { kitInputClass } from './KitField';

// The record, edited line by line. A label and its evidence; an empty line is simply
// not printed, so nothing is padded out to look fuller than the Fellow's own record.
export default function KitEvidenceEditor({ rows, onChange }) {
  const set = (index, patch) => onChange(rows.map((row, n) => (n === index ? { ...row, ...patch } : row)));

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-bold uppercase tracking-[0.24em]" style={{ color: B.copper }}>
          The record
        </span>
        <button
          type="button"
          onClick={() => onChange([...rows, { label: '', detail: '' }])}
          className="inline-flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-[0.18em]"
          style={{ color: B.navy }}
        >
          <Plus className="h-3 w-3" />
          Add item
        </button>
      </div>
      <p className="mt-1 text-[10px] leading-relaxed" style={{ color: B.muted }}>
        A role, a credential, a contribution — only what you have submitted. An empty line does
        not print.
      </p>

      <div className="mt-2.5 space-y-2.5">
        {rows.map((row, index) => (
          <div
            key={index}
            className="rounded-lg p-2.5"
            style={{ border: `1px solid ${B.border}`, background: 'rgba(255,255,255,0.7)' }}
          >
            <div className="flex items-center gap-2">
              <input
                value={row.label || ''}
                onChange={(event) => set(index, { label: event.target.value })}
                placeholder="Senior Structures Engineer, Airbus"
                className={kitInputClass}
                style={{ border: `1px solid ${B.border}`, color: B.navy }}
              />
              <button
                type="button"
                onClick={() => onChange(rows.filter((_, n) => n !== index))}
                aria-label="Remove item"
                className="shrink-0 rounded-md p-1.5"
                style={{ color: B.muted }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <textarea
              rows={2}
              value={row.detail || ''}
              onChange={(event) => set(index, { detail: event.target.value })}
              placeholder="What the work delivered, in one or two lines."
              className={`${kitInputClass} mt-2 resize-y`}
              style={{ border: `1px solid ${B.border}`, color: B.navy }}
            />
          </div>
        ))}
        {!rows.length ? (
          <p className="text-[11px] italic" style={{ color: B.muted }}>
            No items yet. Add the first one above.
          </p>
        ) : null}
      </div>
    </div>
  );
}