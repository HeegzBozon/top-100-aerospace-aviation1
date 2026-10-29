import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

// One line of a checklist, written where it is read. It saves on Enter (or on
// leaving the field) and only when something actually changed, so a Fellow can read
// the whole list without writing a single no-op back to the record.
export default function ChecklistField({
  value,
  placeholder = '',
  multiline = false,
  maxLength,
  onSave,
}) {
  const [draft, setDraft] = useState(value || '');
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    setDraft(value || '');
  }, [value]);

  const commit = async () => {
    const next = draft.trim();
    if (next === String(value || '').trim()) return;
    setState('saving');
    setError('');
    try {
      await onSave(next);
      setState('saved');
      window.setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('idle');
      setError('That did not save. Try again.');
    }
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && (!multiline || event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  const fieldClass = multiline
    ? 'mt-2 w-full resize-y border bg-white px-3 py-2 font-body text-[13px] leading-relaxed text-editorial-navy outline-none placeholder:text-editorial-navy/35 focus:border-editorial-copper'
    : 'mt-2 w-full border-b bg-transparent pb-1.5 font-body text-[13.5px] text-editorial-navy outline-none placeholder:text-editorial-navy/35 focus:border-editorial-copper';

  return (
    <div>
      {multiline ? (
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
          rows={3}
          maxLength={maxLength}
          placeholder={placeholder}
          className={fieldClass}
          style={{ borderColor: 'rgba(184,115,51,0.4)' }}
          aria-label={placeholder}
        />
      ) : (
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
          maxLength={maxLength}
          placeholder={placeholder}
          className={fieldClass}
          style={{ borderColor: 'rgba(30,58,90,0.2)' }}
          aria-label={placeholder}
        />
      )}

      <div className="mt-1 flex h-4 items-center gap-1.5">
        {state === 'saving' && <Loader2 className="h-3 w-3 animate-spin text-editorial-copper" />}
        {state === 'saved' && (
          <>
            <Check className="h-3 w-3 text-editorial-copper" strokeWidth={3} />
            <span className="font-body text-[10px] uppercase tracking-[0.16em] text-editorial-copper">
              Saved
            </span>
          </>
        )}
        {error && <span className="font-body text-[10.5px] text-editorial-copper">{error}</span>}
      </div>
    </div>
  );
}