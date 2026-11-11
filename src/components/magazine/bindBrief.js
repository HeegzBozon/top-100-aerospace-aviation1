import { base44 } from '@/api/base44Client';

// Binding a written brief onto an issue.
//
// A brief is copy and composition held in code — the same shape an edition takes when it
// is alchemized from the roster. Binding lays it down as the issue's articles and pages,
// so the magazine reads it exactly as it reads any other book: contents drawn from the
// sections, chapters opened by their dividers, calls to action gathered onto the Ad Astra
// page at the back.
//
// It is idempotent: the issue's own articles and pages are cleared and laid down again,
// while the issue itself — its id, its number, its status, its cover art — is kept, so
// every link to it survives a rebind and a newer brief never doubles the book.

const asList = (payload) => (Array.isArray(payload) ? payload : payload?.items || payload?.records || []);

// The article's own body is read back off its pages: what the pages carry is what the
// article says, so the inventory and the paper can never drift apart.
const bodyFrom = (pages, slug) =>
  pages
    .filter((page) => page.article === slug)
    .flatMap((page) => (page.blocks || []).filter((block) => block.type === 'body').map((block) => block.text))
    .filter(Boolean)
    .map((text) => `<p>${text}</p>`)
    .join('');

export async function bindBrief({ issueId, brief }) {
  if (!issueId || !brief) throw new Error('A brief and an issue are both required.');
  const issue = await base44.entities.MagazineIssue.get(issueId);
  const live = issue.status === 'published';

  await base44.entities.MagazinePage.deleteMany({ issue_id: issueId });
  await base44.entities.MagazineArticle.deleteMany({ issue_id: issueId });

  await base44.entities.MagazineArticle.bulkCreate(
    brief.articles.map((article) => ({
      issue_id: issueId,
      section_id: article.section_id || '',
      title: article.title,
      subtitle: article.subtitle || '',
      teaser: article.teaser || '',
      writer_credit: article.writer_credit || '',
      article_type: article.article_type || 'feature',
      order: article.order ?? 0,
      status: live ? 'published' : 'ready',
    })),
  );

  // Read back by order, so a slug always resolves to the record it was written for.
  const savedArticles = asList(
    await base44.entities.MagazineArticle.filter({ issue_id: issueId }, { sort: 'order', limit: 100 }),
  );
  const bySlug = new Map(
    brief.articles.map((article) => [
      article.slug,
      savedArticles.find((row) => Number(row.order) === Number(article.order ?? 0)),
    ]),
  );

  const laidDown = brief.pages.map((page) => {
    const article = page.article ? bySlug.get(page.article) : null;
    const row = {
      issue_id: issueId,
      page_number: page.page_number,
      layout_type: page.layout_type,
      section_id: page.section_id || '',
      chapter_label: page.chapter_label || '',
      content_blocks: page.blocks || [],
      article_id: article?.id || '',
      status: live ? 'published' : 'draft',
    };
    if (page.chapter_number != null) row.chapter_number = page.chapter_number;
    return row;
  });

  await base44.entities.MagazinePage.bulkCreate(laidDown);

  // Each article takes the page it opens on, and the words its pages carry.
  const laidOut = brief.articles
    .map((article) => {
      const record = bySlug.get(article.slug);
      if (!record) return null;
      const own = brief.pages.filter((page) => page.article === article.slug).map((page) => page.page_number);
      const body = bodyFrom(brief.pages, article.slug);
      return {
        id: record.id,
        page_number: own.length ? Math.min(...own) : null,
        ...(body ? { body } : {}),
      };
    })
    .filter(Boolean);

  if (laidOut.length) await base44.entities.MagazineArticle.bulkUpdate(laidOut);

  const identity = brief.identity || {};
  const bound = await base44.entities.MagazineIssue.update(issueId, {
    title: identity.title ?? issue.title,
    subtitle: identity.subtitle ?? issue.subtitle,
    cover_kicker: identity.cover_kicker ?? issue.cover_kicker,
    theme_accent: identity.theme_accent ?? issue.theme_accent,
    preface: identity.preface ?? issue.preface,
    colophon: identity.colophon ?? issue.colophon,
    contributors: identity.contributors ?? issue.contributors,
    sections: identity.sections || issue.sections || [],
    assembly_mode: 'native',
  });

  const pages = asList(await base44.entities.MagazinePage.filter({ issue_id: issueId }, { sort: 'page_number', limit: 200 }));
  const articles = asList(await base44.entities.MagazineArticle.filter({ issue_id: issueId }, { sort: 'order', limit: 100 }));

  return { issue: bound || issue, articles, pages };
}