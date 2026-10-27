import { sectionGroupLabel } from '@/components/magazine/magazineConfig';
import { clean, paragraphs, voiceOf } from '@/components/magazine/editionCopy';
import { HONOREES_SECTION_ID, NAME_INDEX_SECTION_ID } from '@/components/magazine/top100WomenEdition';

// The edition's page composer.
//
// Kept apart from the alchemy so the composition can be reasoned about — and
// exercised — with nothing but an issue and its articles in hand: the record-writing
// pass stays in alchemizeEdition, and the grammar of the book lives here.
//
// It composes with a magazine's grammar rather than a database's: a section opens
// with its kicker, its headline and its stand; a portrait opens with the region she is
// indexed under, her name, her stand, her photograph and her own words before the
// institutional read; a region opens on a divider that states what it carries; and the
// name index at the back is composed from the portraits already numbered ahead of it.

const layoutFor = (article) => (article.article_type === 'profile' ? 'profile' : 'article');

// A region's opening spread is an article of the index, and the composer needs to
// know it when it lays the index out — it is the only thing in the book that both
// breaks the run of portraits and carries a line of its own.
const isPackageOpener = (article) => article.article_type === 'feature' && article.section_id === HONOREES_SECTION_ID;

// The name a reader looks an honoree up by: the last word of the name she is printed
// under, and never an invention when there is only one word to hold.
const surnameOf = (name) => clean(name).split(' ').filter(Boolean).slice(-1)[0] || '';

const chunked = (list, size) => {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
};

// A section's own pages, composed from the editorial the edition holds for it.
function sectionBlocks(article, section, blockMap) {
  const authored = blockMap?.[section?.id];
  if (authored?.length) return authored;

  const blocks = [];
  if (section?.name) blocks.push({ type: 'kicker', text: section.name });
  if (article.title) blocks.push({ type: 'heading', text: article.title });
  if (article.subtitle) blocks.push({ type: 'byline', text: article.subtitle });
  else if (article.writer_credit) blocks.push({ type: 'byline', text: article.writer_credit });
  paragraphs(article.body).forEach((paragraph) => blocks.push({ type: 'body', text: paragraph }));
  if (article.pull_quote) {
    blocks.push({ type: 'pull_quote', text: article.pull_quote, attribution: article.pull_quote_attribution || '' });
  }
  return blocks;
}

// A portrait page, composed. Her own words come first — the record keeps them for
// most honorees, and they are the one thing a page of this kind can print that a
// directory cannot — and the institutional read follows, set as paragraphs rather
// than as one wall of text.
function portraitBlocks(article, region) {
  const blocks = [];
  const name = clean(article.title) || 'Honoree';

  if (region) blocks.push({ type: 'kicker', text: region });
  blocks.push({ type: 'heading', text: name });
  if (article.subtitle) blocks.push({ type: 'byline', text: article.subtitle });
  if (article.hero_image_url) {
    blocks.push({ type: 'image', url: article.hero_image_url, caption: article.teaser || '' });
  }

  const [lead = '', ...rest] = String(article.body || '').split('\n\n');
  const voice = voiceOf({ description: lead });
  if (voice) {
    blocks.push({ type: 'pull_quote', text: voice, attribution: name });
  } else if (clean(lead)) {
    blocks.push({ type: 'body', text: clean(lead) });
  }

  const read = paragraphs(rest.join(' '));
  if (read.length) {
    blocks.push({ type: 'divider' });
    read.forEach((paragraph) => blocks.push({ type: 'body', text: paragraph }));
  }
  return blocks;
}

// The pages of the name index: the letters each page carries, and the entries under
// them, set six to a line the way a printed index sets them. Read from the portraits
// already numbered in the book, so every folio on these pages is a real one.
function nameIndexBlocks(entries, sectionName) {
  const initial = (entry) => surnameOf(entry.name).charAt(0).toUpperCase();
  const perPage = Math.max(Math.ceil(entries.length / 3), 1);
  const sheets = chunked(entries, perPage);

  return sheets.map((chunk, i) => {
    const blocks = [
      { type: 'kicker', text: sectionName },
      {
        type: 'heading',
        text: initial(chunk[0]) === initial(chunk[chunk.length - 1])
          ? initial(chunk[0])
          : `${initial(chunk[0])}–${initial(chunk[chunk.length - 1])}`,
      },
    ];
    chunked(chunk.map((entry) => `${entry.name}, ${entry.page}`), 6)
      .forEach((rows) => blocks.push({ type: 'body', text: rows.join(' · ') }));
    if (i === sheets.length - 1) {
      blocks.push({ type: 'byline', text: 'Page numbers refer to the portraits in The Index.' });
    }
    return blocks;
  });
}

