import {
  BookOpen,
  Eye,
  FileText,
  Layers,
  LayoutList,
  PencilLine,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Type,
  User,
} from 'lucide-react';
import {
  ARTICLE_STATUSES,
  ARTICLE_TYPES,
  ISSUE_STATUSES,
  SECTION_GROUPS,
  SECTION_TYPES,
  articleStatusLabel,
  layoutLabel,
  sectionGroupLabel,
  sectionTypeLabel,
  statusLabel,
} from '@/components/magazine/magazineConfig';

// What the ring walks, at every level of the studio. Kept apart from the console so
// the console is only about the wheel: these two builders are plain data, read once
// per level, and nothing here touches the glass or the records.

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// The four surfaces of one issue.
export function buildSurfaces(issue, { articles, pages }) {
  if (!issue) return [];
  const sections = issue.sections || [];
  const published = issue.status === 'published';
  return [
    {
      key: 'blueprint',
      kind: 'surface',
      label: 'Blueprint',
      hint: `${plural(sections.length, 'section')} · ${statusLabel(ISSUE_STATUSES, issue.status)}`,
      icon: LayoutList,
    },
    { key: 'articles', kind: 'surface', label: 'Articles', hint: plural(articles.length, 'article'), icon: FileText },
    { key: 'pages', kind: 'surface', label: 'Pages', hint: plural(pages.length, 'page'), icon: Layers },
    {
      key: 'publish',
      kind: 'surface',
      label: 'Preview & Publish',
      hint: published ? 'Live to readers' : 'Draft — not published',
      icon: Send,
    },
  ];
}

// The archive: the alchemy, a blank issue, then every issue held.
export function buildArchiveEntries({ issues = [], error, alchemizing }) {
  const list = [];
  if (error) {
    list.push({ key: 'retry', tone: 'action', action: 'retry', label: 'Try the archive again', hint: error, icon: RefreshCw });
  }
  list.push(
    {
      key: 'alchemize',
      tone: 'action',
      action: 'alchemize',
      label: 'Alchemize from TOP 100 Women 2025',
      hint: alchemizing ? 'Binding the edition…' : 'Nine sections · a hundred honorees · composed pages',
      icon: Sparkles,
    },
    { key: 'new-issue', tone: 'action', action: 'new-issue', label: 'New blank issue', hint: 'An empty blueprint to start from', icon: Plus },
  );
  issues.forEach((issue) => list.push({
    key: `issue:${issue.id}`,
    kind: 'issue',
    id: issue.id,
    label: issue.title,
    hint: `${statusLabel(ISSUE_STATUSES, issue.status)} · ${issue.assembly_mode === 'pdf' ? 'PDF upload' : 'Native composition'}`,
    icon: BookOpen,
  }));
  return list;
}

