import { Check, Loader2, Pencil } from 'lucide-react';

// The head of the Manifest.
//
// Set like the masthead of a publication: a copper rule struck across the top of a sand
// plate, the count in the plate's margin, and the Fellow's own title for the list beneath it
// at heading size. The name is edited in place — never a modal — and the plate opens
// straight into the line below it, so the head and its clock read as one piece rather than
// as two bands stacked on a page.
export default function ManifestMasthead({
  listName,
  editing,
  onChange,
  onBeginEdit,
  onEndEdit,
  saving,
  count,
}) {
  return (
    <div className="relative overflow-hidden border border-b-0 border-editorial-copper/30 bg-editorial-sand/50 px-4 pb-3.5 pt-3.5">
      <span className="absolute inset-x-0 top-0 h-[2px] bg-editorial-copper" aria-hidden="true" />

      <div className="flex items-baseline justify-between gap-3">
        <p className="font-body text-[9px] uppercase tracking-[0.2em] text-editorial-navy/40 tabular-nums">
          <span className="font-heading text-[13px] leading-none text-editorial-navy/70">{count}</span> of 100
        </p>
        {saving && (
          <Loader2 className="h-3 w-3 shrink-0 animate-spin text-editorial-navy/35" aria-hidden="true" />
        )}
      </div>

      <div className="mt-1.5 flex items-center gap-2">
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
              className="min-w-0 flex-1 border-b border-editorial-copper bg-transparent pb-1 font-heading text-[24px] leading-tight tracking-[-0.01em] text-editorial-navy outline-none sm:text-[28px]"
            />
            <button type="button" onClick={onEndEdit} aria-label="Save the name" className="shrink-0 p-1">
              <Check className="h-4 w-4 text-editorial-copper" />
            </button>
          </>
        ) : (
          <button type="button" onClick={onBeginEdit} className="group flex min-w-0 items-center gap-2 text-left">
            <span className="truncate font-heading text-[24px] leading-[1.1] tracking-[-0.01em] text-editorial-navy sm:text-[28px]">
              {listName}
            </span>
            <Pencil
              className="h-3 w-3 shrink-0 text-editorial-copper/45 transition-colors group-hover:text-editorial-copper group-focus-visible:text-editorial-copper"
              aria-hidden="true"
            />
          </button>
        )}
      </div>
    </div>
  );
}