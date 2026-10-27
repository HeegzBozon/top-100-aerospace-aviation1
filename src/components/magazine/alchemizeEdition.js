import { base44 } from '@/api/base44Client';
import { sectionGroupLabel } from '@/components/magazine/magazineConfig';
import {
  EDITION_SECTIONS,
  EDITION_EDITORIALS,
  TOP100_WOMEN_2025_ISSUE,
  editionArticles,
} from '@/components/magazine/top100WomenEdition';

// Alchemy: the published 2025 edition page, turned into a magazine issue.
//
// The issue, its articles and its pages are built in one pass from the edition held
// in top100WomenEdition, so the studio ends up with an issue that stands on its own
// — a blueprint in nine sections, an article for every section, an entry for every
// honoree, and pages composed from them — while every honoree entry keeps the record
// it was read from.

// The page an article gets when the issue is composed. Section articles print as
// articles; honoree entries print as portraits, with the record's own photograph.
const layoutFor = (article) => (article.article_type === 'profile' ? 'profile' : 'article');

// The blocks a page is composed from, in reading order.
function blocksFor(article, section) {
  const editorial = section ? EDITION_EDITORIALS[section.id] : null;
  const authored = editorial && editorial.title === article.title ? editorial.blocks : null;
  if (authored) return authored;

  const blocks = [{ type: 'kicker', text: section?.name || '' }, { type: 'heading', text: article.title || '' }];
  if (article.article_type === 'profile' && article.hero_image_url) {
    blocks.push({ type: 'image', url: article.hero_image_url, caption: article.title });
  }
  if (article.subtitle) blocks.push({ type: 'byline', text: article.subtitle });
  else if (article.writer_credit) blocks.push({ type: 'byline', text: article.writer_credit });
  (article.body || '')
    .split('\n\n')
    .filter(Boolean)
    .forEach((paragraph) => blocks.push({ type: 'body', text: paragraph }));
  return blocks;
}

// The pages the edition is bound into: cover, masthead, contents, a divider for each
// part of the book, then every article in its section — with the pull quotes kept as
// breakaway pages — and the colophon last.
export function buildEditionPages(issue, articles) {
  const sections = issue.sections || [];
  const pages = [];
  let number = 1;

  pages.push({ page_number: number++, layout_type: 'cover', status: 'draft', content_blocks: [], background_image_url: issue.cover_image_url || '' });
  pages.push({
    page_number: number++,
    layout_type: 'masthead',
    status: 'draft',
    content_blocks: [
      { type: 'heading', text: issue.title || '', level: 1 },
      { type: 'byline', text: issue.cover_kicker || '' },
    ],
  });
  pages.push({ page_number: number++, layout_type: 'toc', status: 'draft', content_blocks: [{ type: 'heading', text: 'Contents', level: 1 }] });

  const groups = ['front_of_book', 'well', 'back_of_book'];
  groups.forEach((group, i) => {
    const inGroup = sections.filter((section) => (section.section_group || 'well') === group);
    if (!inGroup.length) return;
    pages.push({
      page_number: number++,
      layout_type: 'chapter_divider',
      status: 'draft',
      chapter_number: i + 1,
      chapter_label: sectionGroupLabel(group),
      content_blocks: [],
    });

    inGroup.forEach((section) => {
      articles
        .filter((article) => article.section_id === section.id)
        .forEach((article) => {
          if (article.pull_quote) {
            pages.push({
              page_number: number++,
              layout_type: 'pull_quote',
              section_id: section.id,
              status: 'draft',
              content_blocks: [
                { type: 'pull_quote', text: article.pull_quote, attribution: article.pull_quote_attribution || '' },
              ],
            });
          }
          const page = {
            page_number: number++,
            layout_type: layoutFor(article),
            article_id: article.id,
            section_id: section.id,
            status: 'draft',
            content_blocks: blocksFor(article, section),
            background_image_url: article.hero_image_url || '',
          };
          pages.push(page);
          article.page_number = page.page_number;
        });
    });
  });

  pages.push({
    page_number: number++,
    layout_type: 'colophon',
    status: 'draft',
    content_blocks: [
      { type: 'heading', text: 'Colophon', level: 1 },
      { type: 'body', text: issue.colophon || '' },
    ],
  });

  return pages;
}

// The whole alchemy, end to end: an issue, its articles, and its pages.
export async function alchemizeTop100Women2025({ nominees = [] } = {}) {
  const payload = editionArticles(nominees);

  const issue = await base44.entities.MagazineIssue.create({
    ...TOP100_WOMEN_2025_ISSUE,
    status: 'draft',
    issue_number: 1,
    sections: EDITION_SECTIONS.map((section) => ({ ...section })),
  });

  const createdArticles = await base44.entities.MagazineArticle.bulkCreate(
    payload.map((article) => ({ ...article, issue_id: issue.id })),
  );
  const articles = Array.isArray(createdArticles) ? createdArticles : createdArticles?.records || [];

  const articleList = [...articles].sort((a, b) => (a.order || 0) - (b.order || 0));
  const pages = buildEditionPages(issue, articleList);

  const createdPages = await base44.entities.MagazinePage.bulkCreate(
    pages.map((page) => ({ ...page, issue_id: issue.id })),
  );
  const pageList = Array.isArray(createdPages) ? createdPages : createdPages?.records || [];

  // The articles are laid out once they are on a page, so the issue is publishable the
  // moment it is alchemized — and the contents page can print real page numbers.
  const laidOut = articleList.filter((article) => article.page_number);
  if (laidOut.length) {
    await base44.entities.MagazineArticle.bulkUpdate(
      laidOut.map((article) => ({
        id: article.id,
        page_number: article.page_number,
        status: 'laid_out',
      })),
    );
  }

  return {
    issue,
    articles: articleList.map((article) => ({ ...article, status: article.page_number ? 'laid_out' : article.status })),
    pages: pageList.sort((a, b) => a.page_number - b.page_number),
  };
}