// The pages the edition is bound into: cover, masthead, contents, a divider for each
// part of the book, a divider and an opening spread for each region of the index,
// then every other section in its place — with pull quotes kept as breakaway pages —
// the name index composed last of the back matter, and the colophon after it.
export function buildEditionPages(issue, articles, blockMap) {
  const sections = issue.sections || [];
  const pages = [];
  let number = 1;
  let region = 1;

  // The region a portrait is indexed under is carried by the opening spread that
  // precedes it, so the composer walks the index the way a reader does.
  let currentRegion = '';
  articles.forEach((article) => {
    if (isPackageOpener(article)) currentRegion = article.title;
    else article.region = currentRegion;
  });

  const page = (spec) => {
    const placed = { ...spec, page_number: number++ };
    pages.push(placed);
    return placed;
  };

  page({
    layout_type: 'cover',
    status: 'draft',
    content_blocks: [],
    background_image_url: issue.cover_image_url || '',
  });
  page({
    layout_type: 'masthead',
    status: 'draft',
    content_blocks: [
      { type: 'heading', text: issue.title || '', level: 1 },
      { type: 'kicker', text: issue.cover_kicker || '' },
      { type: 'body', text: issue.preface || '' },
    ],
  });
  page({
    layout_type: 'toc',
    status: 'draft',
    content_blocks: [
      { type: 'heading', text: 'Contents', level: 1 },
      { type: 'body', text: issue.subtitle || '' },
    ],
  });

  const groups = ['front_of_book', 'well', 'back_of_book'];
  groups.forEach((group, i) => {
    const inGroup = sections.filter((section) => (section.section_group || 'well') === group);
    if (!inGroup.length) return;

    page({
      layout_type: 'chapter_divider',
      status: 'draft',
      chapter_number: i + 1,
      chapter_label: sectionGroupLabel(group),
      content_blocks: [],
    });

    inGroup.forEach((section) => {
      // The name index is composed from the book itself: every portrait is numbered by
      // the time the back of the book is reached, so a reader who knows a name finds
      // her by her letter rather than by remembering her region.
      if (section.id === NAME_INDEX_SECTION_ID) {
        const article = articles.find((item) => item.section_id === section.id);
        const entries = articles
          .filter((item) => item.article_type === 'profile' && item.page_number)
          .map((item) => ({ name: clean(item.title), page: item.page_number }))
          .sort((a, b) => surnameOf(a.name).localeCompare(surnameOf(b.name)) || a.name.localeCompare(b.name));
        if (!article || !entries.length) return;

        const placed = nameIndexBlocks(entries, section.name).map((blocks) =>
          page({
            layout_type: 'article',
            section_id: section.id,
            article_id: article.id,
            status: 'draft',
            content_blocks: blocks,
          }),
        );
        article.page_number = placed[0].page_number;
        return;
      }

      articles
        .filter((article) => article.section_id === section.id)
        .forEach((article) => {
          // The index opens a region at a time: a divider that says what the region
          // carries, then the names it carries.
          if (isPackageOpener(article)) {
            const placed = page({
              layout_type: 'chapter_divider',
              section_id: section.id,
              article_id: article.id,
              status: 'draft',
              chapter_number: region++,
              chapter_label: article.title,
              content_blocks: [{ type: 'body', text: article.teaser || '' }],
            });
            article.page_number = placed.page_number;
            return;
          }

          if (article.pull_quote) {
            page({
              layout_type: 'pull_quote',
              section_id: section.id,
              article_id: article.id,
              status: 'draft',
              content_blocks: [
                { type: 'pull_quote', text: article.pull_quote, attribution: article.pull_quote_attribution || '' },
              ],
            });
          }

          const portrait = article.article_type === 'profile';
          const placed = page({
            layout_type: layoutFor(article),
            article_id: article.id,
            section_id: section.id,
            status: 'draft',
            content_blocks: portrait ? portraitBlocks(article, article.region || '') : sectionBlocks(article, section, blockMap),
            background_image_url: portrait ? '' : article.hero_image_url || '',
          });
          article.page_number = placed.page_number;
        });
    });
  });

  page({
    layout_type: 'colophon',
    status: 'draft',
    content_blocks: [
      { type: 'heading', text: 'Colophon', level: 1 },
      { type: 'body', text: issue.colophon || '' },
    ],
  });

  return pages;
}