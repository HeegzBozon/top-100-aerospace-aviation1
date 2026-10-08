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

export const SECTION_GROUPS = [
  { key: 'front_of_book', label: 'Front of Book', description: 'Editor\'s letter, contributors, opening essays' },
  { key: 'well', label: 'The Well', description: 'The heart of the issue — cover story, honorees, portfolios' },
  { key: 'back_of_book', label: 'Back of Book', description: 'Index, methodology, closing matter' },
];

export const sectionGroupLabel = (key) =>
  SECTION_GROUPS.find((g) => g.key === key)?.label || key;

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
  { key: 'toc', label: 'Table of Contents', description: 'Issue contents with page numbers and credits' },
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

// Volume IV flagship blueprint — the September-issue model.
// Front of Book → expanded honoree Well → Back of Book.
// Themed packages within the well give the 100 honorees editorial rhythm.
export const VOLUME_IV_BLUEPRINT = {
  title: 'TOP 100 Aerospace & Aviation — Volume IV',
  subtitle: 'The 2026 Edition',
  cover_kicker: 'Volume IV · The 2026 Edition',
  preface: '',
  colophon: 'TOP 100 Aerospace & Aviation is an institutional publication of the TOP 100 Aerospace & Aviation community. Volume IV measures the professional aerospace and aviation community across one cycle of nomination, peer evaluation, and editorial review.',
  sections: [
    // ── Front of Book ──
    { id: 'sec-fob-founders-letter', name: "Founder's Letter", section_type: 'evergreen', section_group: 'front_of_book', order: 0 },
    { id: 'sec-fob-contributors', name: 'Contributors', section_type: 'evergreen', section_group: 'front_of_book', order: 1 },
    { id: 'sec-fob-the-vote', name: 'Up Front: The Vote', section_type: 'evergreen', section_group: 'front_of_book', order: 2 },
    { id: 'sec-fob-by-the-numbers', name: 'By the Numbers', section_type: 'evergreen', section_group: 'front_of_book', order: 3 },
    // ── Departments ──
    { id: 'sec-dept-signals', name: 'Signals', section_type: 'evergreen', section_group: 'front_of_book', order: 4 },
    { id: 'sec-dept-alumni', name: 'Alumni', section_type: 'evergreen', section_group: 'front_of_book', order: 5 },
    { id: 'sec-dept-patrons', name: 'Patron of Record', section_type: 'evergreen', section_group: 'front_of_book', order: 6 },
    // ── The Well ──
    { id: 'sec-well-cover-story', name: 'Cover Story', section_type: 'feature', section_group: 'well', order: 7 },
    { id: 'sec-well-the-100', name: 'The 100', section_type: 'profile', section_group: 'well', order: 8 },
    { id: 'sec-well-portfolios', name: 'Portfolios', section_type: 'feature', section_group: 'well', order: 9 },
    // ── Back of Book ──
    { id: 'sec-bob-index', name: 'Index', section_type: 'evergreen', section_group: 'back_of_book', order: 10 },
    { id: 'sec-bob-methodology', name: 'Methodology & Governance', section_type: 'evergreen', section_group: 'back_of_book', order: 11 },
    { id: 'sec-bob-get-involved', name: 'Get Involved', section_type: 'evergreen', section_group: 'back_of_book', order: 12 },
    { id: 'sec-bob-last-look', name: 'Last Look', section_type: 'colophon', section_group: 'back_of_book', order: 13 },
  ],
};

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