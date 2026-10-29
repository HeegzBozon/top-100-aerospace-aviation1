import {
  clean,
  countryOf,
  fieldOf,
  listNames,
  paragraphs,
  regionOf,
  standFrom,
  voiceOf,
} from '@/components/magazine/editionCopy';

// The 2025 edition of the TOP 100 Women in Aerospace & Aviation, held as a magazine.
//
// Alchemized, not invented: every line below is read off the published
// /Top100Women2025 page — its sections, the editorial copy each one carries, the
// credits and the closing matter — and every count is measured off the records the
// edition resolves. The honorees come from the page's own resolver (see
// useTop100WomenNominees), so an issue built from here reads as the page does, with
// every entry still pointing at the record it came from.

export const HONOREES_SECTION_ID = 'sec-honorees';
export const NAME_INDEX_SECTION_ID = 'sec-name-index';
// The measure's own opening feature: the three names that stand first, opened ahead of
// the run of the hundred with the room a first place earns.
export const FIRST_THREE_SECTION_ID = 'sec-first-three';

// The eleven parts of the book, in the order it prints them. The contents is a page,
// not a chapter: a magazine's contents is furniture, and giving it a section of its
// own only ever produced a section that duplicated the page.
//
// The Well holds the two sections that are the heart of an edition of this kind —
// the portraits and the index. The front of book sets the case and then lets the
// honorees speak it; everything after the directory sits at the back of the book,
// where a reader turns to it deliberately — including the one alphabet that finds a
// name, which is composed from the book's own portraits once they are numbered.
export const EDITION_SECTIONS = [
  { id: 'sec-masthead', name: 'Masthead', section_type: 'evergreen', section_group: 'front_of_book' },
  { id: 'sec-numbers', name: 'By the Numbers', section_type: 'evergreen', section_group: 'front_of_book' },
  { id: 'sec-manifesto', name: 'The Manifesto', section_type: 'feature', section_group: 'front_of_book' },
  { id: 'sec-voices', name: 'Voices', section_type: 'evergreen', section_group: 'front_of_book' },
  { id: FIRST_THREE_SECTION_ID, name: 'The First Three', section_type: 'feature', section_group: 'front_of_book' },
  { id: 'sec-portraits', name: 'Featured Portraits', section_type: 'feature', section_group: 'well' },
  { id: HONOREES_SECTION_ID, name: 'The Index', section_type: 'profile', section_group: 'well' },
  { id: 'sec-orbital-index', name: 'Connections', section_type: 'evergreen', section_group: 'back_of_book' },
  { id: 'sec-signal-report', name: 'Signal Report', section_type: 'evergreen', section_group: 'back_of_book' },
  { id: 'sec-archive', name: 'Archive', section_type: 'evergreen', section_group: 'back_of_book' },
  { id: NAME_INDEX_SECTION_ID, name: 'Index of Names', section_type: 'evergreen', section_group: 'back_of_book' },
  { id: 'sec-closing', name: 'Closing', section_type: 'colophon', section_group: 'back_of_book' },
].map((section, order) => ({ ...section, order }));

const count = (n) => Number(n || 0).toLocaleString('en-US');
const plural = (n, word) => `${count(n)} ${word}${n === 1 ? '' : 's'}`;

// The roster is one hundred names, and it is read as one hundred however the resolution
// lands: where a record is being corrected, reviewed or re-measured, the name still stands
// in the edition and the count carries the asterisk. No one is dropped from the hundred
// while their record is being put right.
export const ROSTER_LABEL = '100*';
export const ROSTER_NOTE =
  'One hundred names stand in this edition. The asterisk marks a record being corrected and reviewed; no name has been removed.';

// What the edition measures, read off the records it resolves. Used for the numbers
// page and for every line of copy that would otherwise have to claim a figure.
export function measure(nominees = []) {
  const countries = [...new Set(nominees.map(countryOf).filter(Boolean))];
  const regions = [...new Set(nominees.map((n) => regionOf(n.country)).filter(Boolean))];
  const fields = {};
  nominees.forEach((nominee) => {
    const field = fieldOf(nominee.industry);
    fields[field] = (fields[field] || 0) + 1;
  });
  return {
    names: nominees.length,
    countries,
    regions,
    fields: Object.entries(fields).sort((a, b) => b[1] - a[1]),
    withVoice: nominees.filter((nominee) => voiceOf(nominee)).length,
  };
}

