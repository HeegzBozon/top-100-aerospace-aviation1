import { layoutLabel } from '@/components/magazine/magazineConfig';

// The contents of an issue, as the glass walks it. A reader navigates by the
// landmarks — the cover, the contents, each part of the book, the colophon — so
// those are what the index holds; an issue with no parts to navigate by falls back
// to the whole run of its pages. Everything else is reached by turning.

const LANDMARKS = ['cover', 'masthead', 'toc', 'chapter_divider', 'colophon'];

export function pageLabel(page) {
  if (!page) return '';
  if (page.layout_type === 'cover') return 'Cover';
  if (page.layout_type === 'chapter_divider') return page.chapter_label || 'Part';
  if (page.layout_type === 'toc') return 'Contents';
  const heading = (page.content_blocks || []).find((block) => block.type === 'heading' && block.text)?.text;
  if (heading) return heading;
  if (page.layout_type === 'colophon') return 'Colophon';
  return layoutLabel(page.layout_type);
}

// {key, position, label, hint} per entry, position being 1-based — the same number
// the page prints in its own fold.
export function buildIssueContents(pages = []) {
  const landmarks = pages
    .map((page, index) => ({ page, index }))
    .filter(({ page }) => LANDMARKS.includes(page.layout_type));
  const chosen = landmarks.length > 1 ? landmarks : pages.map((page, index) => ({ page, index }));

  return chosen.map(({ page, index }) => ({
    key: page.id || `page-${index}`,
    position: index + 1,
    label: pageLabel(page),
    hint: page.layout_type === 'chapter_divider'
      ? `Part · page ${String(page.page_number || index + 1).padStart(2, '0')}`
      : `Page ${String(page.page_number || index + 1).padStart(2, '0')}`,
  }));
}

// What the issue's own fold reads: the position over the run, and the name of what
// is standing open.
export function foldLabel(page, position, total) {
  const fold = `${String(position).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  const name = page ? pageLabel(page) : '';
  return name ? `${fold} · ${name}` : fold;
}