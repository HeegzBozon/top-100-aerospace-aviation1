// What a reader has marked, and which issue's pages they mean.
//
// One small record per issue, kept on the machine the reading happened on: the page that
// was marked and what that page is called in the issue's own words. A bookmark is the
// reader's own ribbon — it is never read by discovery, ranking or scoring, and it is not
// shared with anyone.

const STORE_KEY = 'top100:issue-bookmarks';

const readStore = () => {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORE_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const writeStore = (store) => {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // A blocked or full store must never stop the reading.
  }
};

const normalise = (list) => (Array.isArray(list) ? list : [])
  .filter((entry) => entry && Number.isFinite(entry.page) && entry.page >= 0)
  .map((entry) => ({
    page: Math.max(0, Math.round(entry.page)),
    label: typeof entry.label === 'string' ? entry.label : '',
    at: entry.at || null,
  }))
  .sort((a, b) => a.page - b.page);

// One page is one ribbon: the list is always the issue's pages in order, never a run of
// the same page marked twice.
const uniqueByPage = (list) => {
  const seen = new Map();
  normalise(list).forEach((entry) => {
    if (!seen.has(entry.page)) seen.set(entry.page, entry);
  });
  return [...seen.values()].sort((a, b) => a.page - b.page);
};

export function readIssueBookmarks(issueId) {
  if (!issueId) return [];
  return uniqueByPage(readStore()[issueId]);
}

export function toggleIssueBookmark(issueId, { page = 0, label = '' } = {}) {
  if (!issueId) return [];
  const store = readStore();
  const list = uniqueByPage(store[issueId]);
  const at = Math.max(0, Math.round(page));
  const found = list.some((entry) => entry.page === at);
  const next = found
    ? list.filter((entry) => entry.page !== at)
    : [...list, { page: at, label, at: new Date().toISOString() }];
  store[issueId] = uniqueByPage(next);
  writeStore(store);
  return store[issueId];
}

export function removeIssueBookmark(issueId, page) {
  if (!issueId) return [];
  const store = readStore();
  const at = Math.max(0, Math.round(page));
  store[issueId] = uniqueByPage(store[issueId]).filter((entry) => entry.page !== at);
  writeStore(store);
  return store[issueId];
}