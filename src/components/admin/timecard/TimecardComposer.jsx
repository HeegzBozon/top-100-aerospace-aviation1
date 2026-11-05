import { useEffect, useState } from 'react';
import { FileUp, PenLine } from 'lucide-react';
import { TC } from '@/components/admin/timecard/timecardConfig';
import WorklogImport from '@/components/admin/timecard/WorklogImport';
import WorklogReview from '@/components/admin/timecard/WorklogReview';
import TimecardEntryForm from '@/components/admin/timecard/TimecardEntryForm';
import ClockOutForm from '@/components/admin/timecard/ClockOutForm';

const TABS = [
  ['import', 'Upload a log', FileUp],
  ['manual', 'Type the hours', PenLine],
];

// The desk's one sheet. What it opens on is the workflow that called it: the upload tray
// for a log read from elsewhere, the hours form when hours are typed, the receipt sheet for
// an expense, and the clock's own closing sheet when the shift is being handed in. A log
// that has been read is reviewed in the same sheet before anything is filed.
export default function TimecardComposer({
  entry = null,
  mode = 'import',
  punch = null,
  onClose,
  onSaveEntry,
  onSaveImported,
  onSaveClockOut,
}) {
  const editing = !!entry?.id;
  const [view, setView] = useState(() => {
    if (editing) return entry?.kind === 'expense' ? 'expense' : 'manual';
    return mode;
  });
  const [parsed, setParsed] = useState(null);
  const [duplicate, setDuplicate] = useState(null);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const label = editing
    ? 'Edit entry'
    : view === 'expense'
      ? 'Log an expense'
      : view === 'clockout'
        ? 'Clock out'
        : 'File a session';

  return (
    <>
      {/* A press anywhere off the sheet puts it away. */}
      <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-label={label}
        className="absolute left-0 right-0 z-40 top-[calc(100%+10px)] sm:left-auto sm:w-[min(660px,100%)]"
      >
        <div
          className="desk-plate max-h-[calc(100dvh-11rem)] overflow-y-auto p-3.5"
          style={{ boxShadow: '0 26px 60px -22px rgba(3,8,15,0.92), inset 0 0 0 1px rgba(184,115,51,0.45)' }}
        >
          {!editing && !['review', 'clockout', 'expense'].includes(view) && (
            <div className="mb-3 flex items-center gap-1.5">
              {TABS.map(([key, tabLabel, Glyph]) => (
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
                  <Glyph className="h-3 w-3" /> {tabLabel}
                </button>
              ))}
            </div>
          )}

          {view === 'review' && parsed ? (
            <WorklogReview bare initial={parsed} duplicate={duplicate} onCancel={onClose} onSave={onSaveImported} />
          ) : view === 'clockout' ? (
            <ClockOutForm punch={punch} onCancel={onClose} onSave={onSaveClockOut} />
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
            <TimecardEntryForm
              bare
              entry={entry}
              lockKind={editing ? null : view === 'expense' ? 'expense' : 'time'}
              onCancel={onClose}
              onSave={onSaveEntry}
            />
          )}
        </div>
      </div>
    </>
  );
}