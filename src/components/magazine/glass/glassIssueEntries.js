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

// The register behind the issue: every honoree in it, numbered in the order she stands in
// the book, with the letter her surname falls under and the folio her portrait prints. Read
// from the portraits themselves, so a register can never disagree with the issue it indexes.
export function buildNameIndex(pages = [], articles = [], rankById = null) {
  const entries = [];
  // The issue's portraits and its articles are one honoree twice over: the page carries the
  // picture and the stand, the article carries the record she came from. The register needs
  // both, so the name it prints stays joined to the record a Fellow can follow or keep.
  const articleById = new Map(articles.map((article) => [article.id, article]));

  pages.forEach((page, index) => {
    if (page.layout_type !== 'profile') return;
    const blocks = page.content_blocks || [];
    const name = blocks.find((block) => block.type === 'heading' && block.text)?.text?.trim();
    if (!name) return;

    const parts = name.split(/\s+/);
    const surname = parts[parts.length - 1] || name;
    const given = parts.slice(0, -1).join(' ');

    const article = articleById.get(page.article_id) || null;

    entries.push({
      key: page.id || `name-${index}`,
      number: entries.length + 1,
      name,
      indexForm: given ? `${surname}, ${given}` : surname,
      letter: (surname.charAt(0) || '#').toUpperCase(),
      region: blocks.find((block) => block.type === 'kicker' && block.text)?.text || '',
      stand: blocks.find((block) => block.type === 'byline' && block.text)?.text || article?.subtitle || '',
      portrait: blocks.find((block) => block.type === 'image' && block.url)?.url || article?.hero_image_url || '',
      nomineeId: article?.nominee_id || '',
      rank: rankById?.get(article?.nominee_id) ?? null,
      pageNumber: page.page_number || index + 1,
      position: index + 1,
    });
  });

  return entries;
}

// What the issue's own fold reads: the position over the run, and the name of what
// is standing open.
export function foldLabel(page, position, total) {
  const fold = `${String(position).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  const name = page ? pageLabel(page) : '';
  return name ? `${fold} · ${name}` : fold;
}