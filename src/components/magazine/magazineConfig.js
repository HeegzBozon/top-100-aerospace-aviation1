// Editorial configuration for the Cinematic Digital Magazine Studio.
// Section types, article types, statuses, page layouts, and content blocks.

export const ISSUE_STATUSES = [
  { key: 'draft', label: 'Draft', color: '#6b7280' },
  { key: 'preview', label: 'Preview', color: '#c9a87c' },
  { key: 'published', label: 'Published', color: '#1e3a5a' },
  { key: 'archived', label: 'Archived', color: '#9ca3af' },
];

export const ASSEMBLY_MODES = [
  { key: 'native', label: 'Native Composition', description: 'Build pages from editorial content blocks' },
  { key: 'pdf', label: 'PDF Upload', description: 'Upload a finished issue PDF' },
];

export const SECTION_TYPES = [
  { key: 'evergreen', label: 'Evergreen', description: 'Timeless editorial content' },
  { key: 'profile', label: 'Profile', description: 'Fellow or Nominee profile features' },
  { key: 'feature', label: 'Feature', description: 'Major editorial features' },
  { key: 'results', label: 'Results', description: 'Official measurement results' },
  { key: 'colophon', label: 'Colophon', description: 'Closing institutional matter' },
];

export const ARTICLE_TYPES = [
  { key: 'evergreen', label: 'Evergreen', color: '#1e3a5a', description: 'Can proceed before measurements' },
  { key: 'profile', label: 'Profile', color: '#c9a87c', description: 'Fellow or Nominee profile' },
  { key: 'feature', label: 'Feature', color: '#B87333', description: 'Major feature story' },
  { key: 'results_reserved', label: 'Results — Reserved', color: '#9ca3af', description: 'Held for official measurements' },
];

export const ARTICLE_STATUSES = [
  { key: 'reserved', label: 'Reserved', color: '#9ca3af', description: 'Placeholder for results-dependent content' },
  { key: 'gathering', label: 'Gathering', color: '#c9a87c', description: 'Collecting source material' },
  { key: 'drafting', label: 'Drafting', color: '#B87333', description: 'Writing in progress' },
  { key: 'ready', label: 'Ready', color: '#1e3a5a', description: 'Draft complete, awaiting layout' },
  { key: 'laid_out', label: 'Laid Out', color: '#1e3a5a', description: 'Placed in the page plan' },
  { key: 'published', label: 'Published', color: '#1e3a5a', description: 'Live in the published issue' },
];

export const PAGE_LAYOUTS = [
  { key: 'cover', label: 'Cover', description: 'Full-bleed issue cover' },
  { key: 'masthead', label: 'Masthead', description: 'Institutional masthead spread' },
  { key: 'article', label: 'Article', description: 'Standard article page' },
  { key: 'feature_spread', label: 'Feature Spread', description: 'Full-bleed feature with image' },
  { key: 'profile', label: 'Profile', description: 'Profile portrait page' },
  { key: 'chapter_divider', label: 'Chapter Divider', description: 'Section break with chapter label' },
  { key: 'pull_quote', label: 'Pull Quote', description: 'Full-bleed breakaway quote' },
  { key: 'colophon', label: 'Colophon', description: 'Closing colophon' },
  { key: 'pdf_page', label: 'PDF Page', description: 'Rendered PDF page (PDF mode)' },
];

export const CONTENT_BLOCK_TYPES = [
  { key: 'kicker', label: 'Kicker', icon: 'Type' },
  { key: 'heading', label: 'Heading', icon: 'Heading' },
  { key: 'byline', label: 'Byline', icon: 'User' },
  { key: 'body', label: 'Body Text', icon: 'AlignLeft' },
  { key: 'image', label: 'Image', icon: 'Image' },
  { key: 'pull_quote', label: 'Pull Quote', icon: 'Quote' },
  { key: 'divider', label: 'Divider', icon: 'Minus' },
  { key: 'spacer', label: 'Spacer', icon: 'MoveVertical' },
];

export const THEME_ACCENTS = [
  { key: 'navy', label: 'Navy', color: '#1E3A5A' },
  { key: 'copper', label: 'Copper', color: '#B87333' },
  { key: 'rose_gold', label: 'Rose Gold', color: '#C9A87C' },
];

export const statusLabel = (statuses, key) =>
  statuses.find((s) => s.key === key)?.label || key;

export const statusColor = (statuses, key) =>
  statuses.find((s) => s.key === key)?.color || '#6b7280';

export const sectionTypeLabel = (key) =>
  SECTION_TYPES.find((s) => s.key === key)?.label || key;

export const articleTypeLabel = (key) =>
  ARTICLE_TYPES.find((s) => s.key === key)?.label || key;

export const articleStatusLabel = (key) =>
  ARTICLE_STATUSES.find((s) => s.key === key)?.label || key;

export const articleStatusColor = (key) =>
  ARTICLE_STATUSES.find((s) => s.key === key)?.color || '#6b7280';

export const layoutLabel = (key) =>
  PAGE_LAYOUTS.find((s) => s.key === key)?.label || key;

// Default sections for a new issue — the editorial blueprint skeleton.
export const DEFAULT_SECTIONS = [
  { id: 'sec-masthead', name: 'Masthead', section_type: 'evergreen', order: 0 },
  { id: 'sec-editors-letter', name: "Editor's Letter", section_type: 'evergreen', order: 1 },
  { id: 'sec-features', name: 'Features', section_type: 'feature', order: 2 },
  { id: 'sec-profiles', name: 'Profiles', section_type: 'profile', order: 3 },
  { id: 'sec-results', name: 'The Measurement', section_type: 'results', order: 4 },
  { id: 'sec-colophon', name: 'Colophon', section_type: 'colophon', order: 5 },
];

// Brand palette shared across the studio and reader.
export const MAGAZINE_PALETTE = {
  navy: '#1E3A5A',
  navyDeep: '#0d1f33',
  navyVoid: '#070f1f',
  gold: '#C9A87C',
  copper: '#B87333',
  cream: '#FAF8F5',
  sand: '#e8dcc8',
  beige: '#d4c4a8',
  white: '#ffffff',
  muted: '#6b7280',
};