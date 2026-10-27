import { base44 } from '@/api/base44Client';
import {
  EDITION_SECTIONS,
  editionArticles,
  editionIssue,
  editionSectionBlocks,
} from '@/components/magazine/top100WomenEdition';
import { buildEditionPages } from '@/components/magazine/editionPages';

// Alchemy: the published 2025 edition page, turned into a magazine issue.
//
// The issue, its articles and its pages are built in one pass, so the studio ends up
// with an issue that stands on its own — a blueprint in eleven parts, an article for
// every section, an opening spread for every region of the index, an entry for every
// honoree, and pages composed from them — while every honoree entry keeps the record
// it was read from.
//
// The pages themselves are laid out by the edition's own composer (editionPages),
// which sets this payload with a magazine's grammar rather than a database's. Nothing
// a field left empty is ever printed, and no page is a table row.

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