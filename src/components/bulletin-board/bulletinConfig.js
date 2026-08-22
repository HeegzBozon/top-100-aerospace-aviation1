import { PenLine, StickyNote, Image as ImageIcon, Quote, BookOpen, Link2, MessagesSquare } from 'lucide-react';

// The approved tool set for the Bulletin Board. Fellows toggle and reorder
// from this allowlist — never arbitrary custom tools. Mirrors module_order governance.
export const BULLETIN_TOOLS = [
  { key: 'dispatch', label: 'Dispatch', icon: PenLine, postType: 'dispatch', emptyState: 'No dispatches filed yet. The desk is open.' },
  { key: 'notes', label: 'Notes', icon: StickyNote, postType: 'note', emptyState: 'No notes pinned to the board.' },
  { key: 'gallery', label: 'Gallery', icon: ImageIcon, postType: 'photo', emptyState: 'Hang your first frame.' },
  { key: 'quotes', label: 'Quotes', icon: Quote, postType: 'quote', emptyState: 'No quotes collected.' },
  { key: 'field_notes', label: 'Field Notes', icon: BookOpen, postType: 'field_note', emptyState: 'First entry pending.' },
  { key: 'reading_list', label: 'Reading List', icon: Link2, postType: 'link', emptyState: 'No links bookmarked.' },
  { key: 'threads', label: 'Threads', icon: MessagesSquare, postType: null, emptyState: 'No threads started.' },
];

export const DEFAULT_BULLETIN_TOOLS = ['dispatch', 'notes', 'gallery'];

// Post type formatters for the composer.
export const POST_TYPES = {
  dispatch: { label: 'Dispatch', hasRichBody: true, hasTitle: true, hasTags: true },
  note: { label: 'Note', hasRichBody: false, hasTitle: true, hasTags: false, bodyMax: 1000 },
  photo: { label: 'Photo', hasRichBody: false, hasTitle: true, hasTags: true, hasMedia: true },
  quote: { label: 'Quote', hasRichBody: false, hasTitle: false },
  link: { label: 'Link', hasRichBody: false, hasTitle: false },
  field_note: { label: 'Field Note', hasRichBody: true, hasTitle: true, hasTags: true },
};

// Resolve + dedupe a Fellow's tool order against the allowlist, defaulting if empty.
export const orderedBulletinTools = (tools) => {
  const valid = (tools || []).filter((k) => BULLETIN_TOOLS.some((t) => t.key === k));
  const deduped = valid.filter((k, i) => valid.indexOf(k) === i);
  return [...deduped, ...DEFAULT_BULLETIN_TOOLS.filter((k) => !deduped.includes(k))];
};

export const toolByKey = (key) => BULLETIN_TOOLS.find((t) => t.key === key) || BULLETIN_TOOLS[0];