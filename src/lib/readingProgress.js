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

// A page turned faster than this was walked past, not read. The film's Skim setting holds
// every page for 1.6s, so a skimmed pass counts as turned; a page read at any honest pace
// takes longer than this, and is counted as read. Two tallies per issue, and whichever
// dominates says how the issue was gone through.
const SKIM_PAGE_MS = 2600;

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
  const prev = store[issueId];
  const next = Math.min(Math.max(page, 0), total - 1);
  const now = Date.now();

  let skimPages = prev?.skimPages || 0;
  let readPages = prev?.readPages || 0;

  if (prev && next < prev.page && next <= 1) {
    // Back to the beginning: this is a new pass, so what the last one counted no longer
    // describes it.
    skimPages = 0;
    readPages = 0;
  } else if (prev && next > prev.page && prev.updatedAt) {
    // How long each page of this stretch was actually given. The readers write as the page
    // turns, so the span between two writes is the time spent on the pages in between.
    const turned = next - prev.page;
    const perPage = (now - Date.parse(prev.updatedAt)) / turned;
    if (Number.isFinite(perPage) && perPage >= 0) {
      if (perPage < SKIM_PAGE_MS) skimPages += turned;
      else readPages += turned;
    }
  }

  store[issueId] = {
    page: next,
    total,
    title,
    skimPages,
    readPages,
    updatedAt: new Date(now).toISOString(),
  };
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // A blocked or full store must never stop the reading.
  }
  return asProgress(store[issueId]);
}

// A pass wiped: the reader is reading it again from the front, so the place and the tallies
// go with it and the issue reads as one never opened.
export function clearIssueProgress(issueId) {
  if (!issueId) return;
  const store = readStore();
  if (!(issueId in store)) return;
  delete store[issueId];
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // A blocked store simply keeps the old record; nothing else depends on the write.
  }
}

// How an issue has been gone through: not begun, being read, and once it is finished
// whether most of it was skimmed or actually read.
export function issueStatus(progress) {
  if (!progress) return { key: 'unread', label: 'Not begun', finished: false, skimmed: false };
  const finished = progress.percent >= 100;
  const skimmed = (progress.skimPages || 0) > (progress.readPages || 0);
  if (!finished) {
    return { key: 'reading', label: progress.page === 0 ? 'Not begun' : 'In progress', finished, skimmed };
  }
  return skimmed
    ? { key: 'skimmed', label: 'Skimmed', finished, skimmed }
    : { key: 'read', label: 'Read', finished, skimmed };
}

// The one word the title screen puts on the edition: not begun, part-read, or finished —
// and a finished pass, read or skimmed, invites the reader back into it.
export function progressCta(progress) {
  const status = issueStatus(progress);
  if (status.key === 'reading' && progress?.page > 0) return 'Resume';
  if (status.finished) return 'Read again';
  return 'Start';
}