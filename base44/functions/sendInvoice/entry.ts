import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const money = (cents) =>
  `$${((Number(cents) || 0) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const itemCents = (item) =>
  Math.round((Number(item.quantity) || 0) * (Number(item.unit_price_cents) || 0));

const dayLabel = (value) => {
  if (!value) return '';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// The ledger the client reads inside the email: one row per line, ruled in copper, the
// same figures the sheet in the app prints.
const buildItemsHtml = (invoice) => {
  const items = Array.isArray(invoice.line_items) ? invoice.line_items : [];
  const rows = items
    .map(
      (item) => `<tr>
        <td style="padding:9px 0;border-bottom:1px solid rgba(30,58,90,0.14);font-size:13px;color:#1e3a5a;">${escapeHtml(item.description)}</td>
        <td align="right" style="padding:9px 0;border-bottom:1px solid rgba(30,58,90,0.14);font-size:13px;color:#42627f;">${escapeHtml(item.quantity)}</td>
        <td align="right" style="padding:9px 0;border-bottom:1px solid rgba(30,58,90,0.14);font-size:13px;color:#42627f;">${money(item.unit_price_cents)}</td>
        <td align="right" style="padding:9px 0;border-bottom:1px solid rgba(30,58,90,0.14);font-size:13px;color:#1e3a5a;">${money(itemCents(item))}</td>
      </tr>`,
    )
    .join('');

  const subtotal = Number(invoice.subtotal_cents) || items.reduce((sum, i) => sum + itemCents(i), 0);
  const tax = Number(invoice.tax_cents) || 0;

  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    <thead>
      <tr>
        <th align="left" style="padding-bottom:7px;border-bottom:2px solid #b87333;font-size:10px;letter-spacing:1.6px;color:#8f5c2c;">LINE</th>
        <th align="right" style="padding-bottom:7px;border-bottom:2px solid #b87333;font-size:10px;letter-spacing:1.6px;color:#8f5c2c;width:52px;">QTY</th>
        <th align="right" style="padding-bottom:7px;border-bottom:2px solid #b87333;font-size:10px;letter-spacing:1.6px;color:#8f5c2c;width:84px;">RATE</th>
        <th align="right" style="padding-bottom:7px;border-bottom:2px solid #b87333;font-size:10px;letter-spacing:1.6px;color:#8f5c2c;width:84px;">AMOUNT</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="margin:12px 0 0 0;text-align:right;font-size:12px;color:#42627f;">Subtotal ${money(subtotal)}${
    tax > 0 ? ` &middot; Tax ${money(tax)}` : ''
  }</p>`;
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth
      .me()
      .catch((error) => (error.status === 401 ? null : Promise.reject(error)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { invoice_id } = await req.json().catch(() => ({}));
    if (!invoice_id) return Response.json({ error: 'invoice_id is required' }, { status: 400 });

    const invoice = await base44.entities.Invoice.get(invoice_id).catch((error) =>
      error.status === 404 ? null : Promise.reject(error),
    );
    if (!invoice) return Response.json({ error: 'Invoice not found' }, { status: 404 });
    if (!invoice.client_email) {
      return Response.json({ error: 'This invoice has no client email address.' }, { status: 400 });
    }

    const result = await base44.integrations.Core.SendEmail({
      to: invoice.client_email,
      template_name: 'Invoice',
      category: 'transactional',
      variables: {
        client_name: invoice.client_name || 'there',
        client_company: invoice.client_company || '',
        invoice_number: invoice.invoice_number,
        issue_date: dayLabel(invoice.issue_date),
        due_date: dayLabel(invoice.due_date),
        total: money(invoice.total_cents),
        memo: invoice.memo || '',
        items_html: buildItemsHtml(invoice),
      },
    });

    if (!result || result.success === false) {
      return Response.json({
        sent: false,
        reason: result?.reason || 'unknown',
        message:
          result?.reason === 'unsubscribed' || result?.reason === 'bounced' || result?.reason === 'spam'
            ? 'That address cannot be reached by this app. Copy the invoice as text and send it from your own mail.'
            : 'The mail service would not carry this invoice to that address. Copy it as text and send it from your own mail.',
      });
    }

    const sent_at = new Date().toISOString();
    await base44.entities.Invoice.update(invoice.id, { status: 'sent', sent_at });

    return Response.json({ sent: true, to: invoice.client_email, sent_at });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}