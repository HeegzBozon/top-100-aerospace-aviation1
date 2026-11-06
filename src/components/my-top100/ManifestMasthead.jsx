import { Check, Loader2, Pencil } from 'lucide-react';

// The head of the Manifest.
//
// The list is a publication, so its head is set like one: a small-caps label, a copper
// rule drawn the full measure, then the Fellow's own title for the list. The name is
// edited in place — never a modal — and the count sits in the margin of the rule.
export default function ManifestMasthead({
  listName,
  editing,
  onChange,
  onBeginEdit,
  onEndEdit,
  saving,
  count,
  note,
}) {
  return (
    <div className="pb-4">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-editorial-label">
          The Manifest
        </p>
        <p className="font-body text-[10px] uppercase tracking-[0.18em] text-editorial-navy/45 tabular-nums">
          {count} of 100
        </p>
      </div>

      <div className="mt-2 h-[2px] w-full bg-editorial-copper" />

      <div className="mt-3 flex items-center gap-2">
        {editing ? (
          <>
            <input
              autoFocus
              value={listName}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onEndEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onEndEdit();
                }
              }}
              maxLength={60}
              aria-label="Name of your Manifest"
              className="min-w-0 flex-1 border-b border-editorial-copper bg-transparent pb-1 font-heading text-2xl leading-tight text-editorial-navy outline-none sm:text-[28px]"
            />
            <button type="button" onClick={onEndEdit} aria-label="Save the name" className="shrink-0 p-1">
              <Check className="h-4 w-4 text-editorial-copper" />
            </button>
          </>
        ) : (
          <button type="button" onClick={onBeginEdit} className="flex min-w-0 items-center gap-2 text-left">
            <span className="truncate font-heading text-2xl leading-tight text-editorial-navy sm:text-[28px]">
              {listName}
            </span>
            <Pencil className="h-3.5 w-3.5 shrink-0 text-editorial-copper/60" aria-hidden="true" />
          </button>
        )}
        {saving && <Loader2 className="h-3 w-3 shrink-0 animate-spin text-editorial-navy/35" aria-hidden="true" />}
      </div>

      {note && (
        <p className="mt-2 max-w-lg font-body text-[11.5px] leading-relaxed text-editorial-navy/55">
          {note}
        </p>
      )}
    </div>
  );
}