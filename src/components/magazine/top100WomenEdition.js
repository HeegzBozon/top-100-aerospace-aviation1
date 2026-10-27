// The 2025 edition of the TOP 100 Women in Aerospace & Aviation, held as a magazine.
//
// Alchemized, not invented: every line below is read off the published
// /Top100Women2025 page — its nine sections in the order the page prints its own
// contents, the editorial copy each section carries, the credits and the closing
// matter. The hundred honorees come from the page's own resolver (see
// useTop100WomenNominees), so an issue built from here reads as the page does, one
// section at a time, with every entry still pointing at the record it came from.

export const HONOREES_SECTION_ID = 'sec-honorees';

// The nine sections the edition prints, in the page's own numbered order —
// 01 Masthead → 09 Closing. Nothing is added, nothing is dropped.
export const EDITION_SECTIONS = [
  { id: 'sec-masthead', name: 'Masthead', section_type: 'evergreen', section_group: 'front_of_book' },
  { id: 'sec-contents', name: 'Contents', section_type: 'evergreen', section_group: 'front_of_book' },
  { id: 'sec-manifesto', name: 'The Manifesto', section_type: 'feature', section_group: 'front_of_book' },
  { id: 'sec-portraits', name: 'Featured Portraits', section_type: 'feature', section_group: 'well' },
  { id: HONOREES_SECTION_ID, name: 'The Index', section_type: 'profile', section_group: 'well' },
  { id: 'sec-orbital-index', name: 'Connections', section_type: 'evergreen', section_group: 'well' },
  { id: 'sec-signal-report', name: 'Signal Report', section_type: 'evergreen', section_group: 'well' },
  { id: 'sec-archive', name: 'Archive', section_type: 'evergreen', section_group: 'back_of_book' },
  { id: 'sec-closing', name: 'Closing', section_type: 'colophon', section_group: 'back_of_book' },
].map((section, order) => ({ ...section, order }));

