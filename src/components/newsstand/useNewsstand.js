import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { chooseWomenIssue } from '@/components/magazine/womenEdition';
import {
  ARTICLE_TYPE_LABELS,
  ISSUE_STATUS_LABELS,
  POST_TYPE_LABELS,
  byDateDesc,
  dayLabel,
  firstLine,
} from './newsstandConfig';
import { newsletterNotes } from './newsletterArchive';

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
const WIRE_EMPTY = { loading: true, error: null, items: [], sources: [] };

// The stand's stock: the bound editions, the articles that ran inside them, and the
// bulletins — the house's own release notes and the writing Fellows file. Three reads in
// one round trip, read as four racks.
export default function useNewsstand() {
  const [stock, setStock] = useState(EMPTY);
  // The wire is read from the two networks on its own round trip, so a network that is down
  // leaves the rest of the stand standing.
  const [wire, setWire] = useState(WIRE_EMPTY);

  const load = useCallback(() => {
    setStock((prev) => ({ ...prev, loading: true, error: null }));
    return Promise.all([
      // One edition on the rack: the TOP 100 Women edition the house is printing. The same
      // resolver the title screen and the edition's own route use picks it, so the front page
      // and the reader can never disagree about which issue is the live one.
      base44.entities.MagazineIssue.filter({}, { sort: '-created_date', limit: 50 }),
      base44.entities.MagazineArticle.filter(
        { status: { $in: ['published', 'laid_out', 'ready'] } },
        { sort: '-created_date', limit: 80 },
      ),
      base44.entities.Bulletin.filter({}, { sort: '-published_date', limit: 80 }),
    ])
      .then(([issues, articles, bulletins]) => {
        const edition = chooseWomenIssue(rows(issues));
        setStock({
          loading: false,
          error: null,
          issues: edition ? [edition] : [],
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

  const loadWire = useCallback(() => {
    setWire((prev) => ({ ...prev, loading: true, error: null }));
    return base44.functions
      .invoke('getSocialFeed', {})
      .then((res) => {
        const data = res?.data || {};
        setWire({
          loading: false,
          error: null,
          items: data.items || [],
          sources: data.sources || [],
        });
      })
      .catch((error) => {
        setWire({
          loading: false,
          error: error?.message || 'The wire could not be read.',
          items: [],
          sources: [],
        });
      });
  }, []);

  useEffect(() => {
    load();
    loadWire();
  }, [load, loadWire]);

  const sections = useMemo(() => {
    const issueTitles = new Map(stock.issues.map((issue) => [issue.id, issue.title]));

    const issues = [...stock.issues].sort(byDateDesc('published_date', 'created_date')).map((issue) => ({
      key: `issue-${issue.id}`,
      rack: 'issues',
      title: issue.title || 'Untitled edition',
      subtitle: issue.subtitle || issue.cover_kicker || '',
      kicker: issue.status === 'draft' ? 'The edition' : ISSUE_STATUS_LABELS[issue.status] || 'Edition',
      foot: issue.issue_number
        ? `Issue ${String(issue.issue_number).padStart(2, '0')}`
        : 'The house edition',
      meta: dayLabel(issue.published_date || issue.created_date),
      cover: issue.cover_image_url || '',
      // An edition still at the press has no reader to open, so it lands on the published
      // edition page instead of a route that would come up empty.
      to: issue.status === 'draft' ? '/Top100Women2025' : `/magazine/${issue.id}`,
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
      // A post is set as one line of stock: the source printed above it, its own words below,
      // and the address it goes out from.
      wire: wire.items.map((post) => ({
        key: post.id,
        rack: 'wire',
        kicker: post.source === 'instagram' ? 'Instagram' : 'LinkedIn',
        title: firstLine(post.text, 220) || 'A photograph',
        meta: [post.account, dayLabel(post.publishedAt)].filter(Boolean).join(' · '),
        mediaUrl: post.mediaUrl,
        href: post.permalink,
      })),
      issues,
      articles,
      dispatches: stocked.filter((bulletin) => bulletin.scope !== 'platform').map(asBulletin),
      // The board by the door carries the newsletter: every edition the founder has mailed,
      // newest first, numbered by its own date. The archive is a fixed record, so it is read
      // from the series itself rather than from platform bulletins.
      notes: newsletterNotes(),
    };
  }, [stock, wire]);

  return { ...stock, sections, wire, reload: load, reloadWire: loadWire };
}