// The voices the edition is heard in: one honoree from each region first, so the
// spread reads as the book rather than as the longest lines in it, then the strongest
// of what is left. A voice is the honoree's own first-person line, held on her record
// and printed as she wrote it.
export function voicesFrom(nominees = [], max = 6) {
  const heard = nominees
    .map((nominee) => ({ name: clean(nominee.name), text: voiceOf(nominee), region: regionOf(nominee.country) }))
    .filter((entry) => entry.name && entry.text.length >= 80);
  const picked = [];
  const seen = new Set();
  const take = (entry) => {
    if (!entry || !entry.text || seen.has(entry.text)) return;
    seen.add(entry.text);
    picked.push(entry);
  };
  const strongest = (list) => [...list].sort((a, b) => b.text.length - a.text.length);

  [...new Set(heard.map((entry) => entry.region))].forEach((region) => {
    take(strongest(heard.filter((entry) => entry.region === region))[0]);
  });
  strongest(heard).forEach((entry) => {
    if (picked.length < max) take(entry);
  });
  return picked.slice(0, max);
}

// The editorial each section says, as the page says it — with every figure measured
// rather than asserted. A section with a function is one whose copy carries counts.
const SECTION_EDITORIAL = {
  'sec-masthead': (m) => ({
    title: 'The Definitive Index',
    subtitle: 'Community-nominated. Peer-evaluated. A living index of aerospace excellence.',
    writer_credit: 'The Editors',
    body: [
      'Community-nominated. Peer-evaluated. A living index of aerospace excellence.',
      `${ROSTER_LABEL} names, working from ${plural(m.countries.length, 'country')} across ${plural(m.regions.length, 'region')}.`,
      'This is not a celebration of accomplishment past. It is a record of capability present, and of potential realized.',
    ].join('\n\n'),
    blocks: [
      { type: 'kicker', text: 'Official Publication' },
      { type: 'heading', text: 'The Definitive Index' },
      { type: 'body', text: 'Community-nominated. Peer-evaluated. A living index of aerospace excellence.' },
      { type: 'body', text: `${ROSTER_LABEL} names. ${plural(m.countries.length, 'country')}. ${plural(m.regions.length, 'region')}. One record.` },
      { type: 'byline', text: 'The Orbital Edition · Vol I — 2025' },
    ],
  }),

  // Read off the record, and printed as the record: no figure on this page is
  // asserted, and none is a projection.
  'sec-numbers': (m) => ({
    title: 'By the Numbers',
    subtitle: 'The 2025 measure, read off the record.',
    writer_credit: 'The Editors',
    body: [
      `${ROSTER_LABEL} names resolved from the 2025 pool.`,
      `${plural(m.countries.length, 'country')}. ${plural(m.regions.length, 'region')}.`,
      ...m.fields.slice(0, 5).map(([field, n]) => `${field} — ${count(n)}`),
      `${count(m.withVoice)} of the ${ROSTER_LABEL} names are heard on these pages in their own words.`,
      ROSTER_NOTE,
    ].join('\n\n'),
    blocks: [
      { type: 'kicker', text: 'Up Front' },
      { type: 'heading', text: 'By the Numbers' },
      { type: 'body', text: `${ROSTER_LABEL} names resolved from the 2025 pool.` },
      { type: 'body', text: `${plural(m.countries.length, 'country')}. ${plural(m.regions.length, 'region')}. One record.` },
      ...m.fields.slice(0, 5).map(([field, n]) => ({ type: 'body', text: `${field} — ${count(n)}` })),
      { type: 'byline', text: ROSTER_NOTE },
      { type: 'byline', text: `Measured from the published 2025 edition. Personal lists, availability and sponsorship carry no weight in this measure.` },
    ],
  }),

  'sec-manifesto': {
    title: 'Why this list exists',
    subtitle: 'The record, editorial.',
    writer_credit: 'The Editors',
    body: [
      'The aerospace industry has long been defined by those who dare to look up and reach further. The women in this edition represent the vanguard of that tradition.',
      'Engineers, executives, entrepreneurs, and visionaries reshaping what is possible in the sky and beyond. This publication is not a celebration of accomplishment past — it is a record of capability present, and potential realized.',
      'Recognition, properly understood, is not a reward. It is a responsibility. To be named here is to accept a role in a larger narrative — one that will be read by the next generation of leaders deciding whether to enter this industry at all.',
      'We do not rank. We index. We do not applaud. We document. The distinction matters.',
    ].join('\n\n'),
    pull_quote: 'A community-driven index of aerospace excellence — nominated by peers, validated by the industry, documented for history.',
    pull_quote_attribution: 'The Editors',
    blocks: [
      { type: 'kicker', text: 'The Record — Editorial' },
      { type: 'heading', text: 'Why this list exists' },
      { type: 'byline', text: 'By The Editors' },
      { type: 'body', text: 'The aerospace industry has long been defined by those who dare to look up and reach further. The women in this edition represent the vanguard of that tradition.' },
      { type: 'body', text: 'Engineers, executives, entrepreneurs, and visionaries reshaping what is possible in the sky and beyond. This publication is not a celebration of accomplishment past — it is a record of capability present, and potential realized.' },
      { type: 'pull_quote', text: 'A community-driven index of aerospace excellence — nominated by peers, validated by the industry, documented for history.', attribution: 'The Editors' },
      { type: 'body', text: 'Recognition, properly understood, is not a reward. It is a responsibility. To be named here is to accept a role in a larger narrative — one that will be read by the next generation of leaders deciding whether to enter this industry at all.' },
      { type: 'body', text: 'We do not rank. We index. We do not applaud. We document. The distinction matters.' },
    ],
  },

  // The honorees' own lines, gathered into one spread ahead of the directory: the
  // page that turns a book of names into a book with voices in it.
  'sec-voices': (m, nominees) => {
    const voices = voicesFrom(nominees);
    return {
      title: 'In Their Own Words',
      subtitle: 'The edition, as the honorees say it.',
      writer_credit: 'The Editors',
      body: [
        'One voice from each region of this edition, and the strongest of what is left, printed as each honoree wrote it.',
        `${count(m.withVoice)} of the ${count(m.names)} honorees in this edition are held in their own voice on the record; every portrait in The Index opens on hers.`,
      ].join('\n\n'),
      blocks: [
        { type: 'kicker', text: 'Voices' },
        { type: 'heading', text: 'In Their Own Words' },
        { type: 'body', text: `${count(m.withVoice)} of the ${count(m.names)} honorees in this edition are held in their own voice on the record; every portrait in The Index opens on hers.` },
        ...voices.map((voice) => ({ type: 'pull_quote', text: voice.text, attribution: voice.name })),
        { type: 'byline', text: 'Unedited, from the 2025 record.' },
      ],
    };
  },

  // The opening feature: the three names the measure placed first, and why a book of a
  // hundred opens on three. No authored blocks here — each of the three carries its own
  // spread (see firstThreeArticle) and the composer lays it out from the article itself.
  [FIRST_THREE_SECTION_ID]: {
    title: 'The First Three',
    subtitle: 'Where the measure lands first.',
    writer_credit: 'The Editors',
    body: [
      'A hundred names, and a first place among them. The measure placed three at the front of this edition; each is opened here at the length that standing earns, and met again in The Index with the rest of the hundred.',
      ROSTER_NOTE,
    ].join('\n\n'),
  },

  'sec-portraits': {
    title: 'Leaders in focus',
    subtitle: 'The portraits.',
    writer_credit: 'The Editors',
    body: [
      'Each portrait opened here is one of the names in this edition — photographed in the work she is known for.',
      'The section opens on the words the pioneers left behind, because the line runs through them.',
    ].join('\n\n'),
    pull_quote: 'The air is the only place free from prejudice.',
    pull_quote_attribution: 'Bessie Coleman, first African American woman pilot, 1921',
    blocks: [
      { type: 'kicker', text: 'The Portraits' },
      { type: 'heading', text: 'Leaders in focus' },
      { type: 'body', text: 'Each portrait opened here is one of the names in this edition — photographed in the work she is known for.' },
      { type: 'pull_quote', text: 'The air is the only place free from prejudice.', attribution: 'Bessie Coleman, first African American woman pilot, 1921' },
    ],
  },

  // The index is not an atlas: it is the measure, first to last. The count is the roster's
  // own — one hundred, with the asterisk the front matter explains — and the order is the
  // order the edition's record placed these names in.
  [HONOREES_SECTION_ID]: (m) => ({
    title: 'The Index',
    subtitle: 'The complete directory of the 2025 edition, in measured order.',
    writer_credit: 'The Editors',
    body: [
      `${ROSTER_LABEL} names, resolved from the 2025 pool. Every honoree validated by peers, measured by signal, never by status.`,
      `The index runs in the order the measure placed these names: first to last, and by nothing else.`,
      'Each entry that follows is one honoree of the edition as the directory prints her — her stand, her country, her own words where the record kept them, and the read the institution keeps.',
    ].join('\n\n'),
    blocks: [
      { type: 'kicker', text: 'The Ledger — Index' },
      { type: 'heading', text: 'The Index' },
      { type: 'byline', text: `By The Editors · ${ROSTER_LABEL} names` },
      { type: 'body', text: `${ROSTER_LABEL} names, resolved from the 2025 pool. Every honoree validated by peers, measured by signal, never by status.` },
      { type: 'body', text: 'The index runs in the order the measure placed these names: first to last, and by nothing else.' },
    ],
  }),

  // The one alphabet in the book. It carries no copy of its own: its pages are
  // composed from the portraits the edition has already numbered (see editionPages).
  [NAME_INDEX_SECTION_ID]: {
    title: 'Index of Names',
    subtitle: 'Every honoree in this edition, alphabetically, with the page she stands on.',
    writer_credit: 'The Editors',
    body: 'The names of this edition in one alphabet, each with the page her portrait stands on. The Index runs in measured order; this index runs by name. Page numbers refer to the portraits in The Index.',
    blocks: null,
  },

  'sec-orbital-index': {
    title: 'The Orbital Index',
    subtitle: 'Connections: how these leaders connect across regions, disciplines, and domains.',
    writer_credit: 'The Editors',
    body: [
      'How these leaders connect across regions, disciplines, and domains.',
      'Not a ranking — a record. The verified reputation graph of aerospace & aviation.',
    ].join('\n\n'),
    blocks: [
      { type: 'kicker', text: 'Connections' },
      { type: 'heading', text: 'The Orbital Index' },
      { type: 'body', text: 'How these leaders connect across regions, disciplines, and domains.' },
      { type: 'body', text: 'Not a ranking — a record. The verified reputation graph of aerospace & aviation.' },
    ],
  },

  'sec-signal-report': {
    title: 'The Signal Report',
    subtitle: 'Data-driven intelligence from the selection process.',
    writer_credit: 'The Editors',
    body: [
      'Data reflects the 2025 TOP 100 Women in Aerospace & Aviation selection process.',
      'Federal funding data sourced from USAspending.gov and NASA Tech Transfer APIs.',
    ].join('\n\n'),
    blocks: [
      { type: 'kicker', text: 'Intelligence' },
      { type: 'heading', text: 'The Signal Report' },
      { type: 'body', text: 'Data reflects the 2025 TOP 100 Women in Aerospace & Aviation selection process.' },
      { type: 'byline', text: 'Federal funding data sourced from USAspending.gov and NASA Tech Transfer APIs.' },
    ],
  },

  'sec-archive': {
    title: 'Previous Volumes',
    subtitle: 'Export and continuity.',
    writer_credit: 'The Editors',
    body: [
      'The editions behind this one, kept whole: every volume the community has published, with its ledger and its export.',
      'Archival records are immutable once a cycle is finalized. What was printed stays printed.',
    ].join('\n\n'),
    blocks: [
      { type: 'kicker', text: 'The Archive' },
      { type: 'heading', text: 'Previous Volumes' },
      { type: 'body', text: 'The editions behind this one, kept whole: every volume the community has published, with its ledger and its export.' },
      { type: 'body', text: 'Archival records are immutable once a cycle is finalized. What was printed stays printed.' },
    ],
  },

  'sec-closing': {
    title: 'Recognition is the beginning',
    subtitle: 'The back pages.',
    writer_credit: 'The Editors',
    body: 'To be indexed here is not an ending. It is an invitation — to connect, to collaborate, and to continue pushing the boundaries of what aerospace can achieve.',
    blocks: [
      { type: 'kicker', text: 'The Back Pages — Closing' },
      { type: 'heading', text: 'Recognition is the beginning' },
      { type: 'body', text: 'To be indexed here is not an ending. It is an invitation — to connect, to collaborate, and to continue pushing the boundaries of what aerospace can achieve.' },
    ],
  },
};

