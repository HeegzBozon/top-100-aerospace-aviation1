import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { appendNominationsToManifest } from '../../shared/manifestAppend.ts';

// ── Filing a nomination ──
//
// Putting names forward is open to anyone, so this desk is the one place in the house
// that answers an anonymous caller. What it refuses is volume: a honeypot field no person
// can see, a ceiling on how much one address may file in a day, a check against what that
// address has already put forward, and — only when a filing looks mechanical — one
// question answered by a person before the record is written.
//
// The client shapes the entries (the guided answers are composed there, where the form
// knows them); this function only decides whether they may be filed, and writes them.

const SURVEY_ID = '69f45633daacf496cacd8666';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HOUR = 3600000;
const WINDOW_MS = 24 * HOUR;
const DUPLICATE_WINDOW_MS = 12 * HOUR;
const IDEMPOTENT_WINDOW_MS = 10 * 60 * 1000;
const FAST_FILL_MS = 12000;
const CHALLENGE_TTL_MS = 30 * 60 * 1000;
const GUEST_CEILING = 5;
const MEMBER_CEILING = 20;
const MAX_ENTRIES = 60;
const TRACKS = ['women', 'men', 'angels'];

const norm = (value) => String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
const clean = (value) => (typeof value === 'string' ? value.trim() : '');
const pageItems = (page) => (Array.isArray(page) ? page : page?.items || []);
const ageOf = (stamp) => {
  const at = Date.parse(stamp || '');
  return Number.isFinite(at) ? Date.now() - at : Number.POSITIVE_INFINITY;
};

