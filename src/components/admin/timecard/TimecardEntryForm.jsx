import { useState } from 'react';
import { TC, CATEGORIES, STATUSES, today } from '@/components/admin/timecard/timecardConfig';
import RoomsWorkedField from '@/components/admin/timecard/RoomsWorkedField';

const FIELD =
  'w-full rounded-lg px-2.5 py-2 text-sm outline-none focus:ring-1';
const fieldStyle = {
  background: '#0e141b',
  border: `1px solid ${TC.line}`,
  color: TC.ink,
};

const blank = (kind = 'time') => ({
  kind,
  entry_date: today(),
  description: '',
  payee: '',
  project: '',
  category: kind === 'time' ? 'editorial' : 'other',
  hours: '',
  rate: '',
  amount: '',
  billable: true,
  reimbursable: false,
  status: 'draft',
  notes: '',
  event_title: '',
  rooms_worked: [],
});

// One sheet for both kinds of entry: the kind sets which figures are asked for, and
// what the sheet saves is what the record holds — times and money are kept in cents.
// `lockKind` holds the sheet to one kind, which is how the expense workflow logs a receipt
// on its own without offering to record hours instead.
export default function TimecardEntryForm({ entry = null, lockKind = null, onCancel, onSave, bare = false }) {
  const [form, setForm] = useState(() => {
    if (!entry) return blank(lockKind || 'time');
    return {
      ...blank(lockKind || entry.kind),
      ...entry,
      hours: entry.hours ?? '',
      rate: entry.rate_cents ? entry.rate_cents / 100 : '',
      amount: entry.amount_cents ? entry.amount_cents / 100 : '',
    };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // An expense is a receipt; the time side's fields are not carried across a switch.
      if (key === 'kind') {
        next.category = value === 'time' ? 'editorial' : 'other';
        next.hours = '';
        next.rate = '';
        next.amount = '';
      }
      return next;
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.description.trim()) {
      setError('Give the entry a description.');
      return;
    }
    setError('');
    setSaving(true);
    const hours = Number(form.hours) || 0;
    const rate = Number(form.rate) || 0;
    const amount = Number(form.amount) || 0;
    const payload = {
      kind: form.kind,
      entry_date: form.entry_date,
      description: form.description.trim(),
      payee: form.payee.trim(),
      project: form.project.trim(),
      category: form.category,
      hours: form.kind === 'time' ? hours : undefined,
      rate_cents: form.kind === 'time' ? Math.round(rate * 100) : undefined,
      amount_cents: form.kind === 'time' ? Math.round(hours * rate * 100) : Math.round(amount * 100),
      billable: !!form.billable,
      reimbursable: !!form.reimbursable,
      event_title: form.kind === 'time' ? form.event_title.trim() : '',
      rooms_worked:
        form.kind === 'time'
          ? (form.rooms_worked || [])
              .filter((room) => room.room_key)
              .map((room) => ({ room_key: room.room_key, minutes: Math.round(Number(room.minutes) || 0) }))
          : [],
      status: form.status,
      notes: form.notes.trim(),
    };
    try {
      await onSave(payload);
    } catch (err) {
      setError(err?.message || 'The entry could not be saved.');
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className={bare ? 'space-y-3' : 'rounded-xl p-3.5 space-y-3'}
      style={bare ? undefined : { background: TC.surface, border: `1px solid ${TC.copper}` }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: TC.gold }}>
          {entry
            ? 'Edit entry'
            : lockKind === 'expense'
              ? 'Log an expense'
              : 'Type the hours'}
        </p>
        <div className="flex items-center gap-1">
          {!lockKind && ['time', 'expense'].map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => set('kind')({ target: { value: kind } })}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors"
              style={
                form.kind === kind
                  ? { background: TC.copperDeep, color: '#fdf8f0' }
                  : { background: 'transparent', color: TC.soft, border: `1px solid ${TC.line}` }
              }
            >
              {kind === 'time' ? 'Hours' : 'Expense'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Date</span>
          <input type="date" value={form.entry_date} onChange={set('entry_date')} className={FIELD} style={fieldStyle} required />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Status</span>
          <select value={form.status} onChange={set('status')} className={FIELD} style={fieldStyle}>
            {STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Description</span>
          <input
            value={form.description}
            onChange={set('description')}
            className={FIELD}
            style={fieldStyle}
            placeholder={form.kind === 'time' ? 'Editing Issue 42, profile spread' : 'Flight to IAC, refundable fare'}
          />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>
            {form.kind === 'time' ? 'Worked by' : 'Paid to'}
          </span>
          <input value={form.payee} onChange={set('payee')} className={FIELD} style={fieldStyle} placeholder="Name" />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Project</span>
          <input value={form.project} onChange={set('project')} className={FIELD} style={fieldStyle} placeholder="Issue 42" />
        </label>

        {form.kind === 'time' ? (
          <>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Hours</span>
              <input type="number" step="0.25" min="0" value={form.hours} onChange={set('hours')} className={FIELD} style={fieldStyle} placeholder="0.00" />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Rate (per hour)</span>
              <input type="number" step="0.01" min="0" value={form.rate} onChange={set('rate')} className={FIELD} style={fieldStyle} placeholder="0.00" />
            </label>
          </>
        ) : (
          <>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Amount</span>
              <input type="number" step="0.01" min="0" value={form.amount} onChange={set('amount')} className={FIELD} style={fieldStyle} placeholder="0.00" />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Category</span>
              <select value={form.category} onChange={set('category')} className={FIELD} style={fieldStyle}>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
          </>
        )}

        <label className="flex items-center gap-2 text-xs" style={{ color: TC.ink }}>
          <input type="checkbox" checked={!!form.billable} onChange={set('billable')} />
          Billable
        </label>
        <label className="flex items-center gap-2 text-xs" style={{ color: TC.ink }}>
          <input
            type="checkbox"
            checked={!!form.reimbursable}
            onChange={set('reimbursable')}
            disabled={form.kind === 'time'}
          />
          Reimbursable
        </label>
      </div>

      {form.kind === 'time' && (
        <div className="space-y-2.5">
          <RoomsWorkedField
            rooms={form.rooms_worked}
            hours={form.hours}
            onChange={(rooms) => setForm((prev) => ({ ...prev, rooms_worked: rooms }))}
          />
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Event covered</span>
            <input
              value={form.event_title}
              onChange={set('event_title')}
              className={FIELD}
              style={fieldStyle}
              placeholder="Leave blank when the hours were not held for an event"
            />
          </label>
        </div>
      )}

      <label className="block">
        <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Note</span>
        <textarea value={form.notes} onChange={set('notes')} rows={2} className={FIELD} style={fieldStyle} />
      </label>

      {error && <p className="text-xs" style={{ color: '#f2a1a1' }}>{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="px-3.5 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
          style={{ background: TC.copperDeep, color: '#fdf8f0' }}
        >
          {saving
            ? 'Saving…'
            : entry
              ? 'Save changes'
              : lockKind === 'expense'
                ? 'File the expense'
                : 'Add hours'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-2 rounded-lg text-xs font-medium"
          style={{ background: 'transparent', color: TC.soft, border: `1px solid ${TC.line}` }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}