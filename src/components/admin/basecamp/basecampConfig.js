// What the Basecamp desk can read, and how each kind of record is named on it.
// This list has to stay in step with base44/functions/basecampAdmin: a kind the function
// cannot serve reads as an empty rack, which is the wrong lesson to learn from a desk.

export const BASECAMP_KINDS = [
  { key: 'todos', label: 'To-dos', one: 'to-do', writable: true },
  { key: 'messages', label: 'Messages', one: 'message', writable: true },
  { key: 'documents', label: 'Documents', one: 'document', writable: false },
  { key: 'cards', label: 'Cards', one: 'card', writable: false },
  { key: 'people', label: 'People', one: 'person', writable: false },
];

export const kindMeta = (key) =>
  BASECAMP_KINDS.find((kind) => kind.key === key) || BASECAMP_KINDS[0];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDay(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Basecamp holds most bodies as rich text. The desk prints the words without the markup:
// the record itself is opened in Basecamp when the formatting matters.
export function toPlain(html) {
  if (!html) return '';
  return String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function excerpt(html, limit = 170) {
  const text = toPlain(html).replace(/\s+/g, ' ').trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trimEnd()}…`;
}

export function recordTitle(record) {
  return record?.title || record?.subject || record?.name || record?.full_name || 'Untitled';
}

export function initialsOf(name) {
  return String(name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function isOverdue(record) {
  if (!record?.due_on || record.completed) return false;
  const due = new Date(record.due_on);
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

// One line of provenance under a record's title, whatever kind it is.
export function recordMeta(record, kind) {
  const parts = [];
  if (kind === 'todos') {
    if (record.parent?.title) parts.push(record.parent.title);
    if (record.assignees?.length) parts.push(record.assignees.map((a) => a.name).join(', '));
  } else if (record.creator?.name) {
    parts.push(record.creator.name);
  } else if (record.title) {
    parts.push(record.title);
  }
  if (kind === 'people' && record.email_address) parts.push(record.email_address);
  if (record.created_at) parts.push(formatDay(record.created_at));
  return parts.filter(Boolean).join(' · ');
}