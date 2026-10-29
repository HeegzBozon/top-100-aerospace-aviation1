import { base44 } from '@/api/base44Client';
import {
  EDITION_SECTIONS,
  editionArticles,
  editionIssue,
  editionSectionBlocks,
} from '@/components/magazine/top100WomenEdition';
import { buildEditionPages } from '@/components/magazine/editionPages';

// Rebinding: the same alchemy, applied to a copy of the edition that already exists.
//
// Binding is composition, and composition is code — so an issue composed by an older
// composer keeps the older book until it is bound again. Rebinding clears the issue's
// articles and pages and lays them out once more from the edition as it stands today,
// keeping the issue itself (its id, its number, its status) and therefore its links.
export async function rebindEdition({ issueId, nominees = [] }) {
  const issue = await base44.entities.MagazineIssue.get(issueId);
  const live = issue.status === 'published';

  const payload = editionArticles(nominees);
  const blockMap = editionSectionBlocks(nominees);
  const fresh = editionIssue(nominees);

  await base44.entities.MagazinePage.deleteMany({ issue_id: issueId });
  await base44.entities.MagazineArticle.deleteMany({ issue_id: issueId });

  const createdArticles = await base44.entities.MagazineArticle.bulkCreate(
    payload.map((article) => ({ ...article, issue_id: issueId, status: live ? 'published' : 'ready' })),
  );
  const articles = Array.isArray(createdArticles) ? createdArticles : createdArticles?.records || [];
  const articleList = [...articles].sort((a, b) => (a.order || 0) - (b.order || 0));

  const pages = buildEditionPages({ ...issue, sections: EDITION_SECTIONS.map((section) => ({ ...section })) }, articleList, blockMap);

  const createdPages = await base44.entities.MagazinePage.bulkCreate(
    pages.map((p) => ({ ...p, issue_id: issueId, status: live ? 'published' : 'draft' })),
  );
  const pageList = Array.isArray(createdPages) ? createdPages : createdPages?.records || [];

  const laidOut = articleList.filter((article) => article.page_number);
  if (laidOut.length) {
    await base44.entities.MagazineArticle.bulkUpdate(
      laidOut.map((article) => ({
        id: article.id,
        page_number: article.page_number,
        status: live ? 'published' : 'laid_out',
      })),
    );
  }

  // The issue keeps what makes it the issue — and takes the edition's current copy, so a
  // rebound book never prints last season's note about the roster.
  const bound = await base44.entities.MagazineIssue.update(issueId, {
    ...fresh,
    status: issue.status,
    issue_number: issue.issue_number,
    published_date: issue.published_date,
    cover_image_url: fresh.cover_image_url || issue.cover_image_url,
    sections: EDITION_SECTIONS.map((section) => ({ ...section })),
  });

  return {
    issue: bound || { ...issue, ...fresh },
    articles: articleList.map((article) => ({
      ...article,
      status: article.page_number ? (live ? 'published' : 'laid_out') : article.status,
    })),
    pages: pageList.sort((a, b) => a.page_number - b.page_number),
  };
}

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