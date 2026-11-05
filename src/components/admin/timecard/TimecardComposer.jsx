import { useEffect, useState } from 'react';
import { ClipboardPaste, PenLine } from 'lucide-react';
import { TC } from '@/components/admin/timecard/timecardConfig';
import WorklogImport from '@/components/admin/timecard/WorklogImport';
import WorklogReview from '@/components/admin/timecard/WorklogReview';
import TimecardEntryForm from '@/components/admin/timecard/TimecardEntryForm';

const TABS = [
  ['import', 'From a work log', ClipboardPaste],
  ['manual', 'Type it in', PenLine],
];

// The desk's one composer: a sheet floated under the panel stripe, in which an entry is
// either read out of a work log or typed straight in — and, once a log has been read,
// reviewed as the same sheet before it is filed. Nothing here writes to the ledger; the
// reviewed draft is handed back to the desk to file.
export default function TimecardComposer({ entry = null, onClose, onSaveEntry, onSaveImported }) {
  const editing = !!entry?.id;
  const [view, setView] = useState(editing ? 'manual' : 'import');
  const [parsed, setParsed] = useState(null);
  const [duplicate, setDuplicate] = useState(null);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      {/* A press anywhere off the sheet puts it away. */}
      <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-label={editing ? 'Edit entry' : 'File an entry'}
        className="absolute left-0 right-0 z-40 top-[calc(100%+10px)] sm:left-auto sm:w-[min(660px,100%)]"
      >
        <div
          className="desk-plate max-h-[calc(100dvh-11rem)] overflow-y-auto p-3.5"
          style={{ boxShadow: '0 26px 60px -22px rgba(3,8,15,0.92), inset 0 0 0 1px rgba(184,115,51,0.45)' }}
        >
          {!editing && view !== 'review' && (
            <div className="mb-3 flex items-center gap-1.5">
              {TABS.map(([key, label, Glyph]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  aria-pressed={view === key}
                  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors"
                  style={
                    view === key
                      ? { background: TC.copperDeep, color: '#fdf8f0' }
                      : { color: '#c6d6e3', border: `1px solid ${TC.line}` }
                  }
                >
                  <Glyph className="h-3 w-3" /> {label}
                </button>
              ))}
            </div>
          )}

          {view === 'review' && parsed ? (
            <WorklogReview
              bare
              initial={parsed}
              duplicate={duplicate}
              onCancel={onClose}
              onSave={onSaveImported}
            />
          ) : view === 'import' ? (
            <WorklogImport
              bare
              onCancel={onClose}
              onParsed={(worklog, match) => {
                setParsed(worklog);
                setDuplicate(match);
                setView('review');
              }}
            />
          ) : (
            <TimecardEntryForm bare entry={entry} onCancel={onClose} onSave={onSaveEntry} />
          )}
        </div>
      </div>
    </>
  );
}