// What each section says, as the page says it.
export const EDITION_EDITORIALS = {
  'sec-masthead': {
    title: 'The Definitive Index',
    subtitle: 'Community-nominated. Peer-evaluated. A living index of aerospace excellence.',
    writer_credit: 'The Editors',
    body: [
      'TOP 100 — Women in Aerospace & Aviation.',
      'Community-nominated. Peer-evaluated. A living index of aerospace excellence.',
      'The Orbital Edition: 100 leaders defining the future of flight, drawn from more than thirty countries.',
    ].join('\n\n'),
    blocks: [
      { type: 'kicker', text: 'Official Publication' },
      { type: 'heading', text: 'The Definitive Index' },
      { type: 'body', text: 'Community-nominated. Peer-evaluated. A living index of aerospace excellence.' },
      { type: 'byline', text: 'The Orbital Edition · Vol I — 2025' },
    ],
  },
  'sec-contents': {
    title: 'Contents',
    subtitle: 'The 2025 edition, in nine parts.',
    writer_credit: 'The Editors',
    body: [
      '01 Masthead',
      '02 Contents',
      '03 The Manifesto — Why this list exists',
      '04 Featured Portraits — Leaders in focus',
      '05 The Index — Complete directory',
      '06 Connections — Network & geography',
      '07 Signal Report — Data & insights',
      '08 Archive — Export & continuity',
      '09 Closing',
    ].join('\n\n'),
    blocks: [
      { type: 'kicker', text: 'The 2025 Edition' },
      { type: 'heading', text: 'Contents' },
      { type: 'body', text: 'The edition runs in nine parts, in this order.' },
    ],
  },
  'sec-manifesto': {
    title: 'Why this list exists',
    subtitle: 'The record, editorial.',
    writer_credit: 'The Editors',
    body: [
      'The aerospace industry has long been defined by those who dare to look up and reach further. These 100 women represent the vanguard of that tradition.',
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
      { type: 'body', text: 'The aerospace industry has long been defined by those who dare to look up and reach further. These 100 women represent the vanguard of that tradition.' },
      { type: 'body', text: 'Engineers, executives, entrepreneurs, and visionaries reshaping what is possible in the sky and beyond. This publication is not a celebration of accomplishment past — it is a record of capability present, and potential realized.' },
      { type: 'pull_quote', text: 'A community-driven index of aerospace excellence — nominated by peers, validated by the industry, documented for history.', attribution: 'The Editors' },
      { type: 'body', text: 'Recognition, properly understood, is not a reward. It is a responsibility. To be named here is to accept a role in a larger narrative — one that will be read by the next generation of leaders deciding whether to enter this industry at all.' },
      { type: 'body', text: 'We do not rank. We index. We do not applaud. We document. The distinction matters.' },
    ],
  },
  'sec-portraits': {
    title: 'Leaders in focus',
    subtitle: 'The portraits.',
    writer_credit: 'The Editors',
    body: [
      'Each portrait opened here is one of the hundred named in this edition — photographed in the work they are known for.',
      'The section opens on the words the pioneers left behind, because the line runs through them.',
    ].join('\n\n'),
    pull_quote: 'The air is the only place free from prejudice.',
    pull_quote_attribution: 'Bessie Coleman, first African American woman pilot, 1921',
    blocks: [
      { type: 'kicker', text: 'The Portraits' },
      { type: 'heading', text: 'Leaders in focus' },
      { type: 'body', text: 'Each portrait opened here is one of the hundred named in this edition — photographed in the work they are known for.' },
      { type: 'pull_quote', text: 'The air is the only place free from prejudice.', attribution: 'Bessie Coleman, first African American woman pilot, 1921' },
    ],
  },
  [HONOREES_SECTION_ID]: {
    title: 'The Index',
    subtitle: 'The complete directory of the 2025 edition.',
    writer_credit: 'The Editors',
    body: [
      'One hundred names. Thousands of nominations. Every honoree validated by peers, measured by signal — not by status.',
      'Each entry that follows is one honoree of the edition, as the directory prints them.',
    ].join('\n\n'),
    blocks: [
      { type: 'kicker', text: 'The Ledger — Index' },
      { type: 'heading', text: 'The Index' },
      { type: 'byline', text: 'By The Editors' },
      { type: 'body', text: 'One hundred names. Thousands of nominations. Every honoree validated by peers, measured by signal — not by status.' },
      { type: 'body', text: 'Each entry that follows is one honoree of the edition, as the directory prints them.' },
    ],
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

// The issue itself: masthead, credits, opening word, closing matter.
export const TOP100_WOMEN_2025_ISSUE = {
  title: 'TOP 100 Women in Aerospace & Aviation',
  subtitle: 'The Orbital Edition',
  cover_kicker: 'Vol I — 2025',
  theme_accent: 'rose_gold',
  assembly_mode: 'native',
  cover_credits: {
    subject: 'The 2025 Honorees',
    photographer: 'TOP 100 Editorial',
    writer: 'The Editors',
  },
  preface:
    'The aerospace industry has long been defined by those who dare to look up and reach further. These 100 women represent the vanguard of that tradition.',
  colophon:
    'TOP 100 Women in Aerospace & Aviation — the Orbital Edition, Volume I (2025). Assembled from the published 2025 edition: its nine sections, its editorial copy, and the hundred names it resolves. Measurement only; personal lists, availability and sponsorship carry no weight in this record.',
};

// One honoree, as an entry of the edition. The record it came from is kept on the
// entry (`nominee_id`), so the issue never becomes a second copy of the directory.
export function honoreeArticle(nominee, order) {
  const role = nominee.professional_role || nominee.title || '';
  const org = nominee.company || nominee.organization || '';
  const stand = [role, org].filter(Boolean).join(' · ');
  const where = [nominee.country, nominee.industry].filter(Boolean).join(' · ');

  return {
    title: nominee.name || 'Unnamed honoree',
    subtitle: stand,
    teaser: stand || where,
    article_type: 'profile',
    status: 'ready',
    section_id: HONOREES_SECTION_ID,
    nominee_id: nominee.id,
    order,
    hero_image_url: nominee.avatar_url || nominee.photo_url || '',
    writer_credit: 'The Editors',
    body: [nominee.description, nominee.bio || nominee.bio_extended, nominee.impact_summary]
      .filter(Boolean)
      .join('\n\n'),
  };
}

// The edition's articles, in the order the page runs them: the nine section
// articles first, each followed by the honorees it carries.
export function editionArticles(nominees = []) {
  const articles = [];
  EDITION_SECTIONS.forEach((section) => {
    const editorial = EDITION_EDITORIALS[section.id];
    if (!editorial) return;
    articles.push({
      title: editorial.title,
      subtitle: editorial.subtitle || '',
      teaser: editorial.subtitle || '',
      article_type: section.section_type === 'feature' ? 'feature' : 'evergreen',
      status: 'ready',
      section_id: section.id,
      writer_credit: editorial.writer_credit || 'The Editors',
      body: editorial.body || '',
      pull_quote: editorial.pull_quote || '',
      pull_quote_attribution: editorial.pull_quote_attribution || '',
      order: articles.length,
    });

    if (section.id !== HONOREES_SECTION_ID) return;
    nominees.forEach((nominee) => {
      articles.push(honoreeArticle(nominee, articles.length));
    });
  });
  return articles;
}