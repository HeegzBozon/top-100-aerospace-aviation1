import { useState } from 'react';
import { Pencil, Check, X, Loader2, Plus } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Inline-editable blurb. Empty state is a designed dashed pill that opens the editor;
// populated state shows the content with a subtle edit affordance.
export default function InlineBlurbField({ value, emptyLabel, accent, multiline = false, maxLength, onSave, children }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const start = () => { setDraft(value || ''); setEditing(true); };
  const cancel = () => { setEditing(false); setDraft(''); };
  const save = async () => {
    const v = (draft || '').trim().slice(0, maxLength || undefined);
    setSaving(true);
    try {
      await onSave(v);
      setEditing(false);
      setDraft('');
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    const Input = multiline ? 'textarea' : 'input';
    return (
      <div className="w-72 space-y-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={maxLength}
          rows={multiline ? 3 : undefined}
          autoFocus
          onKeyDown={(e) => {
            if (!multiline && e.key === 'Enter') { e.preventDefault(); save(); }
            if (e.key === 'Escape') { e.preventDefault(); cancel(); }
          }}
          placeholder={emptyLabel}
          className="text-sm bg-white text-left w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2"
          style={{ borderColor: B.border, color: B.navy }}
        />
        <div className="flex justify-end gap-2">
          <button onClick={cancel} disabled={saving} className="text-xs font-semibold uppercase tracking-[0.14em] flex items-center gap-1 hover:opacity-70" style={{ color: B.muted }}>
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60" style={{ background: B.navy }}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
          </button>
        </div>
      </div>
    );
  }

  // Populated — clickable content with a subtle edit affordance.
  if (value) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={start}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(); } }}
        className="group cursor-pointer inline-flex flex-col items-center gap-1 focus:outline-none"
      >
        {children}
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] opacity-50 md:opacity-0 md:group-hover:opacity-100 transition-opacity" style={{ color: accent }}>
          <Pencil className="w-2.5 h-2.5" /> Edit
        </span>
      </div>
    );
  }

  // Empty — designed dashed pill that opens the editor.
  return (
    <button onClick={start} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] hover:opacity-80" style={{ color: B.navy, border: `1px dashed ${accent}`, background: 'transparent' }}>
      <Plus className="w-3 h-3" style={{ color: accent }} /> {emptyLabel}
    </button>
  );
}