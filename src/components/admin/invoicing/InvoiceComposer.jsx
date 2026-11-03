import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Sparkles, Trash2, Wand2 } from 'lucide-react';
import { INV, addDaysISO, itemCents, money, todayISO, totalsOf } from '@/components/admin/invoicing/invoiceConfig';

const FIELD = 'w-full rounded-lg px-2.5 py-2 text-sm outline-none';
const STYLE = { background: INV.raised, border: `1px solid ${INV.line}`, color: INV.ink };

const SCHEMA = {
  type: 'object',
  properties: {
    client_name: { type: 'string' },
    client_company: { type: 'string' },
    client_email: { type: 'string' },
    project: { type: 'string' },
    issue_date: { type: 'string' },
    due_terms_days: { type: 'number' },
    tax_rate: { type: 'number' },
    memo: { type: 'string' },
    line_items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          description: { type: 'string' },
          quantity: { type: 'number' },
          unit_price: { type: 'number' },
        },
        required: ['description', 'quantity', 'unit_price'],
      },
    },
  },
  required: ['client_name', 'line_items'],
};

const buildPrompt = (notes) => `You are the billing clerk for TOP 100 Aerospace & Aviation, a professional membership and editorial platform.

Convert the note below into one invoice, filling the structured fields.

Rules:
- Bill only for work or amounts the note clearly states. Never invent line items, clients, rates or figures.
- Describe each line the way the note describes it, in sentence case, without a trailing period.
- quantity is the number of units billed (hours, days, items). For a lump sum use quantity 1 and the sum as unit_price.
- unit_price is in whole US dollars, for example 450.5.
- issue_date is YYYY-MM-DD. When the note gives no date, use ${todayISO()}.
- due_terms_days is the payment window in days. Use 14 when the note does not say.
- tax_rate is a percentage number, and 0 when the note does not mention tax.
- client_email is only the address the note gives, else an empty string.
- memo is one short sentence the client should read under the total, such as the work the bill covers.

Note:
"""
${notes}
"""`;

const blankForm = () => ({
  client_name: '',
  client_company: '',
  client_email: '',
  project: '',
  issue_date: todayISO(),
  due_date: addDaysISO(14),
  tax_rate: 0,
  memo: '',
});

const toRows = (items) =>
  (items || []).map((item) => ({
    description: item.description || '',
    quantity: String(item.quantity ?? 1),
    price: ((item.unit_price_cents || 0) / 100).toFixed(2),
  }));