// A short, stable fingerprint for one filing, kept inside the key length the desk holds.
function shortHash(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export default async function (req) {
  const base44 = createClientFromRequest(req);
  const service = base44.asServiceRole;

  try {
    const body = await req.json().catch(() => ({}));
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));

    const about = body.about || {};
    const email = norm(about.email);
    const name = clean(about.name);
    const connection = clean(about.connection);
    const meta = body.meta || {};
    const people = Array.isArray(body.people) ? body.people : [];
    const legends = Array.isArray(body.localLegends) ? body.localLegends : [];

    // The field a person never sees and never fills. Answered as though it had been filed,
    // so whatever filled it learns nothing from the reply.
    if (clean(meta.website)) return Response.json({ success: true, filed: 0 });

    if (!name || !EMAIL_RE.test(email)) {
      return Response.json(
        { success: false, code: 'invalid', message: 'A name and a working email address are needed to credit the nomination.' },
        { status: 400 },
      );
    }

    const entries = people
      .map((p) => ({
        nomination_type: TRACKS.includes(p?.type) ? p.type : 'women',
        // When the nominator took up a record the house already holds, the filing carries it,
        // so the desk reads the nomination against the person it is about.
        nominee_id: clean(p?.nominee_id),
        nominee_name: clean(p?.nominee_name),
        nominee_email: clean(p?.nominee_email),
        role_org: clean(p?.role_org),
        firm: clean(p?.firm),
        link: clean(p?.link),
        location: clean(p?.location),
        reason: clean(p?.reason),
        investing_in: clean(p?.investing_in),
        share_name: ['yes', 'no'].includes(p?.share_name) ? p.share_name : '',
      }))
      .filter((entry) => entry.nominee_name);

    const legendEntries = legends
      .map((l) => ({
        business_name: clean(l?.business_name),
        business_type: clean(l?.business_type),
        city: clean(l?.city),
        owner_name: clean(l?.owner_name),
        link: clean(l?.link),
        reason: clean(l?.reason),
        share_name: ['yes', 'no'].includes(l?.share_name) ? l.share_name : '',
      }))
      .filter((entry) => entry.business_name);

    if (!entries.length && !legendEntries.length) {
      return Response.json(
        { success: false, code: 'invalid', message: 'Add at least one name before filing.' },
        { status: 400 },
      );
    }
    if (entries.length + legendEntries.length > MAX_ENTRIES) {
      return Response.json(
        { success: false, code: 'invalid', message: 'That is more names than one filing carries. Send them across two filings.' },
        { status: 413 },
      );
    }

    // What this address has already put forward, so volume is answered rather than stored.
    const history = pageItems(
      await service.entities.NominationIntake.filter({ nominator_email: email }, { sort: '-created_date', limit: 300 }),
    );
    const inWindow = history.filter((row) => ageOf(row.created_date) < WINDOW_MS);

    const ceiling = user ? MEMBER_CEILING : GUEST_CEILING;
    if (inWindow.length >= ceiling) {
      return Response.json(
        {
          success: false,
          code: 'rate_limited',
          message: 'This address has filed several nominations today. The desk opens again tomorrow.',
        },
        { status: 429 },
      );
    }

    // A name already put forward by this address in the last half day is not filed twice.
    const alreadyFiled = new Set(
      history.filter((row) => ageOf(row.created_date) < DUPLICATE_WINDOW_MS).map((row) => norm(row.nominee_name)),
    );
    const freshEntries = entries.filter((entry) => !alreadyFiled.has(norm(entry.nominee_name)));
    const freshLegends = legendEntries.filter((entry) => !alreadyFiled.has(norm(entry.business_name)));

    if (!freshEntries.length && !freshLegends.length) {
      return Response.json({ success: true, filed: 0, already: true });
    }

    // A double tap on the same filing is answered once, not twice.
    const fingerprint = `nom:${shortHash(
      `${email}|${[...entries.map((e) => norm(e.nominee_name)), ...legendEntries.map((l) => norm(l.business_name))]
        .sort()
        .join('|')}`,
    )}`;
    const priorFiling = pageItems(
      await service.entities.IdempotencyRecord.filter({ key: fingerprint }, { limit: 1 }),
    )[0];
    if (priorFiling && ageOf(priorFiling.first_seen_at) < IDEMPOTENT_WINDOW_MS) {
      return Response.json({ success: true, filed: 0, already: true });
    }

    // Two shapes of filing look mechanical: one that arrives faster than a person reads the
    // form, and one from an address already at the desk today. Either is answered with a
    // question a person can answer, and nothing is written until it is.
    const typed = Number(meta.elapsed_ms);
    const tooFast = !Number.isFinite(typed) || typed < FAST_FILL_MS;
    const repeating = inWindow.length >= 2;
    const needsChallenge = !user && (tooFast || repeating);

    if (user === null && needsChallenge) {
      const token = clean(meta.challenge?.token);
      const expected = norm(freshEntries[0]?.nominee_name || entries[0]?.nominee_name || freshLegends[0]?.business_name);

      if (!token) {
        const issued = crypto.randomUUID();
        await service.entities.IdempotencyRecord.create({
          key: `chal:${issued}`,
          request_fingerprint: email,
          response_digest: expected,
          first_seen_at: new Date().toISOString(),
        });
        return Response.json({
          success: false,
          code: 'challenge_required',
          token: issued,
          question: 'Confirm a person is filing this: type the full name of the first person you nominated.',
        });
      }

      const held = pageItems(
        await service.entities.IdempotencyRecord.filter({ key: `chal:${token}` }, { limit: 1 }),
      )[0];
      const matches =
        held &&
        ageOf(held.first_seen_at) < CHALLENGE_TTL_MS &&
        (!held.request_fingerprint || held.request_fingerprint === email) &&
        norm(meta.challenge?.answer) === held.response_digest;

      if (!matches) {
        return Response.json(
          {
            success: false,
            code: 'challenge_failed',
            token,
            question: 'Type the full name of the first person you nominated.',
            message: 'That did not match. Check the spelling of the name and try once more.',
          },
          { status: 400 },
        );
      }
      await service.entities.IdempotencyRecord.delete(held.id).catch(() => {});
    }

    const now = new Date().toISOString();

    const submission = await service.entities.SurveyResponse.create({
      survey_id: SURVEY_ID,
      respondent_email: email,
      respondent_name: name,
      completed: true,
      answers: {
        your_name: name,
        your_email: email,
        your_connection: connection,
        women_nominations: entries.filter((e) => e.nomination_type === 'women'),
        men_nominations: entries.filter((e) => e.nomination_type === 'men'),
        angels_nominations: entries.filter((e) => e.nomination_type === 'angels'),
        local_legends_nominations: freshLegends,
        submitted_at: now,
      },
    });

    const intakeBase = {
      submission_id: submission.id,
      survey_id: SURVEY_ID,
      nominator_name: name,
      nominator_email: email,
      nominator_connection: connection,
      source: 'unified_nomination_hub',
      status: 'new',
    };

    if (freshEntries.length) {
      await service.entities.NominationIntake.bulkCreate(freshEntries.map((entry) => ({ ...entry, ...intakeBase })));
      // What the Fellow put forward joins their own Manifest at the end — the one shared
      // order Women and Men stand on. A filing with no record behind it stays in the intake
      // for review; nothing is invented and no ballot is cast.
      await appendNominationsToManifest(service, email).catch(() => null);
    }
    if (freshLegends.length) {
      await service.entities.LocalLegendNomination.bulkCreate(
        freshLegends.map((entry) => ({
          ...entry,
          submission_id: submission.id,
          survey_id: SURVEY_ID,
          nominator_name: name,
          nominator_email: email,
          source: 'unified_nomination_hub',
          status: 'new',
        })),
      );
    }

    await service.entities.IdempotencyRecord.create({
      key: fingerprint,
      request_fingerprint: email,
      first_seen_at: now,
    }).catch(() => {});

    const surveys = await service.entities.Survey.filter({ id: SURVEY_ID });
    if (surveys[0]) {
      await service.entities.Survey.update(SURVEY_ID, {
        response_count: (surveys[0].response_count || 0) + 1,
      });
    }

    return Response.json({ success: true, filed: freshEntries.length + freshLegends.length });
  } catch (error) {
    return Response.json({ success: false, code: 'error', message: error.message }, { status: 500 });
  }
}