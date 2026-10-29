import { sectionGroupLabel } from '@/components/magazine/magazineConfig';
import { clean, paragraphs } from '@/components/magazine/editionCopy';
import {
  FIRST_THREE_SECTION_ID,
  HONOREES_SECTION_ID,
  NAME_INDEX_SECTION_ID,
} from '@/components/magazine/top100WomenEdition';

// The edition's page composer.
//
// Kept apart from the alchemy so the composition can be reasoned about — and
// exercised — with nothing but an issue and its articles in hand: the record-writing
// pass stays in alchemizeEdition, and the grammar of the book lives here.
//
// It composes with a magazine's grammar rather than a database's: a section opens with
// its kicker, its headline and its stand; the first three names each take a spread of
// their own — a face page, then a page of her own words; the index then runs in
// movements of ten, four names given a page each and the rest set as plates of three,
// four or two to a page; and the name index at the back is composed from the portraits
// already numbered ahead of it.

const layoutFor = (article) => (article.article_type === 'profile' ? 'profile' : 'article');

// The measure's opening: the names that stand first are given two pages each rather than
// one, which is what makes the front of the book feel like a front of the book.
const isOpeningFeature = (article) => article.section_id === FIRST_THREE_SECTION_ID && article.nominee_id;

// The index's rhythm. A hundred identical pages reads as a spreadsheet with photographs;
// four pages of one name, then a plate of faces, gives the run a pulse. The plate shapes
// cycle so no two movements in a row are laid out the same way.
const SOLOS_PER_MOVEMENT = 4;
const PLATE_RHYTHM = [[3, 3], [4, 2], [2, 4]];

// The name a reader looks an honoree up by: the last word of the name she is printed
// under, and never an invention when there is only one word to hold.
const surnameOf = (name) => clean(name).split(' ').filter(Boolean).slice(-1)[0] || '';

const chunked = (list, size) => {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
};

