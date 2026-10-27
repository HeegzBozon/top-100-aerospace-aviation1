// The course. Chapter zero is the onboarding — the origin story, the mission and
// the vision, the values, then the six questions (who, what, when, where, why,
// how) — and the chapters after it carry the record behind the institution, the
// cycle running now, and where it is pointed. It is an ongoing course: a chapter
// is published as the institution takes on new work, and the reader's place is
// kept module by module.
//
// Copy only. Modules render in CourseModule, chapter bands in CourseChapter, the
// reader's place in CourseRail; a module that reads live data names its piece in
// `extra`, wired by the page (BriefingWhen for the season, TheRecord for the
// archive).
export const COURSE = [
  {
    key: 'c0',
    index: '00',
    label: 'Onboarding',
    lede: 'Start here. Who the institution is, why it exists, what it will not trade, and the six questions — who, what, when, where, why, how — answered in the order a newcomer asks them.',
    modules: [
      {
        key: 'origin',
        index: '0.1',
        kicker: 'About',
        title: 'Where this began',
        lede: 'The record of this field was being written by whoever was easiest to find. This exists to write it differently.',
        paras: [
          'It started as an editorial question rather than a product one. If you had to name the women carrying aerospace and aviation forward, where would you go to check — not to be told, but to verify? There was no such place. There were lists, and lists remembered who was loudest.',
          'So the work began as an archive and became an instrument. The archive kept the careers; the instrument learned to measure them: nominations from peers, ordered lists with a written reason beside every position, verification checkpoints, and a seasonal cycle that closes into a published record.',
          'That record is still the point. It is built to be read back years later exactly as it was measured at the time — not corrected quietly, and not rewritten by whoever is currently in the room.',
        ],
      },
      {
        key: 'why',
        index: '0.2',
        kicker: 'Why',
        title: 'Mission',
        lede: 'To make the contribution of women in aerospace and aviation measurable, verifiable, and impossible to overlook.',
        paras: [
          'The record of this field has usually been written by the people who were easiest to find. We build the opposite: a verified reputation graph in which every claim is attached to evidence, every position is attached to a written reason, and every cycle can be read back years later exactly as it was measured.',
          'Nothing here is a popularity contest with a gala at the end. A Fellow’s standing is composed of what they have done, what their peers can verify, and what the field can see — resolved into an influence band, season by season.',
        ],
      },
      {
        key: 'vision',
        index: '0.3',
        kicker: 'Vision',
        title: 'Where it is pointed',
        lede: 'A generation of aerospace professionals whose work is legible before they have to ask to be noticed, and an institution that measures that work rather than ranking people inside it.',
        paras: [
          'The test is not how many names sit on a list. It is whether the record stands up when a hiring manager, a programme lead or a journalist opens it cold and finds evidence instead of a claim.',
          'If that holds, the platform becomes something the field reaches for — an institutional memory that outlives any single season, cohort or team, and a reference other institutions can consult rather than duplicate.',
        ],
      },
      {
        key: 'values',
        index: '0.4',
        kicker: 'Values',
        title: 'What does not move',
        lede: 'Seven constraints the platform is built on. They are structural, not aspirational — the code enforces them.',
        terms: [
          { term: 'Evidence over volume', note: 'A position is only as good as the reason attached to it. Every list entry requires a written reason, and submission is blocked without one.' },
          { term: 'Scarcity over scale', note: 'Eight slots, public, ordered. Empty positions render as visible outlines — vacancy is the statement, and a collapsed grid would destroy the feature.' },
          { term: 'Verify, then display', note: 'Verification is a set of checkpoints: LinkedIn, employer, SME review, metrics validated, ecosystem validated. It locks to position two and can never be reordered around.' },
          { term: 'We measure; individuals rank', note: 'Influence bands are visible. The weights behind them are not, and are never traded, printed, or published.' },
          { term: 'Nothing purchasable moves a position', note: 'Discovery, directory and measurement never read a transaction, payment, availability or sponsorship field. Featured placement is editorial, never for sale.' },
          { term: 'Coordination earns nothing', note: 'Facilitating a network, leading a room, or carrying a Patron of Record’s name confers zero selection weight and is never read by scoring.' },
          { term: 'Archives are immutable', note: 'Once a cycle is finalized its record does not move. Corrections are recorded beside it, never written over it.' },
        ],
      },
      {
        key: 'who',
        index: '0.5',
        kicker: 'Who',
        title: 'Who stands in it',
        lede: 'The platform is a cast, not a crowd. Six roles, each with one job.',
        terms: [
          { term: 'Fellows', note: 'The people the platform measures. They hold a profile, build The Eight, publish editions, and vote.' },
          { term: 'Nominees', note: 'Everyone in the current cycle’s pool. A nomination comes from a peer, a nominator, or a body of work already in the record.' },
          { term: 'The Selection Committee', note: 'The Fellows holding the season’s judgment. Each casts an ordered eight, with a reason for every position.' },
          { term: 'Patrons of Record', note: 'The bodies that make rooms, editions and convenings possible. Attributed as Patron of Record — never as sponsorship, and never a position.' },
          { term: 'Communities of Practice', note: 'Eight standing domain networks that distil each convening corpus into transferable practice, domain by domain.' },
          { term: 'The desk', note: 'Writers, photographers and curators who compose the publication. Editorial work is credited, not scored.' },
        ],
      },
      {
        key: 'what',
        index: '0.6',
        kicker: 'What',
        title: 'What is measured',
        lede: 'Six instruments, one record. Each answers a different question about a career.',
        terms: [
          { term: 'The record', note: 'Identity, credential, career history, education, skills, documents. Every claim is attached to something a reviewer can open.' },
          { term: 'The Eight', note: 'A Fellow’s ordered public list of eight people, each with a written reason. Ordinal: position one reads as position one.' },
          { term: 'The measurement', note: 'Seasonal layers — perception, objective achievement, SME evaluation, narrative, normalization, ecosystem. Resolved into one influence band.' },
          { term: 'Verification', note: 'Checkpoints rather than a badge: LinkedIn, employer, SME review, validated metrics, validated ecosystem contributions.' },
          { term: 'Flightography', note: 'Verified attendance at the convenings the community turns up to. Attendance is verified by the room’s facilitator, never self-declared alone.' },
          { term: 'Availability', note: 'What a Fellow makes themselves available for — introductions only, at zero take rate. It never touches directory position or measurement.' },
        ],
      },
      {
        key: 'when',
        index: '0.7',
        kicker: 'When',
        title: 'When the cycle turns',
        lede: 'A season opens with nominations, resolves through voting and review, and closes into the publication and the archive. Five phases, in order, once a year.',
        terms: [
          { term: 'Nominations', note: 'A window opens and peers, colleagues and institutions put names in. Every nomination is read before anyone enters the pool.' },
          { term: 'Voting', note: 'The committee holds the season’s judgment: ordered eights, each position carrying a written reason that blocks submission without it.' },
          { term: 'Review', note: 'The desk and the SMEs read what the vote has surfaced, and the verification checkpoints are resolved.' },
          { term: 'Finalize', note: 'Scores resolve into influence bands, the pool is frozen for this cycle, and the season’s record stops moving.' },
          { term: 'Publication', note: 'The season closes into the edition and the archive: an immutable record, readable years later as it was measured then.' },
        ],
      },
      {
        key: 'where',
        index: '0.8',
        kicker: 'Where',
        title: 'Where it lives',
        lede: 'Five rooms, one institution. The platform is not a feed that scrolls forever; every surface has a job.',
        terms: [
          { term: 'In the handheld', note: 'This console: your record and your loop, the selection committee, the results, the intelligence layer.' },
          { term: 'At the shows', note: 'Mission rooms open ahead of IAC, Paris, Dubai and the rest — who is going, what they are there to do, and what is verified afterwards.' },
          { term: 'In Results', note: 'The editorial record of each cycle: features, profiles, pull quotes and the results, composed issue by issue.' },
          { term: 'In the archive', note: 'Every finalized cycle, frozen. Read a Fellow’s season as it was measured at the time.' },
          { term: 'By domain', note: 'The eight Communities of Practice — space R&D, commercial aviation, defense, manufacturing, operations, engineering, policy, entrepreneurship.' },
        ],
      },
      {
        key: 'how',
        index: '0.9',
        kicker: 'How',
        title: 'How a Fellow enters the record',
        lede: 'Four ways in. None of them requires paying, and none of them is quick.',
        terms: [
          { term: 'Be nominated', note: 'A peer, a colleague or an institution puts your name into the current cycle. Nominations are reviewed before anyone enters the pool.' },
          { term: 'Claim your profile', note: 'Claim instantly on an email or LinkedIn match. A mismatched or contested claim is reviewed by the desk before it is granted.' },
          { term: 'Hold a seat on the committee', note: 'Measure the pool, place your eight in order, and write the reason beside every one.' },
          { term: 'Publish', note: 'Compose your own edition from your record, and post to the bulletin board. The desk’s publication carries the season’s official account.' },
        ],
      },
    ],
  },
  {
    key: 'c1',
    index: '01',
    label: 'Past',
    lede: 'What the institution has already measured, and the record it left behind.',
    modules: [
      {
        key: 'past',
        index: '1.1',
        kicker: 'Past',
        title: 'What has already been measured',
        lede: 'Every cycle that has run is still readable, exactly as it was measured at the time.',
        paras: [
          'Seasons have opened and closed since the platform began. Names went in, the committee placed its ordered eights with a reason beside each one, SMEs reviewed what the vote surfaced, and the result was published. When the cycle closed, that record was frozen.',
          'That is what makes the past useful here: it does not move. Open a Fellow’s season years later and you find the same numbers, the same reasons and the same verification the field saw then — which is the only way a measured record can be trusted.',
        ],
      },
      {
        key: 'record',
        index: '1.2',
        kicker: 'The record',
        title: 'Previous publications and archives',
        lede: 'Everything the institution has already published, and every cycle already closed. Read them in any order.',
        extra: 'record',
      },
    ],
  },
  {
    key: 'c2',
    index: '02',
    label: 'Present',
    lede: 'The cycle running now, and where it stands today.',
    modules: [
      {
        key: 'present',
        index: '2.1',
        kicker: 'Present',
        title: 'The cycle now',
        lede: 'One season is live at a time, and its calendar is public from the day it opens.',
        paras: [
          'While a season is open the pool is growing, the committee is measuring, and the countdown to close is running on the dashboard. None of it sits behind a paywall or a membership: the dates, the phases and the counts read the same for everyone.',
          'This is the chapter that moves. Its dates come straight off the season record, so what you read here is what the rest of the platform counts down from.',
        ],
        extra: 'season',
      },
    ],
  },
  {
    key: 'c3',
    index: '03',
    label: 'Future',
    lede: 'Where the institution is pointed, and what is being built next.',
    modules: [
      {
        key: 'future',
        index: '3.1',
        kicker: 'Future',
        title: 'What comes next',
        lede: 'The course does not end. A chapter is published as the institution takes on new work, and this is the work already underway.',
        terms: [
          { term: 'A publication cadence', note: 'Issues compose on a rhythm rather than as one-offs: each season closing into its own printed record, with the desk’s coverage carried alongside it.' },
          { term: 'Wider cohorts', note: 'The method was built for women in aerospace and aviation. Nominations, ordered lists with reasons, verification and immutability are what carry to the cohorts that follow.' },
          { term: 'The intelligence layer', note: 'Signals, launches, patents and citations already flow into the record. The work is to make each one verifiable at its source rather than summarised after the fact.' },
          { term: 'Open method, closed weights', note: 'Influence bands stay visible and the weights stay unpublished. That balance is the one thing about the method that will not change as the platform grows.' },
        ],
      },
    ],
  },
];