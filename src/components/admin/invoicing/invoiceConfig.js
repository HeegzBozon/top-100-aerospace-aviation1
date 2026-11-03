// The invoicing desk's own furniture: the palette the admin surfaces are read in, the
// arithmetic the composer, the sheet and the ledger share, and the plain-text rendering
// a bill is copied out as when it is not emailed.

export const INV = {
  surface: '#141b24',
  raised: '#0e141b',
  line: 'rgba(255,255,255,0.08)',
  ink: '#d4e0ec',
  // The ledger's quiet voice. Bright enough to read on the navy plate it is set on.
  soft: '#a3b8c9',
  copper: '#b87333',
  gold: '#c9a87c',
  paper: '#faf8f5',
  navy: '#1e3a5a',
};

export const STATUS_TONE = {
  draft: '#a3b8c9',
  sent: '#c9a87c',
  paid: '#7ec89a',
  void: '#b0a7a7',
};

export const money = (cents) =>
  `$${((cents || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const itemCents = (item) =>
  Math.round((Number(item.quantity) || 0) * (Number(item.unit_price_cents) || 0));

export const totalsOf = (items = [], taxRate = 0) => {
  const subtotal = items.reduce((sum, item) => sum + itemCents(item), 0);
  const tax = Math.round(subtotal * ((Number(taxRate) || 0) / 100));
  return { subtotal, tax, total: subtotal + tax };
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const addDaysISO = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
};

export const dayLabel = (value) => {
  if (!value) return '—';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// The reference a new bill carries: the year, then one past the highest number already
// written, so a deleted bill never hands its number to another.
export const nextNumber = (invoices = []) => {
  const year = new Date().getFullYear();
  const highest = invoices.reduce((max, invoice) => {
    const match = String(invoice.invoice_number || '').match(/(\d+)\s*$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `INV-${year}-${String(highest + 1).padStart(4, '0')}`;
};

// The bill as it reads once it leaves the screen: one block a client can be pasted, so an
// invoice is never stuck inside the house.
export const invoiceText = (invoice) => {
  const items = invoice.line_items || [];
  const { subtotal, tax, total } = totalsOf(items, invoice.tax_rate);
  const lines = items.map(
    (item) =>
      `  ${item.description} · ${item.quantity} x ${money(item.unit_price_cents)} = ${money(itemCents(item))}`,
  );
  return [
    'TOP 100 Aerospace & Aviation',
    `Invoice ${invoice.invoice_number}`,
    `Issued ${dayLabel(invoice.issue_date)} · Due ${dayLabel(invoice.due_date)}`,
    '',
    `Billed to: ${invoice.client_name}${invoice.client_company ? `, ${invoice.client_company}` : ''}`,
    invoice.project ? `For: ${invoice.project}` : '',
    '',
    ...lines,
    '',
    `Subtotal ${money(subtotal)}`,
    tax ? `Tax (${invoice.tax_rate}%) ${money(tax)}` : '',
    `Total due ${money(total)}`,
    '',
    invoice.memo || '',
    '',
    'TOP 100 Aerospace & Aviation. Higher, Further, Faster.',
  ]
    .filter((line) => line !== '')
    .join('\n');
};