// Every editorial's blocks, keyed by section — the page composer lays pages out from
// these, so the copy keeps its shape (a quote where it belongs, a stand where it
// belongs) instead of being flattened into one column of paragraphs.
export function editionSectionBlocks(nominees = []) {
  const m = measure(nominees);
  return Object.fromEntries(
    EDITION_SECTIONS.map((section) => {
      const editorial = SECTION_EDITORIAL[section.id];
      const resolved = typeof editorial === 'function' ? editorial(m, nominees) : editorial;
      return [section.id, resolved?.blocks || null];
    }),
  );
}

const rankOf = (nominee) => (Number.isFinite(nominee?.finalRank) ? nominee.finalRank : Number.MAX_SAFE_INTEGER);

// The standing an entry is printed under: her own measured place where the record holds
// one, and her place in the run where it does not. A book of a hundred never prints an
// entry without a number.
const standingOf = (nominee, index = 0) =>
  (Number.isFinite(nominee?.finalRank) ? nominee.finalRank : index + 1);

// The order the book is read in: the measure, first to last. Region is still on every
// record, and still printed on every portrait — it no longer sets the order.
export function rankedNominees(nominees = []) {
  return [...nominees].sort(
    (a, b) => rankOf(a) - rankOf(b) || clean(a.name).localeCompare(clean(b.name)),
  );
}

