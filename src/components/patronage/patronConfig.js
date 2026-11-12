import { B } from '@/components/fellow-home/fellowHomeConfig';

// THE PATRON OF RECORD OFFER — one place for the words, the rates and the gates.
//
// A Patron buys attribution, never placement. Everything on the public media kit and on
// the desk reads from here, so a rate or a claim is changed once and never drifts between
// the page a buyer reads and the page the house works from.
//
// Anything still under a gate is marked as such in the copy itself. A number on the media
// kit is shown with the date it was pulled and never merged with another figure: reader
// claims and index claims stay separate.

export const P = {
  ...B,
  ink: 'rgba(30,58,90,0.82)',
  faint: 'rgba(30,58,90,0.45)',
  hair: 'rgba(30,58,90,0.14)',
};

export const FIREWALL_LINE =
  'Sponsorship is attribution, never placement. No sponsor has any influence on the index, the measurement, or who is featured.';

export const PAID_LABEL = 'Paid placement';

export const FIREWALL_DUTIES = [
  'No sponsor reviews editorial, and none sees a draft before it sends.',
  'No sponsor chooses a topic, a Fellow, a nominee, or a position in any issue.',
  'Sponsorship confers no vote weight, no standing, and nothing in the measurement.',
  'No reader contact data is ever shared with a sponsor.',
];

export const LIFECYCLE = [
  { key: 'identified', label: 'Identified', owner: 'Erwin', gate: 'A named organization and a written consent basis.' },
  { key: 'touched', label: 'Touched', owner: 'Erwin', gate: 'First contact sent and logged in the CRM the same day.' },
  { key: 'replied', label: 'Replied', owner: 'Erwin', gate: 'The prospect answered. Warm from here on.' },
  { key: 'qualified', label: 'Qualified', owner: 'Erwin', gate: 'Fit category and consent on the record.' },
  { key: 'pitched', label: 'Pitched', owner: 'Matthew', gate: 'Offer built from an approved rate, handoff inside one business day.' },
  { key: 'committed', label: 'Committed', owner: 'Matthew', gate: 'A named slot, priced at a rate the register allows.' },
  { key: 'contracted', label: 'Contracted', owner: 'Katja', gate: 'Agreement signed; firewall, label, offering and pricing cleared.' },
  { key: 'paid', label: 'Paid', owner: 'Erwin', gate: 'Invoice settled before production begins.' },
  { key: 'delivered', label: 'Delivered', owner: 'Erwin', gate: 'Placement approved, links tested, every promised surface shipped.' },
  { key: 'reported', label: 'Reported', owner: 'Erwin', gate: '48-hour and 7-day reports sent, with method and caveats.' },
  { key: 'renewed', label: 'Renewed', owner: 'Matthew', gate: 'Next slot offered and the outcome logged.' },
  { key: 'declined', label: 'Declined', owner: 'Matthew', gate: 'Closed, with the reason kept.' },
];

export const STAGE_KEYS = LIFECYCLE.map((stage) => stage.key);
export const stageLabel = (key) => LIFECYCLE.find((stage) => stage.key === key)?.label || key || '—';
export const LIVE_STAGES = ['committed', 'contracted', 'paid', 'delivered', 'reported', 'renewed'];

export const APPROVALS = [
  { key: 'firewall', label: 'Firewall wording', holder: 'Katja', why: 'Confirmed against production voting before any send.' },
  { key: 'paid_label', label: 'Paid placement label', holder: 'Katja', why: 'A name and a logo do not disclose a paid placement on their own.' },
  { key: 'offering_language', label: 'Offering language', holder: 'Katja', why: 'What we may say we are offering, in writing.' },
  { key: 'pricing', label: 'Pricing', holder: 'Matthew', why: 'The rate a deal may be quoted at.' },
  { key: 'data_use', label: 'Commercial data use', holder: 'Katja', why: 'Privacy basis and the small-segment rule for reports.' },
];

export const APPROVAL_STATES = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'waived', label: 'Waived' },
  { key: 'blocked', label: 'Blocked' },
];