export function buildSurfaceEntries({ surface, issue, articles = [], pages = [] }) {
  const sections = issue?.sections || [];
  const sectionName = (id) => sections.find((section) => section.id === id)?.name || 'Unassigned';

  if (surface === 'blueprint') {
    if (!sections.length) {
      return [
        { key: 'alchemize-blank', tone: 'action', action: 'alchemize', label: 'Bind the 2025 edition as a new issue', hint: 'Nine sections, its articles and its pages', icon: Sparkles },
        { key: 'masthead', tone: 'action', action: 'masthead', label: 'Masthead fields', hint: issue.title, icon: PencilLine },
        { key: 'add-section', tone: 'action', action: 'add-section', label: 'Add a section', icon: Plus },
      ];
    }
    return [
      { key: 'masthead', tone: 'action', action: 'masthead', label: 'Masthead fields', hint: issue.title, icon: PencilLine },
      ...sections.map((section) => ({
        key: `section:${section.id}`,
        kind: 'section',
        id: section.id,
        label: section.name,
        hint: `${sectionTypeLabel(section.section_type)} · ${sectionGroupLabel(section.section_group || 'well')}`,
        icon: Type,
      })),
      { key: 'add-section', tone: 'action', action: 'add-section', label: 'Add a section', icon: Plus },
    ];
  }

  if (surface === 'articles') {
    return [
      ...articles.map((article) => ({
        key: `article:${article.id}`,
        kind: 'article',
        id: article.id,
        label: article.title,
        hint: `${articleStatusLabel(article.status)} · ${sectionName(article.section_id)}`,
        icon: article.article_type === 'profile' ? User : FileText,
      })),
      { key: 'new-article', tone: 'action', action: 'new-article', label: 'New article', icon: Plus },
    ];
  }

  if (surface === 'pages') {
    return [
      { key: 'compose', tone: 'action', action: 'generate-pages', label: 'Compose pages from the blueprint', hint: 'Cover, contents, dividers, articles, colophon', icon: RefreshCw },
      ...pages.map((page) => ({
        key: `page:${page.id}`,
        kind: 'page',
        id: page.id,
        label: `${String(page.page_number).padStart(2, '0')} · ${layoutLabel(page.layout_type)}`,
        hint: (page.content_blocks || []).find((block) => block.type === 'heading')?.text
          || (page.content_blocks || [])[0]?.text
          || page.chapter_label
          || 'Read the page',
        icon: Layers,
      })),
    ];
  }

  if (surface === 'publish') {
    const published = issue?.status === 'published';
    return [
      published
        ? { key: 'unpublish', tone: 'action', action: 'unpublish', label: 'Take the issue back to draft', icon: RefreshCw }
        : { key: 'publish', tone: 'action', action: 'publish', label: 'Publish the issue', hint: 'Live to readers', icon: Send },
      { key: 'reader', tone: 'action', action: 'open-reader', label: 'Open in the reader', hint: 'The issue as a reader sees it', icon: Eye },
      { key: 'delete-issue', tone: 'action', action: 'delete-issue', label: 'Delete this issue', icon: Trash2 },
    ];
  }

  return [];
}

// The options of one field, walked as their own list so a status is chosen by the
// ring rather than by a keyboard.
export function buildOptionEntries(field) {
  if (!field) return [];
  return field.options.map((option) => ({
    key: `option:${option.value}`,
    kind: 'option',
    value: option.value,
    label: option.label,
    hint: option.value === field.value ? 'Current' : '',
  }));
}

// The fields of the entry standing open: a section, an article, or the issue's own
// masthead copy.
export function buildEntryFields({ entry, issue, articles = [] }) {
  if (!entry) return [];
  const sections = issue?.sections || [];
  const choice = (key, label, options, value) => ({
    key,
    label,
    kind: 'choice',
    value,
    options: options.map((option) => ({ value: option.key, label: option.label })),
  });
  const remove = (label) => ({ key: '__delete', label, kind: 'action' });

  if (entry.kind === 'section') {
    const section = sections.find((item) => item.id === entry.id);
    if (!section) return [];
    return [
      { key: 'name', label: 'Section name', kind: 'text', value: section.name || '' },
      choice('section_type', 'Section type', SECTION_TYPES, section.section_type),
      choice('section_group', 'Part of the book', SECTION_GROUPS, section.section_group || 'well'),
      remove('Delete this section'),
    ];
  }

  if (entry.kind === 'article') {
    const article = articles.find((item) => item.id === entry.id);
    if (!article) return [];
    return [
      { key: 'title', label: 'Headline', kind: 'text', value: article.title || '' },
      { key: 'subtitle', label: 'Standfirst', kind: 'text', value: article.subtitle || '' },
      { key: 'teaser', label: 'Contents line', kind: 'text', value: article.teaser || '' },
      { key: 'writer_credit', label: 'Byline', kind: 'text', value: article.writer_credit || '' },
      { key: 'body', label: 'Copy', kind: 'long', value: article.body || '' },
      choice('article_type', 'Article type', ARTICLE_TYPES, article.article_type),
      choice('status', 'Status', ARTICLE_STATUSES, article.status),
      remove('Delete this article'),
    ];
  }

  if (entry.kind === 'issue') {
    return [
      { key: 'title', label: 'Issue title', kind: 'text', value: issue.title || '' },
      { key: 'subtitle', label: 'Issue subtitle', kind: 'text', value: issue.subtitle || '' },
      { key: 'cover_kicker', label: 'Cover line', kind: 'text', value: issue.cover_kicker || '' },
      { key: 'preface', label: "Editor's letter", kind: 'long', value: issue.preface || '' },
      { key: 'colophon', label: 'Colophon', kind: 'long', value: issue.colophon || '' },
    ];
  }

  return [];
}