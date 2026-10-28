import { base44 } from '@/api/base44Client';

// The issue the TOP 100 Women edition opens.
//
// Two surfaces need the same answer — the title screen, which reports how far the reader
// has got, and the edition's own route, which hands the issue to the reader — so the choice
// is made here once: the newest published Women edition, the newest archived one after it,
// and the newest of any kind where the issue is not bound as a Women edition.
const isWomenEdition = (issue) =>
  /women/i.test(issue?.title || '') || /women/i.test(issue?.cover_kicker || '') || /women/i.test(issue?.subtitle || '');

export function chooseWomenIssue(issues = []) {
  const women = issues.filter(isWomenEdition);
  const pool = women.length ? women : issues;
  return (
    pool.find((issue) => issue.status === 'published') ||
    pool.find((issue) => issue.status === 'archived') ||
    pool[0] ||
    null
  );
}

export const loadWomenIssue = () =>
  base44.entities.MagazineIssue
    .filter({}, { sort: '-created_date', limit: 50 })
    .then((page) => chooseWomenIssue(page?.items || []));