export const DELIVERABLES = [
  { key: 'issue', label: 'Issue slot', note: 'Below the editorial lead, labelled, with the firewall line.' },
  { key: 'linkedin', label: 'Native post', note: 'One post to the community. Label carried, link in the first comment.' },
  { key: 'volume', label: 'Volume credit', note: 'Attribution in the Volume, kept apart from index content.' },
];

export const BUNDLE = [
  { key: 'issue', label: 'One issue slot', detail: 'Logo or name, up to 60 words, one tracked link, the paid label, and the firewall line.' },
  { key: 'linkedin', label: 'One native post', detail: 'Written by the house in the house voice, labelled, to the community on LinkedIn.' },
  { key: 'volume', label: 'One Volume credit', detail: 'Attribution in the Volume, set apart from the index itself.' },
  { key: 'report', label: 'Two reports', detail: 'Written reports at 48 hours and 7 days, showing what was delivered and how it was counted.' },
];

// Dated, sourced, and never merged. Percentages wait until the reader survey is in.
export const AUDIENCE_FIGURES = [
  { key: 'subscribers', value: '6,400+', label: 'LinkedIn newsletter subscribers', date: 'Oct 2026', source: 'LinkedIn newsletter, Oct 2026' },
  { key: 'email', value: 'about 3,900', label: 'receive it by email', date: 'Oct 2026', source: 'LinkedIn estimate. Same audience, not a second list.' },
  { key: 'opens', value: '33%+', label: 'email open rate', date: 'Oct 2026', source: 'LinkedIn estimate' },
  { key: 'views', value: 'about 2,100', label: 'article views per standard issue', date: 'Oct 2026', source: 'Issue reports, 2026 issues' },
];

export const NOT_CLAIMED = [
  'A combined audience figure. The email list is part of the newsletter list, not a second one.',
  'A reach, click or lead promise. Tracked clicks are new, and small.',
  'A percentage of who reads, until the reader survey closes.',
  'Any figure without the month it was pulled.',
];

// The published calendar, used to draw the rate card when no slot records exist yet.
export const SLOT_CALENDAR = [
  { issue_number: 43, issue_date: '2026-11-17', ad_close_date: null, tier: 'house', rate_amount: null, rate_note: 'House placement, not for sale', status: 'house' },
  { issue_number: 44, issue_date: '2026-12-01', ad_close_date: '2026-11-20', tier: 'founding', rate_amount: 1200, rate_note: 'Founding rate', status: 'open' },
  { issue_number: 46, issue_date: '2026-12-31', ad_close_date: '2026-12-10', tier: 'flagship', rate_amount: 5000, rate_note: 'Flagship, $3,500 to $5,000', status: 'open' },
  { issue_number: 71, issue_date: '2027-12-31', ad_close_date: '2027-11-16', tier: 'annual', rate_amount: 3500, rate_note: 'Annual, $3,500 and up', status: 'open' },
  { issue_number: null, issue_date: null, ad_close_date: null, tier: 'standard', rate_amount: 1500, rate_note: '18 slots in 2027, from Jan 26. Close 14 to 30 days out', status: 'open' },
  { issue_number: null, issue_date: null, ad_close_date: null, tier: 'quarterly', rate_amount: null, rate_note: '6 quarterly and special slots. Rate under review', status: 'unpriced' },
];

export const TIER_LABELS = {
  founding: 'Founding',
  standard: 'Standard',
  flagship: 'Flagship',
  quarterly: 'Quarterly',
  annual: 'Annual',
  house: 'House',
  unpriced: 'Rate on request',
};

export const FIT_CATEGORIES = [
  { key: 'space_defense_vc', label: 'Space and defense fund' },
  { key: 'b2b_tools', label: 'Software for aerospace firms' },
  { key: 'recruiter', label: 'Talent and search' },
  { key: 'event_organizer', label: 'Conference or event' },
  { key: 'prime', label: 'Prime contractor' },
  { key: 'other', label: 'Something else' },
];

export const FIT_LABEL = (key) => FIT_CATEGORIES.find((fit) => fit.key === key)?.label || 'Not recorded';

