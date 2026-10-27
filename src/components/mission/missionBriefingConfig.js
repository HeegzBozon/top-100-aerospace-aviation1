// The briefing. Why the platform exists, who stands in it, what it measures,
// and how a Fellow enters the record — eight steps, read in order, the same
// order the console's wheel walks them. Copy only; the steps render in
// BriefingStep and the live season and archive read in BriefingWhen / TheRecord.

export const BRIEFING_STEPS = [
  {
    key: 'mission',
    index: '01',
    kicker: 'Why',
    title: 'Mission',
    lede: 'To make the contribution of women in aerospace and aviation measurable, verifiable, and impossible to overlook.',
    paras: [
      'The record of this field has usually been written by the people who were easiest to find. We build the opposite: a verified reputation graph in which every claim is attached to evidence, every position is attached to a written reason, and every cycle can be read back years later exactly as it was measured.',
      'Nothing here is a popularity contest with a gala at the end. A Fellow’s standing is composed of what they have done, what their peers can verify, and what the field can see — resolved into an influence band, season by season.',
    ],
    subs: [
      {
        title: 'Vision',
        text: 'A generation of aerospace professionals whose work is legible before they have to ask to be noticed, and an institution that measures that work rather than ranking people inside it.',
      },
    ],
  },
  {
    key: 'values',
    index: '02',
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
    index: '03',
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
    index: '04',
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
    index: '05',
    kicker: 'When',
    title: 'When the cycle turns',
    lede: 'A season opens with nominations, resolves through voting and review, and closes into the publication and the archive.',
  },
  {
    key: 'where',
    index: '06',
    kicker: 'Where',
    title: 'Where it lives',
    lede: 'Five rooms, one institution. The platform is not a feed that scrolls forever; every surface has a job.',
    terms: [
      { term: 'In the handheld', note: 'This console: your record and your loop, the selection committee, the editorial, the intelligence layer.' },
      { term: 'At the shows', note: 'Mission rooms open ahead of IAC, Paris, Dubai and the rest — who is going, what they are there to do, and what is verified afterwards.' },
      { term: 'In Results', note: 'The editorial record of each cycle: features, profiles, pull quotes and the results, composed issue by issue.' },
      { term: 'In the archive', note: 'Every finalized cycle, frozen. Read a Fellow’s season as it was measured at the time.' },
      { term: 'By domain', note: 'The eight Communities of Practice — space R&D, commercial aviation, defense, manufacturing, operations, engineering, policy, entrepreneurship.' },
    ],
  },
  {
    key: 'how',
    index: '07',
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
  {
    key: 'record',
    index: '08',
    kicker: 'The record',
    title: 'Previous publications and archives',
    lede: 'Everything the institution has already published, and every cycle already closed. Read them in any order.',
  },
];