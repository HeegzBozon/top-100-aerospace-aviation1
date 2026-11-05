import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// THE EDITORIAL CALENDAR, SERVER SIDE.
//
// The calendar is the authoritative plan for what the house publishes. This function keeps
// that plan, stages the three desks against it, and reads their state back — it never holds
// a desk's substance. Magazine Studio keeps its pages, Mail Room keeps its letter and its
// send, the Funnel Desk keeps its campaign. Here they are only linked and read.
//
// Nothing is written on a read: `state` derives every desk's state from the linked records
// themselves, so a change made in a desk shows on the calendar without a second copy of it
// ever existing to fall out of date.

const PLAYBOOK = [
  { no: 42, date: '2026-11-03', name: 'The Vote Issue', type: 'Voting' },
  { no: 43, date: '2026-11-17', name: 'The Midpoint Issue', type: 'Voting' },
  { no: 44, date: '2026-12-01', name: 'The Final Sprint Issue', type: 'Voting' },
  { no: 45, date: '2026-12-15', name: 'The Selection Issue', type: 'Community' },
  { no: 46, date: '2026-12-31', name: 'Volume IV: The Annual', type: 'Annual' },
  { no: 47, date: '2027-01-26', name: 'The Outlook Issue', type: 'Standard' },
  { no: 48, date: '2027-02-09', name: 'The Talent Issue', type: 'Standard' },
  { no: 49, date: '2027-02-23', name: 'The Defense Issue', type: 'Standard' },
  { no: 50, date: '2027-03-09', name: 'The Orbit Issue', type: 'Show' },
  { no: 51, date: '2027-03-23', name: 'The Sustainability Issue', type: 'Standard' },
  { no: 52, date: '2027-04-06', name: 'Q2 Quarterly: The Space Issue', type: 'Quarterly' },
  { no: 53, date: '2027-04-20', name: 'The Spring Debrief', type: 'Debrief' },
  { no: 54, date: '2027-05-04', name: 'The Anniversary Issue', type: 'Special' },
  { no: 55, date: '2027-05-18', name: 'The Lindbergh Issue', type: 'Standard' },
  { no: 56, date: '2027-06-01', name: 'The Paris Preview', type: 'Special' },
  { no: 57, date: '2027-06-15', name: 'Paris Live', type: 'Live' },
  { no: 58, date: '2027-06-29', name: 'The Paris Debrief', type: 'Debrief' },
  { no: 59, date: '2027-07-13', name: 'Q3 Quarterly: The Oshkosh Preview', type: 'Quarterly' },
  { no: 60, date: '2027-07-27', name: 'Oshkosh Live', type: 'Live' },
  { no: 61, date: '2027-08-10', name: 'The Oshkosh Debrief', type: 'Debrief' },
  { no: 62, date: '2027-08-24', name: 'The Founders Issue', type: 'Standard' },
  { no: 63, date: '2027-09-07', name: 'The Uncrewed Issue', type: 'Standard' },
  { no: 64, date: '2027-09-21', name: 'The Global Index Issue', type: 'Standard' },
  { no: 65, date: '2027-10-05', name: 'Q4 Quarterly: The Business Aviation Issue', type: 'Quarterly' },
  { no: 66, date: '2027-10-19', name: 'BACE Live', type: 'Live' },
  { no: 67, date: '2027-11-02', name: 'The BACE Debrief', type: 'Debrief' },
  { no: 68, date: '2027-11-16', name: 'The Final Sprint Issue', type: 'Special' },
  { no: 69, date: '2027-11-30', name: 'The Year in Signals', type: 'Standard' },
  { no: 70, date: '2027-12-14', name: 'The Selection Issue', type: 'Community' },
  { no: 71, date: '2027-12-31', name: 'Volume V: The Annual', type: 'Annual' },
];

const WORD_TARGETS = {
  Standard: '600 to 1,000',
  Voting: '300 to 500',
  Community: '300 to 500',
  Show: '600 to 800',
  Live: '500 to 700',
  Debrief: '800 to 1,100',
  Quarterly: '1,500 to 2,500',
  Annual: 'Longest',
  Special: 'Set per issue',
};

