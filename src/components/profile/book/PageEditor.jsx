import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const NAVY = '#1E3A5A';
const COPPER = '#B87333';
const CREAM = '#FAF8F5';
const LABEL = '#8F5C2C';

// Editing the page you are standing on.
//
// The sheet opened over the page itself, not in a form somewhere else: a Fellow reads
// their record, sees the line that is wrong, and writes it here. What it writes goes to
// the record the page was composed from, so the page that comes back is the same page,
// corrected — nothing is held in the book that the record does not say.
export default function PageEditor({ fields = [], onCancel, onSave }) {
  const [draft, setDraft] = useState(() =>
    Object.fromEntries(fields.map((field) => [field.key, field.value || '']))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await onSave(draft);
    } catch (e) {
      setError(e?.message || 'That did not save. Try again.');
      setSaving(false);
    }
  };

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col"
      style={{ background: CREAM, borderTop: `2px solid ${COPPER}` }}
      role="dialog"
      aria-label="Edit this page"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel?.();
        e.stopPropagation();
      }}
    >
      <div className="flex items-center justify-between px-5 pt-4">
        <p
          className="m-0"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 8,
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: LABEL,
          }}
        >
          Edit this page
        </p>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 9,
            letterSpacing: '0.16em',
            color: 'rgba(184,115,51,0.72)',
          }}
        >
          {fields.length > 1 ? `${fields.length} lines` : 'One line'}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-3">
        {fields.map((field) => {
          const value = draft[field.key] || '';
          return (
            <label key={field.key} className="flex min-h-0 flex-col gap-1">
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 8,
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: LABEL,
                }}
              >
                {field.label}
              </span>
              <textarea
                value={value}
                maxLength={field.max}
                rows={field.rows || 3}
                onChange={(e) => setDraft((d) => ({ ...d, [field.key]: e.target.value }))}
                className="w-full resize-none rounded-sm px-2 py-1.5 outline-none"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 11,
                  lineHeight: 1.6,
                  color: NAVY,
                  background: '#fff',
                  border: '1px solid rgba(30,58,90,0.22)',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 7.5,
                  letterSpacing: '0.1em',
                  color: 'rgba(30,58,90,0.45)',
                  alignSelf: 'flex-end',
                }}
              >
                {value.length} / {field.max}
              </span>
            </label>
          );
        })}

        {error ? (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 9,
              lineHeight: 1.5,
              color: '#9B2C2C',
              margin: 0,
            }}
          >
            {error}
          </p>
        ) : null}
      </div>

      <div
        className="flex flex-none items-center justify-end gap-2 px-5 pb-4 pt-2"
        style={{ borderTop: '1px solid rgba(184,115,51,0.28)' }}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-3 py-1.5"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: NAVY,
            background: 'transparent',
            border: '1px solid rgba(30,58,90,0.32)',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: CREAM,
            background: COPPER,
            border: `1px solid ${COPPER}`,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          {saving ? 'Saving' : 'Save page'}
        </button>
      </div>
    </div>
  );
}