export const INTERESTS = [
  'The next open slot',
  'The December 31 flagship',
  'A 2027 anchor',
  'A Volume credit only',
  'Not sure yet',
];

export const SOURCES = [
  { key: 'media_kit', label: 'Media kit' },
  { key: 'warm_intro', label: 'Warm introduction' },
  { key: 'outbound', label: 'Outbound' },
  { key: 'referral', label: 'Referral' },
  { key: 'event', label: 'Met at a show' },
  { key: 'reply', label: 'Answered a send' },
];

export const DEFAULT_FIREWALL = FIREWALL_LINE;

// One tracked link per promised surface. It is the only click measurement the house has, so
// it is built from the deal and never from an address a reader supplies.
export const TRACKED_CHANNELS = ['issue', 'linkedin', 'volume', 'media_kit'];

// The section tokens the redirect stamps as utm_content: Section 04 gold, Section 06
// silver (two plates), Section 10 bronze, Section 12 the footer door.
export const TRACKED_SECTIONS = ['gold', 'silver1', 'silver2', 'bronze', 'footer_door'];

export const trackedLink = (origin, dealId, channel = 'issue', section = '') => {
  if (!dealId) return '';
  const safe = TRACKED_CHANNELS.includes(channel) ? channel : 'issue';
  const safeSection = TRACKED_SECTIONS.includes(section) ? section : '';
  const base = `${String(origin || '').replace(/\/$/, '')}/functions/patronLink?d=${encodeURIComponent(dealId)}&c=${safe}`;
  return safeSection ? `${base}&s=${safeSection}` : base;
};

// The desk's small set of parts, so every panel on it is cut from the same metal.
export const DESK = {
  input: 'w-full border bg-white px-2.5 py-2 text-[11px] outline-none',
  btn: 'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[8.5px] font-bold uppercase tracking-[0.16em] disabled:opacity-50',
  label: 'text-[8px] font-bold uppercase tracking-[0.2em]',
  card: 'border bg-white',
};

export const money = (value) =>
  typeof value === 'number' && Number.isFinite(value) ? `$${value.toLocaleString('en-US')}` : 'Rate on request';

export const day = (value) => {
  if (!value) return '—';
  // A calendar date ("2026-12-31") is the day the house prints, not an instant. Read
  // bare-date strings at midday local, so a slot stamped 31 December never reads as the
  // 30th to a reader west of Greenwich (the browser parses a bare date as UTC midnight,
  // then prints it in local time — a day earlier for every reader in the Americas).
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(value))
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Only http(s) addresses are ever treated as a link.
export const asHref = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
};

export const isEmailShaped = (value) => /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(String(value || '').trim());

// A local read of the same gates the desk enforces, so the desk can say what is missing
// before a hand reaches the button. The server remains the authority.
export function localBlockers(deal, stage) {
  const blockers = [];
  const gates = deal?.approvals || {};
  const ok = (key) => ['approved', 'waived'].includes(gates?.[key]?.status);

  if (stage === 'qualified') {
    if (!deal?.fit_category) blockers.push('Fit category');
    if (!deal?.consent_basis) blockers.push('Consent basis');
  }
  if (stage === 'committed') {
    if (!ok('pricing')) blockers.push('Pricing gate');
    if (!deal?.slot_id) blockers.push('A named slot');
  }
  if (stage === 'contracted') {
    APPROVALS.forEach((gate) => {
      if (!ok(gate.key)) blockers.push(gate.label);
    });
    if (deal?.agreement?.status !== 'signed') blockers.push('Signed agreement');
  }
  if (stage === 'paid') {
    if (deal?.agreement?.status !== 'signed') blockers.push('Signed agreement');
    if (deal?.payment?.status !== 'paid') blockers.push('Settlement');
  }
  if (stage === 'delivered') {
    if (!deal?.placement?.approved_date) blockers.push('Placement approval');
    if (!deal?.placement?.links_tested) blockers.push('Tested links');
    if (!(deal?.deliverables || []).some((row) => row.key === 'issue' && row.status === 'delivered')) {
      blockers.push('Issue slot delivered');
    }
  }
  if (stage === 'reported') blockers.push('A sent 7-day report');
  return blockers;
}

