// THE PATRON LIFECYCLE — one definition, read by the intake, the desk and the stage sync.
//
// A Patron of Record is attribution, never placement. Nothing in this file may be read by
// discovery, the directory, voting, or scoring: the stage a commercial conversation has
// reached must never touch who is measured. That firewall is the reason the gates below
// exist in one place rather than being re-guessed in each surface.
//
// Every advance is gated. A gate that cannot be met is reported as a blocker, never quietly
// skipped, because a slot is only sold when the things that make it lawful are true.

export const PATRON_STAGES = [
  { key: 'identified', label: 'Identified', owner: 'Erwin', blurb: 'A named organization and a consent basis. Nothing has been sent yet.' },
  { key: 'touched', label: 'Touched', owner: 'Erwin', blurb: 'First contact made. Logged in the CRM the day it went out.' },
  { key: 'replied', label: 'Replied', owner: 'Erwin', blurb: 'The prospect answered. Warm from here on.' },
  { key: 'qualified', label: 'Qualified', owner: 'Erwin', blurb: 'Fit, category and consent recorded. Ready to hand over.' },
  { key: 'pitched', label: 'Pitched', owner: 'Matthew', blurb: 'Approved offer on the table, at a rate the register allows.' },
  { key: 'committed', label: 'Committed', owner: 'Matthew', blurb: 'Verbal yes against a named slot. Priced at an approved rate.' },
  { key: 'contracted', label: 'Contracted', owner: 'Katja', blurb: 'Agreement signed. Firewall, label, offering and pricing cleared.' },
  { key: 'paid', label: 'Paid', owner: 'Erwin', blurb: 'Invoice settled. Production may begin.' },
  { key: 'delivered', label: 'Delivered', owner: 'Erwin', blurb: 'Placement ran, labelled, links tested, every promised surface shipped.' },
  { key: 'reported', label: 'Reported', owner: 'Erwin', blurb: '48-hour and 7-day reports sent with method and caveats.' },
  { key: 'renewed', label: 'Renewed', owner: 'Matthew', blurb: 'Next slot offered, and the outcome logged either way.' },
  { key: 'declined', label: 'Declined', owner: 'Matthew', blurb: 'Closed. The reason is kept, so the same loss is not repeated.' },
];

export const STAGE_KEYS = PATRON_STAGES.map((stage) => stage.key);

export const stageLabel = (key) =>
  PATRON_STAGES.find((stage) => stage.key === key)?.label || key || '—';

export const stageIndex = (key) => Math.max(0, STAGE_KEYS.indexOf(key));

// The internal gates. Each is held by a named seat, because "approved" without a name is
// not an approval. A gate is satisfied only when it is 'approved' or deliberately 'waived'.
export const APPROVAL_KEYS = [
  {
    key: 'firewall',
    label: 'Firewall wording',
    holder: 'Katja',
    why: 'The published claim that patronage never touches measurement, confirmed against production voting before any send.',
  },
  {
    key: 'paid_label',
    label: 'Paid placement label',
    holder: 'Katja',
    why: 'Names and logos alone are unlikely to disclose a paid placement. The label is approved before a placement runs.',
  },
  {
    key: 'offering_language',
    label: 'Offering language',
    holder: 'Katja',
    why: 'What we may say we are offering. Kept off any send that carries the sponsor door until status is written down.',
  },
  {
    key: 'pricing',
    label: 'Pricing',
    holder: 'Matthew',
    why: 'The rate a deal may be quoted at. A slot cannot be committed at a rate the register has not approved.',
  },
  {
    key: 'data_use',
    label: 'Commercial data use',
    holder: 'Katja',
    why: 'The privacy basis for reporting audience numbers, and the small-segment rule that keeps a report from identifying a reader.',
  },
];

export const APPROVAL_STATES = ['pending', 'approved', 'waived', 'blocked'];