// The three names at the front, opened at length: her own words as a breakaway page, then
// a spread that carries the record rather than one line of it. This is what gives first,
// second and third the room the rest of the hundred does not take.
export function firstThreeArticle(nominee, rank) {
  const stand = standFrom(nominee);
  const country = countryOf(nominee);
  const industry = clean(nominee.industry, 46);
  const where = [country, industry].filter(Boolean).join(' · ');
  const body = [
    clean(nominee.description),
    clean(nominee.impact_summary),
    clean(nominee.bio || nominee.bio_extended),
    clean(nominee.achievements),
  ].filter(Boolean).join('\n\n');
  const voice = voiceOf(nominee);

  return {
    title: clean(nominee.name) || 'Unnamed honoree',
    subtitle: `No. ${rank}${stand ? ` · ${stand}` : ''}`,
    teaser: where || stand,
    article_type: 'feature',
    status: 'ready',
    section_id: FIRST_THREE_SECTION_ID,
    nominee_id: nominee.id,
    hero_image_url: clean(nominee.avatar_url || nominee.photo_url),
    writer_credit: 'The Editors',
    pull_quote: voice || '',
    pull_quote_attribution: voice ? clean(nominee.name) : '',
    body,
  };
}

// The regions the index is read in, by the standing of the best-placed name in each, with a country the platform's own
// map does not carry reported as such rather than guessed at.
export function regionPackages(nominees = []) {
  const byRegion = new Map();
  nominees.forEach((nominee) => {
    const region = regionOf(nominee.country);
    if (!byRegion.has(region)) byRegion.set(region, []);
    byRegion.get(region).push(nominee);
  });

  return [...byRegion.entries()]
    .map(([region, names]) => {
      const countries = [...new Set(names.map(countryOf).filter(Boolean))].sort();
      return {
        region,
        names,
        countries,
        line: `${plural(names.length, 'name')} · ${plural(countries.length, 'country')}`,
      };
    })
    .map((pkg) => ({ ...pkg, names: [...pkg.names].sort((a, b) => rankOf(a) - rankOf(b)) }))
    .sort((a, b) => {
      // The region holding the edition's highest-standing name opens the index, then the
      // next, and so on; a country the map does not carry closes it.
      const beyond = (pkg) => (pkg.region === 'Beyond the Map' ? 1 : 0);
      return beyond(a) - beyond(b) || rankOf(a.names[0]) - rankOf(b.names[0]) || a.region.localeCompare(b.region);
    });
}