// The standard as supplied on Nov 4, 2026. Held here so the first press of "seed" files it
// as version 1; after that the standard lives in the ledger and is edited there.
const STANDARD_V1 = {
  version: 1,
  status: 'active',
  title: 'TOP 100 Editorial Style Guide',
  stance:
    'Every issue is a briefing: it reports what happened, who said it, and why it matters to the reader. We attribute views to the people who hold them and do not argue a position of our own.',
  structure: [
    { section: 'Masthead', words: '1 line', byline: 'None', job: 'No. 48 | The Talent Issue | February 2027' },
    { section: "Editor's Note", words: '50 to 100', byline: 'Matthew Higa', job: 'Why this issue matters now' },
    { section: 'The Briefing', words: '80 to 120', byline: 'TOP 100 Editorial', job: 'One lead story' },
    { section: 'Patron credit', words: 'Up to 60', byline: 'None', job: 'Paid label and firewall line, below The Briefing' },
    { section: 'Across the field', words: '60 to 80 per item', byline: 'TOP 100 Editorial', job: 'Three or four items from at least three domains' },
    { section: 'From the Record', words: '100 to 150', byline: 'TOP 100 Editorial', job: 'A Fellow or index data nobody else has' },
    { section: 'One more thing...', words: '30 to 50', byline: 'Matthew Higa', job: 'One ask' },
    { section: 'Sign-off', words: '1 line', byline: 'Matthew Higa', job: 'Ad Astra!, Onwards and upwards!, or Higher, further, faster!' },
  ],
  lengths: [
    { type: 'Standard', words: '600 to 1,000', what_changes: 'Full structure' },
    { type: 'Voting or community', words: '300 to 500', what_changes: 'Lead with one action, Across the field optional' },
    { type: 'Show preview', words: '600 to 800', what_changes: 'What to watch and who to meet' },
    { type: 'Show live', words: '500 to 700', what_changes: 'Dispatch style, with a 20% live section' },
    { type: 'Show debrief', words: '800 to 1,100', what_changes: 'What changed, attributed to the people who said it' },
    { type: 'Quarterly', words: '1,500 to 2,500', what_changes: 'Longer Briefing plus index data' },
    { type: 'Annual', words: 'Longest', what_changes: 'Volume reveal, written for the archive' },
  ],
  voice_do: [
    'Open with the news',
    'Name people, programs, and numbers',
    'Mix short lines with one longer thought',
    'Attribute every view',
    'Measure and document',
    'Use dry wit occasionally',
  ],
  voice_dont: [
    'Open with industry context',
    'Say "the industry" or "many leaders"',
    'Write in a run of fragments',
    'Present an opinion as fact',
    'Rank, crown winners, or hype',
    'Force jokes',
  ],
  use_words: ['Fellows', 'index', 'record', 'index position', 'Patron of Record'],
  never_words: ['honorees', 'winners', 'list', 'directory', 'rank', 'ranking', 'competition'],
  banned_words: [
    'leverage',
    'synergy',
    'optimize',
    'unlock',
    'innovation',
    'disruption',
    'game-changer',
    'next-gen',
    'transformational',
    'honestly',
  ],
  punctuation: ['No em dashes', 'No semicolons'],
  sourcing: [
    'Every number, date, and quote links to a page the writer opened, and nothing ships on a search snippet.',
    'Attribution: name the source and its date in the sentence. A forecast is a forecast, so write "Boeing forecasts," not "the industry needs."',
    'Audience claims: use only approved, dated numbers.',
    'Fellow and nominee data: Katja clears use before it appears in From the Record.',
    'Paid issues: the paid label and firewall line must be visible on web and in email.',
    'Every item uses the same three lines: the news, then the catch or the detail, then who it affects.',
  ],
  gates: [
    { gate: 'Editorial and public-facing', owner: 'Matthew', covers: 'Every issue before send' },
    { gate: 'Legal and compliance', owner: 'Katja', covers: 'Firewall wording, Patron copy, offering-adjacent language, data use' },
    { gate: 'Release timing', owner: 'Perry', covers: 'Timing of major releases, including the Annual' },
  ],
  open_decisions: [
    "Does the PRD's \u201cno ghostwriting\u201d rule still stand, or can others draft The Briefing and Across the field for Matthew's approval?",
    'Does the 1,500 to 2,500 word Authority Piece move to Quarterlies only?',
    'Rename The Lindbergh Issue, Final Sprint, and Selection?',
  ],
  effective_from: '2026-11-04',
  body: '',
};

