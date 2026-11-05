import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { resolveOutreachPersons } from '../../shared/nomineeResolve.ts';

// The ballot notice desk. One campaign, one send per person, ever.
//
// The cohort is never taken from the request: it is read back from the ballot
// (every Nominee on the active ballot) and resolved through the same identity
// resolver the outreach export uses, so a person who holds two records is
// written to once, and an address that fails the validity gate is never mailed.
// Every attempt is filed as a BallotNoticeSend row, which is what makes the
// campaign unrepeatable: a second run only ever picks up who is left.
//
// Most nominees are not app users, so each address is sent to on its own and the
// mail service answers per address. A refusal is recorded, never swallowed.

const CAMPAIGN = 'ballot-notice-2026';
const SITE = 'https://top100aero.space';
const VOTE_URL = `${SITE}/selection-committee`;

// A run is given a slice of its recipients rather than all of them: the workflow
// calls back until nothing is left, so a big ballot never depends on one long
// function call finishing.
const CONCURRENCY = 5;
const BUDGET_MS = 40000;

function firstNameOf(person) {
  const name = String(person?.name || '').trim();
  if (name) {
    const token = name.split(/\s+/)[0].replace(/[^A-Za-z'’-]/g, '');
    if (token.length > 1) return token.charAt(0).toUpperCase() + token.slice(1);
  }
  const local = String(person?.email || '').split('@')[0] || '';
  const part = local.split(/[._\-0-9]/)[0].replace(/[^A-Za-z]/g, '');
  if (!part) return 'Fellow';
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

function profileUrlOf(person) {
  // The resolver's deep link carries the canonical profile route and a claim
  // hint. Share links drop the hint and read on the app's own domain.
  return String(person?.deepLink || '')
    .replace(/^https?:\/\/[^/]+/, SITE)
    .split('?')[0];
}

export default async function (req) {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth
    .me()
    .catch((e) => (e.status === 401 ? null : Promise.reject(e)));
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const dryRun = body?.dry_run === true;

  // The ballot: every record currently in the voting pool.
  const nominees = [];
  let cursor = null;
  for (let page = 0; page < 12; page += 1) {
    const res = await base44.asServiceRole.entities.Nominee.filter(
      { status: 'active' },
      { limit: 200, cursor },
    );
    const items = res?.items || [];
    nominees.push(...items);
    if (!res?.has_more || !res?.next_cursor) break;
    cursor = res.next_cursor;
  }

  const persons = resolveOutreachPersons(nominees, new Set()).filter((p) => p.email);
  const seen = new Set();
  const cohort = persons.filter((p) => {
    const key = String(p.email).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Who has already been written to for this campaign.
  const filed = [];
  let filedCursor = null;
  for (let page = 0; page < 20; page += 1) {
    const res = await base44.asServiceRole.entities.BallotNoticeSend.filter(
      { campaign: CAMPAIGN, status: 'sent' },
      { limit: 200, cursor: filedCursor },
    );
    const items = res?.items || [];
    filed.push(...items);
    if (!res?.has_more || !res?.next_cursor) break;
    filedCursor = res.next_cursor;
  }
  const alreadySent = new Set(filed.map((r) => String(r.email || '').toLowerCase()));

  const queue = cohort.filter((p) => !alreadySent.has(String(p.email).toLowerCase()));

  if (dryRun) {
    return Response.json({
      ok: true,
      dry_run: true,
      on_ballot: nominees.length,
      people: cohort.length,
      already_sent: alreadySent.size,
      remaining: queue.length,
    });
  }

  const startedAt = Date.now();
  let processed = 0;
  let sent = 0;
  let failed = 0;
  const failures = [];

  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    if (Date.now() - startedAt > BUDGET_MS) break;
    const batch = queue.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map((p) =>
        base44.integrations.Core.SendEmail({
          to: p.email,
          template_name: 'BallotNotice',
          variables: {
            first_name: firstNameOf(p),
            vote_url: VOTE_URL,
            share_url: profileUrlOf(p),
          },
        }),
      ),
    );

    const rows = [];
    const now = new Date().toISOString();
    settled.forEach((outcome, n) => {
      const person = batch[n];
      if (outcome.status === 'rejected') {
        failed += 1;
        const reason = outcome.reason?.message || 'The mail service did not answer.';
        failures.push({ email: person.email, reason });
        rows.push({
          campaign: CAMPAIGN,
          nominee_name: person.name || '',
          email: String(person.email).toLowerCase(),
          status: 'failed',
          reason,
          sent_at: now,
        });
        return;
      }
      const res = outcome.value || {};
      if (res.success === false) {
        failed += 1;
        const reason = res.message || res.reason || 'The address could not be reached.';
        failures.push({ email: person.email, reason });
        rows.push({
          campaign: CAMPAIGN,
          nominee_name: person.name || '',
          email: String(person.email).toLowerCase(),
          status: 'failed',
          reason,
          sent_at: now,
        });
        return;
      }
      sent += 1;
      rows.push({
        campaign: CAMPAIGN,
        nominee_name: person.name || '',
        email: String(person.email).toLowerCase(),
        status: 'sent',
        sent_at: now,
      });
    });

    if (rows.length) await base44.asServiceRole.entities.BallotNoticeSend.bulkCreate(rows);
    processed += batch.length;
  }

  return Response.json({
    ok: true,
    on_ballot: nominees.length,
    people: cohort.length,
    already_sent: alreadySent.size,
    queued: queue.length,
    sent,
    failed,
    remaining: Math.max(0, queue.length - processed),
    failures: failures.slice(0, 10),
  });
}