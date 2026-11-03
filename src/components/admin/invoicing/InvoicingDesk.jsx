import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, FileText, Plus, RefreshCw } from 'lucide-react';
import { INV, STATUS_TONE, dayLabel, invoiceText, money, nextNumber } from '@/components/admin/invoicing/invoiceConfig';
import InvoiceComposer from '@/components/admin/invoicing/InvoiceComposer';
import InvoiceSheet from '@/components/admin/invoicing/InvoiceSheet';

const TILES = [
  { key: 'sent', label: 'Outstanding', accent: '#c9a87c' },
  { key: 'paid', label: 'Settled', accent: '#7ec89a' },
  { key: 'draft', label: 'In draft', accent: '#8fb2cc' },
];

// The invoicing desk: notes become bills, bills get sent, and what is owed is read off
// the top of the page. Every bill is one record, edited on its own sheet.
export default function InvoicingDesk() {
  const [invoices, setInvoices] = useState([]);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [view, setView] = useState({ mode: 'list' });
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const page = await base44.entities.Invoice.filter({}, { sort: '-created_date', limit: 100 });
      setInvoices(page?.items || []);
      setState('ready');
    } catch (err) {
      setError(err?.message || 'The invoice ledger could not be read.');
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (payload) => {
    if (view.invoice?.id) {
      const updated = await base44.entities.Invoice.update(view.invoice.id, payload);
      setInvoices((prev) => prev.map((inv) => (inv.id === view.invoice.id ? updated : inv)));
      setView({ mode: 'sheet', invoice: updated });
    } else {
      const created = await base44.entities.Invoice.create({ ...payload, status: 'draft' });
      setInvoices((prev) => [created, ...prev]);
      setView({ mode: 'sheet', invoice: created });
    }
    setNotice('');
  };

  const patch = async (invoice, changes) => {
    const updated = await base44.entities.Invoice.update(invoice.id, changes);
    setInvoices((prev) => prev.map((inv) => (inv.id === invoice.id ? updated : inv)));
    setView({ mode: 'sheet', invoice: updated });
    return updated;
  };

  const send = async () => {
    setSending(true);
    setNotice('');
    try {
      const res = await base44.functions.invoke('sendInvoice', { invoice_id: view.invoice.id });
      const data = res?.data || {};
      if (data.sent) {
        await patch(view.invoice, { status: 'sent', sent_at: new Date().toISOString() });
        setNotice(`Sent to ${view.invoice.client_email}.`);
      } else {
        setNotice(
          data.message ||
            'The invoice was not sent. Copy it as text and send it from your own mail, the bill itself is ready.',
        );
      }
    } catch (err) {
      setNotice(
        err?.response?.data?.error ||
          'The invoice was not sent. Copy it as text and send it from your own mail, the bill itself is ready.',
      );
    } finally {
      setSending(false);
    }
  };

  const markPaid = () => patch(view.invoice, { status: 'paid', paid_at: new Date().toISOString() });

  const remove = async () => {
    if (!window.confirm(`Delete invoice ${view.invoice.invoice_number}?`)) return;
    await base44.entities.Invoice.delete(view.invoice.id);
    setInvoices((prev) => prev.filter((inv) => inv.id !== view.invoice.id));
    setView({ mode: 'list' });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(invoiceText(view.invoice));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setNotice('Select the bill on the sheet and copy it by hand.');
    }
  };

  const summary = useMemo(() => {
    const of = (status) => invoices.filter((inv) => inv.status === status);
    return {
      sent: of('sent').reduce((sum, inv) => sum + (inv.total_cents || 0), 0),
      paid: of('paid').reduce((sum, inv) => sum + (inv.total_cents || 0), 0),
      draft: of('draft').length,
    };
  }, [invoices]);

  if (view.mode === 'compose') {
    return (
      <InvoiceComposer
        initial={view.invoice || null}
        invoiceNumber={view.invoice?.invoice_number || nextNumber(invoices)}
        onCancel={() => setView(view.invoice ? { mode: 'sheet', invoice: view.invoice } : { mode: 'list' })}
        onSave={save}
      />
    );
  }

  if (view.mode === 'sheet') {
    return (
      <InvoiceSheet
        invoice={view.invoice}
        sending={sending}
        notice={notice}
        copied={copied}
        onBack={() => {
          setNotice('');
          setView({ mode: 'list' });
        }}
        onEdit={() => setView({ mode: 'compose', invoice: view.invoice })}
        onSend={send}
        onMarkPaid={markPaid}
        onDelete={remove}
        onCopy={copy}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold" style={{ color: INV.ink }}>Invoicing</h2>
          <p className="text-sm" style={{ color: INV.soft }}>
            Write the notes you already have, and the desk turns them into a bill the client can be sent.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.06)', color: INV.ink, border: `1px solid ${INV.line}` }}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Re-read
          </button>
          <button
            onClick={() => setView({ mode: 'compose' })}
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold"
            style={{ background: INV.copper, color: '#fff' }}
          >
            <Plus className="h-4 w-4" /> New invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {TILES.map((tile) => (
          <div key={tile.key} className="rounded-xl p-3.5" style={{ background: INV.surface, border: `1px solid ${INV.line}` }}>
            <p className="mb-1.5 text-[10px] uppercase leading-none tracking-wider" style={{ color: '#6b8199' }}>{tile.label}</p>
            <p className="text-lg font-bold leading-none tabular-nums" style={{ color: tile.accent }}>
              {tile.key === 'draft' ? summary.draft : money(summary[tile.key])}
            </p>
          </div>
        ))}
      </div>

      {state === 'loading' && (
        <div className="flex items-center gap-2 rounded-xl px-3 py-6 text-sm" style={{ background: INV.surface, border: `1px solid ${INV.line}`, color: INV.soft }}>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Reading the ledger…
        </div>
      )}

      {state === 'error' && (
        <div className="rounded-xl px-3 py-5" style={{ background: INV.surface, border: `1px solid ${INV.line}` }}>
          <p className="flex items-center gap-2 text-sm" style={{ color: '#f2a1a1' }}>
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
          <button onClick={load} className="mt-2 text-xs underline" style={{ color: INV.gold }}>Try again</button>
        </div>
      )}

      {state === 'ready' && invoices.length === 0 && (
        <div className="rounded-xl px-4 py-10 text-center" style={{ background: INV.surface, border: `1px dashed ${INV.line}` }}>
          <FileText className="mx-auto h-5 w-5" style={{ color: INV.soft }} />
          <p className="mt-2 text-sm font-semibold" style={{ color: INV.ink }}>No invoices yet.</p>
          <p className="mx-auto mt-1 max-w-sm text-xs" style={{ color: INV.soft }}>
            Press New invoice, paste in the notes you already wrote, and the desk drafts the bill for you to check.
          </p>
        </div>
      )}

      {state === 'ready' && invoices.length > 0 && (
        <div className="space-y-2">
          {invoices.map((invoice) => (
            <button
              key={invoice.id}
              onClick={() => {
                setNotice('');
                setView({ mode: 'sheet', invoice });
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
              style={{ background: INV.surface, border: `1px solid ${INV.line}` }}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold" style={{ color: INV.ink }}>
                  {invoice.client_name}
                  {invoice.client_company ? <span style={{ color: INV.soft }}> · {invoice.client_company}</span> : null}
                </p>
                <p className="mt-0.5 text-[11px]" style={{ color: INV.soft }}>
                  {invoice.invoice_number} · issued {dayLabel(invoice.issue_date)} · due {dayLabel(invoice.due_date)}
                </p>
              </div>
              <div className="flex flex-shrink-0 flex-col items-end">
                <span className="text-sm font-bold tabular-nums" style={{ color: INV.ink }}>{money(invoice.total_cents)}</span>
                <span className="text-[9px] uppercase tracking-[0.16em]" style={{ color: STATUS_TONE[invoice.status] }}>
                  {invoice.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}