// The standard as one piece of prose, so a drafting prompt reads the whole policy rather
// than the fields it happens to name. Composed from the version's own parts, never invented.
const composeBody = (standard) => {
  const lines = [standard.stance || ''];
  if (standard.structure?.length) {
    lines.push(
      'Standard structure, in print order: ' +
        standard.structure.map((row) => `${row.section} (${row.words}, by ${row.byline || 'none'}): ${row.job}`).join('; ') +
        '.',
    );
  }
  if (standard.lengths?.length) {
    lines.push(
      'Lengths: ' + standard.lengths.map((row) => `${row.type} ${row.words} (${row.what_changes})`).join('; ') + '.',
    );
  }
  if (standard.voice_do?.length) lines.push(`Voice, do: ${standard.voice_do.join('; ')}.`);
  if (standard.voice_dont?.length) lines.push(`Voice, do not: ${standard.voice_dont.join('; ')}.`);
  if (standard.use_words?.length) lines.push(`Use: ${standard.use_words.join(', ')}.`);
  if (standard.never_words?.length) lines.push(`Never use: ${standard.never_words.join(', ')}.`);
  if (standard.banned_words?.length) lines.push(`Banned words: ${standard.banned_words.join(', ')}.`);
  if (standard.punctuation?.length) lines.push(`Punctuation: ${standard.punctuation.join('; ')}.`);
  if (standard.sourcing?.length) lines.push(`Sourcing: ${standard.sourcing.join(' ')}`);
  if (standard.gates?.length) {
    lines.push(
      'Gates before an issue goes out: ' + standard.gates.map((row) => `${row.gate} cleared by ${row.owner} (${row.covers})`).join('; ') + '.',
    );
  }
  return lines.filter(Boolean).join('\n\n');
};

const MAGAZINE_DONE = ['published', 'archived'];
const MAIL_DONE = ['sent'];
const CAMPAIGN_DONE = ['reported', 'closed'];

const ISSUE_PATCHABLE = [
  'issue_no',
  'issue_date',
  'issue_name',
  'issue_type',
  'year',
  'format',
  'word_target',
  'stage',
  'lead_story',
  'why_now',
  'section_plan',
  'owner_name',
  'owner_email',
  'next_action',
  'next_action_due',
  'blockers',
  'notes',
  'style_version',
];

const CAMPAIGN_PATCHABLE = [
  'audience',
  'segment_id',
  'reader_action',
  'action_url',
  'channels',
  'measure',
  'measure_event',
  'start_on',
  'end_on',
  'status',
  'owner_name',
  'evidence',
  'evidence_source',
  'evidence_checked_at',
  'notes',
];

const pick = (source, keys) => {
  const out = {};
  keys.forEach((key) => {
    if (source[key] !== undefined) out[key] = source[key];
  });
  return out;
};

const pad = (n) => String(n).padStart(2, '0');

