import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  ARTICLE_TYPE_LABELS,
  ISSUE_STATUS_LABELS,
  POST_TYPE_LABELS,
  byDateDesc,
  dayLabel,
  firstLine,
} from './newsstandConfig';

const rows = (result) => (Array.isArray(result) ? result : result?.items || []);

// A bulletin is stock once it is out. Drafts and queued posts stay behind the counter, and
// an archived one has been pulled; everything else is on the stand.
const isStocked = (bulletin) => {
  if (['draft', 'scheduled', 'archived'].includes(bulletin.status)) return false;
  if (!bulletin.published_date) return true;
  const date = new Date(bulletin.published_date);
  return Number.isNaN(date.getTime()) || date <= new Date();
};

const EMPTY = { loading: true, error: null, issues: [], articles: [], bulletins: [] };

// The stand's stock: the bound editions, the articles that ran inside them, and the
// bulletins — the house's own release notes and the writing Fellows file. Three reads in
// one round trip, read as four racks.
export default function useNewsstand() {
  const [stock, setStock] = useState(EMPTY);

  const load = useCallback(() => {
    setStock((prev) => ({ ...prev, loading: true, error: null }));
    return Promise.all([
      base44.entities.MagazineIssue.filter(
        { status: { $in: ['published', 'archived', 'preview'] } },
        { sort: '-created_date', limit: 40 },
      ),
      base44.entities.MagazineArticle.filter(
        { status: { $in: ['published', 'laid_out', 'ready'] } },
        { sort: '-created_date', limit: 80 },
      ),
      base44.entities.Bulletin.filter({}, { sort: '-published_date', limit: 80 }),
    ])
      .then(([issues, articles, bulletins]) => {
        setStock({
          loading: false,
          error: null,
          issues: rows(issues),
          articles: rows(articles),
          bulletins: rows(bulletins),
        });
      })
      .catch((error) => {
        setStock({
          loading: false,
          error: error?.message || 'The stand could not be read.',
          issues: [],
          articles: [],
          bulletins: [],
        });
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sections = useMemo(() => {
    const issueTitles = new Map(stock.issues.map((issue) => [issue.id, issue.title]));

    const issues = [...stock.issues].sort(byDateDesc('published_date', 'created_date')).map((issue) => ({
      key: `issue-${issue.id}`,
      rack: 'issues',
      title: issue.title || 'Untitled edition',
      subtitle: issue.subtitle || issue.cover_kicker || '',
      kicker: ISSUE_STATUS_LABELS[issue.status] || 'Edition',
      foot: issue.issue_number
        ? `Issue ${String(issue.issue_number).padStart(2, '0')}`
        : 'The house edition',
      meta: dayLabel(issue.published_date || issue.created_date),
      cover: issue.cover_image_url || '',
      to: `/magazine/${issue.id}`,
    }));

    const articles = [...stock.articles].sort(byDateDesc('created_date')).map((article) => ({
      key: `article-${article.id}`,
      rack: 'articles',
      kicker: ARTICLE_TYPE_LABELS[article.article_type] || 'Article',
      title: article.title || 'Untitled piece',
      meta: [article.writer_credit, issueTitles.get(article.issue_id)].filter(Boolean).join(' · '),
      teaser: article.teaser || article.subtitle || '',
      to: article.issue_id ? `/magazine/${article.issue_id}` : null,
    }));

    const stocked = stock.bulletins
      .filter(isStocked)
      .sort(byDateDesc('published_date', 'created_date'));

    const asBulletin = (bulletin) => {
      const body = bulletin.rich_body || bulletin.body || '';
      const platform = bulletin.scope === 'platform';
      return {
        key: `bulletin-${bulletin.id}`,
        rack: platform ? 'notes' : 'dispatches',
        kicker: platform
          ? 'Platform note'
          : POST_TYPE_LABELS[bulletin.post_type] || 'Bulletin',
        title: bulletin.title || firstLine(body, 90) || 'Bulletin',
        meta: [bulletin.author_name, dayLabel(bulletin.published_date || bulletin.created_date)]
          .filter(Boolean)
          .join(' · '),
        teaser: bulletin.title ? firstLine(body, 170) : '',
        body,
        html: !!bulletin.rich_body,
        link: bulletin.link || '',
        expandable: true,
      };
    };

    return {
      issues,
      articles,
      dispatches: stocked.filter((bulletin) => bulletin.scope !== 'platform').map(asBulletin),
      notes: stocked.filter((bulletin) => bulletin.scope === 'platform').map(asBulletin),
    };
  }, [stock]);

  return { ...stock, sections, reload: load };
}