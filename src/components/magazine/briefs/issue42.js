// Issue 42 — Algorithms, Alchemy, and Aerospace
//
// The written brief for the Season 4 Selection Committee issue. It is the same argument
// as the LinkedIn letter that goes out the same week, given the paper it deserves: the
// editor's note in full, the method set out at length, the long view, the invitation.
//
// The brief holds copy and composition only. Nothing here writes a record: bindBrief
// lays it down as the issue's articles and pages, so an issue composed from this file
// reads in the magazine exactly as an edition composed from the roster does.
//
// Copy rules the house keeps: a person is a Fellow, or a nominee before induction;
// nothing is "ranked" as a verb (the ballot is ranked choice, and the community measures);
// patrons support the platform and never touch the ballot; verification is never bought.

const SECTIONS = [
  {
    id: 'front-of-book',
    name: 'Front of Book',
    section_type: 'evergreen',
    section_group: 'front_of_book',
    order: 0,
  },
  {
    id: 'the-alchemy',
    name: 'The Alchemy',
    section_type: 'feature',
    section_group: 'well',
    order: 1,
  },
  {
    id: 'the-work-ahead',
    name: 'The Work Ahead',
    section_type: 'feature',
    section_group: 'back_of_book',
    order: 2,
  },
];

const ARTICLES = [
  {
    slug: 'editors-note',
    section_id: 'front-of-book',
    title: 'Who Picks the TOP 100?',
    subtitle: 'An editor’s note on the season, the ballot, and the room you are already in.',
    teaser: 'You do. A note from the founder as the ballot opens to the wider network.',
    writer_credit: 'By Matthew Higa',
    article_type: 'evergreen',
    order: 0,
  },
  {
    slug: 'the-alchemy',
    section_id: 'the-alchemy',
    title: 'The Humbler Trick',
    subtitle: 'Popularity goes in. Measurement comes out.',
    teaser: 'Why the ballot is ranked choice, what an order tells us that a count cannot, and why the ballot is sealed.',
    writer_credit: 'By Matthew Higa',
    article_type: 'feature',
    order: 1,
  },
  {
    slug: 'was-is-will-be',
    section_id: 'the-alchemy',
    title: 'Was. Is. Will Be.',
    subtitle: 'The same thing, getting truer every season.',
    teaser: 'Three movements: from recognition to proof, from a list to an institution, from a community to a nation.',
    writer_credit: 'By Matthew Higa',
    article_type: 'feature',
    order: 2,
  },
  {
    slug: 'every-voter-is-a-sensor',
    section_id: 'the-alchemy',
    title: 'Every Voter Is a Sensor',
    subtitle: 'One sensor gives you a guess. Many give you the truth.',
    teaser: 'On sensor fusion, and why there is no judges’ panel: the community is the algorithm.',
    writer_credit: 'By Matthew Higa',
    article_type: 'feature',
    order: 3,
  },
  {
    slug: 'why-youre-hearing-this-now',
    section_id: 'the-work-ahead',
    title: 'Why You’re Hearing This Now',
    subtitle: 'The ballot opened in waves. Today it reaches you.',
    teaser: 'Built in the open, and shaped by the people who use it.',
    writer_credit: 'By Matthew Higa',
    article_type: 'evergreen',
    order: 4,
  },
  {
    slug: 'your-own-100',
    section_id: 'the-work-ahead',
    title: 'Your Own 100',
    subtitle: 'The index is where it starts, not where it ends.',
    teaser: 'The pieces being shipped to take a connection through to an offer — and where the record points next.',
    writer_credit: 'By Matthew Higa',
    article_type: 'feature',
    order: 5,
  },
];