// The register the desk starts from. Every entry carries the choice, the consequence and
// the seat that holds it: a recommendation is a proposal until it is resolved.
export const DECISION_SEED = [
  {
    key: 'DEC1',
    title: 'Do sponsors carry any vote weight?',
    question: 'Does production give a Sponsor of Record any weight in selection?',
    context:
      'The issue copy says sponsorship carries zero selection weight. The reference PRD names sponsors among groups with differential vote weight. One of the two is wrong, and the wrong one is published.',
    options: [
      { label: 'No weight, and correct the PRD', detail: 'Production gives sponsors no weight. The reference PRD is amended to match what ships.', recommended: true, consequence: 'The published claim becomes true, and the Volume can be sold beside the reveal.' },
      { label: 'Some weight, and stop saying zero', detail: 'Sponsors keep a tier weight. The public line is rewritten to describe reality.', consequence: 'Every firewall asset is rewritten before #42 sends.' },
    ],
    recommendation: 'Confirm no weight, then correct the reference PRD.',
    approver_name: 'Matthew',
    approver_role: 'Numbers and public copy',
    blocks: ['firewall', 'public_copy'],
    order: 1,
  },
  {
    key: 'DEC3',
    title: 'The offer ladder',
    question: 'How do newsletter slots relate to the annual tiers?',
    context:
      'The issue invites sponsorship through the Chamber, the playbook sells newsletter slots, and the canonical tiers start at $10K. Three prices with no ladder between them.',
    options: [
      { label: 'Slots are the entry rung', detail: 'Slot spend credits toward an annual tier. A Volume credit comes only with the flagship or a tier.', recommended: true, consequence: 'One price list, one path upward, no $1,500 offer standing beside a $10K one.' },
      { label: 'Slots stand alone', detail: 'Slots are a separate product with no path into the tiers.', consequence: 'Every slot is a one-time sale, and the renewal ask has nothing to offer.' },
    ],
    recommendation: 'Slots are entry inventory. Slot spend credits toward a tier.',
    approver_name: 'Matthew',
    approver_role: 'Numbers and pricing',
    blocks: ['rate_card', 'renewal'],
    order: 2,
  },
  {
    key: 'DEC4',
    title: 'What the credit is called',
    question: 'Is "Sponsor of Record" enough to disclose a paid placement?',
    context:
      'A name or logo alone is unlikely to signal advertising. "Sponsor of Record" is the credit; the disclosure has to be a separate, plain label.',
    options: [
      { label: 'Sponsor of Record, plus a paid label', detail: 'The credit reads Sponsor of Record. Any placement carrying the sponsor\'s own words or link also carries a plain paid label.', recommended: true, consequence: 'Attribution and disclosure are two lines doing two jobs.' },
      { label: 'Sponsor of Record alone', detail: 'One line, treated as sufficient disclosure.', consequence: 'Carries legal risk on any placement with sponsor-supplied copy.' },
    ],
    recommendation: 'Sponsor of Record as the credit, with a paid label on any placement the sponsor writes.',
    approver_name: 'Katja',
    approver_role: 'Firewall and disclosure',
    blocks: ['paid_label', 'public_copy'],
    order: 3,
  },
  {
    key: 'DEC5',
    title: 'The Volume number',
    question: 'Is the next Volume IV or Volume VIII?',
    context: 'Past documents use both. Sponsor material cannot be printed until one is chosen.',
    options: [
      { label: 'Pick one and scrub every asset', detail: 'One number, applied to issues, agreements and the rate card.', recommended: true, consequence: 'A buyer cannot be offered a Volume that does not exist.' },
      { label: 'Wait until the Year End locks', detail: 'Name it when the Volume closes.', consequence: 'No Volume credit can be sold or promised before then.' },
    ],
    recommendation: 'Choose the number and scrub every asset in one pass.',
    approver_name: 'Matthew',
    approver_role: 'Numbers and public copy',
    blocks: ['public_copy', 'volume_credit'],
    order: 4,
  },
  {
    key: 'DEC6',
    title: 'The audience number',
    question: 'Which numbers may be published, in which words?',
    context:
      'Subscribers, email recipients, opens and article views are four different numbers. Said together they read as a bigger audience than exists.',
    options: [
      { label: 'Publish the four, separately dated', detail: '6,400+ subscribers; about 3,900 by email as part of the same list; 33%+ opens; about 2,100 views per issue. Each with its month.', recommended: true, consequence: 'The page is defensible line by line, and reports can be compared to it.' },
      { label: 'Publish only subscribers', detail: 'One number, nothing else.', consequence: 'Least risk, weakest case. Opens and views disappear from the sale.' },
    ],
    recommendation: 'Publish the four as separate dated figures, never combined.',
    approver_name: 'Matthew',
    approver_role: 'Numbers and public copy',
    blocks: ['public_copy'],
    order: 5,
  },
  {
    key: 'DEC7',
    title: 'The standard rate',
    question: 'Does $1,500 standard hold?',
    context:
      '$1,500 against about 2,160 views is roughly $680 per thousand, well above typical B2B newsletter rates. The benchmark has not been run.',
    options: [
      { label: 'Hold $1,500 until benchmarked', detail: 'Sell association and the bundle. Revisit after three paid slots.', recommended: true, consequence: 'No discount spiral, and a review point that is already booked.' },
      { label: 'Cut before the first sale', detail: 'Price to the market now.', consequence: 'Hard to raise later, and it signals the association is not worth the rate.' },
    ],
    recommendation: 'Hold $1,500, sell the bundle, review after three paid slots.',
    approver_name: 'Matthew',
    approver_role: 'Numbers and pricing',
    blocks: ['rate_card', 'committed'],
    order: 6,
  },
  {
    key: 'DEC8',
    title: 'The quarterly and special rate',
    question: 'What do the six quarterly and special slots cost?',
    context: 'They sit between the standard rate and the flagship and are currently unpriced, so they cannot be sold.',
    options: [
      { label: 'Set at the flagship floor', detail: '$3,500, on the strength of the reveal audience.', recommended: true, consequence: 'Fewer, better slots, priced on the one day growth is proven.' },
      { label: 'Set just above standard', detail: 'Around $2,000 to $2,500.', consequence: 'Easier to sell, and the flagship stops being special.' },
    ],
    recommendation: 'Set quarterly and special slots at the flagship floor.',
    approver_name: 'Matthew',
    approver_role: 'Numbers and pricing',
    blocks: ['rate_card'],
    order: 7,
  },
  {
    key: 'DEC9',
    title: 'What #43 runs',
    question: 'Is #43 a house placement or a quarterly?',
    context: '#43 closes before the rate card exists. The Dec 31 annual absorbs Q4.',
    options: [
      { label: 'House ad, "How We Measure"', detail: 'A reusable house placement with the voting midpoint and a tracked link to the media kit.', recommended: true, consequence: '#43 proves the instrument without selling a slot that cannot be priced.' },
      { label: 'A quarterly, sold late', detail: 'Sell it in eight days.', consequence: 'The first paid slot slips and the rate is set under pressure.' },
    ],
    recommendation: 'House ad on #43: "How We Measure", with the voting midpoint.',
    approver_name: 'Matthew',
    approver_role: 'Numbers and public copy',
    blocks: ['rate_card'],
    order: 8,
  },
  {
    key: 'DEC10',
    title: 'The fund door',
    question: 'Does the fundraising door run beside the sponsor door?',
    context: 'Offering language is unconfirmed. A door asking for investment beside a rate card invites the wrong reading.',
    options: [
      { label: 'Keep it off every sponsor send', detail: 'No fund language within sight of the rate card until status is written down.', recommended: true, consequence: 'One ask per surface.' },
      { label: 'Run both', detail: 'Fund and sponsor invitations side by side.', consequence: 'Requires Katja to confirm offering status first.' },
    ],
    recommendation: 'Keep the fund door off any send that carries the sponsor door.',
    approver_name: 'Katja',
    approver_role: 'Offering language',
    blocks: ['offering_language', 'public_copy'],
    order: 9,
  },
];