// A region's opening spread, as an article: it carries the contents line and the
// measured opening, so the index reads as an atlas rather than as one long run.
export function packageArticle(pkg) {
  return {
    title: pkg.region,
    subtitle: pkg.line,
    teaser: pkg.line,
    article_type: 'feature',
    status: 'ready',
    section_id: HONOREES_SECTION_ID,
    writer_credit: 'The Editors',
    body: `${pkg.line}. Names resolved by the country each honoree works from, and by nothing else. ${pkg.countries.length > 1 ? `The region is read from ${listNames(pkg.countries, 3)}.` : ''}`.trim(),
  };
}

// One honoree, as an entry of the edition: her stand, her country, her own words
// where the record kept them, and the institutional read. The record she came from
// is kept on the entry (`nominee_id`), so the issue never becomes a second copy of
// the directory.
export function honoreeArticle(nominee, region) {
  const stand = standFrom(nominee);
  const country = countryOf(nominee);
  const industry = clean(nominee.industry, 46);
  const summary = clean(nominee.description);
  const bio = clean(nominee.bio || nominee.bio_extended);
  const where = [country, industry].filter(Boolean).join(' · ');

  return {
    title: clean(nominee.name) || 'Unnamed honoree',
    subtitle: stand || where,
    teaser: where || country || stand,
    article_type: 'profile',
    status: 'ready',
    section_id: HONOREES_SECTION_ID,
    nominee_id: nominee.id,
    hero_image_url: clean(nominee.avatar_url || nominee.photo_url),
    writer_credit: 'The Editors',
    body: [summary, bio].filter(Boolean).join('\n\n'),
  };
}

