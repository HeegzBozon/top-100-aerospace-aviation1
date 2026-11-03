import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { dayFrom, notifyDesk, todayISO } from '../../shared/patronDesk.ts';

// THE TWO REPORTS OWED ON EVERY PAID SEND.
//
// A deal reaching 'delivered' opens both windows at once: 48 hours and 7 days. This
// function does the opening (idempotent, so a re-run never doubles a report) and the
// reminder that each one has fallen due.
//
// The only figure it may write itself is tracked clicks, and it reads them from the click
// log patronLink writes — never from a number someone typed. Everything else stays blank,
// because a blank means not measured, and a zero would be a claim.

const WINDOWS = [
  { key: '48h', days: 2, label: '48-hour report' },
  { key: '7d', days: 7, label: '7-day report' },
];

export default async function (req: Request): Promise<Response> {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch((error) => (error.status === 401 ? null : Promise.reject(error)));
  if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 });
  if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || 'open');
  const dealId = String(body.deal_id || '');
  if (!dealId) return Response.json({ error: 'deal_id is required' }, { status: 400 });

  const sr = base44.asServiceRole;
  const deal = await sr.entities.PatronDeal.get(dealId).catch((error) =>
    error.status === 404 ? null : Promise.reject(error),
  );
  if (!deal) return Response.json({ error: 'That deal no longer exists.' }, { status: 404 });

  const shipped = (deal.deliverables || []).find((row: any) => row.key === 'issue' && row.status === 'delivered');
  const baseDate = shipped?.delivered_date || deal.updated_date?.slice(0, 10) || todayISO();

  if (action === 'open') {
    const existing = (await sr.entities.PatronReport.filter({ deal_id: dealId })) || [];
    const clicks = (await sr.entities.PatronClick.filter({ deal_id: dealId })) || [];
    const trackedClicks = clicks.length;

    const created: string[] = [];
    for (const window of WINDOWS) {
      if (existing.some((report: any) => report.window === window.key)) continue;

      await sr.entities.PatronReport.create({
        deal_id: dealId,
        issue_number: deal.issue_number,
        window: window.key,
        due_date: dayFrom(baseDate, window.days),
        metrics: { tracked_clicks: trackedClicks || undefined },
        source_note: `Tracked clicks counted from patronLink on ${todayISO()}.`,
        method_note:
          'Clicks are counted by the tracked link the house published, one record per visit. Email and article figures are pulled from the platform at send time and are never estimated here.',
        caveats:
          'No guaranteed reach. Tracked clicks are a small instrument and are not a measure of readership. Every figure is reported as counted, never as promised.',
        no_reader_data: true,
        status: 'draft',
        prepared_by: 'patron reports workflow',
      });
      created.push(window.key);
    }

    return Response.json({ ok: true, created, tracked_clicks: trackedClicks, base_date: baseDate });
  }

  if (action === 'due') {
    const window = WINDOWS.find((item) => item.key === String(body.window || '')) || WINDOWS[0];
    const reports = (await sr.entities.PatronReport.filter({ deal_id: dealId, window: window.key })) || [];
    const report = reports[0] || null;
    const dueDate = report?.due_date || dayFrom(baseDate, window.days);

    const lines = [
      `The ${window.label} for ${deal.organization_name} is due ${dueDate}.`,
      '',
      `Stage: ${deal.stage}`,
      `Issue: ${deal.issue_number || '—'}`,
      `Owner: ${deal.owner_pitcher || deal.owner_qualifier || 'desk'}`,
      report
        ? 'The report is already open on the desk, with tracked clicks filled from the click log.'
        : 'No report record was open for this window. Open it from the Reports tab before sending.',
      '',
      'Send it with method and caveats attached. A blank figure means not measured, never zero.',
      'https://top100aero.space/patronage/desk',
    ];

    const sentTo = await notifyDesk(sr, `Patron ${window.label} due: ${deal.organization_name}`, lines.join('\n'));
    return Response.json({ ok: true, window: window.key, due_date: dueDate, notified: sentTo });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
}