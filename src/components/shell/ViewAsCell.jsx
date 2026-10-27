import { Eye, EyeOff } from 'lucide-react';

// The operator's lens, on the bar itself.
//
// An admin can stand in a visitor's place without giving up the session they are signed
// in with, and this is the key that does it: it reads as a lamp that is lit while the
// visitor's reading is on the glass, and it prints which reading is being looked at, so
// a Fellow is never in doubt about whose view they are seeing. It is drawn for an admin
// and for nobody else, and it is the one cell that answers to the record rather than to
// the reading.
export default function ViewAsCell({ viewingAsVisitor, onToggle }) {
  const label = viewingAsVisitor ? 'Visitor' : 'Fellow';

  return (
    <button
      role="menuitem"
      type="button"
      onClick={onToggle}
      data-open={viewingAsVisitor ? 'true' : 'false'}
      aria-pressed={viewingAsVisitor}
      aria-label={
        viewingAsVisitor
          ? 'Showing the visitor view — press to return to the Fellow view'
          : 'Showing the Fellow view — press to see the platform as a visitor'
      }
      title={
        viewingAsVisitor
          ? 'Viewing as a visitor (operator preview) — press to go back'
          : 'View as a visitor (operator preview)'
      }
      className="mb-cell flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2 text-[8px] font-bold uppercase tracking-[0.20em]"
      style={{ width: 58, color: viewingAsVisitor ? 'var(--mb-ink-strong)' : 'var(--mb-ink)' }}
    >
      {viewingAsVisitor ? (
        <EyeOff className="h-[13px] w-[13px] shrink-0" strokeWidth={1.8} />
      ) : (
        <Eye className="h-[13px] w-[13px] shrink-0" strokeWidth={1.8} />
      )}
      <span className="truncate">{label}</span>
    </button>
  );
}