// The edition's articles, in the order the book runs them: the sections in their own
// order, and inside the index, each region's opening spread followed by the names it
// carries.
export function editionArticles(nominees = []) {
  const m = measure(nominees);
  const articles = [];
  const push = (article) => articles.push({ ...article, order: articles.length });
  // The book's order, read once: the measure, first to last.
  const ranked = rankedNominees(nominees);

  EDITION_SECTIONS.forEach((section) => {
    const editorial = SECTION_EDITORIAL[section.id];
    const resolved = typeof editorial === 'function' ? editorial(m, nominees) : editorial;
    if (!resolved) return;

    push({
      title: resolved.title,
      subtitle: resolved.subtitle || '',
      teaser: resolved.subtitle || '',
      article_type: section.section_type === 'feature' ? 'feature' : 'evergreen',
      status: 'ready',
      section_id: section.id,
      writer_credit: resolved.writer_credit || 'The Editors',
      body: resolved.body || '',
      pull_quote: resolved.pull_quote || '',
      pull_quote_attribution: resolved.pull_quote_attribution || '',
    });

    // The first three carry the opening: one spread each, ahead of the run of the hundred.
    if (section.id === FIRST_THREE_SECTION_ID) {
      ranked.slice(0, 3).forEach((nominee, i) => push(firstThreeArticle(nominee, standingOf(nominee, i))));
    }

    if (section.id !== HONOREES_SECTION_ID) return;

    // The index runs as the measure placed it: first to last, and by nothing else. The
    // three at the front carry a breakaway page of their own words beside the portrait.
    ranked.forEach((nominee, i) => {
      const article = honoreeArticle(nominee);
      if (standingOf(nominee, i) <= 3) {
        article.pull_quote = voiceOf(nominee) || clean(nominee.description, 220);
        article.pull_quote_attribution = clean(nominee.name);
      }
      push(article);
    });
  });

  return articles;
}

// The issue itself: masthead, credits, opening word, closing matter — with the
// figures in its own copy measured rather than asserted.
export const TOP100_WOMEN_2025_ISSUE = {
  title: 'TOP 100 Women in Aerospace & Aviation',
  subtitle: 'The Orbital Edition',
  cover_kicker: 'Vol I — 2025',
  theme_accent: 'rose_gold',
  assembly_mode: 'native',
  // The cover is the edition's own artwork — an arc of rose gold on the institution's
  // navy — with the masthead set in type over it. No photograph is claimed here that
  // the edition cannot credit.
  cover_image_url: 'https://media.base44.com/images/public/68996845be6727838fdb822e/c908d2434_generated_image.png',
  // The cover is artwork rather than a photograph, and the credits say so: nothing
  // is claimed on the cover that the edition cannot show.
  cover_credits: {
    subject: 'The 2025 Edition',
    writer: 'The Editors',
  },
  preface:
    'The aerospace industry has long been defined by those who look up and reach further. This edition is the record of the women who did: the work they stand for, the country they work from, and the ground they hold for the next generation.',
  colophon:
    'TOP 100 Women in Aerospace & Aviation — The Orbital Edition, Volume I (2025). Assembled from the published 2025 edition: its eleven parts, its editorial copy, and the names it resolves. Measurement only; personal lists, availability and sponsorship carry no weight in this record.',
};

export function editionIssue(nominees = []) {
  const m = measure(nominees);
  return {
    ...TOP100_WOMEN_2025_ISSUE,
    preface: `The aerospace industry has long been defined by those who look up and reach further. This edition is the record of the ${ROSTER_LABEL} women who did: the work they stand for, the country they work from, and the ground they hold for the next generation. ${ROSTER_NOTE}`,
    colophon: `TOP 100 Women in Aerospace & Aviation — The Orbital Edition, Volume I (2025). Assembled from the published 2025 edition: its eleven parts, its editorial copy, and the ${ROSTER_LABEL} names it resolves across ${plural(m.countries.length, 'country')}. Measurement only; personal lists, availability and sponsorship carry no weight in this record.`,
    cover_credits: {
      subject: 'The 2025 Edition',
      writer: 'The Editors',
    },
  };
}

export { paragraphs };