// The composer: notes on the left of the work, the bill they become on the right. Writing
// plain notes and pressing compose is the whole shortcut; every field stays editable,
// because an invoice is a document the house signs, not a guess at one.
export default function InvoiceComposer({ initial = null, invoiceNumber, onCancel, onSave }) {
  const [notes, setNotes] = useState(initial?.source_notes || '');
  const [form, setForm] = useState(() =>
    initial
      ? {
          client_name: initial.client_name || '',
          client_company: initial.client_company || '',
          client_email: initial.client_email || '',
          project: initial.project || '',
          issue_date: initial.issue_date || todayISO(),
          due_date: initial.due_date || addDaysISO(14),
          tax_rate: initial.tax_rate || 0,
          memo: initial.memo || '',
        }
      : blankForm(),
  );
  const [rows, setRows] = useState(() =>
    initial ? toRows(initial.line_items) : [{ description: '', quantity: '1', price: '' }],
  );
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const setRow = (index, key, value) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

  const addRow = () =>
    setRows((prev) => [...prev, { description: '', quantity: '1', price: '' }]);

  const dropRow = (index) => setRows((prev) => prev.filter((_, i) => i !== index));

  const asItems = () =>
    rows
      .filter((row) => row.description.trim() || Number(row.price))
      .map((row) => ({
        description: row.description.trim(),
        quantity: Number(row.quantity) || 0,
        unit_price_cents: Math.round((Number(row.price) || 0) * 100),
      }));

  const totals = totalsOf(asItems(), form.tax_rate);

  const compose = async () => {
    if (!notes.trim()) {
      setError('Write the notes first: who it is for, what was done, and what it is worth.');
      return;
    }
    setError('');
    setParsing(true);
    try {
      const draft = await base44.integrations.Core.InvokeLLM({
        prompt: buildPrompt(notes),
        response_json_schema: SCHEMA,
      });
      const days = Number(draft.due_terms_days) || 14;
      const issued = draft.issue_date || todayISO();
      const issuedDate = new Date(`${issued}T12:00:00`);
      const due = Number.isNaN(issuedDate.getTime())
        ? addDaysISO(days)
        : new Date(issuedDate.getTime() + days * 86400000).toISOString().slice(0, 10);
      setForm({
        client_name: draft.client_name || '',
        client_company: draft.client_company || '',
        client_email: draft.client_email || '',
        project: draft.project || '',
        issue_date: issued,
        due_date: due,
        tax_rate: Number(draft.tax_rate) || 0,
        memo: draft.memo || '',
      });
      const drafted = (draft.line_items || []).map((item) => ({
        description: item.description || '',
        quantity: String(item.quantity ?? 1),
        price: (Number(item.unit_price) || 0).toFixed(2),
      }));
      setRows(drafted.length ? drafted : [{ description: '', quantity: '1', price: '' }]);
    } catch (err) {
      setError(err?.message || 'The notes could not be read into an invoice.');
    } finally {
      setParsing(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const items = asItems();
    if (!form.client_name.trim()) {
      setError('Name the client the invoice is addressed to.');
      return;
    }
    if (!items.length) {
      setError('An invoice needs at least one billed line.');
      return;
    }
    setError('');
    setSaving(true);
    const { subtotal, tax, total } = totalsOf(items, form.tax_rate);
    const payload = {
      invoice_number: initial?.invoice_number || invoiceNumber,
      client_name: form.client_name.trim(),
      client_company: form.client_company.trim(),
      client_email: form.client_email.trim(),
      project: form.project.trim(),
      issue_date: form.issue_date,
      due_date: form.due_date,
      source_notes: notes,
      line_items: items,
      subtotal_cents: subtotal,
      tax_rate: Number(form.tax_rate) || 0,
      tax_cents: tax,
      total_cents: total,
      memo: form.memo.trim(),
    };
    try {
      await onSave(payload);
    } catch (err) {
      setError(err?.message || 'The invoice could not be saved.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="rounded-xl p-3.5" style={{ background: INV.surface, border: `1px solid ${INV.copper}` }}>
        <p className="mb-2 text-[10px] uppercase tracking-[0.18em]" style={{ color: INV.gold }}>
          The notes
        </p>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={5}
          placeholder="Two days editing the Issue 42 profile spread for Adela Boranova, 900 a day. Half day of photo research at 450. Due in two weeks, 20% tax if that applies."
          className={`${FIELD} leading-relaxed`}
          style={STYLE}
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={compose}
            disabled={parsing}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50"
            style={{ background: INV.copper, color: '#fff' }}
          >
            {parsing ? <Sparkles className="h-3.5 w-3.5" /> : <Wand2 className="h-3.5 w-3.5" />}
            {parsing ? 'Reading the notes…' : 'Compose invoice'}
          </button>
          <span className="text-[11px]" style={{ color: INV.soft }}>
            Plain notes in, a finished bill out. Every line below stays editable.
          </span>
        </div>
      </div>

      <div className="rounded-xl p-3.5" style={{ background: INV.surface, border: `1px solid ${INV.line}` }}>
        <div className="mb-2.5 flex items-baseline justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: INV.gold }}>
            The bill
          </p>
          <p className="text-[11px] tabular-nums" style={{ color: INV.soft }}>{invoiceNumber}</p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider" style={{ color: INV.soft }}>Client</span>
            <input value={form.client_name} onChange={set('client_name')} className={FIELD} style={STYLE} placeholder="Full name" />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider" style={{ color: INV.soft }}>Company</span>
            <input value={form.client_company} onChange={set('client_company')} className={FIELD} style={STYLE} />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider" style={{ color: INV.soft }}>Email to send to</span>
            <input type="email" value={form.client_email} onChange={set('client_email')} className={FIELD} style={STYLE} placeholder="client@example.com" />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider" style={{ color: INV.soft }}>For</span>
            <input value={form.project} onChange={set('project')} className={FIELD} style={STYLE} placeholder="Issue 42, profile spread" />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider" style={{ color: INV.soft }}>Issued</span>
            <input type="date" value={form.issue_date} onChange={set('issue_date')} className={FIELD} style={STYLE} />
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: INV.soft }}>Due</span>
              <input type="date" value={form.due_date} onChange={set('due_date')} className={FIELD} style={STYLE} />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: INV.soft }}>Tax %</span>
              <input type="number" step="0.01" min="0" value={form.tax_rate} onChange={set('tax_rate')} className={FIELD} style={STYLE} />
            </label>
          </div>
        </div>

        <div className="mt-3.5 space-y-2">
          <div className="hidden gap-2 text-[10px] uppercase tracking-wider sm:flex" style={{ color: INV.soft }}>
            <span className="flex-1">Line</span>
            <span className="w-16 text-right">Qty</span>
            <span className="w-24 text-right">Rate</span>
            <span className="w-24 text-right">Amount</span>
            <span className="w-7" />
          </div>
          {rows.map((row, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
              <input
                value={row.description}
                onChange={(event) => setRow(index, 'description', event.target.value)}
                className={`${FIELD} min-w-0 flex-1`}
                style={STYLE}
                placeholder="What is being billed"
              />
              <input
                type="number"
                step="0.25"
                min="0"
                value={row.quantity}
                onChange={(event) => setRow(index, 'quantity', event.target.value)}
                className={`${FIELD} w-16 text-right`}
                style={STYLE}
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={row.price}
                onChange={(event) => setRow(index, 'price', event.target.value)}
                className={`${FIELD} w-24 text-right`}
                style={STYLE}
                placeholder="0.00"
              />
              <span className="w-24 text-right text-sm tabular-nums" style={{ color: INV.soft }}>
                {money(itemCents({ quantity: Number(row.quantity), unit_price_cents: Math.round((Number(row.price) || 0) * 100) }))}
              </span>
              <button
                type="button"
                onClick={() => dropRow(index)}
                title="Remove line"
                className="rounded-md p-1.5 hover:bg-white/10"
                style={{ color: INV.soft }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold"
            style={{ background: 'rgba(255,255,255,0.05)', color: INV.ink, border: `1px solid ${INV.line}` }}
          >
            <Plus className="h-3.5 w-3.5" /> Add line
          </button>
        </div>

        <label className="mt-3 block">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: INV.soft }}>Line under the total</span>
          <input value={form.memo} onChange={set('memo')} className={FIELD} style={STYLE} placeholder="Thank you for the work, settled on receipt." />
        </label>

        <div className="mt-3 flex items-center justify-end gap-4 text-sm" style={{ color: INV.ink }}>
          <span style={{ color: INV.soft }}>Subtotal {money(totals.subtotal)}</span>
          {totals.tax > 0 && <span style={{ color: INV.soft }}>Tax {money(totals.tax)}</span>}
          <span className="text-base font-bold tabular-nums" style={{ color: INV.gold }}>Total {money(totals.total)}</span>
        </div>
      </div>

      {error && <p className="text-xs" style={{ color: '#f2a1a1' }}>{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg px-3.5 py-2 text-xs font-semibold disabled:opacity-50"
          style={{ background: INV.copper, color: '#fff' }}
        >
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Save invoice'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3.5 py-2 text-xs font-medium"
          style={{ background: 'transparent', color: INV.soft, border: `1px solid ${INV.line}` }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}