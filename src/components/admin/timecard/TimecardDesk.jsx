import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { TC } from '@/components/admin/timecard/timecardConfig';
import TimecardSummary from '@/components/admin/timecard/TimecardSummary';
import TimecardRow from '@/components/admin/timecard/TimecardRow';
import TimecardComposer from '@/components/admin/timecard/TimecardComposer';
import DeskPanelBar from '@/components/admin/desk/DeskPanelBar';

// The desk the platform's own hours and receipts are kept on: one ledger of time and
// expenses, filed against a project, settled through approval. Admin-only — the record
// is the operator's, not the membership's.
export default function TimecardDesk() {
  const [entries, setEntries] = useState([]);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  // One composer serves both ways in — typed by hand, or read out of a work log. It is
  // null when shut, and holds the entry being edited when it is open.
  const [composer, setComposer] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const page = await base44.entities.Timecard.filter({}, { sort: '-entry_date', limit: 200 });
      setEntries(page?.items || []);
      setState('ready');
    } catch (err) {
      setError(err?.message || 'The ledger could not be read.');
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (payload) => {
    const editing = composer?.entry;
    if (editing?.id) {
      const updated = await base44.entities.Timecard.update(editing.id, payload);
      setEntries((prev) => prev.map((e) => (e.id === editing.id ? { ...e, ...updated } : e)));
    } else {
      const created = await base44.entities.Timecard.create(payload);
      setEntries((prev) => [created, ...prev]);
    }
    setComposer(null);
  };

  // A reviewed session is filed once, carrying the clock times the log reported and the
  // split across the jobs inside it.
  const saveImported = async (payload) => {
    const created = await base44.entities.Timecard.create(payload);
    setEntries((prev) => [created, ...prev]);
    setComposer(null);
  };

  const remove = async (entry) => {
    if (!window.confirm(`Delete "${entry.description}"?`)) return;
    await base44.entities.Timecard.delete(entry.id);
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
  };

  const shown = useMemo(() => {
    if (filter === 'all') return entries;
    if (filter === 'worklog') return entries.filter((e) => e.source === 'worklog');
    return entries.filter((e) => e.kind === filter);
  }, [entries, filter]);

  const counts = useMemo(
    () => ({
      all: entries.length,
      time: entries.filter((e) => e.kind === 'time').length,
      expense: entries.filter((e) => e.kind === 'expense').length,
      worklog: entries.filter((e) => e.source === 'worklog').length,
    }),
    [entries],
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <DeskPanelBar label="Hours & Expenses" note={`${entries.length} filed`}>
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ border: '1px solid rgba(201,168,124,0.34)', color: '#dbe6ef' }}
          >
            <RefreshCw className="h-3 w-3" /> Re-read
          </button>
          {/* One key for the whole way in: the sheet it opens offers the work log and
              the blank entry side by side, rather than two buttons on the stripe. */}
          <button
            onClick={() => setComposer((open) => (open ? null : {}))}
            aria-expanded={!!composer}
            className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={
              composer
                ? { background: 'rgba(184,115,51,0.22)', border: '1px solid #b87333', color: '#f5efe4' }
                : { background: TC.copperDeep, border: '1px solid rgba(201,168,124,0.34)', color: '#fdf8f0' }
            }
          >
            <Plus className="h-3.5 w-3.5" /> New entry
          </button>
        </DeskPanelBar>

        {composer && (
          <TimecardComposer
            entry={composer.entry || null}
            onClose={() => setComposer(null)}
            onSaveEntry={save}
            onSaveImported={saveImported}
          />
        )}
      </div>

      <TimecardSummary entries={entries} />

      <div className="flex items-center gap-1.5">
        {[
          ['all', 'All'],
          ['time', 'Hours'],
          ['worklog', 'Sessions'],
          ['expense', 'Expenses'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
            style={
              filter === key
                ? { background: TC.copperDeep, color: '#fdf8f0' }
                : { background: 'transparent', color: TC.soft, border: `1px solid ${TC.line}` }
            }
          >
            {label} <span className="tabular-nums opacity-70">{counts[key]}</span>
          </button>
        ))}
      </div>

      {state === 'loading' && (
        <div className="flex items-center gap-2 rounded-xl px-3 py-6 text-sm" style={{ background: TC.surface, border: `1px solid ${TC.line}`, color: TC.soft }}>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Reading the ledger…
        </div>
      )}

      {state === 'error' && (
        <div className="rounded-xl px-3 py-5" style={{ background: TC.surface, border: `1px solid ${TC.line}` }}>
          <p className="flex items-center gap-2 text-sm" style={{ color: '#f2a1a1' }}>
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
          <button onClick={load} className="mt-2 text-xs underline" style={{ color: TC.gold }}>Try again</button>
        </div>
      )}

      {state === 'ready' && shown.length === 0 && (
        <div className="desk-plate px-4 py-10 text-center">
          <p className="font-heading text-base" style={{ color: '#f5efe4' }}>
            {entries.length ? 'Nothing filed under this filter.' : 'The logbook is empty.'}
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed" style={{ color: '#a3b8c9' }}>
            {entries.length
              ? 'Switch the filter, or file a new entry against the project it belongs to.'
              : 'File the first entry — hours worked, or a receipt that needs paying back.'}
          </p>
        </div>
      )}

      {state === 'ready' && shown.length > 0 && (
        <div className="space-y-2">
          {shown.map((entry) => (
            <TimecardRow key={entry.id} entry={entry} onEdit={(row) => setComposer({ entry: row })} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  );
}