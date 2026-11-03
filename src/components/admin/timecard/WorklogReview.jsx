import { useState } from 'react';
import { AlertTriangle, Clock, Plus, Trash2 } from 'lucide-react';
import { CATEGORIES, STATUSES, TC } from '@/components/admin/timecard/timecardConfig';
import {
  hoursFromMinutes,
  minutesLabel,
  payloadOf,
  rangeLabel,
  reviewOf,
  splitMinutes,
} from '@/components/admin/timecard/worklogConfig';

const FIELD = 'w-full rounded-lg px-2.5 py-2 text-sm outline-none focus:ring-1';
const fieldStyle = { background: '#0e141b', border: `1px solid ${TC.line}`, color: TC.ink };
const label = { color: TC.soft };

function Field({ title, children, span = false }) {
  return (
    <label className={`block${span ? ' sm:col-span-2' : ''}`}>
      <span className="text-[10px] uppercase tracking-wider" style={label}>{title}</span>
      {children}
    </label>
  );
}

// The reviewed reading of a log, before it is filed. The elapsed figure the source
// reported sits apart from the split across the jobs, and every job says whether its
// minutes came from the log or were allocated across the session.
export default function WorklogReview({ initial, duplicate, onCancel, onSave }) {
  const [review, setReview] = useState(() => reviewOf(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setReview((prev) => ({ ...prev, [key]: value }));
  };

  const setTask = (index, key, value) =>
    setReview((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => (i === index ? { ...task, [key]: value } : task)),
    }));

  const addTask = () =>
    setReview((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { label: '', minutes: 0, estimated: true, note: '' }],
    }));

  const dropTask = (index) =>
    setReview((prev) => ({ ...prev, tasks: prev.tasks.filter((_, i) => i !== index) }));

  const reported = Math.round(Number(review.duration_minutes) || 0);
  const split = splitMinutes(review);
  const drift = split - reported;

  const submit = async (event) => {
    event.preventDefault();
    if (!review.description.trim()) {
      setError('Give the session its one-line description.');
      return;
    }
    if (reported <= 0) {
      setError('Give the session its duration in minutes, as the log reported it.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave(payloadOf(review));
    } catch (err) {
      setError(err?.message || 'The session could not be filed.');
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-xl p-3.5 space-y-3"
      style={{ background: TC.surface, border: `1px solid ${TC.copper}` }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: TC.gold }}>
          Review imported session
        </p>
        <p className="text-[10px]" style={{ color: TC.soft }}>
          {review.source_label || 'Work log'}
          {initial?.confidence ? ` · read with ${initial.confidence} confidence` : ''}
        </p>
      </div>

      {duplicate && (
        <p className="flex items-start gap-2 rounded-lg px-2.5 py-2 text-[11px]" style={{ background: 'rgba(201,168,124,0.10)', color: TC.gold }}>
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          This session looks like one already on the ledger — {duplicate.description} ({duplicate.status}). File it
          only if it is genuinely a second sitting.
        </p>
      )}

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Field title="Session date">
          <input type="date" value={review.session_date} onChange={set('session_date')} className={FIELD} style={fieldStyle} required />
        </Field>
        <Field title="Status">
          <select value={review.status} onChange={set('status')} className={FIELD} style={fieldStyle}>
            {STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </Field>
        <Field title="Started">
          <input type="time" value={review.start_time} onChange={set('start_time')} className={FIELD} style={fieldStyle} />
        </Field>
        <Field title="Ended">
          <input type="time" value={review.end_time} onChange={set('end_time')} className={FIELD} style={fieldStyle} />
        </Field>

        <Field title="Worked by">
          <input value={review.payee} onChange={set('payee')} className={FIELD} style={fieldStyle} placeholder="Name" />
        </Field>
        <Field title="Project">
          <input value={review.project} onChange={set('project')} className={FIELD} style={fieldStyle} placeholder="Issue 42" />
        </Field>

        <Field title="Elapsed time (minutes, as logged)">
          <input
            type="number"
            min="0"
            step="1"
            value={review.duration_minutes}
            onChange={set('duration_minutes')}
            className={FIELD}
            style={fieldStyle}
          />
        </Field>
        <Field title="Hours filed">
          <div className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm tabular-nums" style={{ ...fieldStyle, color: TC.gold }}>
            <span>{hoursFromMinutes(reported).toFixed(2)}</span>
            <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>
              {rangeLabel(review.start_time, review.end_time) || 'wall clock'}
            </span>
          </div>
        </Field>

        <Field title="Description" span>
          <input
            value={review.description}
            onChange={set('description')}
            className={FIELD}
            style={fieldStyle}
            placeholder="What the session did, in one line"
          />
        </Field>

        <Field title="Category">
          <select value={review.category} onChange={set('category')} className={FIELD} style={fieldStyle}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </Field>
        <Field title="Rate (per hour)">
          <input type="number" step="0.01" min="0" value={review.rate} onChange={set('rate')} className={FIELD} style={fieldStyle} placeholder="0.00" />
        </Field>

        <label className="flex items-center gap-2 text-xs" style={{ color: TC.ink }}>
          <input type="checkbox" checked={!!review.billable} onChange={set('billable')} />
          Billable
        </label>
        <Field title="Timezone">
          <input value={review.timezone} onChange={set('timezone')} className={FIELD} style={fieldStyle} placeholder="America/Los_Angeles" />
        </Field>
      </div>

      <div className="rounded-lg px-2.5 py-2" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${TC.line}` }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>
            <Clock className="h-3 w-3" /> Source reported {minutesLabel(reported)}
          </p>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: drift === 0 ? '#7ec89a' : TC.gold }}>
            Task split {minutesLabel(split)}
            {drift !== 0 ? ` · ${drift > 0 ? '+' : '−'}${minutesLabel(Math.abs(drift))} ${drift > 0 ? 'over' : 'unallocated'}` : ''}
          </p>
        </div>
        <p className="mt-1 text-[10px] leading-snug" style={{ color: '#4e677d' }}>
          The elapsed figure is what the log clocked. The split below distributes it across the jobs and is an
          allocation, not a second measurement.
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Jobs inside the session</p>
          <button
            type="button"
            onClick={addTask}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: TC.gold, border: `1px solid ${TC.line}` }}
          >
            <Plus className="h-3 w-3" /> Add job
          </button>
        </div>

        {review.tasks.length === 0 && (
          <p className="rounded-lg px-2.5 py-3 text-[11px]" style={{ color: TC.soft, border: `1px dashed ${TC.line}` }}>
            No jobs were read out of this log. Add them here, or file the session as one block of hours.
          </p>
        )}

        {review.tasks.map((task, index) => (
          <div key={index} className="flex flex-wrap items-center gap-1.5">
            <input
              value={task.label}
              onChange={(event) => setTask(index, 'label', event.target.value)}
              className={`${FIELD} min-w-0 flex-1`}
              style={fieldStyle}
              placeholder="What was done"
            />
            <input
              type="number"
              min="0"
              step="1"
              value={task.minutes}
              onChange={(event) => setTask(index, 'minutes', event.target.value)}
              className={`${FIELD} w-20`}
              style={fieldStyle}
              title="Minutes for this job"
            />
            <button
              type="button"
              onClick={() => setTask(index, 'estimated', !task.estimated)}
              title={task.estimated ? 'Allocated across the session — the log gave no time for this job' : 'Taken from the log itself'}
              className="rounded-md px-2 py-1 text-[9px] font-bold uppercase tracking-wider"
              style={
                task.estimated
                  ? { color: TC.soft, border: `1px solid ${TC.line}` }
                  : { color: '#0b1219', background: TC.gold }
              }
            >
              {task.estimated ? 'est.' : 'logged'}
            </button>
            <button
              type="button"
              onClick={() => dropTask(index)}
              title="Remove job"
              className="rounded-md p-1.5 hover:bg-white/10"
              style={{ color: TC.soft }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <Field title="Deliverables (one per line)">
        <textarea value={review.deliverables} onChange={set('deliverables')} rows={3} className={FIELD} style={fieldStyle} />
      </Field>

      <Field title="Note">
        <textarea value={review.notes} onChange={set('notes')} rows={2} className={FIELD} style={fieldStyle} />
      </Field>

      {review.source_text && (
        <details className="rounded-lg px-2.5 py-2" style={{ border: `1px solid ${TC.line}` }}>
          <summary className="cursor-pointer text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>
            Original log, kept with the session
          </summary>
          <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed" style={{ color: '#8ba4ba' }}>
            {review.source_text}
          </pre>
        </details>
      )}

      {error && <p className="text-xs" style={{ color: '#f2a1a1' }}>{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg px-3.5 py-2 text-xs font-semibold disabled:opacity-50"
          style={{ background: TC.copper, color: '#fff' }}
        >
          {saving ? 'Filing…' : 'File session'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3.5 py-2 text-xs font-medium"
          style={{ background: 'transparent', color: TC.soft, border: `1px solid ${TC.line}` }}
        >
          Discard
        </button>
      </div>
    </form>
  );
}