// The page's opening line, used when a record carries no voice of its own to set large.
const openingOf = (text) => {
  const [first = ''] = paragraphs(text);
  const line = clean(first);
  return line.length > 220 ? `${line.slice(0, 217).trimEnd()}…` : line;
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
function portraitBlocks(article, standing) {
  const blocks = [];
  const name = clean(article.title) || 'Honoree';

  if (standing) blocks.push({ type: 'kicker', text: standing });
  blocks.push({ type: 'heading', text: name });
  if (article.subtitle) blocks.push({ type: 'byline', text: article.subtitle });
  if (article.hero_image_url) {
    blocks.push({ type: 'image', url: article.hero_image_url, caption: article.teaser || '' });
  }

  const [lead = '', ...rest] = String(article.body || '').split('\n\n');
  const voice = openingOf(lead);
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

// The face page of a spread: the portrait to the trim, her standing and her name over it.
function facePage(article, standing) {
  const name = clean(article.title) || 'Honoree';
  return {
    layout_type: 'feature_spread',
    background_image_url: article.hero_image_url || '',
    content_blocks: [
      { type: 'kicker', text: `No. ${standing}` },
      { type: 'heading', text: name, level: 1 },
      ...(article.subtitle ? [{ type: 'byline', text: article.subtitle }] : []),
      ...(article.hero_image_url
        ? [{ type: 'image', url: article.hero_image_url, caption: article.teaser || '' }]
        : []),
    ],
  };
}

// The words page beside it: her voice at the size of the paper, and the read beneath.
function wordsPage(article) {
  const name = clean(article.title) || 'Honoree';
  const quote = clean(article.pull_quote) || openingOf(article.body);
  const read = paragraphs(article.body);

  return {
    layout_type: 'pull_quote',
    content_blocks: [
      { type: 'kicker', text: 'In her own words' },
      { type: 'pull_quote', text: quote, attribution: name },
      ...(read.length ? [{ type: 'divider' }, ...read.map((text) => ({ type: 'body', text }))] : []),
    ],
  };
}

// A plate: the faces of a movement, set together, with the standing each one holds.
function platePage(tiles, label) {
  return {
    layout_type: 'article',
    content_blocks: [
      { type: 'kicker', text: label },
      ...tiles.map(({ article, standing }) => ({
        type: 'image',
        url: article.hero_image_url || '',
        text: clean(article.title) || 'Honoree',
        caption: article.subtitle || article.teaser || '',
        attribution: `No. ${standing}`,
        level: standing,
      })),
    ],
  };
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

// The pages the edition is bound into: cover, masthead, contents, a divider for each part
// of the book, the opening spreads, the index in its movements, then every other section
// in its place — with pull quotes kept as breakaway pages — the name index composed last
// of the back matter, and the colophon after it.
export function buildEditionPages(issue, articles, blockMap) {
  const sections = issue.sections || [];
  const pages = [];
  let number = 1;

  // The portraits are numbered as the composer walks them, so the standing printed on a
  // page is the standing the book actually runs in: the measure, first to last.
  let standing = 0;

  const page = (spec) => {
    const placed = { ...spec, page_number: number++ };
    pages.push(placed);
    return placed;
  };

  // The first three: a face page, then a page of her own words. Two pages each, ahead of
  // the run of the hundred.
  const composeOpening = (list, section) => {
    list.forEach((article) => {
      if (!isOpeningFeature(article)) {
        const placed = page({
          layout_type: layoutFor(article),
          article_id: article.id,
          section_id: section.id,
          status: 'draft',
          content_blocks: sectionBlocks(article, section, blockMap),
          background_image_url: article.hero_image_url || '',
        });
        article.page_number = placed.page_number;
        return;
      }

      standing += 1;
      const face = page({
        ...facePage(article, standing),
        article_id: article.id,
        section_id: section.id,
        status: 'draft',
      });
      article.page_number = face.page_number;

      page({
        ...wordsPage(article),
        article_id: article.id,
        section_id: section.id,
        status: 'draft',
      });
    });
  };

  // The index: movements of ten — four names with a page each, then plates for the rest.
  const composeIndex = (list, section) => {
    // The section's own opening line is not a honoree: it opens The Index, and then the
    // run of the hundred begins beneath it.
    const portraits = list.filter((article) => {
      if (article.nominee_id) return true;
      const placed = page({
        layout_type: layoutFor(article),
        article_id: article.id,
        section_id: section.id,
        status: 'draft',
        content_blocks: sectionBlocks(article, section, blockMap),
      });
      article.page_number = placed.page_number;
      return false;
    });

    let at = 0;
    let movement = 0;

    while (at < portraits.length) {
      const solos = Math.min(SOLOS_PER_MOVEMENT, portraits.length - at);
      for (let k = 0; k < solos; k += 1) {
        const article = portraits[at];
        standing += 1;
        const placed = page({
          layout_type: 'profile',
          article_id: article.id,
          section_id: section.id,
          status: 'draft',
          content_blocks: portraitBlocks(article, `No. ${standing}`),
        });
        article.page_number = placed.page_number;
        at += 1;
      }

      const rhythm = PLATE_RHYTHM[movement % PLATE_RHYTHM.length];
      for (const size of rhythm) {
        if (at >= portraits.length) break;
        const take = Math.min(size, portraits.length - at);
        if (take < 2) break;

        const tiles = portraits.slice(at, at + take).map((article) => {
          standing += 1;
          return { article, standing };
        });
        const placed = page({
          ...platePage(tiles, `The Index · No. ${tiles[0].standing}–${tiles[tiles.length - 1].standing}`),
          section_id: section.id,
          status: 'draft',
        });
        tiles.forEach(({ article }) => { article.page_number = placed.page_number; });
        at += take;
      }

      movement += 1;
    }
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
      // her by her letter rather than by remembering where she stood in the run.
      if (section.id === NAME_INDEX_SECTION_ID) {
        const article = articles.find((item) => item.section_id === section.id);
        const entries = articles
          .filter((item) => item.nominee_id && item.page_number)
          .filter((item) => item.article_type === 'profile' || item.section_id === FIRST_THREE_SECTION_ID)
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

      const under = articles.filter((article) => article.section_id === section.id);

      if (section.id === FIRST_THREE_SECTION_ID) {
        composeOpening(under, section);
        return;
      }

      if (section.id === HONOREES_SECTION_ID) {
        composeIndex(under, section);
        return;
      }

      under.forEach((article) => {
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

        const placed = page({
          layout_type: layoutFor(article),
          article_id: article.id,
          section_id: section.id,
          status: 'draft',
          content_blocks: sectionBlocks(article, section, blockMap),
          background_image_url: article.hero_image_url || '',
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