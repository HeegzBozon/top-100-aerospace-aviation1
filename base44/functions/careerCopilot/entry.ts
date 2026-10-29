import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// The Career Copilot composes a goal-specific pitch from ONE Fellow's own record.
// It never writes: it returns a proposal the Fellow must review and approve in the
// app. Grounding is the whole design — every line of the proposal must trace to a
// fact this function handed the model, and the model is told to leave anything it
// does not have in `gaps` rather than fill it in.

const GOAL_BRIEF = {
  job: 'a job opportunity — the next role they want to be considered for',
  deal: 'a business deal — a partnership, contract or commercial relationship they want to open',
  general: 'their general professional profile — a considered presentation with no single ask',
};

// Configurable slide regions. Identity and verification are locked at positions
// 1 and 2 and may never be recommended, moved, or listed here.
const SLIDE_KEYS = [
  'viral_post',
  'blurb',
  'documents',
  'eight',
  'flightography',
  'conferences',
  'availability',
];

const clean = (value, max) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);

function points(list, limit, secondKey) {
  if (!Array.isArray(list)) return [];
  return list
    .slice(0, limit)
    .map((p) => {
      const a = clean(p?.label, 80);
      const b = clean(p?.[secondKey], 260);
      return a && b ? { label: a, [secondKey]: b } : null;
    })
    .filter(Boolean);
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const goal = body?.goal;
    if (!GOAL_BRIEF[goal]) {
      return Response.json({ error: 'Goal must be one of: job, deal, general' }, { status: 400 });
    }

    // ---- The Fellow's own record. Service role so the resolver can match on
    // claim and email, which a member cannot query directly; every read below is
    // scoped to this caller and nothing is returned that is not their own.
    let nominee = null;
    if (user.id) {
      const claimed = await base44.asServiceRole.entities.Nominee.filter(
        { claimed_by_user_id: user.id },
        { limit: 1 }
      );
      nominee = (claimed?.items || claimed || [])[0] || null;
    }
    if (!nominee && user.email) {
      const byEmail = await base44.asServiceRole.entities.Nominee.filter(
        { claimed_by_user_email: user.email },
        { limit: 1 }
      );
      nominee = (byEmail?.items || byEmail || [])[0] || null;
    }
    if (!nominee && user.email) {
      const byNomineeEmail = await base44.asServiceRole.entities.Nominee.filter(
        { nominee_email: user.email },
        { limit: 1 }
      );
      nominee = (byNomineeEmail?.items || byNomineeEmail || [])[0] || null;
    }

    const [settingsRows, serviceRows, resourcePage] = await Promise.all([
      base44.entities.FellowProfileSettings.filter({ fellow_email: user.email }),
      base44.entities.Service.filter({ provider_user_email: user.email, is_active: true }),
      base44.entities.CareerResource.filter({ is_active: true }, { limit: 12 }),
    ]);
    const settings = (settingsRows || [])[0] || null;
    const services = (serviceRows || []).filter((s) => s.is_draft !== true);
    const resources = resourcePage?.items || resourcePage || [];

    // ---- Fact sheet. Each line carries the provenance the proposal must respect.
    const checks = nominee?.verification_status || {};
    const fullyVerified = nominee?.verified_status === 'fully_verified';
    const employerOk = checks.employer_verified === true || fullyVerified;
    const linkedinOk = checks.linkedin_verified === true || fullyVerified;

    const facts = [];
    const add = (tag, label, value, max = 320) => {
      const v = clean(value, max);
      if (v) facts.push(`[${tag}] ${label}: ${v}`);
    };

    add('verified', 'Name', nominee?.name || user.full_name);
    add('verified', 'Platform credential', nominee?.verified_status);
    add(employerOk ? 'verified' : 'submitted', 'Title', nominee?.title);
    add(employerOk ? 'verified' : 'submitted', 'Company', nominee?.company || nominee?.organization);
    add('submitted', 'Discipline', nominee?.discipline);
    add('submitted', 'Industry', nominee?.industry);
    add('submitted', 'Location', nominee?.country || user.location);
    add('submitted', 'Self description', nominee?.description);
    add('submitted', 'Biography', nominee?.bio_extended || nominee?.bio || user.bio, 900);
    add('submitted', 'Impact summary', nominee?.impact_summary, 600);
    add('submitted', 'Achievements', nominee?.achievements, 600);
    add(employerOk ? 'verified' : 'submitted', 'Skills', (nominee?.skills || []).join(', '), 400);
    add(employerOk ? 'verified' : 'submitted', 'Affiliations', (nominee?.affiliations || []).join(', '), 300);

    const career = (nominee?.career_history || []).slice(0, 5).map((c) =>
      [c.role_title, c.company_name, [c.start_date, c.end_date].filter(Boolean).join('–')]
        .filter(Boolean)
        .join(', ')
    );
    add(employerOk ? 'verified' : 'submitted', 'Career record', career.join(' | '), 700);

    const education = (nominee?.education || []).slice(0, 4).map((e) =>
      [e.degree, e.field_of_study, e.institution_name].filter(Boolean).join(', ')
    );
    add(employerOk ? 'verified' : 'submitted', 'Education', education.join(' | '), 400);

    if (linkedinOk && nominee?.linkedin_profile_url) {
      add('verified', 'Professional profile link', nominee.linkedin_profile_url, 200);
    }
    add('submitted', 'Headline', user.headline, 160);
    add('submitted', 'Six word story', settings?.six_word_story || user.six_word_story, 80);
    add('submitted', 'In their own words', settings?.about_me, 600);
    add('submitted', "Who they'd like to meet", settings?.who_id_like_to_meet, 600);
    add('submitted', 'Current status', settings?.status_key, 60);

    if (services.length) {
      const names = services.slice(0, 5).map((s) => clean(s.title, 90)).filter(Boolean).join('; ');
      add('verified', 'Available for introductions', names, 400);
    }

    for (const r of resources.slice(0, 8)) {
      const line = [clean(r.title, 120), clean(r.summary, 200), clean(r.link, 200)].filter(Boolean).join(' — ');
      if (line) facts.push(`[platform] Resource: ${line}`);
    }

    if (!facts.length) {
      return Response.json({ error: 'There is nothing on your profile to work from yet.' }, { status: 400 });
    }

    const hasAvailability = services.length > 0;
    const factSheet = facts.join('\n');

    const prompt = `You are the Career Copilot for TOP 100 Aerospace & Aviation, an institutional measurement and reputation platform. You write the way the institution writes: warm, precise, spare, editorial. You are composing one presentation for one Fellow.

THE GOAL
They are preparing for ${GOAL_BRIEF[goal]}.

THE FACTS
Everything you may say about this person is below. Each line is prefixed with its provenance.

${factSheet}

PROVENANCE — this is the point of the whole exercise
- [verified] = corroborated by the platform.
- [submitted] = the Fellow's own words, not independently corroborated.
- [platform] = a resource this platform curates.
A point belongs in verified_points only if it rests on a [verified] line. A point resting on [submitted] text belongs in expression_points. Never move one to the other to make the record look stronger.

HARD RULES
- Invent nothing. No employers, titles, dates, metrics, clients, programmes, awards, or credentials that are not above. If the record does not support something the goal needs, put it in gaps instead.
- You are not the measurer. Never rank the person, never imply a place on a list, never mention scores, votes, tiers, selection outcomes, or the judging process.
- Never promise a role, an introduction, a meeting, or a deal. Never say who would want to meet them.
- Never call them a "follower" or count likes. The community endorses; it does not follow.
- Availability is an introduction-only expert network: say "available for introductions". Never use "gig", "freelance", "service", "rate", "booking", or star ratings.
- No hype vocabulary: no "rockstar", "guru", "world-class", "visionary", "game-changer", "passionate".
- Never use an em dash in the writing. Use a comma, a period, or rewrite the sentence.
- Plain, concrete, first person for the pitch. No exclamation marks anywhere.

WHAT TO RETURN
- headline: one line, at most 90 characters, the positioning that carries this goal. Not a job title alone.
- pitch: first person, 3 to 5 sentences, at most 900 characters, built from the facts above and aimed at this goal.
- verified_points: up to 4, each {label, detail}, only from [verified] lines.
- expression_points: up to 3, each {label, detail}, drawn from [submitted] lines.
- gaps: up to 3, each {label, why}, the specific things this goal needs that the record does not yet say. Empty if the record genuinely covers the goal.
- recommended_slides: the configurable profile slides, in the order that best serves this goal. Choose from exactly these keys and use each at most once: ${SLIDE_KEYS.join(', ')}. Identity and Credential are locked at positions 1 and 2 and are not yours to choose.
- resources: up to 3, each {title, why, link}, only from [platform] Resource lines that genuinely help this goal. Empty if none fit.
- availability_note: one line describing their active availability for introductions. Empty string if they have none above.`;

    const proposal = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          headline: { type: 'string' },
          pitch: { type: 'string' },
          verified_points: {
            type: 'array',
            items: {
              type: 'object',
              properties: { label: { type: 'string' }, detail: { type: 'string' } },
              required: ['label', 'detail'],
            },
          },
          expression_points: {
            type: 'array',
            items: {
              type: 'object',
              properties: { label: { type: 'string' }, detail: { type: 'string' } },
              required: ['label', 'detail'],
            },
          },
          gaps: {
            type: 'array',
            items: {
              type: 'object',
              properties: { label: { type: 'string' }, why: { type: 'string' } },
              required: ['label', 'why'],
            },
          },
          recommended_slides: { type: 'array', items: { type: 'string' } },
          resources: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                why: { type: 'string' },
                link: { type: 'string' },
              },
              required: ['title'],
            },
          },
          availability_note: { type: 'string' },
        },
        required: ['headline', 'pitch', 'recommended_slides'],
      },
    });

    // The server, not the model, decides what a valid slide order can be.
    const proposed = Array.isArray(proposal?.recommended_slides) ? proposal.recommended_slides : [];
    const order = [];
    for (const key of proposed) {
      if (SLIDE_KEYS.includes(key) && !order.includes(key)) order.push(key);
    }
    for (const key of SLIDE_KEYS) {
      if (!order.includes(key)) order.push(key);
    }

    const safeResources = (Array.isArray(proposal?.resources) ? proposal.resources : [])
      .slice(0, 3)
      .map((r) => ({
        title: clean(r?.title, 140),
        why: clean(r?.why, 220),
        link: clean(r?.link, 300),
      }))
      .filter((r) => r.title && resources.some((src) => clean(src.title, 140) === r.title));

    return Response.json({
      proposal: {
        goal,
        headline: clean(proposal?.headline, 90),
        pitch: clean(proposal?.pitch, 900),
        verified_points: points(proposal?.verified_points, 4, 'detail'),
        expression_points: points(proposal?.expression_points, 3, 'detail'),
        gaps: points(proposal?.gaps, 3, 'why'),
        recommended_slides: order,
        resources: safeResources,
        availability_note: hasAvailability ? clean(proposal?.availability_note, 200) : '',
      },
      sources: {
        has_nominee: !!nominee,
        availability_count: services.length,
        fact_count: facts.length,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}