import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { readLedgers, resolveRules, mailableRows, firstNameOf } from '../../shared/audience.ts';
import { renderLetter, letterSubject } from '../../shared/mailShell.ts';

// THE POSTING DESK — one letter, one walk through its cohort.
//
// The cohort is never taken from the request: it is the letter's own segment, resolved
// through the shared audience resolver, minus anyone already filed against this letter. A
// second run therefore only ever picks up who is left, which is what makes an issue
// impossible to post twice.
//
// A run is given a slice of the cohort rather than all of it: the desk calls back while
// there is anything remaining, so a large segment never depends on one call finishing.
//
// Every attempt is filed on MailSend, refusal reasons included. The letter is never
// reported as delivered: the counter says what the mail service accepted.

const CONCURRENCY = 4;
const BUDGET_MS = 40000;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth
      .me()
      .catch((e: any) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const issueId = String(body?.issue_id || '').trim();
    if (!issueId) return Response.json({ error: 'issue_id is required' }, { status: 400 });
    const dryRun = body?.dry_run === true;

    const issue = await base44.asServiceRole.entities.MailIssue.get(issueId).catch((e: any) =>
      e.status === 404 ? null : Promise.reject(e),
    );
    if (!issue) return Response.json({ error: 'Not found' }, { status: 404 });
    if (!String(issue.headline || '').trim()) {
      return Response.json({ error: 'The letter has no headline to send.' }, { status: 400 });
    }
    if (issue.status === 'sent') {
      return Response.json({
        ok: true,
        already_sent: true,
        sent: Number(issue.sent_count) || 0,
        remaining: 0,
        cohort: Number(issue.recipients) || 0,
      });
    }

    let rules: any[] = [];
    if (issue.segment_id) {
      const segment = await base44.asServiceRole.entities.AudienceSegment.get(issue.segment_id).catch(
        (e: any) => (e.status === 404 ? null : Promise.reject(e)),
      );
      rules = segment?.rules || [];
    }

    const audience = await readLedgers(base44);
    const cohort = mailableRows(resolveRules(audience, rules));

    // Who has already been written to for this letter.
    const filed: any[] = [];
    let cursor: string | null = null;
    for (let page = 0; page < 25; page += 1) {
      const res: any = await base44.asServiceRole.entities.MailSend.filter(
        { issue_id: issueId, status: 'sent' },
        { limit: 200, cursor },
      );
      filed.push(...(res?.items || []));
      if (!res?.has_more || !res?.next_cursor) break;
      cursor = res.next_cursor;
    }
    const already = new Set(filed.map((row) => String(row.email || '').toLowerCase()));
    const queue = cohort.filter((row) => !already.has(row.email));

    const letter = {
      ...issue,
      issue_date:
        issue.issue_date ||
        new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          timeZone: 'America/Los_Angeles',
        }),
    };

    if (dryRun) {
      return Response.json({
        ok: true,
        dry_run: true,
        cohort: cohort.length,
        already_sent: already.size,
        queued: queue.length,
        subject: letterSubject(letter),
        sample_first_name: firstNameOf(queue[0]?.name, queue[0]?.email),
      });
    }

    const startedAt = Date.now();
    let sent = 0;
    let failed = 0;
    let processed = 0;
    const failures: Array<{ email: string; reason: string }> = [];

    for (let i = 0; i < queue.length; i += CONCURRENCY) {
      if (Date.now() - startedAt > BUDGET_MS) break;
      const batch = queue.slice(i, i + CONCURRENCY);

      const settled = await Promise.allSettled(
        batch.map((row) =>
          base44.integrations.Core.SendEmail({
            to: row.email,
            subject: letterSubject(letter),
            html: renderLetter(letter, firstNameOf(row.name, row.email)),
            category: 'marketing',
          }),
        ),
      );

      const rows: any[] = [];
      const stamp = new Date().toISOString();

      settled.forEach((outcome, n) => {
        const person = batch[n];
        const base = {
          issue_id: issueId,
          email: person.email,
          name: person.name || '',
          source: person.source,
          sent_at: stamp,
        };

        if (outcome.status === 'rejected') {
          const reason = (outcome.reason && outcome.reason.message) || 'The mail service did not answer.';
          failed += 1;
          failures.push({ email: person.email, reason });
          rows.push({ ...base, status: 'failed', reason });
          return;
        }

        const answer: any = outcome.value || {};
        if (answer.success === false) {
          const reason = answer.message || answer.reason || 'The address could not be reached.';
          failed += 1;
          failures.push({ email: person.email, reason });
          rows.push({ ...base, status: 'failed', reason });
          return;
        }

        sent += 1;
        rows.push({ ...base, status: 'sent' });
      });

      if (rows.length) await base44.asServiceRole.entities.MailSend.bulkCreate(rows);
      processed += batch.length;
    }

    const remaining = Math.max(0, queue.length - processed);

    await base44.asServiceRole.entities.MailIssue.update(issueId, {
      recipients: cohort.length,
      sent_count: (Number(issue.sent_count) || 0) + sent,
      failed_count: (Number(issue.failed_count) || 0) + failed,
      status: remaining > 0 ? 'sending' : 'sent',
      started_at: issue.started_at || new Date(startedAt).toISOString(),
      finished_at: remaining > 0 ? issue.finished_at : new Date().toISOString(),
      last_error: failures[0]?.reason || issue.last_error || '',
    });

    return Response.json({
      ok: true,
      cohort: cohort.length,
      already_sent: already.size,
      queued: queue.length,
      sent,
      failed,
      remaining,
      failures: failures.slice(0, 10),
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}