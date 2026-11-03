// A page of an issue is an address.
//
// The issue itself is reached at /magazine/:issueId, and the page it stands open at
// travels with it as ?page=N — one-based, the way the folio prints it. So a spread can be
// handed to someone the way a printed page is: they open the link and the issue is already
// there, turned to the page that was being talked about.
//
// The address bar is kept in step as the reader turns, which is what makes the browser's
// own Copy address work, and what the Share control hands over.

const PARAM = 'page';

// The page named by the address, as an index — or null when the address names none. A
// number past the end of the issue is read as its last page rather than as nothing.
export const pageFromUrl = ({ total = 0 } = {}) => {
  if (typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get(PARAM);
  if (!raw) return null;
  const named = Number.parseInt(raw, 10);
  if (!Number.isFinite(named) || named < 1) return null;
  const index = named - 1;
  return total > 0 ? Math.min(index, total - 1) : index;
};

// The address follows the reader. Written with replaceState, so turning a page is not a
// navigation and the back button still leaves the issue rather than walking the pages.
export const writePageToUrl = (index) => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (index > 0) url.searchParams.set(PARAM, String(index + 1));
  else url.searchParams.delete(PARAM);
  window.history.replaceState(window.history.state, '', url);
};

// The link to hand on: this issue, standing open at this page, with nothing of this
// reader's own sitting in it — no restart, no mode, no fragment.
export const issuePageUrl = (index) => {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  if (index > 0) url.searchParams.set(PARAM, String(index + 1));
  return url.toString();
};