const PAGES = [
  {
    page_number: 1,
    layout_type: 'cover',
    // The cover is set in type: one block is enough to tell the plate it carries copy of
    // its own, and the renderer prints the masthead, the issue and the rule over it.
    blocks: [{ type: 'kicker', text: 'Issue 42 · Season 4' }],
  },
  { page_number: 2, layout_type: 'masthead', blocks: [] },
  { page_number: 3, layout_type: 'toc', blocks: [] },

  // ── Front of book ────────────────────────────────────────────────────────────
  {
    page_number: 4,
    layout_type: 'article',
    section_id: 'front-of-book',
    article: 'editors-note',
    blocks: [
      { type: 'kicker', text: 'Editor’s Note' },
      { type: 'heading', text: 'Who Picks the TOP 100?' },
      { type: 'byline', text: 'Matthew Higa, Founder' },
      {
        type: 'body',
        text: `People ask me who picks the TOP 100, usually in the tone of someone expecting a room they will never be let into. The answer is short enough to write on one line. You do.`,
      },
      {
        type: 'body',
        text: `Season 4 belongs to the women of aerospace and aviation. More than five hundred of them have been nominated by the community, from around the world. Voting closes on December 14. Volume VIII publishes on New Year’s Eve.`,
      },
      {
        type: 'body',
        text: `Being named to it will mean something different depending on who you are, and it should. A record that means the same thing to everyone means nothing to anyone in particular.`,
      },
      {
        type: 'body',
        text: `For some of you, this is one more line on a long record. You have held bigger prizes from older institutions, and we know it. What we hope this gives you is the thing those institutions cannot: a seat next to people you would never meet in those rooms, and a way to vouch for them.`,
      },
    ],
  },
  {
    page_number: 5,
    layout_type: 'article',
    section_id: 'front-of-book',
    article: 'editors-note',
    blocks: [
      { type: 'kicker', text: 'Editor’s Note · continued' },
      { type: 'heading', text: 'Three Kinds of Reader' },
      {
        type: 'body',
        text: `For others, this is the first time anyone outside your own team has put your work into words. You build, you test, you fix, you ship. You do not post about it. This recognition is yours to carry into the review, the promotion case, the next role — and to show the people at home who have watched you do it.`,
      },
      {
        type: 'body',
        text: `And for the voices: the ones who keep this industry visible through podcasts, posts and panels. Your reach is real and it matters. It does its best work when it points at somebody else. This issue is an invitation to do exactly that, once, with a ballot.`,
      },
      {
        type: 'body',
        text: `Which brings us to the tension we would rather name than let you find.`,
      },
      {
        type: 'body',
        text: `Community voting favors people with networks. Our early seasons leaned further on popularity than we wanted, and we are not going to pretend otherwise in an issue about measurement. We are building our way out of it, in public, and the rest of this issue is the blueprint.`,
      },
      {
        type: 'cta',
        text: 'Join the Selection Committee',
        url: '/vote',
        caption: 'Voting closes December 14. One voter, one record.',
      },
    ],
  },

  // ── The well ────────────────────────────────────────────────────────────────
  {
    page_number: 6,
    layout_type: 'chapter_divider',
    section_id: 'the-alchemy',
    chapter_number: 1,
    chapter_label: 'The Alchemy',
    blocks: [{ type: 'body', text: 'Turning popularity into measurement.' }],
  },
  {
    page_number: 7,
    layout_type: 'article',
    section_id: 'the-alchemy',
    article: 'the-alchemy',
    blocks: [
      { type: 'kicker', text: 'The Alchemy' },
      { type: 'heading', text: 'The Humbler Trick' },
      { type: 'byline', text: 'Matthew Higa' },
      {
        type: 'body',
        text: `Alchemists spent centuries trying to turn lead into gold. Ours is a humbler trick, and it takes one ballot at a time.`,
      },
      {
        type: 'body',
        text: `Every community vote starts with the same raw material: popularity. Who has the following. Who can send the most people. Left alone, that is all a vote can measure — and it is why so many industry lists read like a directory of who is best at asking.`,
      },
      {
        type: 'body',
        text: `So the ballot asks for something harder than a like. It is ranked choice. You put the nominees in order, your strongest pick first, and you keep going for as long as you have a view. Not who is loudest. Whose work moves this industry furthest.`,
      },
      {
        type: 'pull_quote',
        text: 'Popularity goes in. Measurement comes out.',
        attribution: 'Matthew Higa',
      },
    ],
  },
  {
    page_number: 8,
    layout_type: 'article',
    section_id: 'the-alchemy',
    article: 'the-alchemy',
    blocks: [
      { type: 'kicker', text: 'The Alchemy · continued' },
      { type: 'heading', text: 'What an Order Tells Us' },
      {
        type: 'body',
        text: `A count of taps tells you how many people arrived. An order tells you what a person who knows the field believes, name by name, against every other name on their ballot. One ballot carries the shape of a whole judgment, and the record keeps the shape.`,
      },
      {
        type: 'body',
        text: `It is also the reason the ballot is sealed. One voter, one record. A ballot is not a post: it is not public, and nobody sees how you ordered your names — including the people you ordered first. Measurement that can be watched is measurement that can be gamed.`,
      },
      {
        type: 'body',
        text: `And a note on the room you are voting in. Sponsors support this platform. They never touch the ballot. Sponsorship buys attribution, and it buys nothing else — not a ballot, not an order, not a page in the Volume. Featured placement is an editorial decision and is never for sale. If you ever see that line crossed, the line is the thing worth writing to the masthead about.`,
      },
    ],
  },
  {
    page_number: 9,
    layout_type: 'article',
    section_id: 'the-alchemy',
    article: 'was-is-will-be',
    blocks: [
      { type: 'kicker', text: 'The Long View' },
      { type: 'heading', text: 'Was. Is. Will Be.' },
      {
        type: 'body',
        text: `What TOP 100 was is not what it is. What it is is not what it will be. It is the same thing, getting truer every season.`,
      },
      { type: 'heading', text: 'Recognition of excellence, becoming proof of excellence' },
      {
        type: 'body',
        text: `A name on a page is nice. A verified record that stays — the role, the work, the words attached to it, the people who put you there — is something you can build a career on. That is the direction of travel: from being recognized once, to being legible always.`,
      },
      { type: 'heading', text: 'A list, becoming an institution' },
      {
        type: 'body',
        text: `Lists come and go every year, and mostly they go. An institution outlasts seasons, editions and founders. It has a standard, a method, and an archive that does not change after the fact. We are building the second thing. It is slower, and it will outlive all of us.`,
      },
      { type: 'heading', text: 'A community, becoming a nation' },
      {
        type: 'body',
        text: `A community is people who show up. A nation is people who claim it as theirs — who take responsibility for who else gets in, and who speak for it in rooms we will never be in. The difference is not sentiment. It is the difference between an audience and a citizenry.`,
      },
      {
        type: 'body',
        text: `What does not change: it should be useful, it should be fun, and it should make the next generation want in.`,
      },
    ],
  },
  {
    page_number: 10,
    layout_type: 'article',
    section_id: 'the-alchemy',
    article: 'every-voter-is-a-sensor',
    blocks: [
      { type: 'kicker', text: 'The Method' },
      { type: 'heading', text: 'Every Voter Is a Sensor' },
      { type: 'byline', text: 'Matthew Higa' },
      {
        type: 'body',
        text: `Before TOP 100, I spent years in sensor fusion: taking scattered, noisy, partial signals and turning them into one clear picture of what is actually out there.`,
      },
      {
        type: 'body',
        text: `The principle is simple. One sensor gives you a guess. Many sensors, each seeing the same thing from a different angle, give you the truth — not because any one of them is right, but because their errors do not agree with each other.`,
      },
      {
        type: 'body',
        text: `A single judge can be wrong, or biased, or simply tired on a Tuesday. A community of peers, each measuring from their own seat — the cockpit, the cleanroom, the launch pad, the boardroom — converges on something no panel could see alone. The disagreements are the useful part. They are what cancels the noise.`,
      },
      {
        type: 'body',
        text: `More sensors, stronger signal. Which is the whole reason this issue is addressed to you, rather than to a shortlist of people we already know.`,
      },
    ],
  },
  {
    page_number: 11,
    layout_type: 'pull_quote',
    section_id: 'the-alchemy',
    blocks: [
      {
        type: 'pull_quote',
        text: 'There is no judges’ panel. The Selection Committee is the community. The community is the algorithm.',
        attribution: 'Matthew Higa, Founder',
      },
    ],
  },

  // ── Back of book ────────────────────────────────────────────────────────────
  {
    page_number: 12,
    layout_type: 'chapter_divider',
    section_id: 'the-work-ahead',
    chapter_number: 2,
    chapter_label: 'The Work Ahead',
    blocks: [{ type: 'body', text: 'Building in the open, and what the door opens onto.' }],
  },
  {
    page_number: 13,
    layout_type: 'article',
    section_id: 'the-work-ahead',
    article: 'why-youre-hearing-this-now',
    blocks: [
      { type: 'kicker', text: 'In the Open' },
      { type: 'heading', text: 'Why You’re Hearing This Now' },
      {
        type: 'body',
        text: `We have been opening the ballot in waves. Our core team went first. Then a small test group. Earlier this week, the community on the platform. Today, it is you.`,
      },
      {
        type: 'body',
        text: `There is no launch moment coming where the doors open and everything is finished. We are building this in the open, and we want it shaped by the people who will use it. Tell us what works. Tell us what does not — especially if it is the ballot.`,
      },
      {
        type: 'body',
        text: `You can reply to this issue, or put half an hour in my diary and tell me directly. Both reach the same desk.`,
      },
      {
        type: 'cta',
        text: 'Book a time to talk',
        url: 'https://calendar.app.google/TrL8saY6XS6tdVj1A',
        caption: 'Half an hour, no agenda beyond the record.',
      },
    ],
  },
  {
    page_number: 14,
    layout_type: 'article',
    section_id: 'the-work-ahead',
    article: 'your-own-100',
    blocks: [
      { type: 'kicker', text: 'Your Own 100' },
      { type: 'heading', text: 'The Index Is Where It Starts' },
      {
        type: 'body',
        text: `The index is where this begins, not where it ends. The point of a measured record is not that you can read it. It is that you can use it.`,
      },
      {
        type: 'body',
        text: `The goal is to help you build your own TOP 100: the people worth connecting with, and worth working with. We are shipping the pieces that take that from an idea to a route. A connection becomes a digital business card. The card becomes a follow-up. The follow-up becomes an offer.`,
      },
      {
        type: 'body',
        text: `Coming next: a year-round virtual aerospace conference, and AeroSync — the record’s own CRM, so the people you meet on a Tuesday are still there on the Tuesday after.`,
      },
      {
        type: 'body',
        text: `Where it leads: offers, promotions, deal flow, grants, scholarships. Availability on this platform is an expert network, never a marketplace — introductions, no take rate, and no star ratings attached to a person.`,
      },
    ],
  },
  {
    page_number: 15,
    layout_type: 'article',
    section_id: 'the-work-ahead',
    article: 'your-own-100',
    blocks: [
      { type: 'kicker', text: 'Your Own 100 · continued' },
      { type: 'heading', text: 'Where the Record Points' },
      {
        type: 'body',
        text: `And further out, the record points somewhere. Toward the historic firsts still ahead. The first Slovak woman in space. The first all-women crew to the Moon. The firsts nobody has thought of yet.`,
      },
      {
        type: 'body',
        text: `When they happen, the people who did the work should already be in the record — found early, by a community that knew them first, and able to prove it when the world arrives to ask.`,
      },
      {
        type: 'body',
        text: `We are not the destination. We are the door.`,
      },
      {
        type: 'body',
        text: `It starts with your seat on the Committee. Vote before December 14, then share the ballot with one woman who walks the walk and never talks about it. That is how the voices and the builders win together.`,
      },
      {
        type: 'cta',
        text: 'Cast your ballot',
        url: '/vote',
        caption: 'Voting closes December 14.',
      },
      {
        type: 'cta',
        text: 'Open your record',
        url: '/Profile',
        caption: 'Your record, your Eight, your availability.',
      },
    ],
  },
  { page_number: 16, layout_type: 'colophon', blocks: [] },
];

export const ISSUE_42_BRIEF = {
  issue_number: 42,
  identity: {
    title: 'Algorithms, Alchemy, and Aerospace',
    subtitle: 'An invitation to join the Season 4 Selection Committee',
    cover_kicker: 'Issue 42 · Season 4',
    theme_accent: 'navy',
    preface:
      'Seven weeks from the record. Before the Volume publishes, the institution explains itself — and hands you the ballot.',
    colophon:
      'TOP 100 Aerospace & Aviation, Issue 42, Season 4. Editorial and measurement are kept apart by policy: sponsors support the platform and never touch the ballot. Set in Playfair Display and Montserrat. Volume VIII publishes December 31.',
    contributors: [
      { name: 'Matthew Higa', role: 'Editor' },
      { name: 'TOP 100 Aerospace & Aviation', role: 'Design and masthead' },
    ],
    sections: SECTIONS,
  },
  articles: ARTICLES,
  pages: PAGES,
};

export default ISSUE_42_BRIEF;