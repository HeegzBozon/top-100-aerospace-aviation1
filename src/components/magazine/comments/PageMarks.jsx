import { Bookmark, X } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// The reader's ribbons, kept in the same margin as their notes.
//
// The key in the foot band marks the spread under the reader in one press; this is the
// list behind it — every mark in the issue's own page order, and the way back to any of
// them. Nothing here is shared with anybody else.
export default function PageMarks({ marks = [], markedHere, onToggleMark, onGoTo, onDrop }) {
  return (
    <div>
      <button
        onClick={onToggleMark}
        className="flex h-9 w-full items-center justify-center gap-2 rounded-full text-[9px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-90"
        style={{
          background: markedHere ? 'transparent' : P.copper,
          border: markedHere ? '1px solid rgba(201,168,124,0.55)' : '1px solid transparent',
          color: markedHere ? P.gold : P.cream,
        }}
        aria-pressed={markedHere}
      >
        <Bookmark className="h-3.5 w-3.5" fill={markedHere ? P.gold : 'none'} />
        {markedHere ? 'Remove this spread’s mark' : 'Mark this spread'}
      </button>

      <p className="mb-2 mt-7 text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: P.gold }}>
        Marked spreads
      </p>

      {marks.length ? (
        <div className="space-y-1">
          {marks.map((mark) => (
            <div key={mark.page} className="flex items-center gap-1 rounded-lg hover:bg-white/5">
              <button onClick={() => onGoTo(mark.page)} className="min-w-0 flex-1 px-3 py-2 text-left">
                <p className="truncate text-sm" style={{ color: P.cream }}>
                  {mark.label || 'Marked spread'}
                </p>
                <p className="mt-0.5 text-[10px]" style={{ color: 'rgba(250,248,245,0.4)' }}>
                  Page {String(mark.page + 1).padStart(2, '0')}
                </p>
              </button>
              <button
                onClick={() => onDrop(mark.page)}
                className="mr-1 rounded-full p-1.5 transition-colors hover:bg-white/10"
                aria-label={`Remove the bookmark on page ${mark.page + 1}`}
              >
                <X className="h-3 w-3" style={{ color: 'rgba(250,248,245,0.5)' }} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-3 text-[11px] leading-relaxed" style={{ color: 'rgba(250,248,245,0.42)' }}>
          Nothing marked yet. The ribbon in the foot band marks the spread you are reading.
        </p>
      )}
    </div>
  );
}