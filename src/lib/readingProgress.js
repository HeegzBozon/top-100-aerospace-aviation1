// What a reader has read, and where they stopped.
//
// One small record per issue, kept on the machine the reading happened on: the page open
// when it was last written, how many pages the issue has, and when that was. The readers
// write it as the page turns — so it is always current — and the issue's own Save control
// writes it again on purpose, because a reader likes to be able to say so themselves.
//
// Nothing here measures a Fellow or an issue: it is one person's place in one publication,
// never read by discovery, ranking or scoring.

const STORE_KEY = 'top100:issue-progress';

const readStore = () => {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORE_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

// How far through the issue a page index stands: the cover is nothing read, the last page
// is the whole of it.
const asProgress = (entry) => {
  if (!entry || !entry.total) return null;
  const span = Math.max(entry.total - 1, 1);
  return {
    ...entry,
    percent: Math.min(100, Math.max(0, Math.round((entry.page / span) * 100))),
  };
};

export function readIssueProgress(issueId) {
  if (!issueId) return null;
  return asProgress(readStore()[issueId]);
}

export function saveIssueProgress(issueId, { page = 0, total = 0, title = '' } = {}) {
  if (!issueId || total < 1) return null;
  const store = readStore();
  store[issueId] = {
    page: Math.min(Math.max(page, 0), total - 1),
    total,
    title,
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // A blocked or full store must never stop the reading.
  }
  return asProgress(store[issueId]);
}

// The one word the title screen puts on the edition: not begun, part-read, or finished.
export function progressCta(progress) {
  if (!progress || progress.page === 0) return 'Start';
  return progress.percent >= 100 ? 'Read' : 'Resume';
}