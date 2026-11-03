import { Check, Copy, Mail, Pencil, Trash2 } from 'lucide-react';
import { INV, dayLabel, itemCents, money, totalsOf } from '@/components/admin/invoicing/invoiceConfig';

// The bill as the client reads it: cream stock, the navy masthead, one copper rule, and
// the ledger under it. It is drawn exactly as it is sent, so what is approved here is what
// arrives in the inbox.
export default function InvoiceSheet({
  invoice,
  sending = false,
  notice = '',
  onBack,
  onEdit,
  onSend,
  onMarkPaid,
  onDelete,
  onCopy,
  copied = false,
}) {
  const items = invoice.line_items || [];
  const totals = totalsOf(items, invoice.tax_rate);
  const canSend = !!invoice.client_email && invoice.status !== 'paid';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="rounded-lg px-3 py-1.5 text-xs font-medium"
          style={{ background: 'rgba(255,255,255,0.06)', color: INV.ink, border: `1px solid ${INV.line}` }}
        >
          ← All invoices
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onCopy}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.06)', color: INV.ink, border: `1px solid ${INV.line}` }}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy as text'}
          </button>
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.06)', color: INV.ink, border: `1px solid ${INV.line}` }}
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          {invoice.status !== 'paid' && (
            <button
              onClick={onMarkPaid}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
              style={{ background: 'rgba(126,200,154,0.14)', color: '#9fd9b4', border: '1px solid rgba(126,200,154,0.4)' }}
            >
              <Check className="h-3.5 w-3.5" /> Mark paid
            </button>
          )}
          <button
            onClick={onSend}
            disabled={!canSend || sending}
            title={!invoice.client_email ? 'Add an email address to send this invoice' : undefined}
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold disabled:opacity-45"
            style={{ background: INV.copper, color: '#fff' }}
          >
            <Mail className="h-3.5 w-3.5" />
            {sending ? 'Sending…' : invoice.status === 'sent' ? 'Send again' : 'Send invoice'}
          </button>
          <button
            onClick={onDelete}
            title="Delete invoice"
            className="rounded-lg p-2"
            style={{ color: INV.soft, border: `1px solid ${INV.line}` }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {notice && (
        <p className="rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(201,168,124,0.12)', color: INV.gold, border: '1px solid rgba(201,168,124,0.32)' }}>
          {notice}
        </p>
      )}

      <article
        id="invoice-paper"
        className="mx-auto w-full max-w-2xl px-7 py-8 sm:px-10 sm:py-10"
        style={{ background: INV.paper, color: INV.navy, borderTop: `3px solid ${INV.copper}` }}
      >
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: INV.copper }}>
              TOP 100 Aerospace &amp; Aviation
            </p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 30, lineHeight: 1.05, marginTop: 6, color: INV.navy }}>
              Invoice
            </p>
          </div>
          <div className="text-right" style={{ fontSize: 11, lineHeight: 1.7 }}>
            <p style={{ fontWeight: 700, letterSpacing: '0.08em' }}>{invoice.invoice_number}</p>
            <p>Issued {dayLabel(invoice.issue_date)}</p>
            <p>Due {dayLabel(invoice.due_date)}</p>
            <p style={{ marginTop: 4, fontWeight: 700, textTransform: 'uppercase', fontSize: 9, letterSpacing: '0.18em', color: invoice.status === 'paid' ? '#3f7a55' : INV.copper }}>
              {invoice.status === 'paid' ? 'Paid' : invoice.status === 'sent' ? 'Awaiting payment' : invoice.status === 'void' ? 'Void' : 'Draft'}
            </p>
          </div>
        </header>

        <div style={{ height: 2, background: INV.copper, margin: '18px 0 16px' }} />

        <div className="flex flex-wrap justify-between gap-6">
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#8f5c2c' }}>
              Billed to
            </p>
            <p style={{ fontWeight: 700, marginTop: 5 }}>{invoice.client_name}</p>
            {invoice.client_company && <p style={{ fontSize: 12 }}>{invoice.client_company}</p>}
            {invoice.client_email && <p style={{ fontSize: 12, color: '#42627f' }}>{invoice.client_email}</p>}
          </div>
          {invoice.project && (
            <div className="text-right">
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#8f5c2c' }}>
                For
              </p>
              <p style={{ fontSize: 13, marginTop: 5 }}>{invoice.project}</p>
            </div>
          )}
        </div>

        <table className="mt-7 w-full" style={{ fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${INV.copper}` }}>
              <th align="left" style={{ paddingBottom: 6, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8f5c2c' }}>Line</th>
              <th align="right" style={{ paddingBottom: 6, width: 60, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8f5c2c' }}>Qty</th>
              <th align="right" style={{ paddingBottom: 6, width: 90, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8f5c2c' }}>Rate</th>
              <th align="right" style={{ paddingBottom: 6, width: 90, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8f5c2c' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid rgba(30,58,90,0.12)' }}>
                <td style={{ padding: '9px 0' }}>{item.description}</td>
                <td align="right" style={{ padding: '9px 0' }}>{item.quantity}</td>
                <td align="right" style={{ padding: '9px 0' }}>{money(item.unit_price_cents)}</td>
                <td align="right" style={{ padding: '9px 0', fontVariantNumeric: 'tabular-nums' }}>{money(itemCents(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div style={{ minWidth: 220, fontSize: 12 }}>
            <div className="flex justify-between" style={{ padding: '3px 0', color: '#42627f' }}>
              <span>Subtotal</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{money(totals.subtotal)}</span>
            </div>
            {totals.tax > 0 && (
              <div className="flex justify-between" style={{ padding: '3px 0', color: '#42627f' }}>
                <span>Tax ({invoice.tax_rate}%)</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{money(totals.tax)}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between" style={{ borderTop: `1px solid ${INV.copper}`, paddingTop: 7, fontWeight: 700, fontSize: 15 }}>
              <span>Total due</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{money(totals.total)}</span>
            </div>
          </div>
        </div>

        {invoice.memo && (
          <p style={{ marginTop: 22, fontSize: 12, fontStyle: 'italic', color: '#42627f' }}>{invoice.memo}</p>
        )}

        <p style={{ marginTop: 22, paddingTop: 10, borderTop: '1px solid rgba(30,58,90,0.14)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8f5c2c' }}>
          Higher, Further, Faster
        </p>
      </article>
    </div>
  );
}