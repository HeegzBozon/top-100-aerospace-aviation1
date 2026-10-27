import { base44 } from '@/api/base44Client';
import { sectionGroupLabel } from '@/components/magazine/magazineConfig';
import { clean, paragraphs, voiceOf } from '@/components/magazine/editionCopy';
import {
  EDITION_SECTIONS,
  HONOREES_SECTION_ID,
  editionArticles,
  editionIssue,
  editionSectionBlocks,
} from '@/components/magazine/top100WomenEdition';

// Alchemy: the published 2025 edition page, turned into a magazine issue.
//
// The issue, its articles and its pages are built in one pass, so the studio ends up
// with an issue that stands on its own — a blueprint in nine parts, an article for
// every section, an opening spread for every region of the index, an entry for every
// honoree, and pages composed from them — while every honoree entry keeps the record
// it was read from.
//
// Pages are composed with a magazine's grammar rather than a database's: a section
// opens with its kicker, its headline and its stand; a portrait opens with the
// region she is indexed under, her name, her stand, her photograph and her own words
// before the institutional read; a region opens on a divider that states what it
// carries. Nothing a field left empty is ever printed, and no page is a table row.

const layoutFor = (article) => (article.article_type === 'profile' ? 'profile' : 'article');

// A region's opening spread is an article of the index, and the composer needs to
// know it when it lays the index out — it is the only thing in the book that both
// breaks the run of portraits and carries a line of its own.
const isPackageOpener = (article) => article.article_type === 'feature' && article.section_id === HONOREES_SECTION_ID;

// A section's own pages, composed from the editorial the edition holds for it.
function sectionBlocks(article, section, blockMap) {
  const authored = blockMap?.[section?.id];
  if (authored?.length) return authored;

  const blocks = [];
  if (section?.name) blocks.push({ type: 'kicker', text: section.name });
  if (article.title) blocks.push({ type: 'heading', text: article.title });
  if (article.subtitle) blocks.push({ type: 'byline', text: article.subtitle });
  else if (article.writer_credit) blocks.push({ type: 'byline', text: article.writer_credit });
  paragraphs(article.body).forEach((paragraph) => blocks.push({ type: 'body', text: paragraph }));
  if (article.pull_quote) {
    blocks.push({ type: 'pull_quote', text: article.pull_quote, attribution: article.pull_quote_attribution || '' });
  }
  return blocks;
}

// A portrait page, composed. Her own words come first — the record keeps them for
// most honorees, and they are the one thing a page of this kind can print that a
// directory cannot — and the institutional read follows, set as paragraphs rather
// than as one wall of text.
function portraitBlocks(article, region) {
  const blocks = [];
  const name = clean(article.title) || 'Honoree';

  if (region) blocks.push({ type: 'kicker', text: region });
  blocks.push({ type: 'heading', text: name });
  if (article.subtitle) blocks.push({ type: 'byline', text: article.subtitle });
  if (article.hero_image_url) {
    blocks.push({ type: 'image', url: article.hero_image_url, caption: article.teaser || '' });
  }

  const [lead = '', ...rest] = String(article.body || '').split('\n\n');
  const voice = voiceOf({ description: lead });
  if (voice) {
    blocks.push({ type: 'pull_quote', text: voice, attribution: name });
  } else if (clean(lead)) {
    blocks.push({ type: 'body', text: clean(lead) });
  }

  const read = paragraphs(rest.join(' '));
  if (read.length) {
    blocks.push({ type: 'divider' });
    read.forEach((paragraph) => blocks.push({ type: 'body', text: paragraph }));
  }
  return blocks;
}

// The pages the edition is bound into: cover, masthead, contents, a divider for each
// part of the book, a divider and an opening spread for each region of the index,
// then every other section in its place — with pull quotes kept as breakaway pages —
// and the colophon last.
export function buildEditionPages(issue, articles, blockMap) {
  const sections = issue.sections || [];
  const pages = [];
  let number = 1;
  let region = 1;

  const page = (spec) => {
    const placed = { ...spec, page_number: number++ };
    pages.push(placed);
    return placed;
  };

  page({
    layout_type: 'cover',
    status: 'draft',
    content_blocks: [],
    background_image_url: issue.cover_image_url || '',
  });
  page({
    layout_type: 'masthead',
    status: 'draft',
    content_blocks: [
      { type: 'heading', text: issue.title || '', level: 1 },
      { type: 'kicker', text: issue.cover_kicker || '' },
      { type: 'body', text: issue.preface || '' },
    ],
  });
  page({
    layout_type: 'toc',
    status: 'draft',
    content_blocks: [
      { type: 'heading', text: 'Contents', level: 1 },
      { type: 'body', text: issue.subtitle || '' },
    ],
  });

  const groups = ['front_of_book', 'well', 'back_of_book'];
  groups.forEach((group, i) => {
    const inGroup = sections.filter((section) => (section.section_group || 'well') === group);
    if (!inGroup.length) return;

    page({
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
          // The index opens a region at a time: a divider that says what the region
          // carries, then the names it carries.
          if (isPackageOpener(article)) {
            const placed = page({
              layout_type: 'chapter_divider',
              section_id: section.id,
              article_id: article.id,
              status: 'draft',
              chapter_number: region++,
              chapter_label: article.title,
              content_blocks: [{ type: 'body', text: article.teaser || '' }],
            });
            article.page_number = placed.page_number;
            return;
          }

          if (article.pull_quote) {
            page({
              layout_type: 'pull_quote',
              section_id: section.id,
              article_id: article.id,
              status: 'draft',
              content_blocks: [
                { type: 'pull_quote', text: article.pull_quote, attribution: article.pull_quote_attribution || '' },
              ],
            });
          }

          const portrait = article.article_type === 'profile';
          const placed = page({
            layout_type: layoutFor(article),
            article_id: article.id,
            section_id: section.id,
            status: 'draft',
            content_blocks: portrait ? portraitBlocks(article, article.region || '') : sectionBlocks(article, section, blockMap),
            background_image_url: portrait ? '' : article.hero_image_url || '',
          });
          article.page_number = placed.page_number;
        });
    });
  });

  page({
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
  const blockMap = editionSectionBlocks(nominees);

  const issue = await base44.entities.MagazineIssue.create({
    ...editionIssue(nominees),
    status: 'draft',
    issue_number: 1,
    sections: EDITION_SECTIONS.map((section) => ({ ...section })),
  });

  const createdArticles = await base44.entities.MagazineArticle.bulkCreate(
    payload.map((article) => ({ ...article, issue_id: issue.id })),
  );
  const articles = Array.isArray(createdArticles) ? createdArticles : createdArticles?.records || [];

  const articleList = [...articles].sort((a, b) => (a.order || 0) - (b.order || 0));

  // The region a portrait is indexed under is carried by the opening spread that
  // precedes it, so the composer walks the index the way a reader does.
  let region = '';
  articleList.forEach((article) => {
    if (isPackageOpener(article)) region = article.title;
    else article.region = region;
  });

  const pages = buildEditionPages(issue, articleList, blockMap);

  const createdPages = await base44.entities.MagazinePage.bulkCreate(
    pages.map((p) => ({ ...p, issue_id: issue.id })),
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