export const DELIVERABLE_KEYS = [
  { key: 'issue', label: 'Issue slot', note: 'Below the editorial lead, with the paid label and the firewall line.' },
  { key: 'linkedin', label: 'Native post', note: 'One post to the community. Label carried, link in the first comment only.' },
  { key: 'volume', label: 'Volume credit', note: 'Attribution in the Volume, separate from index content.' },
];

export const DEFAULT_FIREWALL_LINE =
  'Patronage is attribution, never placement. No Patron has any influence on the index, the measurement, or who is featured.';

export const DEFAULT_PAID_LABEL = 'Paid placement';

const approved = (gate) => gate && (gate.status === 'approved' || gate.status === 'waived');

// What stands between a deal and a stage. Empty means it may advance.
// `hasSentReport` is passed by the sync, which is the only caller that can read reports.
export function blockersFor(deal, stage, { hasSentReport = false } = {}) {
  const blockers = [];
  const approvals = deal?.approvals || {};

  if (stage === 'qualified') {
    if (!deal?.fit_category) blockers.push('Fit category is not recorded.');
    if (!deal?.consent_basis) blockers.push('Consent basis is not written down.');
  }

  if (stage === 'committed') {
    if (!approved(approvals.pricing)) blockers.push('Pricing gate is open — the rate is not approved.');
    if (!deal?.slot_id) blockers.push('No slot is attached to the deal.');
  }

  if (stage === 'contracted') {
    for (const gate of APPROVAL_KEYS) {
      if (!approved(approvals[gate.key])) blockers.push(`${gate.label} is not approved (${gate.holder}).`);
    }
    if (deal?.agreement?.status !== 'signed') blockers.push('The agreement is not signed.');
  }

  if (stage === 'paid') {
    if (deal?.agreement?.status !== 'signed') blockers.push('The agreement is not signed.');
    if (deal?.payment?.status !== 'paid') blockers.push('Payment is not recorded as settled.');
  }

  if (stage === 'delivered') {
    if (!deal?.placement?.approved_date) blockers.push('The placement has not been approved.');
    if (!deal?.placement?.links_tested) blockers.push('The tracked links have not been tested.');
    const issue = (deal?.deliverables || []).find((row) => row.key === 'issue');
    if (!issue || issue.status !== 'delivered') blockers.push('The issue slot is not marked delivered.');
  }

  if (stage === 'reported') {
    if (!hasSentReport) blockers.push('The 7-day report has not been sent.');
  }

  return blockers;
}

// The tracked link is the only click measurement this house has, so it is a first-class
// piece of the deal rather than an afterthought: one URL per deliverable, built from the
// deal id, never from a URL a reader supplies.
export const TRACKED_CHANNELS = ['issue', 'linkedin', 'volume', 'media_kit'];

// The five surfaces the media kit sells beside. Each carries its own token, which the
// redirect stamps on the outbound link as utm_content, so the placement a reader came
// from is written on the Patron's own analytics as well as on the house's click ledger.
export const TRACKED_SECTIONS = ['gold', 'silver1', 'silver2', 'bronze', 'footer_door'];

export function trackedLink(origin, dealId, channel = 'issue', section = '') {
  if (!dealId) return '';
  const safeChannel = TRACKED_CHANNELS.includes(channel) ? channel : 'issue';
  const safeSection = TRACKED_SECTIONS.includes(section) ? section : '';
  const base = `${String(origin).replace(/\/$/, '')}/functions/patronLink?d=${encodeURIComponent(dealId)}&c=${safeChannel}`;
  return safeSection ? `${base}&s=${safeSection}` : base;
}

// The RFC-ish gate, the same shape used at every other door in the house: garbage addresses
// are refused before they reach a record or the CRM.
export const isEmailShaped = (value) => /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(String(value || '').trim());

export const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

// Only http(s) destinations are ever forwarded to, and only the host stored on the deal.
export function safeDestination(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url;
  } catch {
    return null;
  }
}