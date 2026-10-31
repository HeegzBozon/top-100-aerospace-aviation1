import { useEffect, useState } from 'react';
import { Check, Loader2, Pencil } from 'lucide-react';

// One line of the record, edited where it stands. The value reads as type until it
// is clicked; then it becomes a field that saves on Enter (Cmd+Enter for a
// paragraph), or on Save. Escape puts the old value back untouched.
export default function InlineDossierField({
  label,
  value,
  placeholder = '',
  multiline = false,
  maxLength,
  hint,
  validate,
  onSave,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(value || '');
  }, [value, editing]);

  useEffect(() => {
    if (!justSaved) return undefined;
    const timer = window.setTimeout(() => setJustSaved(false), 2200);
    return () => window.clearTimeout(timer);
  }, [justSaved]);

  const start = () => {
    setDraft(value || '');
    setError('');
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setError('');
    setDraft(value || '');
  };

  const commit = async () => {
    const next = draft.trim();
    if (next === (value || '').trim()) {
      cancel();
      return;
    }
    const problem = validate?.(next);
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(next);
      setEditing(false);
      setJustSaved(true);
    } catch {
      setError('That did not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
    if (event.key === 'Enter' && (!multiline || event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      commit();
    }
  };

  const fieldClass = multiline
    ? 'w-full resize-y border bg-white px-4 py-3 font-body text-[15px] leading-[1.8] text-editorial-navy outline-none focus:border-editorial-copper'
    : 'w-full border-b bg-transparent pb-2 font-heading text-xl text-editorial-navy outline-none focus:border-editorial-copper';

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-3">
        <p className="pd-label">{label}</p>
        <div className="flex items-center gap-2">
          {justSaved && (
            <span className="font-body text-[10px] uppercase tracking-[0.16em] text-editorial-copper">
              Saved
            </span>
          )}
          {!editing && (
            <button
              type="button"
              onClick={start}
              aria-label={`Edit ${label}`}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-editorial-navy/25 text-editorial-navy/60 transition-colors hover:border-editorial-copper hover:text-editorial-copper focus-visible:outline focus-visible:outline-2 focus-visible:outline-editorial-copper"
            >
              <Pencil className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="mt-2.5">
          {multiline ? (
            <textarea
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
              rows={5}
              maxLength={maxLength}
              placeholder={placeholder}
              className={fieldClass}
              style={{ borderColor: 'rgba(184,115,51,0.45)' }}
            />
          ) : (
            <input
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
              maxLength={maxLength}
              placeholder={placeholder}
              className={fieldClass}
              style={{ borderColor: 'rgba(184,115,51,0.45)' }}
            />
          )}

          {error ? (
            <p className="mt-1.5 font-body text-[11px] text-editorial-copper">{error}</p>
          ) : hint ? (
            <p className="mt-1.5 font-body text-[11px] text-editorial-navy/60">{hint}</p>
          ) : null}

          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={commit}
              disabled={saving}
              className="pd-acct-link !py-2 !text-[10px] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              {saving ? 'Saving' : 'Save'}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="font-body text-[10px] uppercase tracking-[0.16em] text-editorial-navy/60 transition-colors hover:text-editorial-copper"
            >
              Cancel
            </button>
            <span className="font-body text-[10px] tracking-[0.06em] text-editorial-navy/60">
              {multiline ? 'Cmd + Enter to save' : 'Enter to save'}
            </span>
          </div>
        </div>
      ) : (
        <button type="button" onClick={start} className="mt-1.5 block w-full text-left">
          {value ? (
            multiline ? (
              <span className="block whitespace-pre-line font-body text-[15px] leading-[1.85] text-editorial-navy/85">
                {value}
              </span>
            ) : (
              <span className="font-heading text-xl leading-snug text-editorial-navy">{value}</span>
            )
          ) : (
            <span className="font-body text-sm italic text-editorial-navy/60">{placeholder}</span>
          )}
        </button>
      )}
    </div>
  );
}