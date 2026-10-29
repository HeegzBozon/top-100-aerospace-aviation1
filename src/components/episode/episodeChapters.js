// The Fellow's own arc.
//
// An episode is told in up to twenty-two chapters, in the Fellow's order. The
// order in the array is the reading order — the book plays them exactly as they
// are set here, so there is never a second sequence to keep in step.
export const MAX_EPISODE_CHAPTERS = 22;

const clean = (v) => (typeof v === 'string' ? v.trim() : '');

// One chapter, cut to the length the page can carry. A chapter with no title and
// nothing written in it is not a chapter: it is dropped rather than printed blank.
export function normalizeChapters(rows) {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => ({
      title: clean(row?.title).slice(0, 120),
      body: clean(row?.body).slice(0, 1600),
    }))
    .filter((row) => row.title || row.body)
    .slice(0, MAX_EPISODE_CHAPTERS);
}