const longDate = (value) => {
  if (!value) return '';
  const d = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

// The letter is dated by the day it is written, not by the issue it carries.
const todayKey = () => {
  const d = new Date();
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

const trim = (text, limit) => {
  const value = String(text || '');
  return value.length > limit ? `${value.slice(0, limit)}\u2026` : value;
};

function deskState(issue, magazine, mail, campaign) {
  const magazineStatus = magazine ? magazine.status : '';
  const mailStatus = mail ? mail.status : '';
  const campaignStatus = campaign ? campaign.status : '';

  const desks = [
    {
      key: 'magazine',
      label: 'Magazine Studio',
      linked: Boolean(issue.magazine_issue_id),
      id: issue.magazine_issue_id || '',
      status: magazineStatus,
      complete: MAGAZINE_DONE.includes(magazineStatus),
      halted: false,
    },
    {
      key: 'mail',
      label: 'Mail Room',
      linked: Boolean(issue.mail_issue_id),
      id: issue.mail_issue_id || '',
      status: mailStatus,
      complete: MAIL_DONE.includes(mailStatus),
      halted: mailStatus === 'halted',
    },
    {
      key: 'campaign',
      label: 'Funnel Desk',
      linked: Boolean(issue.campaign_id),
      id: issue.campaign_id || '',
      status: campaignStatus,
      complete: CAMPAIGN_DONE.includes(campaignStatus),
      halted: false,
    },
  ];

  const staged = desks.filter((desk) => desk.linked);
  let readiness = 'planned';
  if (desks.some((desk) => desk.halted)) readiness = 'held';
  else if (staged.length && staged.every((desk) => desk.complete)) readiness = 'published';
  else if (staged.some((desk) => desk.complete)) readiness = 'ready';
  else if (staged.length) readiness = 'drafting';

  return { desks, readiness, stagedCount: staged.length, doneCount: staged.filter((d) => d.complete).length };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'state';
    const stamp = { at: new Date().toISOString(), by: user.email || '' };

    // ── Read the desk ────────────────────────────────────────────────────────
    if (action === 'state') {
      const [issues, campaigns, standards] = await Promise.all([
        base44.asServiceRole.entities.EditorialIssue.list('-issue_date', 400),
        base44.asServiceRole.entities.EditorialCampaign.list('-issue_no', 400),
        base44.asServiceRole.entities.EditorialStandard.filter({ status: 'active' }, { limit: 1 }),
      ]);

      const issueRows = Array.isArray(issues) ? issues : issues?.items || [];
      const campaignRows = Array.isArray(campaigns) ? campaigns : campaigns?.items || [];

      const magazineIds = issueRows.map((i) => i.magazine_issue_id).filter(Boolean);
      const mailIds = issueRows.map((i) => i.mail_issue_id).filter(Boolean);

      const [magazines, mails] = await Promise.all([
        magazineIds.length
          ? base44.asServiceRole.entities.MagazineIssue.filter({ id: { $in: magazineIds } }, { limit: 400 })
          : Promise.resolve([]),
        mailIds.length
          ? base44.asServiceRole.entities.MailIssue.filter({ id: { $in: mailIds } }, { limit: 400 })
          : Promise.resolve([]),
      ]);

      const magazineRows = Array.isArray(magazines) ? magazines : magazines?.items || [];
      const mailRows = Array.isArray(mails) ? mails : mails?.items || [];
      const magazineById = new Map(magazineRows.map((m) => [m.id, m]));
      const mailById = new Map(mailRows.map((m) => [m.id, m]));
      const campaignById = new Map(campaignRows.map((c) => [c.id, c]));

      const enriched = issueRows.map((issue) => ({
        ...issue,
        ...deskState(
          issue,
          magazineById.get(issue.magazine_issue_id),
          mailById.get(issue.mail_issue_id),
          campaignById.get(issue.campaign_id),
        ),
        magazine_title: magazineById.get(issue.magazine_issue_id)?.title || '',
        mail_headline: mailById.get(issue.mail_issue_id)?.headline || '',
        mail_sent_count: mailById.get(issue.mail_issue_id)?.sent_count || 0,
        mail_failed_count: mailById.get(issue.mail_issue_id)?.failed_count || 0,
      }));

      return Response.json({
        issues: enriched,
        campaigns: campaignRows,
        standard: (standards?.items || standards || [])[0] || null,
        seeded: enriched.length > 0,
      });
    }

    // ── File the playbook and the standard, once ─────────────────────────────
    if (action === 'seed') {
      const existing = await base44.asServiceRole.entities.EditorialIssue.list('-issue_no', 400);
      const rows = Array.isArray(existing) ? existing : existing?.items || [];
      const known = new Set(rows.map((row) => row.source_key).filter(Boolean));
      const knownNos = new Set(rows.map((row) => row.issue_no));

      const created = [];
      for (const row of PLAYBOOK) {
        const sourceKey = `playbook-${row.no}`;
        if (known.has(sourceKey) || knownNos.has(row.no)) continue;
        created.push({
          source_key: sourceKey,
          issue_no: row.no,
          issue_date: row.date,
          issue_name: row.name,
          issue_type: row.type,
          year: Number(row.date.slice(0, 4)),
          format: row.type === 'Quarterly' || row.type === 'Annual' ? 'magazine' : 'quick',
          word_target: WORD_TARGETS[row.type] || '',
          stage: 'planned',
          section_plan: [],
          timeline: [{ ...stamp, action: 'filed', detail: 'Added to the calendar from the playbook grid.' }],
        });
      }

      const written = created.length
        ? await base44.asServiceRole.entities.EditorialIssue.bulkCreate(created)
        : [];

      const standards = await base44.asServiceRole.entities.EditorialStandard.filter({ status: 'active' }, { limit: 1 });
      const activeStandard = (standards?.items || standards || [])[0];
      let standard = activeStandard || null;
      if (!standard) {
        standard = await base44.asServiceRole.entities.EditorialStandard.create({
          ...STANDARD_V1,
          body: composeBody(STANDARD_V1),
        });
      }

      return Response.json({
        created: written.length,
        skipped: PLAYBOOK.length - written.length,
        standard_version: standard?.version || 1,
      });
    }

    // ── Move one issue's plan ────────────────────────────────────────────────
    if (action === 'save_issue') {
      const id = body.id;
      if (!id) return Response.json({ error: 'id is required' }, { status: 400 });

      const current = await base44.asServiceRole.entities.EditorialIssue.get(id).catch((e) =>
        e.status === 404 ? null : Promise.reject(e),
      );
      if (!current) return Response.json({ error: 'Not found' }, { status: 404 });

      const patch = pick(body.patch || {}, ISSUE_PATCHABLE);
      if (patch.issue_type) {
        patch.word_target = WORD_TARGETS[patch.issue_type] || patch.word_target || current.word_target || '';
        patch.format = patch.issue_type === 'Quarterly' || patch.issue_type === 'Annual' ? 'magazine' : 'quick';
      }

      const timeline = [...(current.timeline || [])];
      if (patch.stage && patch.stage !== current.stage) {
        timeline.push({ ...stamp, action: 'stage', detail: `${current.stage || 'planned'} to ${patch.stage}` });
      }
      timeline.push({ ...stamp, action: 'plan', detail: 'Issue plan updated.' });
      patch.timeline = timeline.slice(-60);

      const saved = await base44.asServiceRole.entities.EditorialIssue.update(id, patch);
      return Response.json({ issue: saved });
    }

    // ── Stage a desk against an issue ────────────────────────────────────────
    if (action === 'stage_desk') {
      const { issue_id: issueId, desk } = body;
      if (!issueId || !desk) return Response.json({ error: 'issue_id and desk are required' }, { status: 400 });

      const issue = await base44.asServiceRole.entities.EditorialIssue.get(issueId).catch((e) =>
        e.status === 404 ? null : Promise.reject(e),
      );
      if (!issue) return Response.json({ error: 'Not found' }, { status: 404 });

      const standardRes = await base44.asServiceRole.entities.EditorialStandard.filter({ status: 'active' }, { limit: 1 });
      const standard = (standardRes?.items || standardRes || [])[0] || null;

      if (desk === 'magazine') {
        if (issue.magazine_issue_id) return Response.json({ id: issue.magazine_issue_id, existed: true });
        const record = await base44.asServiceRole.entities.MagazineIssue.create({
          title: issue.issue_name,
          issue_number: issue.issue_no,
          status: 'draft',
          assembly_mode: 'native',
          sections: [],
        });
        await base44.asServiceRole.entities.EditorialIssue.update(issueId, {
          magazine_issue_id: record.id,
          timeline: [
            ...(issue.timeline || []),
            { ...stamp, action: 'staged', detail: 'Magazine Studio issue opened.' },
          ].slice(-60),
        });
        return Response.json({ id: record.id, existed: false });
      }

      if (desk === 'mail') {
        if (issue.mail_issue_id) return Response.json({ id: issue.mail_issue_id, existed: true });
        const record = await base44.asServiceRole.entities.MailIssue.create({
          issue_no: issue.issue_no,
          issue_date: longDate(todayKey()),
          kicker: `The Dispatch \u00b7 No. ${issue.issue_no}`,
          headline: issue.issue_name,
          standfirst: issue.why_now || issue.issue_name,
          sections: [],
          quick_links: [],
          status: 'draft',
          closing: '',
        });
        await base44.asServiceRole.entities.EditorialIssue.update(issueId, {
          mail_issue_id: record.id,
          style_version: standard?.version || issue.style_version || null,
          timeline: [
            ...(issue.timeline || []),
            { ...stamp, action: 'staged', detail: 'Mail Room letter drafted.' },
          ].slice(-60),
        });
        return Response.json({ id: record.id, existed: false });
      }

      if (desk === 'campaign') {
        if (issue.campaign_id) return Response.json({ id: issue.campaign_id, existed: true });
        const record = await base44.asServiceRole.entities.EditorialCampaign.create({
          issue_id: issueId,
          issue_no: issue.issue_no,
          issue_name: issue.issue_name,
          audience: '',
          reader_action: '',
          channels: [],
          measure: '',
          status: 'planned',
          owner_name: '',
        });
        await base44.asServiceRole.entities.EditorialIssue.update(issueId, {
          campaign_id: record.id,
          timeline: [
            ...(issue.timeline || []),
            { ...stamp, action: 'staged', detail: 'Funnel Desk campaign opened.' },
          ].slice(-60),
        });
        return Response.json({ id: record.id, existed: false });
      }

      return Response.json({ error: 'Unknown desk' }, { status: 400 });
    }

    // ── Write the campaign plan ──────────────────────────────────────────────
    if (action === 'save_campaign') {
      const { campaign_id: campaignId, issue_id: issueId, patch } = body;
      const clean = pick(patch || {}, CAMPAIGN_PATCHABLE);

      if (campaignId) {
        const saved = await base44.asServiceRole.entities.EditorialCampaign.update(campaignId, clean);
        return Response.json({ campaign: saved });
      }
      if (!issueId) return Response.json({ error: 'campaign_id or issue_id is required' }, { status: 400 });

      const issue = await base44.asServiceRole.entities.EditorialIssue.get(issueId).catch((e) =>
        e.status === 404 ? null : Promise.reject(e),
      );
      if (!issue) return Response.json({ error: 'Not found' }, { status: 404 });

      const record = await base44.asServiceRole.entities.EditorialCampaign.create({
        ...clean,
        issue_id: issueId,
        issue_no: issue.issue_no,
        issue_name: issue.issue_name,
      });
      await base44.asServiceRole.entities.EditorialIssue.update(issueId, {
        campaign_id: record.id,
        timeline: [
          ...(issue.timeline || []),
          { ...stamp, action: 'staged', detail: 'Funnel Desk campaign opened.' },
        ].slice(-60),
      });
      return Response.json({ campaign: record });
    }

    // ── Draft the letter to the standard ─────────────────────────────────────
    if (action === 'draft_letter') {
      const { issue_id: issueId } = body;
      if (!issueId) return Response.json({ error: 'issue_id is required' }, { status: 400 });

      const issue = await base44.asServiceRole.entities.EditorialIssue.get(issueId).catch((e) =>
        e.status === 404 ? null : Promise.reject(e),
      );
      if (!issue) return Response.json({ error: 'Not found' }, { status: 404 });

      const standardRes = await base44.asServiceRole.entities.EditorialStandard.filter({ status: 'active' }, { limit: 1 });
      const standard = (standardRes?.items || standardRes || [])[0] || STANDARD_V1;

      let existing = null;
      if (issue.mail_issue_id) {
        existing = await base44.asServiceRole.entities.MailIssue.get(issue.mail_issue_id).catch((e) =>
          e.status === 404 ? null : Promise.reject(e),
        );
        if (existing && (existing.status === 'sent' || existing.status === 'sending')) {
          return Response.json(
            { error: 'This letter has already gone out. A sent letter is never rewritten.' },
            { status: 409 },
          );
        }
      }

      const brief = [
        `Issue: No. ${issue.issue_no}, ${issue.issue_name} (${issue.issue_type}), landing ${issue.issue_date}.`,
        issue.lead_story ? `Lead story: ${issue.lead_story}` : '',
        issue.why_now ? `Why now: ${issue.why_now}` : '',
        issue.notes ? `Desk notes: ${issue.notes}` : '',
        `Length for this issue type: ${WORD_TARGETS[issue.issue_type] || standard.lengths?.[0]?.words || '600 to 1,000'} words.`,
      ]
        .filter(Boolean)
        .join('\n');

      const rules = [
        `Stance: ${standard.stance || ''}`,
        `Voice, do: ${(standard.voice_do || []).join('; ')}`,
        `Voice, do not: ${(standard.voice_dont || []).join('; ')}`,
        `Words to use: ${(standard.use_words || []).join(', ')}`,
        `Words never to use: ${(standard.never_words || []).join(', ')}`,
        `Banned words: ${(standard.banned_words || []).join(', ')}`,
        `Punctuation: ${(standard.punctuation || []).join('; ')}`,
        `Sourcing: ${(standard.sourcing || []).join(' ')}`,
        `Sections, in order: ${(standard.structure || []).map((s) => `${s.section} (${s.words})`).join(', ')}`,
      ].join('\n');

      const prompt = `You are drafting ONE issue of The Dispatch, the house letter of TOP 100 Aerospace & Aviation, to the house editorial standard.

THE STANDARD, WHICH IS BINDING
${trim(standard.body || '', 4000)}
${trim(rules, 4000)}

THE ISSUE
${brief}

Write the letter. Rules that override everything else:
- Report. Do not argue a position. Attribute every view to the person or document that holds it.
- Invent nothing. No number, date, quote or name that is not in the issue brief above may appear. Where a figure is missing, write around it rather than estimating.
- Never use the banned words, never use an em dash or a semicolon.
- The headline is a plain statement of what is inside, under 55 characters. Never a tease.
- One to three signals, strongest first. Each signal's body opens with the news in one sentence, then says who it affects.
- Carry a link only where the brief printed one. Otherwise leave it empty.
- The closing is one line, signed by the editor, in the house sign-off.`;

      const schema = {
        type: 'object',
        properties: {
          kicker: { type: 'string', description: 'Small line above the headline, e.g. "The Dispatch \u00b7 No. 48".' },
          headline: { type: 'string', description: 'Subject line and the letter headline, under 55 characters.' },
          standfirst: { type: 'string', description: 'One sentence carried as the inbox preview line.' },
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                title: { type: 'string' },
                body: { type: 'string' },
                url: { type: 'string' },
              },
            },
          },
          quick_links: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                url: { type: 'string' },
              },
            },
          },
          closing: { type: 'string' },
          cta_label: { type: 'string' },
          cta_url: { type: 'string' },
        },
      };

      const draft = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: schema,
      });

      const payload = {
        kicker: draft?.kicker || `The Dispatch \u00b7 No. ${issue.issue_no}`,
        headline: draft?.headline || issue.issue_name,
        standfirst: draft?.standfirst || issue.why_now || '',
        sections: Array.isArray(draft?.sections) ? draft.sections.slice(0, 3) : [],
        quick_links: Array.isArray(draft?.quick_links) ? draft.quick_links.slice(0, 5) : [],
        closing: draft?.closing || '',
        cta_label: draft?.cta_label || '',
        cta_url: draft?.cta_url || '',
        issue_no: issue.issue_no,
        issue_date: longDate(todayKey()),
        status: 'draft',
      };

      let record;
      if (existing) {
        record = await base44.asServiceRole.entities.MailIssue.update(existing.id, payload);
      } else {
        record = await base44.asServiceRole.entities.MailIssue.create(payload);
      }

      await base44.asServiceRole.entities.EditorialIssue.update(issueId, {
        mail_issue_id: record.id,
        style_version: standard.version || 1,
        timeline: [
          ...(issue.timeline || []),
          { ...stamp, action: 'drafted', detail: `Letter drafted to standard v${standard.version || 1}.` },
        ].slice(-60),
      });

      return Response.json({ letter: record, standard_version: standard.version || 1 });
    }

    // ── File a new version of the standard ───────────────────────────────────
    if (action === 'save_standard') {
      const patch = body.standard || {};
      const activeRes = await base44.asServiceRole.entities.EditorialStandard.filter({ status: 'active' }, { limit: 1 });
      const active = (activeRes?.items || activeRes || [])[0] || null;

      if (active) {
        await base44.asServiceRole.entities.EditorialStandard.update(active.id, { status: 'superseded' });
      }

      const next = { ...STANDARD_V1, ...(active || {}), ...patch };
      const created = await base44.asServiceRole.entities.EditorialStandard.create({
        ...next,
        version: (active?.version || 0) + 1,
        status: 'active',
        effective_from: todayKey(),
        body: composeBody(next),
        id: undefined,
        created_date: undefined,
        updated_date: undefined,
        created_by_id: undefined,
      });

      return Response.json({ standard: created });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}